import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Check if already subscribed
    const existing = await db.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 })
    }

    await db.newsletterSubscription.create({
      data: { email: normalizedEmail },
    })

    return NextResponse.json({ success: true, message: 'Subscribed successfully' }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
