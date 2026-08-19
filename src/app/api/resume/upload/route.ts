import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const applicantIdParam = formData.get('applicantId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded. Use field name "file".' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: PDF, DOCX, JPG, PNG.` },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.` },
        { status: 400 },
      )
    }

    // Resolve applicantId
    let applicantId = applicantIdParam
    if (!applicantId) {
      // Find or auto-create profile by userId
      let profile = await db.applicantProfile.findUnique({
        where: { userId: auth.userId },
      })
      if (!profile) {
        // Auto-create a blank profile so the applicant can upload a resume
        // before completing the profile form
        profile = await db.applicantProfile.create({
          data: { userId: auth.userId, firstName: '', lastName: '' },
        })
      }
      applicantId = profile.id
    } else {
      // Access check: own profile or FIRA role
      const FIRA_ROLES = ['super_admin', 'staff', 'international_agency']
      if (!FIRA_ROLES.includes(auth.userRole) && auth.userId !== applicantId) {
        // Verify the applicantId belongs to the user
        const profile = await db.applicantProfile.findUnique({
          where: { userId: auth.userId },
        })
        if (!profile || profile.id !== applicantId) {
          return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
        }
      }
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create data URI
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Extract text for PDF/DOCX
    let extractedText = ''
    const isImage = file.type.startsWith('image/')

    if (!isImage) {
      try {
        if (file.type === 'application/pdf') {
          const pdfParseModule: any = await import('pdf-parse')
          const pdfData = await (pdfParseModule.default || pdfParseModule)(buffer)
          extractedText = pdfData.text || ''
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          extractedText = result.value || ''
        }
      } catch (e) {
        console.error('Text extraction failed during upload:', e)
        // Don't fail the upload, just skip text extraction
      }
    }

    // Save document to database
    const document = await db.applicantDocument.create({
      data: {
        applicantId,
        documentType: 'resume',
        fileName: file.name,
        mimeType: file.type,
        filePath: dataUri,
        fileSize: file.size,
      },
    })

    // Update resumeText on the profile if we extracted text
    const hasText = extractedText.trim().length > 0
    if (hasText) {
      await db.applicantProfile.update({
        where: { id: applicantId },
        data: { resumeText: extractedText.slice(0, 50000) },
      })
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      fileName: file.name,
      fileSize: file.size,
      hasText,
      textLength: extractedText.length,
    })
  } catch (error: any) {
    console.error('Resume upload error:', error)
    // Never expose technical errors (Prisma, DB, etc.) to the user
    const msg = String(error?.message || '')
    let userMessage = 'Something went wrong while uploading your resume. Please try again.'
    if (msg.includes('file_size') || msg.includes('too large')) {
      userMessage = 'The file is too large. Please choose a file under 10MB.'
    } else if (msg.includes('column') || msg.includes('does not exist') || msg.includes('prisma') || msg.includes('invocation')) {
      userMessage = 'Upload failed due to a system issue. Please try again or contact support.'
    }
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
