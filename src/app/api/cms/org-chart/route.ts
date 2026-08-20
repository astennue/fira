import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCmsAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'

    const where: Record<string, unknown> = {}
    if (isPublic) {
      where.isActive = true
    }

    const members = await db.cmsOrgChart.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('CMS Org Chart GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { name, position, department, parentId, avatar, email, phone, order, isActive } = body

    if (!name || !position) {
      return NextResponse.json({ error: 'Name and position are required' }, { status: 400 })
    }

    const member = await db.cmsOrgChart.create({
      data: {
        name,
        position,
        department: department || null,
        parentId: parentId || null,
        avatar: avatar || null,
        email: email || null,
        phone: phone || null,
        order: order || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('CMS Org Chart POST error:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const member = await db.cmsOrgChart.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        department: body.department,
        parentId: body.parentId,
        avatar: body.avatar,
        email: body.email,
        phone: body.phone,
        order: body.order,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('CMS Org Chart PUT error:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.cmsOrgChart.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS Org Chart DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}
