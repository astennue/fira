import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    const agencyId = searchParams.get('agencyId');
    const firaStatus = searchParams.get('firaStatus');
    const employerStatus = searchParams.get('employerStatus');
    const agencyStatus = searchParams.get('agencyStatus');

    const where: Record<string, unknown> = {};
    if (employerId) where.employerId = employerId;
    if (agencyStatus) where.agencyStatus = agencyStatus;
    if (firaStatus) where.firaStatus = firaStatus;
    if (employerStatus) where.employerStatus = employerStatus;
    if (agencyId) {
      const jobOrders = await db.jobOrder.findMany({ where: { agencyId }, select: { id: true } });
      where.jobOrderId = { in: jobOrders.map(j => j.id) };
    }

    const endorsements = await db.endorsement.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        application: {
          include: {
            applicant: {
              select: { id: true, name: true, email: true, role: true },
            },
            jobOrder: { include: { employer: { select: { companyName: true, country: true } } } },
          },
        },
        jobOrder: { include: { employer: { select: { companyName: true, country: true } } } },
        endorsedBy: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(endorsements);
  } catch (error) {
    console.error('Endorsements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch endorsements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobOrderId, employerId, endorsedById, agencyNotes } = await request.json();

    const existing = await db.endorsement.findUnique({ where: { applicationId } });
    if (existing) {
      return NextResponse.json({ error: 'Already endorsed' }, { status: 409 });
    }

    const endorsement = await db.endorsement.create({
      data: {
        applicationId, jobOrderId, employerId, endorsedById,
        agencyNotes, agencyStatus: 'endorsed',
      },
    });

    return NextResponse.json(endorsement, { status: 201 });
  } catch (error) {
    console.error('Endorsements POST error:', error);
    return NextResponse.json({ error: 'Failed to create endorsement' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action, notes, actionedById } = await request.json();

    const endorsement = await db.endorsement.findUnique({ where: { id } });
    if (!endorsement) {
      return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (action === 'fira_approve') {
      updateData.firaStatus = 'approved';
      updateData.firaNotes = notes;
      updateData.firaActionedAt = new Date();
    } else if (action === 'fira_reject') {
      updateData.firaStatus = 'rejected';
      updateData.firaNotes = notes;
      updateData.firaActionedAt = new Date();
    } else if (action === 'employer_accept') {
      updateData.employerStatus = 'accepted';
      updateData.employerNotes = notes;
      updateData.employerActionedAt = new Date();
    } else if (action === 'employer_decline') {
      updateData.employerStatus = 'declined';
      updateData.employerNotes = notes;
      updateData.employerActionedAt = new Date();
    }

    const updated = await db.endorsement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Endorsements PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update endorsement' }, { status: 500 });
  }
}