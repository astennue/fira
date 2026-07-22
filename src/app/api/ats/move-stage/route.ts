import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, stageId, movedById, notes } = await request.json();

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { jobOrder: true },
    });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const stage = await db.aTSStage.findUnique({
      where: { id: stageId },
    });
    if (!stage || stage.jobOrderId !== application.jobOrderId) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const history = await db.aTSStageHistory.create({
      data: { applicationId, stageId, movedById, notes },
    });

    // Update application status based on stage name
    const stageName = stage.name.toLowerCase();
    let newStatus = application.status;
    if (stageName.includes('reject') || stageName.includes('terminat')) {
      newStatus = 'rejected';
    } else if (stageName.includes('accept') || stageName.includes('hired') || stageName.includes('deploy')) {
      newStatus = 'hired';
    } else if (stageName.includes('withdraw')) {
      newStatus = 'withdrawn';
    } else {
      newStatus = 'pending';
    }

    await db.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('ATS move error:', error);
    return NextResponse.json({ error: 'Failed to move stage' }, { status: 500 });
  }
}