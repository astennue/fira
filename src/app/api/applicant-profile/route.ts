import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireFira } from '@/lib/auth'

const FIRA_ROLES = ['super_admin', 'staff', 'international_agency'] as const

function checkProfileAccess(auth: { userId: string; userRole: string }, requestUserId: string): NextResponse | null {
  // FIRA roles can access any profile
  if (FIRA_ROLES.includes(auth.userRole as any)) return null
  // Otherwise, user can only access their own profile
  if (auth.userId !== requestUserId) {
    return NextResponse.json({ error: 'You can only access your own profile' }, { status: 403 })
  }
  return null
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    // Check access: own profile or FIRA role
    const accessCheck = checkProfileAccess(auth, userId)
    if (accessCheck) return accessCheck

    const profile = await db.applicantProfile.findUnique({
      where: { userId },
      include: {
        education: { orderBy: { startYear: 'desc' } },
        experience: { orderBy: { startDate: 'desc' } },
        skills: true,
        languages: true,
        certifications: { orderBy: { issuedDate: 'desc' } },
        documents: true,
        references: true,
        trainings: true,
      },
    })

    if (!profile) return NextResponse.json({ profile: null, education: [], experience: [], skills: [], languages: [], certifications: [], documents: [], references: [], trainings: [] })

    return NextResponse.json({ profile, education: profile.education, experience: profile.experience, skills: profile.skills, languages: profile.languages, certifications: profile.certifications, documents: profile.documents, references: profile.references, trainings: profile.trainings })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { userId, ...data } = body
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    // Check access: own profile or FIRA role
    const accessCheck = checkProfileAccess(auth, userId)
    if (accessCheck) return accessCheck

    const existing = await db.applicantProfile.findUnique({ where: { userId } })
    if (existing) return NextResponse.json({ error: 'Profile already exists. Use PUT to update.' }, { status: 409 })

    const profile = await db.applicantProfile.create({ data: { userId, ...data } })
    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { userId, ...data } = body
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    // Check access: own profile or FIRA role
    const accessCheck = checkProfileAccess(auth, userId)
    if (accessCheck) return accessCheck

    // Update profile
    const profileFields: Record<string, unknown> = {}
    const allowedFields = ['firstName', 'middleName', 'lastName', 'suffixName', 'gender', 'birthDate', 'birthPlace', 'civilStatus', 'religion', 'height', 'weight', 'address', 'city', 'province', 'region', 'zipCode', 'phone', 'altPhone', 'email', 'applicantType', 'householdTasks', 'passportNo', 'passportExpiry', 'passportStatus', 'hasVisa', 'visaCountry', 'visaType', 'visaStatus', 'visaExpiry', 'medicalStatus', 'medicalExpiry', 'highestEducation', 'yearsExperience', 'preferredCountry', 'preferredJob', 'salaryExpectation', 'availabilityDate', 'resumeText', 'emergencyName', 'emergencyRelation', 'emergencyPhone', 'formStep', 'isComplete']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (['birthDate', 'passportExpiry', 'medicalExpiry', 'visaExpiry'].includes(field) && data[field]) {
          profileFields[field] = new Date(data[field])
        } else if (['hasVisa', 'isComplete'].includes(field)) {
          profileFields[field] = Boolean(data[field])
        } else if (['yearsExperience'].includes(field)) {
          profileFields[field] = data[field] ? Number(data[field]) : null
        } else {
          profileFields[field] = data[field]
        }
      }
    }

    const profile = await db.applicantProfile.upsert({
      where: { userId },
      update: profileFields as any,
      create: { userId, ...profileFields } as any,
    })

    // Handle nested arrays: education, experience, skills, languages, certifications, documents, references, trainings
    const nestedArrays = ['education', 'experience', 'skills', 'languages', 'certifications', 'documents', 'references', 'trainings'] as const
    const modelMap: Record<string, any> = {
      education: 'applicantEducation',
      experience: 'applicantExperience',
      skills: 'applicantSkill',
      languages: 'applicantLanguage',
      certifications: 'applicantCertification',
      documents: 'applicantDocument',
      references: 'applicantReference',
      trainings: 'applicantTraining',
    }

    for (const arrType of nestedArrays) {
      const items = data[arrType]
      if (!Array.isArray(items)) continue

      // Delete existing items and recreate
      const model: any = db[modelMap[arrType]]
      await model.deleteMany({ where: { applicantId: profile.id } })

      for (const item of items) {
        const { id, ...createData } = item
        createData.applicantId = profile.id
        if (['birthDate', 'issuedDate', 'expiryDate', 'startDate', 'endDate'].some(f => createData[f])) {
          for (const dateField of ['birthDate', 'issuedDate', 'expiryDate', 'startDate', 'endDate']) {
            if (createData[dateField]) createData[dateField] = new Date(createData[dateField])
          }
        }
        if (createData.yearsExperience) createData.yearsExperience = Number(createData.yearsExperience)
        if (createData.hours) createData.hours = Number(createData.hours)
        await model.create({ data: createData })
      }
    }

    const updatedProfile = await db.applicantProfile.findUnique({
      where: { userId },
      include: { education: true, experience: true, skills: true, languages: true, certifications: true, documents: true, references: true, trainings: true },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
