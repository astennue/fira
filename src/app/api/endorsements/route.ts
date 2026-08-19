import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, requireFira } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['super_admin', 'staff', 'international_agency', 'local_agency', 'employer'])
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const employerId = searchParams.get('employerId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (applicationId) where.applicationId = applicationId
    if (status) where.status = status

    // Auto-filter by role: employers only see endorsements addressed to them
    if (auth.userRole === 'employer') {
      const employerProfile = await db.employerProfile.findUnique({ where: { userId: auth.userId } })
      if (employerProfile) where.employerId = employerProfile.id
    }
    // Agencies only see endorsements they created
    if (auth.userRole === 'local_agency') {
      where.endorsedById = auth.userId
    }
    // Allow explicit employerId override for FIRA roles
    if (employerId && ['super_admin', 'staff', 'international_agency'].includes(auth.userRole)) {
      where.employerId = employerId
    }

    const endorsements = await db.endorsement.findMany({
      where,
      include: {
        endorser: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        employer: { include: { user: { select: { id: true, name: true, email: true } } } },
        application: {
          include: {
            applicant: { select: { id: true, name: true, email: true, avatar: true, role: true } },
            jobOrder: { select: { id: true, title: true, country: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ endorsements })
  } catch (error) {
    console.error('Endorsements GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['super_admin', 'staff', 'international_agency', 'local_agency'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { applicationId, endorsedById, employerId, coverNote, agencyNote } = body
    if (!applicationId || !endorsedById || !employerId)
      return NextResponse.json({ error: 'applicationId, endorsedById, and employerId are required' }, { status: 400 })

    const application = await db.application.findUnique({ where: { id: applicationId } })
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const endorsement = await db.endorsement.create({
      data: { applicationId, endorsedById, employerId, status: 'pending_fira_review', coverNote: coverNote || null, agencyNote: agencyNote || null },
      include: { endorser: { select: { id: true, name: true, email: true } }, employer: true, application: { include: { applicant: { select: { id: true, name: true } }, jobOrder: { select: { id: true, title: true } } } } },
    })

    return NextResponse.json({ endorsement }, { status: 201 })
  } catch (error) {
    console.error('Endorsements POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { endorsementId, action, notes } = body
    if (!endorsementId || !action) return NextResponse.json({ error: 'endorsementId and action are required' }, { status: 400 })

    // Role-based check depending on the action
    let auth: any
    if (action === 'fira_approve' || action === 'fira_reject') {
      auth = requireFira(request)
      if (auth instanceof NextResponse) return auth
    } else if (action === 'employer_accept' || action === 'employer_decline') {
      auth = requireRole(request, ['employer'])
      if (auth instanceof NextResponse) return auth
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const endorsement = await db.endorsement.findUnique({ where: { id: endorsementId } })
    if (!endorsement) return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 })

    // Employer can only update their own endorsements
    if (action === 'employer_accept' || action === 'employer_decline') {
      const employerProfile = await db.employerProfile.findUnique({ where: { userId: auth.userId } })
      if (!employerProfile || employerProfile.id !== endorsement.employerId) {
        return NextResponse.json({ error: 'You can only update endorsements addressed to you' }, { status: 403 })
      }
    }

    let updateData: Record<string, unknown> = {}
    switch (action) {
      case 'fira_approve': updateData = { status: 'pending_employer_review', firaNote: notes || endorsement.firaNote }; break
      case 'fira_reject': updateData = { status: 'fira_rejected', firaNote: notes || endorsement.firaNote }; break
      case 'employer_accept': updateData = { status: 'employer_accepted', employerNote: notes || endorsement.employerNote }; break
      case 'employer_decline': updateData = { status: 'employer_declined', employerNote: notes || endorsement.employerNote }; break
    }

    const updated = await db.endorsement.update({ where: { id: endorsementId }, data: updateData })

    // Sync endorsement action to application status
    if (endorsement.applicationId) {
      const statusMap: Record<string, string> = {
        fira_approve: 'pending_employer_review',
        fira_reject: 'rejected_by_fira',
        employer_accept: 'employer_accepted',
        employer_decline: 'employer_declined',
      }
      const newAppStatus = statusMap[action]
      if (newAppStatus) {
        await db.application.update({
          where: { id: endorsement.applicationId },
          data: { status: newAppStatus },
        })
      }
    }

    return NextResponse.json({ endorsement: updated })
  } catch (error) {
    console.error('Endorsements PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
