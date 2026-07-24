import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, newStageId, notes, movedBy } = body
    if (!applicationId || !newStageId) return NextResponse.json({ error: 'applicationId and newStageId are required' }, { status: 400 })

    const application = await db.application.findUnique({ where: { id: applicationId }, include: { currentStage: true } })
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const newStage = await db.aTSStage.findUnique({ where: { id: newStageId } })
    if (!newStage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
    if (newStage.jobOrderId !== application.jobOrderId) return NextResponse.json({ error: 'Stage does not belong to this job' }, { status: 400 })

    const history = await db.aTSStageHistory.create({
      data: { applicationId, stageId: newStageId, fromStageId: application.currentStageId, movedBy: movedBy || null, notes: notes || null },
    })

    // Auto-update application status based on stage
    const stageLower = newStage.name.toLowerCase()
    let newStatus = application.status
    if (stageLower.includes('reject') || stageLower.includes('terminat')) newStatus = 'rejected'
    else if (stageLower.includes('deploy')) newStatus = 'deployed'
    else if (stageLower.includes('complet') || stageLower.includes('arrival')) newStatus = 'deployed'
    else if (stageLower.includes('hired') || stageLower.includes('offer')) newStatus = 'offered'

    const updated = await db.application.update({
      where: { id: applicationId },
      data: { currentStageId: newStageId, status: newStatus },
      include: { applicant: { select: { id: true, name: true } }, jobOrder: true, currentStage: true },
    })

    return NextResponse.json({ application: updated, history })
  } catch (error) {
    console.error('Move stage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
