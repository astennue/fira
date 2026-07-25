import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const links = await db.cmsSocialMedia.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('CMS Social GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, title, url, icon, order, isActive } = body

    if (!platform || !url) {
      return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 })
    }

    const link = await db.cmsSocialMedia.create({
      data: {
        platform,
        title: title || null,
        url,
        icon: icon || null,
        order: order || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('CMS Social POST error:', error)
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const link = await db.cmsSocialMedia.update({
      where: { id },
      data: {
        platform: body.platform,
        title: body.title,
        url: body.url,
        icon: body.icon,
        order: body.order,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('CMS Social PUT error:', error)
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.cmsSocialMedia.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS Social DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 })
  }
}
