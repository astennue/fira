import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const agencies = await db.agency.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        members: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { applicants: true, jobOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(agencies);
  } catch (error) {
    console.error('Agencies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isApproved } = await request.json();
    const agency = await db.agency.update({
      where: { id },
      data: { isApproved },
    });
    return NextResponse.json(agency);
  } catch (error) {
    console.error('Agencies PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update agency' }, { status: 500 });
  }
}