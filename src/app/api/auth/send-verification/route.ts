import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json();
    const { userId, type = 'email_verification' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing codes for this user and type
    await db.verificationCode.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new verification code
    await db.verificationCode.create({
      data: {
        userId,
        code,
        type,
        expiresAt,
      },
    });

    // In production, send email via SDK. For now, return the code in dev mode.
    // TODO: integrate email sending service
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      ...(isDev && { code }), // Only expose code in development
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
