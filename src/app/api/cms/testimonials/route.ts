import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const testimonials = await db.cmsTestimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('CMS Testimonials GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, position, company, feedback, rating, avatar, isActive } = body

    if (!name || !feedback) {
      return NextResponse.json({ error: 'Name and feedback are required' }, { status: 400 })
    }

    const testimonial = await db.cmsTestimonial.create({
      data: {
        name,
        position: position || null,
        company: company || null,
        feedback,
        rating: rating || 5,
        avatar: avatar || null,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('CMS Testimonials POST error:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
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

    const testimonial = await db.cmsTestimonial.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        company: body.company,
        feedback: body.feedback,
        rating: body.rating,
        avatar: body.avatar,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('CMS Testimonials PUT error:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.cmsTestimonial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS Testimonials DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
