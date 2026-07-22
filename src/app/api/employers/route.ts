import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const employers = await db.employerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, isActive: true } },
        _count: { select: { jobOrders: true, endorsements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(employers);
  } catch (error) {
    console.error('Employers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch employers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isApproved } = await request.json();
    const employer = await db.employerProfile.update({
      where: { id },
      data: { isApproved },
    });
    return NextResponse.json(employer);
  } catch (error) {
    console.error('Employers PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update employer' }, { status: 500 });
  }
}