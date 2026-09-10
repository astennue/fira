import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireJobViewer, type ApiRole, type AuthResult } from '@/lib/auth'

const DEFAULT_STAGES = [
  'New Application', 'Document Review', 'Initial Screening', 'Interview Scheduled',
  'Interview Completed', 'Skills Assessment', 'Background Check', 'Medical Examination',
  'Government Processing', 'Pre-Departure Orientation', 'Contract Signing',
  'Deployment', 'Arrival Confirmed', 'Completed',
]

const FIRA_ROLES: ApiRole[] = ['super_admin', 'staff', 'international_agency']
const JOB_CREATORS: ApiRole[] = ['super_admin', 'staff', 'international_agency', 'employer', 'local_agency']

/** Job statuses visible to the public catalog. 'open' kept for legacy rows. */
const PUBLIC_STATUSES = ['approved', 'open']

export async function GET(request: NextRequest) {
  let auth: AuthResult | null = null
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public')

    // Public access only when public=true param is present
    if (isPublic !== 'true') {
      const result = requireJobViewer(request)
      if (result instanceof NextResponse) return result
      auth = result
    }

    const country = searchParams.get('country')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const visibility = searchParams.get('visibility')
    const search = searchParams.get('search')
    const jobId = searchParams.get('jobId')

    const where: Record<string, unknown> = {}
    if (country) where.country = country
    if (category) where.category = category
    if (status) where.status = status
    if (jobId) where.id = jobId

    if (isPublic === 'true') {
      where.visibility = 'public'
      where.status = { in: PUBLIC_STATUSES }
    } else {
      const visFilter = buildVisibilityFilter(visibility, auth)
      Object.assign(where, visFilter)
    }

    if (search) {
      const existingOr = (where as Record<string, unknown>).OR
      where.OR = [
        ...(Array.isArray(existingOr) ? existingOr : []),
        { title: { contains: search } },
        { description: { contains: search } },
        { requiredSkills: { contains: search } },
        { country: { contains: search } },
      ]
    }

    const jobs = await db.jobOrder.findMany({
      where,
      include: {
        employer: { include: { user: { select: { id: true, name: true, email: true } } } },
        agency: { select: { id: true, name: true, country: true, agencyType: true } },
        atsStages: { orderBy: { order: 'asc' } },
        customFields: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
      },
      orderBy: { postedDate: 'desc' },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Jobs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Role-based visibility filter (uses the authenticated header role; falls
 * back gracefully when unauthenticated). FIRA roles see everything including
 * pending approvals; employers see their own jobs; local agencies see their
 * own submissions plus public/agency_only jobs.
 */
function buildVisibilityFilter(visibility: string | null, auth: AuthResult | null) {
  if (visibility) return { visibility }
  if (!auth) return { visibility: 'public', status: { in: PUBLIC_STATUSES } }
  const role = auth.userRole
  if (FIRA_ROLES.includes(role)) return {}
  if (role === 'employer') {
    return {
      OR: [{ employer: { userId: auth.userId } }, { createdBy: auth.userId }],
    }
  }
  if (role === 'local_agency') {
    return {
      OR: [
        { createdBy: auth.userId },
        { visibility: 'public' },
        { visibility: 'agency_only' },
      ],
    }
  }
  return { visibility: 'public', status: { in: PUBLIC_STATUSES } }
}

export async function POST(request: NextRequest) {
  // Any authenticated job creator may call this; per-role rules applied below.
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    if (!JOB_CREATORS.includes(auth.userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { title, description, country, city, category, jobType, salaryMin, salaryMax, salaryCurrency, salaryPeriod, contractType, duration, slots, requirements, benefits, requiredSkills, visibility, deadline } = body

    if (!title || !description || !country || !category || !requirements || !requiredSkills)
      return NextResponse.json({ error: 'title, description, country, category, requirements, and requiredSkills are required' }, { status: 400 })

    const isFira = FIRA_ROLES.includes(auth.userRole)

    // ── Workflow: employer/local_agency submissions go to the FIRA approval
    // queue (pending + hidden). Jobs created directly by FIRA staff are
    // pre-approved; visibility is their per-job publish decision.
    const status = isFira ? 'approved' : 'pending'
    const finalVisibility = isFira ? (visibility || 'public') : 'hidden'

    // Link employer/local_agency submissions to their profile/agency records
    let employerId: string | null = body.employerId || null
    let agencyId: string | null = body.agencyId || null
    if (auth.userRole === 'employer' && !employerId) {
      const profile = await db.employerProfile.findUnique({ where: { userId: auth.userId }, select: { id: true } })
      employerId = profile?.id || null
    }
    if (auth.userRole === 'local_agency' && !agencyId) {
      const member = await db.agencyMember.findFirst({
        where: { userId: auth.userId },
        select: { agencyId: true },
      })
      agencyId = member?.agencyId || null
    }

    const job = await db.jobOrder.create({
      data: {
        title, description, country, city: city || null, category, jobType: jobType || null,
        salaryMin: salaryMin != null ? Number(salaryMin) : null,
        salaryMax: salaryMax != null ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'USD', salaryPeriod: salaryPeriod || null,
        contractType: contractType || 'full_time', duration: duration || null,
        slots: slots ? Number(slots) : 1, filledSlots: 0,
        requirements, benefits: benefits || null, requiredSkills,
        status, visibility: finalVisibility,
        deadline: deadline ? new Date(deadline) : null,
        employerId, agencyId,
        createdBy: auth.userId,
      },
    })

    const stageData = DEFAULT_STAGES.map((name, index) => ({ jobOrderId: job.id, name, order: index + 1, isDefault: true }))
    await db.aTSStage.createMany({ data: stageData })

    const createdJob = await db.jobOrder.findUnique({
      where: { id: job.id },
      include: { employer: true, agency: { select: { id: true, name: true } }, atsStages: { orderBy: { order: 'asc' } }, customFields: true },
    })

    return NextResponse.json({ job: createdJob }, { status: 201 })
  } catch (error) {
    console.error('Jobs POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { jobId } = body
    if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 })

    const job = await db.jobOrder.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const isFira = FIRA_ROLES.includes(auth.userRole)
    const action: string | undefined = body.action

    // ── Approval workflow actions ─────────────────────────────────────────
    if (action === 'approve' || action === 'reject') {
      if (!isFira) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      if (job.status !== 'pending') {
        return NextResponse.json({ error: `Only pending jobs can be ${action}d` }, { status: 400 })
      }
      // Per-job publish decision: publish=true (default) makes it publicly
      // visible immediately; publish=false keeps it hidden for later editing.
      const updated = await db.jobOrder.update({
        where: { id: jobId },
        data: action === 'approve'
          ? { status: 'approved', visibility: body.publish === false ? 'hidden' : 'public' }
          : { status: 'rejected', visibility: 'hidden' },
      })
      return NextResponse.json({ job: updated })
    }

    if (action === 'close') {
      // FIRA can close anything; owner (creator) can close their own job
      if (!isFira && job.createdBy !== auth.userId) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      const updated = await db.jobOrder.update({ where: { id: jobId }, data: { status: 'closed' } })
      return NextResponse.json({ job: updated })
    }

    if (action === 'publish' || action === 'unpublish') {
      if (!isFira) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      if (job.status === 'pending' || job.status === 'rejected') {
        return NextResponse.json({ error: 'Only approved/open jobs can change visibility' }, { status: 400 })
      }
      const updated = await db.jobOrder.update({
        where: { id: jobId },
        data: { visibility: action === 'publish' ? 'public' : 'hidden' },
      })
      return NextResponse.json({ job: updated })
    }

    // ── Field edits ───────────────────────────────────────────────────────
    // FIRA can edit everything (any job). Employers/local agencies can edit
    // their own submissions while still pending.
    const editableFields = [
      'title', 'description', 'country', 'city', 'category', 'jobType',
      'salaryMin', 'salaryMax', 'salaryCurrency', 'salaryPeriod',
      'contractType', 'duration', 'slots', 'requirements', 'benefits',
      'requiredSkills', 'deadline', 'employerId', 'agencyId',
    ] as const

    const data: Record<string, unknown> = {}
    for (const field of editableFields) {
      if (body[field] !== undefined) {
        data[field] = field === 'deadline' && body[field]
          ? new Date(body[field])
          : ['salaryMin', 'salaryMax', 'slots'].includes(field) && body[field] !== null
            ? Number(body[field])
            : body[field] || (['city', 'jobType', 'duration', 'benefits', 'salaryPeriod'].includes(field) ? null : body[field])
      }
    }
    if (body.visibility !== undefined && isFira) data.visibility = body.visibility

    if (isFira) {
      // legacy simple status flip (open/closed/filled/cancelled)
      const legacyStatuses = ['open', 'closed', 'filled', 'cancelled']
      if (body.status && legacyStatuses.includes(body.status)) data.status = body.status
      if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
      }
      const updated = await db.jobOrder.update({ where: { id: jobId }, data })
      return NextResponse.json({ job: updated })
    }

    // Non-FIRA owner editing their own pending submission
    if (job.createdBy !== auth.userId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    if (job.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending submissions can be edited' }, { status: 400 })
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    const updated = await db.jobOrder.update({ where: { id: jobId }, data })
    return NextResponse.json({ job: updated })
  } catch (error) {
    console.error('Jobs PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
