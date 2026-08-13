import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCmsAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const terms = await db.cmsTermsPrivacy.findMany()

    return NextResponse.json(terms)
  } catch (error) {
    console.error('CMS Terms GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireCmsAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { type, title, content, version } = body

    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 })
    }

    const existing = await db.cmsTermsPrivacy.findUnique({
      where: { type },
    })

    if (existing) {
      const updated = await db.cmsTermsPrivacy.update({
        where: { type },
        data: { title: title || existing.title, content, version: version || existing.version },
      })
      return NextResponse.json(updated)
    } else {
      const created = await db.cmsTermsPrivacy.create({
        data: { type, title: title || type, content, version: version || '1.0' },
      })
      return NextResponse.json(created, { status: 201 })
    }
  } catch (error) {
    console.error('CMS Terms PUT error:', error)
    return NextResponse.json({ error: 'Failed to update terms' }, { status: 500 })
  }
}
