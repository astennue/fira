import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (applicationId) where.applicationId = applicationId;
    if (employerId) where.employerId = employerId;
    if (status) where.status = status;

    const endorsements = await db.endorsement.findMany({
      where,
      include: {
        endorser: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        employer: { include: { user: { select: { id: true, name: true, email: true } } } },
        application: {
          include: {
            applicant: {
              select: { id: true, name: true, email: true, avatar: true },
              include: { applicantProfile: true },
            },
            jobOrder: { select: { id: true, title: true, country: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ endorsements });
  } catch (error) {
    console.error('Endorsements GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, endorsedById, employerId, coverNote, agencyNote } = body;

    if (!applicationId || !endorsedById || !employerId) {
      return NextResponse.json(
        { error: 'applicationId, endorsedById, and employerId are required' },
        { status: 400 }
      );
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const endorsement = await db.endorsement.create({
      data: {
        applicationId,
        endorsedById,
        employerId,
        status: 'agency_endorsed',
        coverNote: coverNote || null,
        agencyNote: agencyNote || null,
      },
      include: {
        endorser: { select: { id: true, name: true, email: true } },
        employer: true,
        application: {
          include: {
            applicant: { select: { id: true, name: true, email: true } },
            jobOrder: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ endorsement }, { status: 201 });
  } catch (error) {
    console.error('Endorsements POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { endorsementId, action, notes } = body;

    if (!endorsementId || !action) {
      return NextResponse.json(
        { error: 'endorsementId and action are required' },
        { status: 400 }
      );
    }

    const endorsement = await db.endorsement.findUnique({
      where: { id: endorsementId },
    });

    if (!endorsement) {
      return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'fira_approve':
        updateData = { status: 'fira_approved', firaNote: notes || endorsement.firaNote };
        break;
      case 'fira_reject':
        updateData = { status: 'fira_rejected', firaNote: notes || endorsement.firaNote };
        break;
      case 'employer_accept':
        updateData = { status: 'employer_accepted', employerNote: notes || endorsement.employerNote };
        break;
      case 'employer_decline':
        updateData = { status: 'employer_declined', employerNote: notes || endorsement.employerNote };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: fira_approve, fira_reject, employer_accept, employer_decline' },
          { status: 400 }
        );
    }

    const updated = await db.endorsement.update({
      where: { id: endorsementId },
      data: updateData,
      include: {
        endorser: { select: { id: true, name: true, email: true } },
        employer: true,
        application: {
          include: {
            applicant: { select: { id: true, name: true, email: true } },
            jobOrder: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ endorsement: updated });
  } catch (error) {
    console.error('Endorsements PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
