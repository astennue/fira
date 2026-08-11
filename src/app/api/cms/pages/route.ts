import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireFira } from '@/lib/auth'

export async function GET() {
  try {
    const pages = await db.cmsPage.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('CMS Pages GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { title, slug, content, status, order } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    const page = await db.cmsPage.create({
      data: {
        title,
        slug,
        content: content || '',
        status: status || 'draft',
        order: order || 0,
      },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('CMS Pages POST error:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const page = await db.cmsPage.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        status: body.status,
        order: body.order,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('CMS Pages PUT error:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.cmsPage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS Pages DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
