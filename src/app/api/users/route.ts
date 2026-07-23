import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isApproved = searchParams.get('isApproved');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (isApproved !== null && isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        employerProfile: { select: { id: true, companyName: true, country: true, industry: true } },
        agencyMembers: { include: { agency: { select: { id: true, name: true, city: true, country: true } } } },
        applicantProfile: { select: { id: true, firstName: true, lastName: true, preferredCountry: true, yearsExperience: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const count = await db.user.count({ where });

    return NextResponse.json({ users, total: count });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
