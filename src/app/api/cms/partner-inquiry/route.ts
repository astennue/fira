import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, country, email, phone, message, workersNeeded } = body;

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      );
    }

    // In production, this would save to database and/or send email
    // For now, log the inquiry
    console.log('📋 Employer Partnership Inquiry:', {
      name,
      company,
      country,
      email,
      phone,
      workersNeeded,
      message: message?.slice(0, 200),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your interest in partnering with FIRA. Our team will review your inquiry and get back to you within 24-48 hours.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partner inquiry error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
