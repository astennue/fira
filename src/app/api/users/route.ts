import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['super_admin', 'staff', 'international_agency', 'local_agency'])
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isApproved = searchParams.get('isApproved')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (isApproved !== null && isApproved !== undefined) where.isApproved = isApproved === 'true'
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }]

    const users = await db.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, isActive: true, isApproved: true, createdAt: true, employerProfile: { select: { id: true, companyName: true, country: true, industry: true } }, agencyMembers: { include: { agency: { select: { id: true, name: true, city: true, country: true, agencyType: true } } } }, applicantProfile: { select: { id: true, firstName: true, lastName: true, preferredCountry: true, yearsExperience: true, applicantType: true, isComplete: true, formStep: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const count = await db.user.count({ where })
    return NextResponse.json({ users, total: count })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireRole(request, ['super_admin'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { userId, action } = body
    if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (action === 'approve') {
      await db.user.update({ where: { id: userId }, data: { isApproved: true } })
      // If agency role, also approve agency
      if (user.role === 'local_agency' || user.role === 'international_agency') {
        const member = await db.agencyMember.findFirst({ where: { userId } })
        if (member) await db.agency.update({ where: { id: member.agencyId }, data: { isApproved: true } })
      }
      return NextResponse.json({ success: true, message: 'User approved' })
    } else if (action === 'reject') {
      await db.user.update({ where: { id: userId }, data: { isActive: false } })
      return NextResponse.json({ success: true, message: 'User rejected and deactivated' })
    }

    return NextResponse.json({ error: 'Invalid action. Use approve or reject.' }, { status: 400 })
  } catch (error) {
    console.error('Users PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
