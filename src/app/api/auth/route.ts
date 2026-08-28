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

function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
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
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const user = await db.user.findUnique({ where: { email: normalizedEmail } });

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!user.isActive) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
      }

      if (!user.isApproved && user.role !== 'applicant') {
        return NextResponse.json({ error: 'Account is pending approval. Please wait for FIRA to approve your account.' }, { status: 401 });
      }

      // Get agency info if applicable
      let agencyId: string | undefined;
      let agencyName: string | undefined;
      if (user.role === 'local_agency' || user.role === 'international_agency') {
        const member = await db.agencyMember.findFirst({
          where: { userId: user.id },
          include: { agency: { select: { id: true, name: true } } },
        });
        if (member) {
          agencyId = member.agency.id;
          agencyName = member.agency.name;
        }
      }

      return NextResponse.json({
        user: {
          ...excludePassword(user),
          agencyId,
          agencyName,
        },
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

      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Only applicants can self-register. Agencies and employers are created by FIRA.
      if (role !== 'applicant') {
        return NextResponse.json({ error: 'Registration is only available for applicants. Contact FIRA for agency/employer accounts.' }, { status: 403 });
      }

      const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      // Applicants are auto-approved upon registration

      const user = await db.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name,
          role,
          phone: phone || null,
          isApproved: true,
          isActive: true,
        },
      });

      // Auto-create blank applicant profile
      await db.applicantProfile.create({
        data: {
          userId: user.id,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || '',
        },
      });

      // Note: Agencies and employers are created by FIRA admin, not via self-registration.
      // See User Management (super-admin-users) for creating those accounts.

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
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[AUTH] Error:', msg)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
