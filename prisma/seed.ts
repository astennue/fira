import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('🌱 Seeding FIRA database...')

  // Clean existing data
  const tables = [
    'VerificationCode', 'CmsSettings', 'CmsFormField', 'CmsTermsPrivacy',
    'CmsOrgChart', 'CmsSocialMedia', 'CmsTestimonial', 'CmsFaq', 'CmsPage',
    'ResumeEnhancement', 'AIAnalysisResult', 'Notification', 'Endorsement',
    'ATSStageHistory', 'ApplicationCustomResponse', 'Application',
    'ATSStage', 'JobCustomField', 'JobOrder', 'ApplicantTraining',
    'ApplicantDocument', 'ApplicantReference', 'ApplicantCertification',
    'ApplicantLanguage', 'ApplicantSkill', 'ApplicantExperience',
    'ApplicantEducation', 'ApplicantProfile', 'EmployerProfile',
    'AgencyMember', 'Agency', 'User'
  ]

  for (const table of tables) {
    try {
      await (db as any)[table].deleteMany()
    } catch (e) {
      // ignore
    }
  }

  // ============ USERS ============
  console.log('  Creating users...')
  const user0 = await db.user.create({
    data: {
      email: 'admin@fira.com.ph', password: await hashPassword('admin2025!'),
      name: 'FIRA Super Admin', role: 'super_admin', phone: '+212 662 261 499',
      isActive: true, isApproved: true,
    },
  })
  const user1 = await db.user.create({
    data: {
      email: 'staff@fira.com.ph', password: await hashPassword('staff2025!'),
      name: 'FIRA Staff Member', role: 'staff', phone: '+212 662 260 805',
      isActive: true, isApproved: true,
    },
  })
  const user2 = await db.user.create({
    data: {
      email: 'applicant@fira.com.ph', password: await hashPassword('applicant2025!'),
      name: 'Maria Santos', role: 'applicant', phone: '+63 917 123 4567',
      isActive: true, isApproved: true,
    },
  })
  const user3 = await db.user.create({
    data: {
      email: 'agency@fira.com.ph', password: await hashPassword('agency2025!'),
      name: 'Juan Dela Cruz', role: 'local_agency', phone: '+63 2 8888 5678',
      isActive: true, isApproved: true,
    },
  })
  const user4 = await db.user.create({
    data: {
      email: 'employer@fira.com.ph', password: await hashPassword('employer2025!'),
      name: 'Ahmed Bennani', role: 'employer', phone: '+212 662 260 336',
      isActive: true, isApproved: true,
    },
  })
  const users = [user0, user1, user2, user3, user4]

  // ============ AGENCY & MEMBERS ============
  console.log('  Creating agencies...')
  const agency = await db.agency.create({
    data: {
      name: 'Manila Recruitment Corp', agencyType: 'local',
      address: '123 Ayala Ave, Makati City', city: 'Makati', country: 'Philippines',
      licenseNo: 'POEA-LB-2024-001', phone: '+63 2 8888 5678',
      email: 'info@manilarecruit.ph', isActive: true, isApproved: true,
    },
  })
  await db.agencyMember.create({
    data: { userId: users[3].id, agencyId: agency.id, role: 'admin' },
  })

  // ============ EMPLOYER PROFILE ============
  console.log('  Creating employer profile...')
  const employerProfile = await db.employerProfile.create({
    data: {
      userId: users[4].id, companyName: 'Al Baraka Holding',
      companyAddress: 'Casablanca, Morocco', country: 'Morocco',
      industry: 'Household Services', contactPerson: 'Ahmed Bennani',
      contactEmail: 'ahmed@albaraka.ma', contactPhone: '+212 662 260 336',
      website: 'https://albaraka.ma',
    },
  })

  // ============ APPLICANT PROFILE ============
  console.log('  Creating applicant profile...')
  await db.applicantProfile.create({
    data: {
      userId: users[2].id, firstName: 'Maria', middleName: 'Garcia', lastName: 'Santos',
      gender: 'Female', nationality: 'Filipino', civilStatus: 'Single',
      address: '456 Rizal St, Quezon City', city: 'Quezon City', province: 'Metro Manila',
      region: 'NCR', phone: '+63 917 123 4567',
      applicantType: 'domestic_helper', highestEducation: 'college_vocational',
      yearsExperience: 3, preferredCountry: 'Morocco', preferredJob: 'Household Service Worker',
      passportNo: 'PN1234567', passportStatus: 'valid',
      medicalStatus: 'passed', formStep: 3, isComplete: true,
    },
  })

  // ============ JOBS ============
  console.log('  Creating job orders...')
  const jobsData = [
    { title: 'Household Service Worker / Nanny', description: 'Looking for experienced Filipino household service workers to work in Morocco.', country: 'Morocco', city: 'Casablanca', category: 'domestic_helper', jobType: 'domestic_helper', salaryMin: 400, salaryMax: 600, duration: '2 years', slots: 10, requirements: 'At least 2 years experience as household worker.', benefits: 'Free housing, free food, medical insurance', requiredSkills: 'Household management, Cooking, Child care' },
    { title: 'Caregiver for Elderly Care', description: 'Seeking compassionate Filipino caregivers for elderly patients in Morocco.', country: 'Morocco', city: 'Rabat', category: 'caregiver', jobType: 'domestic_helper', salaryMin: 500, salaryMax: 700, duration: '2 years', slots: 5, requirements: 'Certificate in caregiving. At least 1 year experience.', benefits: 'Free housing, medical insurance, overtime pay', requiredSkills: 'Elderly care, First aid, Patient care' },
    { title: 'Professional Nurse - Hospital', description: 'Hiring licensed Filipino nurses for a major hospital in Morocco.', country: 'Morocco', city: 'Casablanca', category: 'nurse', jobType: 'skills_professional', salaryMin: 1200, salaryMax: 1800, duration: '3 years', slots: 15, requirements: 'BSN degree, valid PRC license, 2 years hospital experience.', benefits: 'Free housing, medical insurance, relocation allowance', requiredSkills: 'Patient assessment, IV therapy, Medication administration' },
    { title: 'Factory Worker - Electronics', description: 'Looking for skilled Filipino workers for electronics manufacturing.', country: 'Morocco', city: 'Tangier', category: 'factory', jobType: 'skills_professional', salaryMin: 600, salaryMax: 900, duration: '2 years', slots: 20, requirements: 'High school graduate. Electronics assembly experience preferred.', benefits: 'Free housing, transportation, medical insurance', requiredSkills: 'Electronics assembly, Quality control, Teamwork' },
    { title: 'Hotel Staff - Hospitality', description: 'Hiring experienced Filipino hospitality workers for a luxury hotel.', country: 'Morocco', city: 'Marrakech', category: 'hospitality', jobType: 'skills_professional', salaryMin: 700, salaryMax: 1000, duration: '2 years', slots: 8, requirements: 'Experience in hotel or restaurant service.', benefits: 'Free housing, meals, uniform, medical insurance', requiredSkills: 'Customer service, Housekeeping, Food service' },
  ]

  const jobs: any[] = []
  for (const data of jobsData) {
    const job = await db.jobOrder.create({
      data: {
        ...data,
        salaryCurrency: 'USD',
        salaryPeriod: 'monthly',
        contractType: 'full_time',
        status: 'open',
        visibility: 'public',
        employerId: employerProfile.id,
        agencyId: agency.id,
        createdBy: users[0].id,
      },
    })
    jobs.push(job)
  }

  // ============ ATS STAGES ============
  console.log('  Creating ATS stages...')
  for (const job of jobs) {
    const stages = [
      { name: 'Applied', order: 0, color: '#3b82f6' },
      { name: 'Screening', order: 1, color: '#f59e0b' },
      { name: 'Interview', order: 2, color: '#8b5cf6' },
      { name: 'Assessment', order: 3, color: '#ec4899' },
      { name: 'Offer', order: 4, color: '#10b981' },
      { name: 'Deployed', order: 5, color: '#06b6d4' },
    ]
    for (const s of stages) {
      await db.aTSStage.create({ data: { jobOrderId: job.id, ...s } })
    }
  }

  // ============ APPLICATIONS ============
  console.log('  Creating applications...')
  const stage1 = await db.aTSStage.findFirst({ where: { jobOrderId: jobs[0].id, order: 0 } })
  if (stage1) {
    await db.application.create({
      data: {
        applicantId: users[2].id, jobOrderId: jobs[0].id,
        status: 'applied', currentStageId: stage1.id,
        coverLetter: 'I am a hardworking and dedicated household worker with 3 years of experience.',
      },
    })
  }

  // ============ FAQs ============
  console.log('  Creating FAQs...')
  const faqsData = [
    { question: 'What types of jobs does FIRA offer?', answer: 'FIRA offers a wide range of overseas jobs including domestic helpers, caregivers, nurses, hotel staff, factory workers, construction workers, and more. We partner with employers in Morocco, Middle East, and other regions.', category: 'Jobs', order: 1 },
    { question: 'How do I apply for a job?', answer: 'Simply register on our platform, complete your profile with your resume and documents, browse available job openings, and click "Apply Now" on any job that interests you. Our team will review your application and guide you through the process.', category: 'Application', order: 2 },
    { question: 'Is there a placement fee?', answer: 'FIRA is committed to ethical recruitment practices. We comply with POEA regulations regarding placement fees. Please contact us directly for specific information about fees related to your chosen position.', category: 'Fees', order: 3 },
    { question: 'What documents do I need to prepare?', answer: 'Typical requirements include: valid passport, NSO/PSA birth certificate, NBI clearance, medical certificate, employment certificates, training certificates, and 2x2 photos. Specific requirements may vary by position.', category: 'Documents', order: 4 },
    { question: 'How long does the deployment process take?', answer: 'The process typically takes 2-6 months depending on the position and employer requirements. This includes document processing, medical examination, visa application, and pre-departure orientation.', category: 'Process', order: 5 },
    { question: 'Does FIRA provide support after deployment?', answer: 'Yes! FIRA provides continuous support to all deployed workers. We have a monitoring system to check on your welfare, and you can contact us anytime for assistance with work-related concerns.', category: 'Support', order: 6 },
  ]
  for (const faq of faqsData) {
    await db.cmsFaq.create({ data: faq })
  }

  // ============ TESTIMONIALS ============
  console.log('  Creating testimonials...')
  const testimonialsData = [
    { name: 'Maria Santos', position: 'Household Service Worker', company: 'Al Baraka Holding', feedback: 'FIRA helped me find a good job in Morocco. They supported me every step of the way. Now I can provide a better life for my family.', rating: 5, avatar: null },
    { name: 'Ana Reyes', position: 'Caregiver', company: 'Rabat Healthcare', feedback: 'The process was smooth and professional. FIRA staff are very caring and always available to answer questions.', rating: 5, avatar: null },
    { name: 'Carmen Garcia', position: 'Hotel Staff', company: 'Marrakech Resort', feedback: 'I am grateful to FIRA for this opportunity. Working in Morocco has been a great experience for me and my family.', rating: 4, avatar: null },
    { name: 'Rosa Lim', position: 'Nurse', company: 'Casablanca Medical Center', feedback: 'FIRA made the entire deployment process easy. From application to arrival, everything was well-organized.', rating: 5, avatar: null },
    { name: 'Jose Mendoza', position: 'Factory Worker', company: 'Tangier Electronics', feedback: 'Good company, good benefits. FIRA is a trusted agency that truly cares for Filipino workers.', rating: 4, avatar: null },
  ]
  for (const t of testimonialsData) {
    await db.cmsTestimonial.create({ data: t })
  }

  // ============ SOCIAL MEDIA ============
  console.log('  Creating social media links...')
  const socialsData = [
    { platform: 'facebook', title: 'Facebook', url: 'https://facebook.com/filinternational', icon: 'facebook', order: 1 },
    { platform: 'instagram', title: 'Instagram', url: 'https://instagram.com/filinternational', icon: 'instagram', order: 2 },
    { platform: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com/company/filinternational', icon: 'linkedin', order: 3 },
    { platform: 'twitter', title: 'Twitter / X', url: 'https://twitter.com/filinternational', icon: 'twitter', order: 4 },
    { platform: 'whatsapp', title: 'WhatsApp', url: 'https://wa.me/212662261499', icon: 'whatsapp', order: 5 },
    { platform: 'youtube', title: 'YouTube', url: 'https://youtube.com/@filinternational', icon: 'youtube', order: 6 },
    { platform: 'tiktok', title: 'TikTok', url: 'https://tiktok.com/@filinternational', icon: 'tiktok', order: 7 },
  ]
  for (const s of socialsData) {
    await db.cmsSocialMedia.create({ data: s })
  }

  // ============ ORG CHART ============
  console.log('  Creating org chart...')
  const orgData = [
    { name: 'Fil International Management', position: 'CEO / Managing Director', department: 'Executive', order: 1, email: 'info@filinternational.ma', phone: '+212 662 261 499' },
    { name: 'Recruitment Department', position: 'Head of Recruitment', department: 'Recruitment', order: 2, email: 'recruitment@filinternational.ma', phone: '+212 662 260 805' },
    { name: 'Documents & Processing', position: 'Documents Manager', department: 'Processing', order: 3, email: 'docs@filinternational.ma', phone: '+212 662 260 806' },
    { name: 'Employer Relations', position: 'Employer Liaison', department: 'Relations', order: 4, email: 'relations@filinternational.ma', phone: '+212 662 260 807' },
    { name: 'Worker Welfare', position: 'Welfare Officer', department: 'Welfare', order: 5, email: 'welfare@filinternational.ma', phone: '+212 662 260 808' },
    { name: 'IT & Systems', position: 'IT Administrator', department: 'IT', order: 6, email: 'it@filinternational.ma', phone: '+212 662 260 809' },
  ]
  for (const org of orgData) {
    await db.cmsOrgChart.create({ data: org })
  }

  // ============ TERMS & PRIVACY ============
  console.log('  Creating terms & privacy...')
  await db.cmsTermsPrivacy.create({
    data: {
      type: 'terms_of_service',
      title: 'Terms of Service',
      content: '## Terms of Service\n\n**Fil International Recruitment Agency (FIRA)**\n\n### 1. Acceptance of Terms\nBy accessing and using the FIRA platform, you agree to be bound by these Terms of Service.\n\n### 2. Services\nFIRA provides overseas recruitment and deployment services for Filipino workers seeking international employment opportunities.\n\n### 3. User Responsibilities\n- Provide accurate and truthful information\n- Maintain the confidentiality of your account\n- Comply with all applicable laws and regulations\n\n### 4. Privacy\nYour personal information is handled in accordance with our Data Privacy Policy.\n\n### 5. Limitation of Liability\nFIRA acts as an intermediary between job seekers and employers. We strive for accuracy but cannot guarantee specific employment outcomes.',
      version: '1.0',
    },
  })
  await db.cmsTermsPrivacy.create({
    data: {
      type: 'data_privacy_consent',
      title: 'Data Privacy Consent',
      content: '## Data Privacy Consent\n\n**Fil International Recruitment Agency (FIRA)**\n\n### 1. Data Collection\nWe collect personal information necessary for recruitment purposes including: name, contact details, educational background, work experience, and government-issued IDs.\n\n### 2. Data Usage\nYour information will be used for:\n- Matching you with suitable job opportunities\n- Processing your employment application\n- Communicating with you about recruitment updates\n- Compliance with government reporting requirements\n\n### 3. Data Protection\nWe implement appropriate security measures to protect your personal information from unauthorized access.\n\n### 4. Data Sharing\nYour information may be shared with:\n- Prospective employers (with your consent)\n- Government agencies (as required by law)\n- Partner agencies involved in the deployment process\n\n### 5. Your Rights\nYou have the right to access, correct, and request deletion of your personal data.',
      version: '1.0',
    },
  })

  // ============ CMS PAGES ============
  console.log('  Creating CMS pages...')
  await db.cmsPage.create({
    data: {
      title: 'About FIRA',
      slug: 'about-fira',
      content: 'Fil International Recruitment Agency (FIRA) is a licensed recruitment agency based in Casablanca, Morocco. We specialize in recruiting, deploying, and monitoring Filipino workers for international employment opportunities.\n\nFounded with the mission of connecting skilled Filipino workers with reputable employers worldwide, FIRA operates under the highest ethical standards and full compliance with both Philippine and international labor laws.',
      status: 'published',
      order: 1,
    },
  })
  await db.cmsPage.create({
    data: {
      title: 'Our Services',
      slug: 'our-services',
      content: 'FIRA offers comprehensive recruitment services including: job matching, document processing, medical coordination, visa assistance, pre-departure orientation, and post-deployment monitoring.',
      status: 'published',
      order: 2,
    },
  })

  // ============ FORM FIELDS ============
  console.log('  Creating form fields...')
  const formFieldsData = [
    { label: 'Full Name', fieldType: 'text', isRequired: true, order: 1, section: 'Personal Information' },
    { label: 'Email Address', fieldType: 'email', isRequired: true, order: 2, section: 'Personal Information' },
    { label: 'Phone Number', fieldType: 'phone', isRequired: true, order: 3, section: 'Personal Information' },
    { label: 'Date of Birth', fieldType: 'date', isRequired: true, order: 4, section: 'Personal Information' },
    { label: 'Gender', fieldType: 'select', isRequired: true, order: 5, section: 'Personal Information', options: '["Male","Female"]' },
    { label: 'Civil Status', fieldType: 'select', isRequired: true, order: 6, section: 'Personal Information', options: '["Single","Married","Widowed","Separated"]' },
    { label: 'Present Address', fieldType: 'textarea', isRequired: true, order: 7, section: 'Personal Information' },
    { label: 'Highest Education', fieldType: 'select', isRequired: true, order: 8, section: 'Education & Experience', options: '["Elementary","High School","College","Vocational","Graduate"]' },
    { label: 'Years of Experience', fieldType: 'number', isRequired: true, order: 9, section: 'Education & Experience' },
    { label: 'Preferred Country', fieldType: 'select', isRequired: true, order: 10, section: 'Preferences', options: '["Morocco","Saudi Arabia","UAE","Qatar","Kuwait","Other"]' },
    { label: 'Preferred Job Category', fieldType: 'select', isRequired: true, order: 11, section: 'Preferences', options: '["Domestic Helper","Caregiver","Nurse","Hotel Staff","Factory Worker","Construction","Other"]' },
    { label: 'Upload Resume (PDF)', fieldType: 'file', isRequired: false, order: 12, section: 'Documents' },
  ]
  for (const field of formFieldsData) {
    await db.cmsFormField.create({ data: field })
  }

  // ============ SETTINGS ============
  console.log('  Creating settings...')
  const settingsData = [
    { key: 'site_name', value: 'Fil International Recruitment Agency (FIRA)' },
    { key: 'site_tagline', value: 'Your Gateway to Opportunities Abroad' },
    { key: 'site_email', value: 'manpower@filinternational.ma' },
    { key: 'site_phone', value: '+212 662 261 499' },
    { key: 'site_address', value: '59 Boulevard Zerktouni, Casablanca, Morocco' },
    { key: 'primary_color', value: '#1e3a8a' },
  ]
  for (const setting of settingsData) {
    await db.cmsSettings.create({ data: setting })
  }

  // ============ NOTIFICATIONS ============
  console.log('  Creating notifications...')
  await db.notification.create({
    data: {
      userId: users[2].id, title: 'Welcome to FIRA!',
      message: 'Thank you for registering. Browse our available job openings and start your journey abroad.',
      type: 'info', isRead: false,
    },
  })
  await db.notification.create({
    data: {
      userId: users[2].id, title: 'New Jobs Available',
      message: 'We have new job openings in Morocco. Check them out now!',
      type: 'info', isRead: false,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📋 Test Accounts:')
  console.log('  Super Admin: admin@fira.com.ph / admin2025!')
  console.log('  Staff:       staff@fira.com.ph / staff2025!')
  console.log('  Applicant:   applicant@fira.com.ph / applicant2025!')
  console.log('  Agency:      agency@fira.com.ph / agency2025!')
  console.log('  Employer:    employer@fira.com.ph / employer2025!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
