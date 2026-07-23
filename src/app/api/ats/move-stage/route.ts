import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, newStageId, notes, movedBy } = body;

    if (!applicationId || !newStageId) {
      return NextResponse.json(
        { error: 'applicationId and newStageId are required' },
        { status: 400 }
      );
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { currentStage: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const newStage = await db.aTSStage.findUnique({
      where: { id: newStageId },
    });

    if (!newStage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    if (newStage.jobOrderId !== application.jobOrderId) {
      return NextResponse.json(
        { error: 'Stage does not belong to this job' },
        { status: 400 }
      );
    }

    const history = await db.aTSStageHistory.create({
      data: {
        applicationId,
        stageId: newStageId,
        fromStageId: application.currentStageId,
        movedBy: movedBy || null,
        notes: notes || null,
      },
      include: {
        stage: true,
      },
    });

    const stageNameLower = newStage.name.toLowerCase();
    let newStatus = application.status;
    if (stageNameLower.includes('reject') || stageNameLower.includes('terminat')) {
      newStatus = 'rejected';
    }

    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        currentStageId: newStageId,
        status: newStatus,
      },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        jobOrder: true,
        currentStage: true,
      },
    });

    return NextResponse.json({ application: updated, history });
  } catch (error) {
    console.error('Move stage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
