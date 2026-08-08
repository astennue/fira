import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')
    const jobOrderId = searchParams.get('jobOrderId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (applicantId) where.applicantId = applicantId
    if (jobOrderId) where.jobOrderId = jobOrderId
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicantId, jobOrderId, coverLetter } = body

    if (!applicantId || !jobOrderId)
      return NextResponse.json({ error: 'applicantId and jobOrderId are required' }, { status: 400 })

    const jobExists = await db.jobOrder.findUnique({ where: { id: jobOrderId } })
    if (!jobExists) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const firstStage = await db.aTSStage.findFirst({ where: { jobOrderId }, orderBy: { order: 'asc' } })

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
          matchScore: 75.0,
          semanticScore: 0.75,
          matchedSkills: '[]',
          missingSkills: '[]',
          explanation: 'Initial analysis - AI matching pending.',
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
