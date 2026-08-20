import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields (name, email, subject, message) are required' }, { status: 400 })
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof subject !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'All fields must be strings' }, { status: 400 })
    }

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return NextResponse.json({ error: 'All fields must be non-empty' }, { status: 400 })
    }

    // Rate limit: reject if same email submitted more than 3 times in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await db.contactSubmission.count({
      where: {
        email: email.trim(),
        createdAt: { gte: oneHourAgo },
      },
    })
    if (recentCount >= 3) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
    }

    const submission = await db.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully', id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}
