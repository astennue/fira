import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { applicantId } = body

    if (!applicantId) {
      return NextResponse.json({ error: 'applicantId is required' }, { status: 400 })
    }

    // Fetch the resume document from the database
    const resumeDoc = await db.applicantDocument.findFirst({
      where: {
        applicantId,
        documentType: 'resume',
      },
    })

    if (!resumeDoc?.filePath) {
      return NextResponse.json(
        { error: 'No resume found. Please upload a resume first.' },
        { status: 404 },
      )
    }

    const imageUrl = resumeDoc.filePath // This is a data URI (data:image/...;base64,...)

    // Try to use VLM for resume parsing
    try {
      // Dynamic import so it doesn't crash if the SDK is not available
      const ZAI = await import('z-ai-web-dev-sdk').then((m) => m.default || m)
      const zai = await ZAI.create()

      const prompt = `You are a resume parser for overseas Filipino workers (OFW) recruitment. Extract the following information from this resume and return ONLY a JSON object (no markdown, no backticks, no explanation). If a field is not found, use empty string "" or empty array []:

{
  "firstName": "",
  "middleName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "address": "",
  "education": [{"institution": "", "degree": "", "fieldOfStudy": "", "startYear": "", "endYear": "", "honors": ""}],
  "experience": [{"company": "", "position": "", "country": "", "startDate": "", "endDate": "", "description": ""}],
  "skills": [{"name": "", "level": "intermediate"}],
  "languages": [{"language": "", "proficiency": "conversational"}],
  "certifications": [{"name": "", "issuingBody": "", "issuedDate": "", "expiryDate": "", "credentialId": ""}]
}

For dates, use YYYY-MM-DD format or YYYY-MM format. For year-only dates, use just the year as a string.
For skill levels, use one of: beginner, intermediate, advanced, expert.
For language proficiency, use one of: basic, conversational, intermediate, advanced, fluent, native.
Parse all entries you can find. Return valid JSON only.`

      const messages = [
        {
          role: 'assistant',
          content: [{ type: 'text', text: 'Output only valid JSON, no markdown.' }],
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ]

      const response = await zai.chat.completions.createVision({
        model: 'glm-4.6v',
        messages: messages as any,
        thinking: { type: 'disabled' },
      })

      const reply = response.choices?.[0]?.message?.content

      if (!reply) {
        return NextResponse.json({
          success: false,
          error: 'No response from AI model',
          extracted: { firstName: '', lastName: '', email: '', phone: '', address: '', education: [], experience: [], skills: [], languages: [], certifications: [] },
        })
      }

      // Clean up response and parse JSON
      let cleanReply = reply.trim()
      // Remove markdown code blocks if present
      cleanReply = cleanReply.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

      const extracted = JSON.parse(cleanReply)

      return NextResponse.json({ success: true, extracted })
    } catch (vlmError: any) {
      console.error('VLM parsing failed, returning empty result:', vlmError?.message || vlmError)
      // Graceful fallback — return empty extraction with error info
      return NextResponse.json({
        success: false,
        error: `AI parsing unavailable: ${vlmError?.message || 'Unknown error'}`,
        extracted: {
          firstName: '', middleName: '', lastName: '', email: '', phone: '',
          address: '', education: [], experience: [], skills: [],
          languages: [], certifications: [],
        },
      })
    }
  } catch (error) {
    console.error('Resume parse error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
