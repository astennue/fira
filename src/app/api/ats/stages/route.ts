import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireFira, requireFiraOrAgency } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireFiraOrAgency(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const jobOrderId = searchParams.get('jobOrderId')
    if (!jobOrderId) return NextResponse.json({ error: 'jobOrderId required' }, { status: 400 })

    const stages = await db.aTSStage.findMany({
      where: { jobOrderId },
      orderBy: { order: 'asc' },
      include: { _count: { select: { applications: true } } },
    })
    return NextResponse.json({ stages })
  } catch (error) {
    console.error('ATS stages GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { jobOrderId, name, color, order } = body
    if (!jobOrderId || !name) return NextResponse.json({ error: 'jobOrderId and name required' }, { status: 400 })

    const maxOrder = await db.aTSStage.findFirst({ where: { jobOrderId }, orderBy: { order: 'desc' }, select: { order: true } })
    const nextOrder = order || (maxOrder ? maxOrder.order + 1 : 1)

    const stage = await db.aTSStage.create({
      data: { jobOrderId, name, order: nextOrder, color: color || '#6366f1', isDefault: false },
    })
    return NextResponse.json({ stage }, { status: 201 })
  } catch (error) {
    console.error('ATS stage POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get('stageId')
    if (!stageId) return NextResponse.json({ error: 'stageId required' }, { status: 400 })

    const stage = await db.aTSStage.findUnique({ where: { id: stageId } })
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
    if (stage.isDefault) return NextResponse.json({ error: 'Cannot delete default stages' }, { status: 403 })

    await db.aTSStage.delete({ where: { id: stageId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ATS stage DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
