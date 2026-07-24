import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULT_STAGES = [
  'New Application', 'Document Review', 'Initial Screening', 'Interview Scheduled',
  'Interview Completed', 'Skills Assessment', 'Background Check', 'Medical Examination',
  'Government Processing', 'Pre-Departure Orientation', 'Contract Signing',
  'Deployment', 'Arrival Confirmed', 'Completed',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const visibility = searchParams.get('visibility')
    const isPublic = searchParams.get('public')
    const search = searchParams.get('search')
    const userRole = searchParams.get('userRole')
    const jobId = searchParams.get('jobId')

    const where: Record<string, unknown> = {}
    if (country) where.country = country
    if (category) where.category = category
    if (status) where.status = status
    if (jobId) where.id = jobId

    if (isPublic === 'true') {
      where.visibility = 'public'
      where.status = 'open'
    } else {
      const visFilter = buildVisibilityFilter(visibility, userRole)
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

function buildVisibilityFilter(visibility: string | null, userRole: string | null) {
  if (visibility) return { visibility }
  if (!userRole) return { visibility: 'public' }
  if (userRole === 'international_agency') return {}
  if (userRole === 'local_agency') return { OR: [{ visibility: 'public' }, { visibility: 'agency_only' }] }
  return { visibility: 'public' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userRole } = body

    if (!userId || !userRole) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const allowedRoles = ['international_agency', 'local_agency']
    if (!allowedRoles.includes(userRole)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { title, description, country, city, category, jobType, salaryMin, salaryMax, salaryCurrency, salaryPeriod, contractType, duration, slots, requirements, benefits, requiredSkills, visibility, deadline, employerId, agencyId } = body

    if (!title || !description || !country || !category || !requirements || !requiredSkills)
      return NextResponse.json({ error: 'title, description, country, category, requirements, and requiredSkills are required' }, { status: 400 })

    const job = await db.jobOrder.create({
      data: {
        title, description, country, city: city || null, category, jobType: jobType || null,
        salaryMin: salaryMin != null ? Number(salaryMin) : null,
        salaryMax: salaryMax != null ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'USD', salaryPeriod: salaryPeriod || null,
        contractType: contractType || 'full_time', duration: duration || null,
        slots: slots ? Number(slots) : 1, filledSlots: 0,
        requirements, benefits: benefits || null, requiredSkills,
        status: 'open', visibility: visibility || 'public',
        deadline: deadline ? new Date(deadline) : null,
        employerId: employerId || null, agencyId: agencyId || null,
        createdBy: userId,
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
  try {
    const body = await request.json()
    const { jobId, status } = body
    if (!jobId || !status) return NextResponse.json({ error: 'jobId and status are required' }, { status: 400 })

    const validStatuses = ['open', 'closed', 'filled', 'cancelled']
    if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    const updated = await db.jobOrder.update({ where: { id: jobId }, data: { status } })
    return NextResponse.json({ job: updated })
  } catch (error) {
    console.error('Jobs PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
