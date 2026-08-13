import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireFiraOrAgency, type AuthResult } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')
    const jobOrderId = searchParams.get('jobOrderId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    // Role-based filtering: restrict which applications a user can view
    const accessDenied = buildApplicationWhereClause(auth, where, applicantId, jobOrderId)
    if (accessDenied) return accessDenied

    if (status) where.status = status

    const applications = await db.application.findMany({
      where,
      include: {
      applicant: { include: { applicantProfile: true } },
        jobOrder: { include: { employer: { select: { id: true, companyName: true, country: true } }, agency: { select: { id: true, name: true } } } },
        currentStage: true,
        aiAnalysis: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Applications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Build WHERE clause for applications based on user role.
 * Returns a 403 NextResponse if access is denied, or null if access is allowed.
 */
function buildApplicationWhereClause(
  auth: AuthResult,
  where: Record<string, unknown>,
  applicantId: string | null,
  jobOrderId: string | null,
): NextResponse | null {
  const firaRoles = ['super_admin', 'staff', 'international_agency']

  if (firaRoles.includes(auth.userRole)) {
    // FIRA can view all applicants — no filtering needed
    if (applicantId) where.applicantId = applicantId
    if (jobOrderId) where.jobOrderId = jobOrderId
    return null
  }

  if (auth.userRole === 'local_agency') {
    // Local agency can only view applicants for jobs assigned to their agency
    if (jobOrderId) where.jobOrderId = jobOrderId
    if (applicantId) where.applicantId = applicantId
    // Filter to only applications for jobs assigned to this user's agency
    where.jobOrder = { agency: { members: { some: { userId: auth.userId } } } }
    return null
  }

  if (auth.userRole === 'employer') {
    // Employer can only view endorsed candidates for their company
    where.jobOrder = { employer: { userId: auth.userId } }
    if (applicantId) where.applicantId = applicantId
    if (jobOrderId) where.jobOrderId = jobOrderId
    return null
  }

  if (auth.userRole === 'applicant') {
    // Applicant can only view their own applications
    where.applicantId = auth.userId
    if (jobOrderId) where.jobOrderId = jobOrderId
    return null
  }

  return NextResponse.json({ error: 'Insufficient permissions to view applications' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  // Only applicants can apply for jobs; FIRA staff can also create applications on behalf
  const firaRoles = ['super_admin', 'staff', 'international_agency']
  if (auth.userRole !== 'applicant' && !firaRoles.includes(auth.userRole)) {
    return NextResponse.json({ error: 'Only applicants can apply for jobs' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { applicantId, jobOrderId, coverLetter } = body

    if (!applicantId || !jobOrderId)
      return NextResponse.json({ error: 'applicantId and jobOrderId are required' }, { status: 400 })

    // If applicant, ensure they are applying as themselves
    if (auth.userRole === 'applicant' && applicantId !== auth.userId) {
      return NextResponse.json({ error: 'You can only apply on your own behalf' }, { status: 403 })
    }

    const jobExists = await db.jobOrder.findUnique({ where: { id: jobOrderId } })
    if (!jobExists) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Auto-create default ATS stages if none exist for this job
    const DEFAULT_APPLICATION_STAGES = [
      { name: 'Applied', color: '#3b82f6' },
      { name: 'Screening', color: '#06b6d4' },
      { name: 'Interview', color: '#8b5cf6' },
      { name: 'Assessment', color: '#f59e0b' },
      { name: 'Offer', color: '#10b981' },
      { name: 'Deployed', color: '#84cc16' },
    ]

    const existingStages = await db.aTSStage.findMany({ where: { jobOrderId }, select: { id: true } })
    let firstStage: { id: string } | null = null
    if (existingStages.length === 0) {
      const stageData = DEFAULT_APPLICATION_STAGES.map((s, i) => ({
        jobOrderId,
        name: s.name,
        order: i + 1,
        color: s.color,
        isDefault: true,
      }))
      await db.aTSStage.createMany({ data: stageData })
      firstStage = await db.aTSStage.findFirst({ where: { jobOrderId, name: 'Applied' } })
    } else {
      firstStage = await db.aTSStage.findFirst({ where: { jobOrderId }, orderBy: { order: 'asc' } })
    }

    try {
      const application = await db.application.create({
        data: {
          applicantId, jobOrderId,
          coverLetter: coverLetter || null,
          status: 'applied',
          currentStageId: firstStage?.id || null,
        },
        include: {
          applicant: { include: { applicantProfile: true } },
          jobOrder: true,
          currentStage: true,
        },
      })

      await db.aIAnalysisResult.create({
        data: {
          applicationId: application.id,
          matchScore: 0,
          semanticScore: 0,
          matchedSkills: '[]',
          missingSkills: '[]',
          explanation: null,
        },
      })

      return NextResponse.json({ application }, { status: 201 })
    } catch (createError: unknown) {
      const msg = createError instanceof Error ? createError.message : String(createError)
      if (msg.includes('Unique') || msg.includes('unique')) {
        return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 })
      }
      throw createError
    }
  } catch (error) {
    console.error('Applications POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireFiraOrAgency(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { applicationId, status } = body
    if (!applicationId || !status) return NextResponse.json({ error: 'applicationId and status are required' }, { status: 400 })

    const updated = await db.application.update({
      where: { id: applicationId },
      data: { status },
    })
    return NextResponse.json({ application: updated })
  } catch (error) {
    console.error('Applications PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
