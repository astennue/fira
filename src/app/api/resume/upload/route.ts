import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: PDF, DOCX, JPG, PNG' },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 },
      )
    }

    // Find applicant profile
    const profile = await db.applicantProfile.findUnique({
      where: { userId: auth.userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Applicant profile not found' }, { status: 404 })
    }

    // Convert file to base64 data URI
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upsert document record
    const existing = await db.applicantDocument.findFirst({
      where: { applicantId: profile.id, documentType: 'resume' },
    })

    if (existing) {
      await db.applicantDocument.update({
        where: { id: existing.id },
        data: {
          fileName: file.name,
          filePath: dataUri,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
        },
      })
    } else {
      await db.applicantDocument.create({
        data: {
          applicantId: profile.id,
          documentType: 'resume',
          fileName: file.name,
          filePath: dataUri,
          fileSize: file.size,
          mimeType: file.type,
        },
      })
    }

    // Extract text for PDF/DOCX to store in profile.resumeText
    if (file.type === 'application/pdf') {
      try {
        const pdfParseModule: any = await import('pdf-parse')
        const pdfData = await (pdfParseModule.default || pdfParseModule)(Buffer.from(bytes))
        if (pdfData.text) {
          await db.applicantProfile.update({
            where: { id: profile.id },
            data: { resumeText: pdfData.text.slice(0, 50000) },
          })
        }
      } catch (e) {
        console.error('PDF text extraction failed:', e)
      }
    } else if (
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
        if (result.value) {
          await db.applicantProfile.update({
            where: { id: profile.id },
            data: { resumeText: result.value.slice(0, 50000) },
          })
        }
      } catch (e) {
        console.error('DOCX text extraction failed:', e)
      }
    }
    // For image files (JPG/PNG), text extraction is not attempted here.
    // The parse endpoint will use VLM for those.

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
