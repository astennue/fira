import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCmsAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await db.cmsSettings.findMany()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('CMS Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()

    const results: any[] = []
    for (const [key, value] of Object.entries(body)) {
      if (!key || value === undefined) continue

      const existing = await db.cmsSettings.findUnique({
        where: { key },
      })

      if (existing) {
        const updated = await db.cmsSettings.update({
          where: { key },
          data: { value: String(value) },
        })
        results.push(updated)
      } else {
        const created = await db.cmsSettings.create({
          data: { key, value: String(value) },
        })
        results.push(created)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('CMS Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
