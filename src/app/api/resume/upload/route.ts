import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 },
      )
    }

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64data = buffer.toString('base64')

    // Find applicant profile for this user
    const applicantProfile = await db.applicantProfile.findUnique({
      where: { userId: auth.userId },
    })

    if (!applicantProfile) {
      return NextResponse.json(
        { error: 'Applicant profile not found. Please create your profile first.' },
        { status: 404 },
      )
    }

    // Store file info as data URI in the database
    const dataUri = `data:${file.type};base64,${base64data}`

    const document = await db.applicantDocument.create({
      data: {
        applicantId: applicantProfile.id,
        documentType: 'resume',
        fileName: file.name,
        filePath: dataUri,
        fileSize: file.size,
        mimeType: file.type,
        isVerified: false,
      },
    })

    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      documentType: document.documentType,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
