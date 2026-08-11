import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireFira } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    const faqs = await db.cmsFaq.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('CMS FAQs GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { question, answer, category, order, isActive } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const faq = await db.cmsFaq.create({
      data: {
        question,
        answer,
        category: category || 'General',
        order: order || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('CMS FAQs POST error:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
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

    const faq = await db.cmsFaq.update({
      where: { id },
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category,
        order: body.order,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('CMS FAQs PUT error:', error)
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
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

    await db.cmsFaq.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CMS FAQs DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
