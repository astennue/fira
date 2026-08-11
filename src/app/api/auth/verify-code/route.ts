import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json();
    const { userId, code, type = 'email_verification' } = body;

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and code are required' }, { status: 400 });
    }

    const verification = await db.verificationCode.findFirst({
      where: {
        userId,
        code,
        type,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Mark code as used
    await db.verificationCode.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
