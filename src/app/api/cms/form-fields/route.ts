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

    const fields = await db.cmsFormField.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(fields)
  } catch (error) {
    console.error('CMS Form Fields GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch form fields' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { label, fieldType, options, isRequired, order, section, isActive } = body

    if (!label || !fieldType) {
      return NextResponse.json({ error: 'Label and field type are required' }, { status: 400 })
    }

    const field = await db.cmsFormField.create({
      data: {
        label,
        fieldType,
        options: options || null,
        isRequired: isRequired || false,
        order: order || 0,
        section: section || 'Personal Information',
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(field, { status: 201 })
  } catch (error) {
    console.error('CMS Form Fields POST error:', error)
    return NextResponse.json({ error: 'Failed to create form field' }, { status: 500 })
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

    const field = await db.cmsFormField.update({
      where: { id },
      data: {
        label: body.label,
        fieldType: body.fieldType,
        options: body.options,
        isRequired: body.isRequired,
        order: body.order,
        section: body.section,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(field)
  } catch (error) {
    console.error('CMS Form Fields PUT error:', error)
    return NextResponse.json({ error: 'Failed to update form field' }, { status: 500 })
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

    await db.cmsFormField.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS Form Fields DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete form field' }, { status: 500 })
  }
}
