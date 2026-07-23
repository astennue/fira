import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { role: 'employer' }
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }]

    const employers = await db.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, isApproved: true, createdAt: true, employerProfile: { select: { id: true, companyName: true, country: true, industry: true, contactPerson: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ employers })
  } catch (error) {
    console.error('Employers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body
    if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 })

    if (action === 'approve') {
      await db.user.update({ where: { id: userId }, data: { isApproved: true } })
      return NextResponse.json({ success: true })
    } else if (action === 'reject') {
      return NextResponse.json({ success: true, message: 'User rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Employers PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
