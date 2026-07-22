import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const jobOrderId = searchParams.get('jobOrderId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (applicantId) where.applicantId = applicantId;
    if (jobOrderId) where.jobOrderId = jobOrderId;
    if (status) where.status = status;

    const applications = await db.application.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        applicant: { select: { id: true, name: true, email: true, role: true } },
        jobOrder: { include: { employer: { select: { companyName: true, country: true } } } },
        atsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { stage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId, jobOrderId, coverLetter } = body;

    // Check for duplicate
    const existing = await db.application.findFirst({
      where: { applicantId, jobOrderId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 });
    }

    // Move to first ATS stage
    const firstStage = await db.aTSStage.findFirst({
      where: { jobOrderId, order: 0 },
    });

    const application = await db.application.create({
      data: { applicantId, jobOrderId, coverLetter, status: 'pending' },
    });

    if (firstStage) {
      await db.aTSStageHistory.create({
        data: {
          applicationId: application.id,
          stageId: firstStage.id,
          movedById: applicantId,
          notes: 'Application submitted',
        },
      });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}