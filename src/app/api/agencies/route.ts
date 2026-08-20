import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireFira } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const agencyType = searchParams.get('agencyType')
    const isApproved = searchParams.get('isApproved')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (agencyType) where.agencyType = agencyType
    if (isApproved !== null && isApproved !== undefined) where.isApproved = isApproved === 'true'
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }]

    const agencies = await db.agency.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true, isApproved: true } } } },
        _count: { select: { members: true, jobOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ agencies })
  } catch (error) {
    console.error('Agencies GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { agencyId, action } = body
    if (!agencyId || !action) return NextResponse.json({ error: 'agencyId and action are required' }, { status: 400 })

    const agency = await db.agency.findUnique({ where: { id: agencyId }, include: { members: true } })
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    if (action === 'approve') {
      await db.agency.update({ where: { id: agencyId }, data: { isApproved: true } })
      // Also approve all members
      for (const member of agency.members) {
        await db.user.update({ where: { id: member.userId }, data: { isApproved: true } })
      }
      return NextResponse.json({ success: true, message: 'Agency and members approved' })
    } else if (action === 'reject') {
      await db.agency.update({ where: { id: agencyId }, data: { isApproved: false } })
      for (const member of agency.members) {
        await db.user.update({ where: { id: member.userId }, data: { isActive: false, isApproved: false } })
      }
      return NextResponse.json({ success: true, message: 'Agency and members rejected' })
    }

    return NextResponse.json({ error: 'Invalid action. Use approve or reject.' }, { status: 400 })
  } catch (error) {
    console.error('Agencies PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
