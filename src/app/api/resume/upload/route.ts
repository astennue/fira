import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use PDF, DOC, DOCX, JPEG, PNG, or WebP.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 10MB.' },
        { status: 400 },
      )
    }

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Find or create applicant profile
    let profile = await db.applicantProfile.findUnique({
      where: { userId: auth.userId },
    })

    if (!profile) {
      profile = await db.applicantProfile.create({
        data: {
          userId: auth.userId,
          firstName: '',
          lastName: '',
        },
      })
    }

    // Delete existing resume document if any
    await db.applicantDocument.deleteMany({
      where: {
        applicantId: profile.id,
        documentType: 'resume',
      },
    })

    // Create new resume document
    const doc = await db.applicantDocument.create({
      data: {
        applicantId: profile.id,
        documentType: 'resume',
        fileName: file.name,
        filePath: dataUri,
        fileSize: file.size,
        mimeType: file.type,
      },
    })

    // Also store raw text in the profile's resumeText field
    // For images, we'll store a placeholder since text extraction needs VLM
    let extractedText = ''
    if (file.type === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text || ''
      } catch (e) {
        console.error('PDF text extraction failed:', e)
        extractedText = ''
      }
    } else if (
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value || ''
      } catch (e) {
        console.error('DOCX text extraction failed:', e)
        extractedText = ''
      }
    }

    // Update profile resumeText
    if (extractedText) {
      await db.applicantProfile.update({
        where: { id: profile.id },
        data: { resumeText: extractedText.slice(0, 50000) }, // Cap at 50k chars
      })
    }

    return NextResponse.json({
      success: true,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      documentId: doc.id,
      hasExtractedText: !!extractedText,
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
