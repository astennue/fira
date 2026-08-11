import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireFira } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const job = await db.jobOrder.findUnique({
      where: { id },
      include: {
        employer: { include: { user: { select: { id: true, name: true, email: true } } } },
        agency: { select: { id: true, name: true, country: true, agencyType: true } },
        atsStages: { orderBy: { order: 'asc' } },
        customFields: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Job GET by ID error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    // Check job exists
    const existing = await db.jobOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Build update data from allowed fields
    const allowedFields = [
      'title', 'description', 'country', 'city', 'category', 'jobType',
      'salaryMin', 'salaryMax', 'salaryCurrency', 'salaryPeriod', 'contractType',
      'duration', 'slots', 'requirements', 'benefits', 'requiredSkills',
      'status', 'visibility', 'deadline', 'employerId', 'agencyId',
    ] as const

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'salaryMin' || field === 'salaryMax' || field === 'slots') {
          data[field] = Number(body[field])
        } else if (field === 'deadline' && body[field]) {
          data[field] = new Date(body[field] as string)
        } else {
          data[field] = body[field]
        }
      }
    }
    data.updatedAt = new Date()

    const updated = await db.jobOrder.update({
      where: { id },
      data,
      include: {
        employer: true,
        agency: { select: { id: true, name: true } },
        atsStages: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json({ job: updated })
  } catch (error) {
    console.error('Job PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params

    const existing = await db.jobOrder.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete stages and custom fields first (cascade handled by schema, but be explicit)
    await db.aTSStage.deleteMany({ where: { jobOrderId: id } })
    await db.jobCustomField.deleteMany({ where: { jobOrderId: id } })
    await db.jobOrder.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Job deleted' })
  } catch (error) {
    console.error('Job DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
