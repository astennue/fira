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

    // Access check: own profile or FIRA role
    const FIRA_ROLES = ['super_admin', 'staff', 'international_agency']
    if (!FIRA_ROLES.includes(auth.userRole) && auth.userId !== applicantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Find applicant profile
    const profile = await db.applicantProfile.findUnique({
      where: { userId: applicantId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Applicant profile not found' }, { status: 404 })
    }

    // Try to get resume text from profile first (extracted during upload)
    let resumeText = profile.resumeText || ''
    let useVLM = false

    // If no text extracted during upload, try the document filePath (could be image)
    let resumeDoc: any = null
    if (!resumeText) {
      resumeDoc = await db.applicantDocument.findFirst({
        where: { applicantId: profile.id, documentType: 'resume' },
      })

      if (!resumeDoc?.filePath) {
        return NextResponse.json(
          { error: 'No resume found. Please upload a resume first.', extracted: { firstName: '', lastName: '', email: '', phone: '', address: '', education: [], experience: [], skills: [], languages: [], certifications: [] } },
          { status: 404 },
        )
      }

      // Check if it's an image type (data URI starts with data:image/)
      if (resumeDoc.filePath.startsWith('data:image/')) {
        useVLM = true
      } else {
        // Try to extract text from the stored data
        try {
          const base64Data = resumeDoc.filePath.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')

          if (resumeDoc.mimeType === 'application/pdf') {
            const pdfParseModule: any = await import('pdf-parse')
            const pdfData = await (pdfParseModule.default || pdfParseModule)(buffer)
            resumeText = pdfData.text || ''
          } else if (
            resumeDoc.mimeType === 'application/msword' ||
            resumeDoc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ) {
            const mammoth = await import('mammoth')
            const result = await mammoth.extractRawText({ buffer })
            resumeText = result.value || ''
          }
        } catch (e) {
          console.error('Text extraction failed:', e)
        }
      }
    }

    // Parse with AI
    const emptyResult = {
      firstName: '', middleName: '', lastName: '', email: '', phone: '',
      address: '', education: [], experience: [], skills: [],
      languages: [], certifications: [],
    }

    try {
      const ZAI = await import('z-ai-web-dev-sdk').then((m) => m.default || m)
      const zai = await ZAI.create()

      const jsonSchema = `{"firstName":"","middleName":"","lastName":"","email":"","phone":"","address":"","education":[{"institution":"","degree":"","fieldOfStudy":"","startYear":"","endYear":"","honors":""}],"experience":[{"company":"","position":"","country":"","startDate":"","endDate":"","description":"","monthlySalary":"","employerContact":""}],"skills":[{"name":"","level":"intermediate","yearsExperience":""}],"languages":[{"language":"","proficiency":"conversational","speaking":"","reading":"","writing":""}],"certifications":[{"name":"","issuingBody":"","issuedDate":"","expiryDate":"","credentialId":""}]}`

      let response: any

      if (useVLM) {
        // Use VLM for image-based resumes
        const imageUrl = resumeDoc?.filePath || ''
        const prompt = `You are a resume parser for overseas Filipino workers (OFW) recruitment. Extract ALL information from this resume image and return ONLY a JSON object with this exact structure (no markdown, no backticks):

${jsonSchema}

Rules:
- For dates, use YYYY-MM-DD or YYYY-MM or YYYY format as found in the resume
- For skill levels, use: beginner, intermediate, advanced, expert
- For language proficiency, use: basic, conversational, intermediate, advanced, fluent, native
- Parse ALL entries you can find
- If a field is not found, use empty string "" or empty array []
- Return valid JSON only, no explanation`

        response = await zai.chat.completions.createVision({
          model: 'glm-4.6v',
          messages: [
            { role: 'assistant', content: [{ type: 'text', text: 'Output only valid JSON, no markdown.' }] },
            { role: 'user', content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ]},
          ] as any,
          thinking: { type: 'disabled' },
        })
      } else {
        // Use LLM text-based parsing for PDF/DOCX
        if (!resumeText || resumeText.trim().length < 20) {
          return NextResponse.json({
            success: false,
            error: 'Could not extract readable text from the resume. The file may be scanned or corrupted. Please try uploading an image version or fill in the fields manually.',
            extracted: emptyResult,
          })
        }

        const prompt = `You are a resume parser for overseas Filipino workers (OFW) recruitment. Extract ALL information from the following resume text and return ONLY a JSON object with this exact structure (no markdown, no backticks):

${jsonSchema}

Rules:
- For dates, use YYYY-MM-DD or YYYY-MM or YYYY format as found in the resume
- For skill levels, use: beginner, intermediate, advanced, expert
- For language proficiency, use: basic, conversational, intermediate, advanced, fluent, native
- Parse ALL entries you can find
- If a field is not found, use empty string "" or empty array []
- Return valid JSON only, no explanation

Here is the resume text:

---
${resumeText.slice(0, 30000)}
---`

        response = await zai.chat.completions.create({
          model: 'glm-4-flash',
          messages: [{ role: 'user', content: prompt }],
        })
      }

      const reply = response.choices?.[0]?.message?.content
      if (!reply) {
        return NextResponse.json({ success: false, error: 'No AI response', extracted: emptyResult })
      }

      // Clean and parse JSON
      let cleanReply = reply.trim()
      cleanReply = cleanReply.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
      
      // Try to find JSON in the response
      const jsonMatch = cleanReply.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ success: false, error: 'Could not parse AI response', extracted: emptyResult })
      }

      const extracted = JSON.parse(jsonMatch[0])

      // Update profile resumeText if we now have text
      if (resumeText && !profile.resumeText) {
        await db.applicantProfile.update({
          where: { id: profile.id },
          data: { resumeText: resumeText.slice(0, 50000) },
        })
      }

      return NextResponse.json({ success: true, extracted })
    } catch (aiError: any) {
      console.error('AI parsing failed:', aiError?.message || aiError)
      return NextResponse.json({
        success: false,
        error: `AI parsing unavailable: ${aiError?.message || 'Unknown error'}`,
        extracted: emptyResult,
      })
    }
  } catch (error) {
    console.error('Resume parse error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
