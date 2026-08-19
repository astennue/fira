import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { applicantId } = await request.json()
    if (!applicantId) return NextResponse.json({ error: 'applicantId required' }, { status: 400 })

    const FIRA_ROLES = ['super_admin', 'staff', 'international_agency']
    if (!FIRA_ROLES.includes(auth.userRole) && auth.userId !== applicantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const profile = await db.applicantProfile.findUnique({
      where: { userId: applicantId },
    })

    if (!profile?.resumeText) {
      return NextResponse.json({ error: 'No resume text found. Upload a resume first.' }, { status: 404 })
    }

    const ZAI = await import('z-ai-web-dev-sdk').then((m) => m.default || m)
    const zai = await ZAI.create()

    const prompt = `You are an expert OFW (Overseas Filipino Worker) resume enhancer. Improve the following resume text to make it more professional, compelling, and suitable for international recruitment. Keep the same structure but enhance descriptions, add action verbs, quantify achievements where possible, and ensure proper formatting. Return ONLY the enhanced resume text, no explanations.

---
${profile.resumeText.slice(0, 25000)}
---`

    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [{ role: 'user', content: prompt }],
    })

    const enhanced = response.choices?.[0]?.message?.content
    if (!enhanced) {
      return NextResponse.json({ error: 'AI enhancement failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, enhancedText: enhanced })
  } catch (error: any) {
    console.error('Resume enhance error:', error)
    return NextResponse.json({ error: 'Resume enhancement is currently unavailable. Please try again later.' }, { status: 500 })
  }
}
