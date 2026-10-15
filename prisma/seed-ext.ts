/**
 * MatchWise prototype extension seed — rich demo data for the hi-fi clickable prototype.
 * Adds: extra applicants w/ full profiles, extra agencies/employers, applications spread
 * across the 19-state status machine, 2-step endorsements, simulated AI match scores,
 * documents, stage history (audit trail), and notifications.
 * Idempotent: skips rows that already exist.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MatchWise extension data...')

  // ---------- Employers ----------
  let amal = await db.employerProfile.findFirst({ where: { companyName: 'AI Amal Clinic' } })
  const ahmed = await db.user.findUnique({ where: { email: 'employer@fira.com.ph' } })
  if (!amal) {
    const uAmal = await db.user.create({
      data: {
        email: 'amal@fira.com.ph', password: await bcrypt.hash('employer2025!', 12),
        name: 'Dr. Samira Al Amal', role: 'employer', isActive: true, isApproved: true,
      },
    })
    amal = await db.employerProfile.create({
      data: {
        userId: uAmal.id, companyName: 'AI Amal Clinic',
        companyAddress: '12 Avenue Mohammed V, Rabat', country: 'Morocco',
        industry: 'Healthcare', contactPerson: 'Dr. Samira Al Amal',
        contactEmail: 'hr@amalclinic.ma', contactPhone: '+212 537 220 144',
        website: 'https://amalclinic.ma',
      },
    })
  }
  let resort = await db.employerProfile.findFirst({ where: { companyName: 'Marrakech Luxury Resorts Group' } })
  if (!resort) {
    const uResort = await db.user.create({
      data: {
        email: 'resorts@fira.com.ph', password: await bcrypt.hash('employer2025!', 12),
        name: 'Youssef El Fassi', role: 'employer', isActive: true, isApproved: true,
      },
    })
    resort = await db.employerProfile.create({
      data: {
        userId: uResort.id, companyName: 'Marrakech Luxury Resorts Group',
        companyAddress: 'Palmeraie District, Marrakech', country: 'Morocco',
        industry: 'Hospitality', contactPerson: 'Youssef El Fassi',
        contactEmail: 'talent@mlrg.ma', contactPhone: '+212 524 330 910',
        website: 'https://mlrg.ma',
      },
    })
  }

  // ---------- Agency #2 ----------
  const cebu = await db.agency.findFirst({ where: { name: 'Cebu Global Manpower Intl' } })
  if (!cebu) {
    const uCebu = await db.user.create({
      data: {
        email: 'cebu@fira.com.ph', password: await bcrypt.hash('agency2025!', 12),
        name: 'Marites Villanueva', role: 'local_agency', isActive: true, isApproved: true,
      },
    })
    const ag2 = await db.agency.create({
      data: {
        name: 'Cebu Global Manpower Intl', agencyType: 'local',
        address: '22 Osmeña Blvd, Cebu City', city: 'Cebu', country: 'Philippines',
        licenseNo: 'DMW-LB-2024-118', phone: '+63 32 255 8819',
        email: 'deploy@cebuglobal.ph', isActive: true, isApproved: true,
      },
    })
    await db.agencyMember.create({ data: { userId: uCebu.id, agencyId: ag2.id, role: 'admin' } })
  }

  // ---------- Applicants ----------
  const applicants = [
    {
      email: 'ana@fira.com.ph', name: 'Ana Reyes',
      profile: { firstName: 'Ana', lastName: 'Reyes', gender: 'Female', city: 'Davao City', province: 'Davao del Sur', region: 'XI', applicantType: 'caregiver', highestEducation: 'college_vocational', yearsExperience: 4, preferredCountry: 'Morocco', preferredJob: 'Caregiver', passportNo: 'PN7781203', passportStatus: 'valid', medicalStatus: 'passed', formStep: 3, isComplete: true },
      skills: [['Elderly care', 'advanced', 4], ['First aid', 'advanced', 3], ['Patient care', 'advanced', 4], ['Medication management', 'intermediate', 2], ['Housekeeping', 'intermediate', 4]],
      languages: [['English', 'fluent'], ['Tagalog', 'native'], ['Arabic', 'basic']],
      certs: [['TESDA Caregiving NC II', 'TESDA'], ['Red Cross First Aid & BLS', 'Philippine Red Cross']],
      docs: [['passport', 'passport_ana.pdf', true], ['medical_certificate', 'med_ana.pdf', true], ['nbi_clearance', 'nbi_ana.pdf', true], ['training_certificate', 'tesda_ana.pdf', true]],
    },
    {
      email: 'joy@fira.com.ph', name: 'Joy Aquino',
      profile: { firstName: 'Joy', lastName: 'Aquino', gender: 'Female', city: 'Pampanga', province: 'Pampanga', region: 'III', applicantType: 'domestic_helper', highestEducation: 'high_school', yearsExperience: 5, preferredCountry: 'Morocco', preferredJob: 'Household Service Worker', passportNo: 'PN5590341', passportStatus: 'valid', medicalStatus: 'passed', formStep: 3, isComplete: true },
      skills: [['Household management', 'advanced', 5], ['Cooking', 'advanced', 5], ['Child care', 'advanced', 4], ['Laundry & Ironing', 'advanced', 5], ['Pet Care', 'intermediate', 2]],
      languages: [['English', 'conversational'], ['Tagalog', 'native'], ['Arabic', 'basic']],
      certs: [['TESDA Household Services NC II', 'TESDA']],
      docs: [['passport', 'passport_joy.pdf', true], ['medical_certificate', 'med_joy.pdf', true], ['nbi_clearance', 'nbi_joy.pdf', false]],
    },
    {
      email: 'carmen@fira.com.ph', name: 'Carmen Garcia',
      profile: { firstName: 'Carmen', lastName: 'Garcia', gender: 'Female', city: 'Iloilo City', province: 'Iloilo', region: 'VI', applicantType: 'skills_professional', highestEducation: 'college_bachelor', yearsExperience: 3, preferredCountry: 'Morocco', preferredJob: 'Hotel Staff', passportNo: 'PN6621887', passportStatus: 'valid', medicalStatus: 'pending', formStep: 3, isComplete: true },
      skills: [['Customer service', 'advanced', 3], ['Food service', 'advanced', 3], ['Housekeeping', 'advanced', 3], ['Front desk operations', 'intermediate', 2]],
      languages: [['English', 'fluent'], ['Tagalog', 'native'], ['French', 'conversational']],
      certs: [['TESDA Commercial Cooking NC II', 'TESDA']],
      docs: [['passport', 'passport_carmen.pdf', true], ['nbi_clearance', 'nbi_carmen.pdf', true]],
    },
    {
      email: 'rosa@fira.com.ph', name: 'Rosa Lim',
      profile: { firstName: 'Rosa', lastName: 'Lim', gender: 'Female', city: 'Cebu City', province: 'Cebu', region: 'VII', applicantType: 'skills_professional', highestEducation: 'college_bachelor', yearsExperience: 6, preferredCountry: 'Morocco', preferredJob: 'Nurse', passportNo: 'PN4451029', passportStatus: 'valid', medicalStatus: 'passed', formStep: 3, isComplete: true },
      skills: [['Patient assessment', 'advanced', 6], ['IV therapy', 'advanced', 5], ['Medication administration', 'advanced', 6], ['Emergency response', 'advanced', 4], ['Patient education', 'intermediate', 3]],
      languages: [['English', 'fluent'], ['Tagalog', 'native'], ['Cebuano', 'native']],
      certs: [['PRC Registered Nurse', 'PRC'], ['BLS/ACLS Provider', 'Philippine Heart Association']],
      docs: [['passport', 'passport_rosa.pdf', true], ['medical_certificate', 'med_rosa.pdf', true], ['prc_license', 'prc_rosa.pdf', true]],
    },
    {
      email: 'jose@fira.com.ph', name: 'Jose Mendoza',
      profile: { firstName: 'Jose', lastName: 'Mendoza', gender: 'Male', city: 'Laguna', province: 'Laguna', region: 'IV-A', applicantType: 'skills_professional', highestEducation: 'high_school', yearsExperience: 4, preferredCountry: 'Morocco', preferredJob: 'Factory Worker', passportNo: 'PN3312876', passportStatus: 'valid', medicalStatus: 'passed', formStep: 3, isComplete: true },
      skills: [['Electronics assembly', 'advanced', 4], ['Quality control', 'intermediate', 3], ['Teamwork', 'advanced', 4], ['Machine operation', 'intermediate', 2]],
      languages: [['English', 'conversational'], ['Tagalog', 'native']],
      certs: [['TESDA Mechatronics NC II', 'TESDA']],
      docs: [['passport', 'passport_jose.pdf', true], ['medical_certificate', 'med_jose.pdf', false]],
    },
    {
      email: 'liza@fira.com.ph', name: 'Liza Navarro',
      profile: { firstName: 'Liza', lastName: 'Navarro', gender: 'Female', city: 'Bacolod City', province: 'Negros Occidental', region: 'VI', applicantType: 'caregiver', highestEducation: 'college_vocational', yearsExperience: 2, preferredCountry: 'Morocco', preferredJob: 'Caregiver', passportNo: 'PN8834102', passportStatus: 'new', medicalStatus: 'pending', formStep: 2, isComplete: false },
      skills: [['Elderly care', 'intermediate', 2], ['Companionship', 'intermediate', 2], ['Housekeeping', 'intermediate', 2]],
      languages: [['English', 'conversational'], ['Tagalog', 'native'], ['Ilonggo', 'native']],
      certs: [['TESDA Caregiving NC II', 'TESDA']],
      docs: [['passport', 'passport_liza.pdf', false]],
    },
    {
      email: 'ben@fira.com.ph', name: 'Ben Tordesillas',
      profile: { firstName: 'Ben', lastName: 'Tordesillas', gender: 'Male', city: 'Manila', province: 'Metro Manila', region: 'NCR', applicantType: 'skills_professional', highestEducation: 'college_bachelor', yearsExperience: 3, preferredCountry: 'Morocco', preferredJob: 'Nurse', passportNo: 'PN2290455', passportStatus: 'valid', medicalStatus: 'passed', formStep: 3, isComplete: true },
      skills: [['Patient assessment', 'intermediate', 3], ['IV therapy', 'intermediate', 2], ['Medication administration', 'advanced', 3], ['Documentation', 'advanced', 3]],
      languages: [['English', 'fluent'], ['Tagalog', 'native']],
      certs: [['PRC Registered Nurse', 'PRC']],
      docs: [['passport', 'passport_ben.pdf', true], ['prc_license', 'prc_ben.pdf', false]],
    },
  ]

  const applicantIds: Record<string, string> = {}
  for (const a of applicants) {
    let u = await db.user.findUnique({ where: { email: a.email } })
    if (!u) {
      u = await db.user.create({
        data: {
          email: a.email, password: await bcrypt.hash('applicant2025!', 12),
          name: a.name, role: 'applicant', isActive: true, isApproved: true,
        },
      })
    }
    applicantIds[a.email] = u.id
    let prof = await db.applicantProfile.findUnique({ where: { userId: u.id } })
    if (!prof) {
      prof = await db.applicantProfile.create({
        data: { userId: u.id, nationality: 'Filipino', civilStatus: 'Single', phone: '+63 917 000 0000', salaryExpectation: 'USD 500 - 900', availabilityDate: '2026-11-01', ...a.profile } as any,
      })
    }
    // skills
    for (const [name, level, years] of a.skills as [string, string, number][]) {
      const exists = await db.applicantSkill.findFirst({ where: { applicantId: prof.id, name } })
      if (!exists) await db.applicantSkill.create({ data: { applicantId: prof.id, name, level, yearsExperience: years } })
    }
    for (const [language, proficiency] of a.languages as [string, string][]) {
      const exists = await db.applicantLanguage.findFirst({ where: { applicantId: prof.id, language } })
      if (!exists) await db.applicantLanguage.create({ data: { applicantId: prof.id, language, proficiency } })
    }
    for (const [name, body] of a.certs as [string, string][]) {
      const exists = await db.applicantCertification.findFirst({ where: { applicantId: prof.id, name } })
      if (!exists) await db.applicantCertification.create({ data: { applicantId: prof.id, name, issuingBody: body, issuedDate: new Date('2024-03-01') } })
    }
    for (const [documentType, fileName, isVerified] of a.docs as [string, string, boolean][]) {
      const exists = await db.applicantDocument.findFirst({ where: { applicantId: prof.id, documentType, fileName } })
      if (!exists) await db.applicantDocument.create({ data: { applicantId: prof.id, documentType, fileName, isVerified, fileSize: 245760, mimeType: 'application/pdf' } })
    }
    // one experience row each
    const expExists = await db.applicantExperience.findFirst({ where: { applicantId: prof.id } })
    if (!expExists) {
      await db.applicantExperience.create({
        data: {
          applicantId: prof.id, company: 'Prior Employer (PH/UAE)', position: a.profile.preferredJob || 'Worker',
          country: 'Philippines', startDate: new Date('2021-06-01'), endDate: new Date('2024-08-30'),
          description: `Worked as ${a.profile.preferredJob} with growing responsibilities.`, monthlySalary: 'PHP 25,000',
        },
      })
    }
  }

  // ---------- Extra jobs (AI Amal Clinic — deck data, MAD currency) ----------
  const agencyRec = await db.agency.findFirst({ where: { name: 'Manila Recruitment Corp' } })
  const staff = await db.user.findUnique({ where: { email: 'staff@fira.com.ph' } })
  const nannyJob = await db.jobOrder.findFirst({ where: { title: 'Household Service Worker / Nanny' } })
  const caregiverJob = await db.jobOrder.findFirst({ where: { title: 'Caregiver for Elderly Care' } })
  const nurseJob = await db.jobOrder.findFirst({ where: { title: 'Professional Nurse - Hospital' } })
  const factoryJob = await db.jobOrder.findFirst({ where: { title: 'Factory Worker - Electronics' } })
  const hotelJob = await db.jobOrder.findFirst({ where: { title: 'Hotel Staff - Hospitality' } })
  const jobs = [nannyJob, caregiverJob, nurseJob, factoryJob, hotelJob]

  const amalJobs: any[] = []
  const amalJobsData = [
    { title: 'Domestic Helper - Casablanca', description: 'Trusted household for a family in central Casablanca. Filipino domestic helper with strong cooking and childcare experience preferred. Private room provided.', country: 'Morocco', city: 'Casablanca', category: 'domestic_helper', jobType: 'domestic_helper', salaryMin: 4200, salaryMax: 4800, duration: '2 years', slots: 4, requirements: '2+ years household experience, good English.', benefits: 'Private room, weekly rest day, airfare after contract, medical coverage', requiredSkills: 'Household management, Cooking, Child care' },
    { title: 'Caregiver - Rabat (Clinic-Managed)', description: 'AI Amal Clinic manages in-home elderly care placements in Rabat. Compassionate caregivers with NC II certification and first-aid training.', country: 'Morocco', city: 'Rabat', category: 'caregiver', jobType: 'domestic_helper', salaryMin: 5500, salaryMax: 6200, duration: '2 years', slots: 6, requirements: 'TESDA Caregiving NC II, first aid certificate, 2+ years experience.', benefits: 'MAD 5,500+ monthly, clinic-supervised, housing allowance, insurance', requiredSkills: 'Elderly care, First aid, Patient care, Medication management' },
  ]
  for (const d of amalJobsData) {
    let j = await db.jobOrder.findFirst({ where: { title: d.title } })
    if (!j) {
      j = await db.jobOrder.create({
        data: {
          ...d, salaryCurrency: 'MAD', salaryPeriod: 'monthly', contractType: 'full_time',
          status: 'open', visibility: 'public', employerId: amal.id, agencyId: agencyRec?.id,
          createdBy: staff?.id,
        },
      })
      const stages = [
        { name: 'Applied', order: 0, color: '#3b82f6' },
        { name: 'Screening', order: 1, color: '#f59e0b' },
        { name: 'Interview', order: 2, color: '#8b5cf6' },
        { name: 'Assessment', order: 3, color: '#ec4899' },
        { name: 'Offer', order: 4, color: '#10b981' },
        { name: 'Deployed', order: 5, color: '#06b6d4' },
      ]
      for (const s of stages) await db.aTSStage.create({ data: { jobOrderId: j.id, ...s } })
    }
    amalJobs.push(j)
  }

  const allJobs = [...jobs.filter(Boolean), ...amalJobs]
  const stageFor = (jobId: string, order: number) =>
    db.aTSStage.findFirst({ where: { jobOrderId: jobId, order } })

  // ---------- Applications across the 19-state machine ----------
  type AppRow = { email: string; jobIdx: number; status: string; stageOrder: number; score: number; note: string }
  const rows: AppRow[] = [
    { email: 'applicant@fira.com.ph', jobIdx: 0, status: 'applied', stageOrder: 0, score: 84, note: 'Application submitted via job board.' },
    { email: 'applicant@fira.com.ph', jobIdx: 6, status: 'interview', stageOrder: 2, score: 92, note: 'Interview set with AI Amal Clinic HR — Oct 9, 2:00 PM (video).' },
    { email: 'applicant@fira.com.ph', jobIdx: 4, status: 'screening', stageOrder: 1, score: 78, note: 'Documents under initial review.' },
    { email: 'applicant@fira.com.ph', jobIdx: 2, status: 'rejected', stageOrder: 1, score: 41, note: 'License verification did not proceed; profile kept for other roles.' },
    { email: 'ana@fira.com.ph', jobIdx: 6, status: 'pending_fira_review', stageOrder: 4, score: 92, note: 'Endorsed by agency — awaiting FIRA approval (step 1).' },
    { email: 'joy@fira.com.ph', jobIdx: 5, status: 'pending_employer_review', stageOrder: 4, score: 88, note: 'FIRA approved — awaiting employer acceptance (step 2).' },
    { email: 'rosa@fira.com.ph', jobIdx: 2, status: 'offered', stageOrder: 4, score: 95, note: 'Offer released; contract signing scheduled.' },
    { email: 'jose@fira.com.ph', jobIdx: 3, status: 'assessment', stageOrder: 3, score: 81, note: 'Skills assessment at TESDA-accredited center.' },
    { email: 'carmen@fira.com.ph', jobIdx: 4, status: 'shortlisted', stageOrder: 1, score: 76, note: 'Shortlisted by recruiter.' },
    { email: 'liza@fira.com.ph', jobIdx: 6, status: 'applied', stageOrder: 0, score: 71, note: 'Application submitted.' },
    { email: 'ben@fira.com.ph', jobIdx: 2, status: 'under_review', stageOrder: 1, score: 69, note: 'PRC license verification in progress.' },
    { email: 'ana@fira.com.ph', jobIdx: 4, status: 'withdrawn', stageOrder: 1, score: 74, note: 'Applicant withdrew — accepted competing offer.' },
    { email: 'joy@fira.com.ph', jobIdx: 0, status: 'deployed', stageOrder: 5, score: 86, note: 'Deployed — arrival confirmed at Casablanca.' },
    { email: 'rosa@fira.com.ph', jobIdx: 3, status: 'processing', stageOrder: 2, score: 72, note: 'Government processing (DMW).', },
    { email: 'ben@fira.com.ph', jobIdx: 3, status: 'hired', stageOrder: 4, score: 83, note: 'Hired — onboarding in progress.' },
    { email: 'carmen@fira.com.ph', jobIdx: 5, status: 'completed', stageOrder: 5, score: 80, note: 'Contract completed successfully.' },
  ]

  const appIds: Record<string, string> = {}
  const mariaUser = await db.user.findUnique({ where: { email: 'applicant@fira.com.ph' } })
  if (mariaUser) applicantIds['applicant@fira.com.ph'] = mariaUser.id
  let i = 0
  for (const r of rows) {
    const job = allJobs[r.jobIdx]
    if (!job) continue
    const applicantId = applicantIds[r.email]
    const existing = await db.application.findUnique({
      where: { applicantId_jobOrderId: { applicantId, jobOrderId: job.id } },
    })
    const stage = await stageFor(job.id, r.stageOrder)
    let appId: string
    if (existing) {
      appId = existing.id
    } else {
      const created = await db.application.create({
        data: {
          applicantId, jobOrderId: job.id, status: r.status, matchScore: r.score,
          currentStageId: stage?.id ?? null,
          coverLetter: 'I am committed, experienced, and eager to contribute to your household/team in Morocco.',
        },
      })
      appId = created.id
    }
    appIds[`app${i}`] = appId
    // AI analysis for most applications
    const hasAI = await db.aIAnalysisResult.findUnique({ where: { applicationId: appId } })
    if (!hasAI && r.status !== 'applied') {
      const semantic = Math.min(0.99, r.score / 100 + 0.03)
      await db.aIAnalysisResult.create({
        data: {
          applicationId: appId, matchScore: r.score, semanticScore: Math.round(semantic * 100) / 100,
          matchedSkills: JSON.stringify(['Household management', 'Cooking', 'Child care'].slice(0, 2 + (i % 2))),
          missingSkills: JSON.stringify(i % 3 === 0 ? ['Arabic basics'] : []),
          explanation: `Weighted score: 0.40 semantic fit + 0.40 skills overlap + 0.20 experience. ${r.score >= 85 ? 'Strong alignment across all dimensions.' : r.score >= 70 ? 'Good fit with minor gaps.' : 'Partial fit; skills gap identified.'}`,
        },
      })
    }
    // stage history (audit trail)
    const histCount = await db.aTSStageHistory.count({ where: { applicationId: appId } })
    if (histCount === 0 && stage) {
      await db.aTSStageHistory.create({
        data: { applicationId: appId, stageId: stage.id, movedBy: staff?.id, notes: r.note },
      })
    }
    i++
  }

  // ---------- Endorsements (2-step flow) ----------
  // step 1: pending_fira_review (Ana → Caregiver/Rabat = appIdx 4)
  const e1 = await db.endorsement.findFirst({ where: { applicationId: appIds['app4'] } })
  if (!e1) {
    await db.endorsement.create({
      data: {
        applicationId: appIds['app4'], endorsedById: applicantIds['ana@fira.com.ph'] && (await db.user.findUnique({ where: { email: 'agency@fira.com.ph' } }))!.id,
        employerId: amal.id, status: 'pending_fira_review',
        agencyNote: 'Top scorer (92) for this role. NC II certified, 4 yrs elderly-care experience, medical passed. Recommend immediate approval.',
      },
    })
  }
  // step 2: pending_employer_review (Joy → Domestic Helper Casablanca = appIdx 5)
  const e2 = await db.endorsement.findFirst({ where: { applicationId: appIds['app5'] } })
  if (!e2) {
    await db.endorsement.create({
      data: {
        applicationId: appIds['app5'], endorsedById: (await db.user.findUnique({ where: { email: 'agency@fira.com.ph' } }))!.id,
        employerId: amal.id, status: 'pending_employer_review',
        agencyNote: '5 yrs household experience, strong cooking profile, complete documents.',
        firaNote: 'Verified: passport valid, medical passed, DMW records clear. Approved by FIRA on Oct 1.',
      },
    })
  }
  // completed flow: employer_accepted (Rosa → Nurse = appIdx 6)
  const e3 = await db.endorsement.findFirst({ where: { applicationId: appIds['app6'] } })
  if (!e3) {
    await db.endorsement.create({
      data: {
        applicationId: appIds['app6'], endorsedById: (await db.user.findUnique({ where: { email: 'agency@fira.com.ph' } }))!.id,
        employerId: (await db.employerProfile.findFirst({ where: { companyName: 'Al Baraka Holding' } }))!.id,
        status: 'employer_accepted',
        agencyNote: '6 yrs hospital experience, PRC-licensed, ACLS certified.',
        firaNote: 'All credentials verified. FIRA approval granted.',
        employerNote: 'Accepted. Please schedule contract signing this week.',
      },
    })
  }
  // declined example (Carmen → Hotel, appIdx 15)
  const e4 = await db.endorsement.findFirst({ where: { applicationId: appIds['app15'] } })
  if (!e4) {
    await db.endorsement.create({
      data: {
        applicationId: appIds['app15'], endorsedById: (await db.user.findUnique({ where: { email: 'agency@fira.com.ph' } }))!.id,
        employerId: resort.id, status: 'employer_declined',
        agencyNote: 'Experienced in resort housekeeping and food service.',
        firaNote: 'Documents verified; approved by FIRA.',
        employerNote: 'Position filled internally this cycle. Will prioritize next intake.',
      },
    })
  }

  // ---------- Notifications ----------
  const maria = applicantIds['applicant@fira.com.ph']
  const notifs = [
    { userId: maria, title: 'Interview scheduled', message: 'Your interview with AI Amal Clinic is set for Oct 9, 2:00 PM (video call).', type: 'success', isRead: false },
    { userId: maria, title: 'New AI match: 87', message: 'Caregiver - Rabat (Clinic-Managed) at AI Amal Clinic matches your profile at 87.', type: 'info', isRead: false },
    { userId: maria, title: 'Resume parsed', message: 'AI Resume Boost updated your skills: 5 skills extracted, profile 92% complete.', type: 'info', isRead: true },
  ]
  for (const n of notifs) {
    const exists = await db.notification.findFirst({ where: { userId: n.userId, title: n.title } })
    if (!exists) await db.notification.create({ data: n })
  }

  console.log('✅ Extension seed complete.')
  console.log(`   Applicants: ${Object.keys(applicantIds).length + 1}, Jobs: ${allJobs.length}, Applications: ${Object.keys(appIds).length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
