import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

type UserPayload = {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
};

function excludePassword<T extends Record<string, unknown>>(
  user: T
): Omit<T, 'password'> {
  const { password: _pw, ...rest } = user as T & { password: unknown };
  return rest;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'logout') {
      return NextResponse.json({ success: true, message: 'Logged out' });
    }

    if (action === 'login') {
      const { email, password } = body as { email: string; password: string };

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({ where: { email } });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 401 }
        );
      }

      if (!user.isApproved) {
        return NextResponse.json(
          { error: 'Account is pending approval' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: excludePassword(user),
      });
    }

    if (action === 'register') {
      const { email, password, name, role, phone } = body as UserPayload;

      if (!email || !password || !name || !role) {
        return NextResponse.json(
          { error: 'Email, password, name, and role are required' },
          { status: 400 }
        );
      }

      const validRoles = ['applicant', 'agency_admin', 'agency_member', 'fira', 'employer'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be one of: ' + validRoles.join(', ') },
          { status: 400 }
        );
      }

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const isApproved = role === 'applicant';

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone: phone || null,
          isApproved,
          isActive: true,
        },
      });

      return NextResponse.json(
        { user: excludePassword(user) },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use login, register, or logout.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
