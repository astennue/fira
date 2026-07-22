import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';

type UserRole = 'applicant' | 'agency_admin' | 'agency_member' | 'fira' | 'employer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, role } = body;

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!user.isActive) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
      }

      const valid = await compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Check agency approval for agency roles
      if (user.role === 'agency_admin' || user.role === 'agency_member') {
        const member = await db.agencyMember.findUnique({ where: { userId: user.id } });
        if (member) {
          const agency = await db.agency.findUnique({ where: { id: member.agencyId } });
          if (agency && !agency.isApproved) {
            return NextResponse.json({ error: 'Agency pending approval', code: 'PENDING_APPROVAL' }, { status: 403 });
          }
        }
      }

      // Check employer approval
      if (user.role === 'employer') {
        const employer = await db.employerProfile.findUnique({ where: { userId: user.id } });
        if (employer && !employer.isApproved) {
          return NextResponse.json({ error: 'Employer pending approval', code: 'PENDING_APPROVAL' }, { status: 403 });
        }
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          avatarUrl: user.avatarUrl,
        },
      });
    }

    if (action === 'register') {
      if (!email || !password || !name || !role) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const { hash } = await import('bcryptjs');
      const passwordHash = await hash(password, 12);

      const user = await db.user.create({
        data: { email, passwordHash, name, role, isActive: true },
      });

      // Create role-specific profile
      if (role === 'employer') {
        await db.employerProfile.create({
          data: {
            userId: user.id,
            companyName: name,
            country: '',
            isApproved: false,
          },
        });
      }

      if (role === 'applicant') {
        await db.applicantProfile.create({
          data: {
            userId: user.id,
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            nationality: 'Filipino',
          },
        });
      }

      if (role === 'agency_admin') {
        const agency = await db.agency.create({
          data: { name: `${name}'s Agency`, ownerId: user.id, isApproved: false },
        });
        await db.agencyMember.create({
          data: { userId: user.id, agencyId: agency.id, role: 'admin' },
        });
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}