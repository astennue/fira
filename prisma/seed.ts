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
  const users = await Promise.all([
    db.user.create({
      data: {
        email: 'admin@fira.com.ph', password: await hashPassword('admin2025!'),
        name: 'FIRA Super Admin', role: 'super_admin', phone: '+212 662 261 499',
        isActive: true, isApproved: true,
      },
    }),
    db.user.create({
      data: {
        email: 'staff@fira.com.ph', password: await hashPassword('staff2025!'),
        name: 'FIRA Staff Member', role: 'staff', phone: '+212 662 260 805',
        isActive: true, isApproved: true,
      },
    }),
    db.user.create({
      data: {
        email: 'applicant@fira.com.ph', password: await hashPassword('applicant2025!'),
        name: 'Maria Santos', role: 'applicant', phone: '+63 917 123 4567',
        isActive: true, isApproved: true,
      },
    }),
    db.user.create({
      data: {
        email: 'agency@fira.com.ph', password: await hashPassword('agency2025!'),
        name: 'Manila Recruitment Corp', role: 'local_agency', phone: '+63 2 8888 5678',
        isActive: true, isApproved: true,
      },
    }),
    db.user.create({
      data: {
        email: 'employer@fira.com.ph', password: await hashPassword('employer2025!'),
        name: 'Al Baraka Holding', role: 'employer', phone: '+212 662 260 336',
        isActive: true, isApproved: true,
      },
    }),
  ])

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
  await db.employerProfile.create({
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
  const jobs = await Promise.all([
    db.jobOrder.create({
      data: {
        title: 'Household Service Worker / Nanny', description: 'Looking for experienced Filipino household service workers to work in Morocco. Must be skilled in household chores, cooking, and child care.',
        country: 'Morocco', city: 'Casablanca', category: 'domestic_helper',
        jobType: 'domestic_helper', salaryMin: 400, salaryMax: 600,
        salaryCurrency: 'USD', salaryPeriod: 'monthly', contractType: 'full_time',
        duration: '2 years', slots: 10, requirements: 'At least 2 years experience as household worker. Can cook, clean, and take care of children. Must be able to communicate in basic English or Arabic.',
        benefits: 'Free housing, free food, round-trip airfare, medical insurance, 1 day off per week, annual leave with pay',
        requiredSkills: 'Household management, Cooking, Child care, Cleaning, Laundry',
        status: 'open', visibility: 'public', employerId: users[4].id, agencyId: agency.id, createdBy: users[0].id,
      },
    }),
    db.jobOrder.create({
      data: {
        title: 'Caregiver for Elderly Care', description: 'Seeking compassionate Filipino caregivers to provide care for elderly patients in private homes in Morocco.',
        country: 'Morocco', city: 'Rabat', category: 'caregiver',
        jobType: 'domestic_helper', salaryMin: 500, salaryMax: 700,
        salaryCurrency: 'USD', salaryPeriod: 'monthly', contractType: 'full_time',
        duration: '2 years', slots: 5, requirements: 'Certificate in caregiving. At least 1 year experience in elderly care. Patient, compassionate, and physically fit.',
        benefits: 'Free housing, free food, medical insurance, overtime pay, annual bonus',
        requiredSkills: 'Elderly care, First aid, Patient care, Medication management, Companionship',
        status: 'open', visibility: 'public', employerId: users[4].id, agencyId: agency.id, createdBy: users[0].id,
      },
    }),
    db.jobOrder.create({
      data: {
        title: 'Professional Nurse - Hospital', description: 'Hiring licensed Filipino nurses for a major hospital in Morocco. Must have valid PRC license and hospital experience.',
        country: 'Morocco', city: 'Casablanca', category: 'nurse',
        jobType: 'skills_professional', salaryMin: 1200, salaryMax: 1800,
        salaryCurrency: 'USD', salaryPeriod: 'monthly', contractType: 'full_time',
        duration: '3 years', slots: 15, requirements: 'BSN degree, valid PRC license, at least 2 years hospital experience, BLS/ACLS certified.',
        benefits: 'Free housing, medical insurance, relocation allowance, professional development, paid vacations',
        requiredSkills: 'Patient assessment, IV therapy, Medication administration, Nursing documentation, Emergency response',
        status: 'open', visibility: 'public', employerId: users[4].id, agencyId: agency.id, createdBy: users[0].id,
      },
    }),
    db.jobOrder.create({
      data: {
        title: 'Factory Worker - Electronics Assembly', description: 'Looking for skilled Filipino workers for electronics manufacturing company in Morocco.',
        country: 'Morocco', city: 'Tangier', category: 'factory',
        jobType: 'skills_professional', salaryMin: 600, salaryMax: 900,
        salaryCurrency: 'USD', salaryPeriod: 'monthly', contractType: 'full_time',
        duration: '2 years', slots: 20, requirements: 'At least high school graduate. Experience in electronics assembly preferred. Willing to work in shifts.',
        benefits: 'Free housing, transportation, medical insurance, overtime pay, performance bonus',
        requiredSkills: 'Electronics assembly, Quality control, Teamwork, Attention to detail',
        status: 'open', visibility: 'public', employerId: users[4].id, agencyId: agency.id, createdBy: users[0].id,
      },
    }),
    db.jobOrder.create({
      data: {
        title: 'Hotel Staff - Hospitality', description: 'Hiring experienced Filipino hospitality workers for a luxury hotel chain in Morocco.',
        country: 'Morocco', city: 'Marrakech', category: 'hospitality',
        jobType: 'skills_professional', salaryMin: 700, salaryMax: 1000,
        salaryCurrency: 'USD', salaryPeriod: 'monthly', contractType: 'full_time',
        duration: '2 years', slots: 8, requirements: 'Experience in hotel or restaurant service. Good communication skills. Professional appearance and demeanor.',
        benefits: 'Free housing, meals, uniform, medical insurance, tips, career advancement opportunities',
        requiredSkills: 'Customer service, Housekeeping, Food service, Front desk operations, English communication',
        status: 'open', visibility: 'public', employerId: users[4].id, agencyId: agency.id, createdBy: users[0].id,
      },
    }),
  ])

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
    await Promise.all(stages.map(s =>
      db.aTSStage.create({ data: { jobOrderId: job.id, ...s } })
    ))
  }

  // ============ APPLICATIONS ============
  console.log('  Creating applications...')
  const stage1 = await db.aTSStage.findFirst({ where: { jobOrderId: jobs[0].id, order: 0 } })
  if (stage1) {
    await db.application.create({
      data: {
        applicantId: users[2].id, jobOrderId: jobs[0].id,
        status: 'applied', currentStageId: stage1.id,
        coverLetter: 'I am a hardworking and dedicated household worker with 3 years of experience. I am skilled in cooking, cleaning, and child care.',
      },
    })
  }

  // ============ CMS DATA ============
  console.log('  Creating CMS content...')

  // FAQ
  const faqs = [
    { question: 'What services does FIRA provide?', answer: 'FIRA (Fil International Recruitment Agency) provides comprehensive overseas recruitment services including job matching, document processing, skills assessment, pre-departure orientation, and post-deployment monitoring. We connect Filipino workers with trusted employers in Morocco and other countries.', category: 'General' },
    { question: 'How do I apply for a job?', answer: 'To apply for a job: 1) Register an account on our platform, 2) Complete your applicant profile with your skills and documents, 3) Browse available job openings, 4) Submit your application with a cover letter. Our team will review your application and guide you through the process.', category: 'Application Process' },
    { question: 'What are the requirements for applying?', answer: 'Basic requirements include: Valid Philippine passport, at least 2 years of relevant work experience, educational certificates, NBI clearance, and medical certificate. Specific requirements may vary depending on the job category and country.', category: 'Requirements' },
    { question: 'Is there any placement fee?', answer: 'FIRA follows Philippine government regulations on placement fees. We do not charge illegal fees. Any processing fees are transparent and within the limits set by the Department of Migrant Workers (DMW). Please verify all fees before proceeding.', category: 'Fees' },
    { question: 'How long does the recruitment process take?', answer: 'The recruitment process typically takes 2-6 months depending on the job category and employer requirements. This includes application review, interview, medical examination, document processing, and visa application.', category: 'Application Process' },
    { question: 'What support do you provide after deployment?', answer: 'We provide comprehensive post-deployment support including: Regular check-ins with deployed workers, assistance with employer-related concerns, access to our 24/7 hotline, repatriation assistance when needed, and reintegration programs for returning workers.', category: 'Support' },
    { question: 'Do you offer training programs?', answer: 'Yes, we offer pre-departure training programs including: Language and cultural orientation, skills enhancement workshops, safety and rights awareness, and country-specific orientation for destination countries.', category: 'Training' },
    { question: 'How can employers partner with FIRA?', answer: 'Employers interested in partnering with FIRA can contact us through our website or directly via email/phone. We offer customized recruitment solutions including: Job posting and candidate sourcing, screening and skills assessment, document processing, and deployment coordination.', category: 'For Employers' },
  ]
  await Promise.all(faqs.map((f, i) =>
    db.cmsFaq.create({ data: { ...f, order: i } })
  ))

  // Testimonials
  const testimonials = [
    { name: 'Rosa Mendoza', position: 'Household Service Worker', company: 'Deployed to Morocco', feedback: 'FIRA helped me find a good employer in Morocco. The process was smooth and transparent. I am now able to provide a better life for my family back in the Philippines.', rating: 5 },
    { name: 'Juan Dela Cruz', position: 'Caregiver', company: 'Deployed to Morocco', feedback: 'The team at FIRA was very supportive from application to deployment. They made sure I was prepared and comfortable with my new role. I highly recommend FIRA to all OFWs.', rating: 5 },
    { name: 'Carmen Reyes', position: 'Nurse', company: 'Deployed to Morocco', feedback: 'As a nurse, I was looking for international opportunities. FIRA matched me with a great hospital in Morocco. The salary and benefits are excellent. Thank you FIRA!', rating: 4 },
    { name: 'Pedro Santos', position: 'Factory Worker', company: 'Deployed to Morocco', feedback: 'FIRA made the recruitment process easy and stress-free. Their team was always available to answer my questions. I am grateful for their professional service.', rating: 5 },
    { name: 'Ana Flores', position: 'Hotel Staff', company: 'Deployed to Morocco', feedback: 'I am very happy with my deployment through FIRA. The hotel I work for treats me well and the salary is competitive. FIRA truly cares about the welfare of Filipino workers.', rating: 5 },
  ]
  await Promise.all(testimonials.map(t =>
    db.cmsTestimonial.create({ data: t })
  ))

  // Social Media
  const socials = [
    { platform: 'facebook', title: 'Facebook', url: 'https://facebook.com/filinternational', order: 0 },
    { platform: 'instagram', title: 'Instagram', url: 'https://instagram.com/filinternational', order: 1 },
    { platform: 'whatsapp', title: 'WhatsApp', url: 'https://wa.me/212662261499', order: 2 },
    { platform: 'twitter', title: 'Twitter', url: 'https://twitter.com/filinternational', order: 3 },
    { platform: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com/company/filinternational', order: 4 },
    { platform: 'tiktok', title: 'TikTok', url: 'https://tiktok.com/@filinternational', order: 5 },
    { platform: 'youtube', title: 'YouTube', url: 'https://youtube.com/@filinternational', order: 6 },
  ]
  await Promise.all(socials.map(s =>
    db.cmsSocialMedia.create({ data: s })
  ))

  // Terms & Privacy
  await db.cmsTermsPrivacy.create({
    data: {
      type: 'terms_of_service',
      title: 'Terms of Service',
      content: `TERMS OF SERVICE

Last Updated: ${new Date().toISOString().split('T')[0]}

1. ACCEPTANCE OF TERMS
By accessing and using the FIRA (Fil International Recruitment Agency) platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.

2. ELIGIBILITY
You must be at least 18 years of age to use this platform. By using our services, you represent and warrant that you are of legal age to enter into a binding agreement.

3. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.

4. SERVICES
FIRA provides overseas recruitment services including but not limited to: job matching, document processing, skills assessment, pre-departure orientation, and post-deployment monitoring.

5. ACCURACY OF INFORMATION
You agree to provide accurate, current, and complete information in your application and profile. Providing false information may result in account termination.

6. FEES
Any applicable fees will be communicated transparently before any payment is required. FIRA complies with all Philippine government regulations regarding placement fees.

7. PRIVACY
Your use of our platform is also governed by our Privacy Policy, which is incorporated by reference into these Terms.

8. LIMITATION OF LIABILITY
FIRA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.

9. GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws of the Philippines.

10. CONTACT
For any questions regarding these Terms, please contact us at manpower@filinternational.ma or +212 6 62 26 14 99.`,
      version: '1.0',
    },
  })
  await db.cmsTermsPrivacy.create({
    data: {
      type: 'data_privacy_consent',
      title: 'Data Privacy Consent',
      content: `DATA PRIVACY CONSENT

Last Updated: ${new Date().toISOString().split('T')[0]}

FIRA (Fil International Recruitment Agency) is committed to protecting your personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173).

1. DATA COLLECTED
We collect personal information including but not limited to: full name, contact details, educational background, work experience, government-issued IDs, and medical records as required for recruitment processing.

2. PURPOSE OF COLLECTION
Your personal data is collected and processed for: processing your job application, matching you with suitable job opportunities, facilitating deployment procedures, and providing post-deployment support.

3. DATA SHARING
Your data may be shared with: potential employers (with your consent), government agencies (POEA/DMW, DOLE, etc.), partner recruitment agencies, and medical service providers as required for recruitment processing.

4. DATA SECURITY
We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.

5. DATA RETENTION
We retain your personal data for the duration necessary to fulfill the purposes outlined above, or as required by law.

6. YOUR RIGHTS
You have the right to: access your personal data, request correction of inaccurate data, request deletion of your data (subject to legal requirements), and withdraw your consent.

7. CONSENT
By using our platform, you consent to the collection, processing, and sharing of your personal data as described in this Privacy Notice.

8. CONTACT
For data privacy concerns, contact our Data Protection Officer at manpower@filinternational.ma.`,
      version: '1.0',
    },
  })

  // Org Chart
  const orgChart = [
    { name: 'Ahmed Bennani', position: 'General Manager', department: 'Executive', order: 0, email: 'gm@filinternational.ma' },
    { name: 'Fatima Zahra', position: 'Operations Director', department: 'Operations', order: 1, email: 'ops@filinternational.ma' },
    { name: 'Carlos Rivera', position: 'Recruitment Manager', department: 'Recruitment', order: 2, email: 'recruit@filinternational.ma' },
    { name: 'Aisha Benali', position: 'HR Manager', department: 'Human Resources', order: 3, email: 'hr@filinternational.ma' },
    { name: 'Jose Rodriguez', position: 'Document Processor', department: 'Processing', order: 4, email: 'docs@filinternational.ma' },
    { name: 'Nour El Houda', position: 'Finance Manager', department: 'Finance', order: 5, email: 'finance@filinternational.ma' },
  ]
  await Promise.all(orgChart.map(o =>
    db.cmsOrgChart.create({ data: o })
  ))

  // CMS Pages (About, Services, Contact content)
  await db.cmsPage.create({
    data: {
      title: 'About FIRA',
      slug: 'about',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            title: 'About Fil International Recruitment Agency',
            subtitle: 'Your trusted partner in international recruitment since 2020'
          },
          {
            type: 'content',
            title: 'Who We Are',
            body: 'Fil International Recruitment Agency (FIRA) is a licensed overseas recruitment agency based in Casablanca, Morocco. We specialize in connecting skilled Filipino workers with reputable employers across Morocco and other countries. Our mission is to provide ethical, transparent, and efficient recruitment services that benefit both workers and employers.'
          },
          {
            type: 'content',
            title: 'Our Mission',
            body: 'To be the leading recruitment agency that bridges Filipino talent with global opportunities, while ensuring the welfare, rights, and dignity of every worker we deploy.'
          },
          {
            type: 'content',
            title: 'Our Vision',
            body: 'A world where every Filipino worker has access to safe, fair, and rewarding international employment opportunities.'
          },
          {
            type: 'values',
            items: [
              { title: 'Integrity', desc: 'We operate with transparency and honesty in all our dealings.' },
              { title: 'Excellence', desc: 'We strive to deliver the highest quality recruitment services.' },
              { title: 'Compassion', desc: 'We genuinely care for the welfare of every worker.' },
              { title: 'Innovation', desc: 'We leverage technology to improve the recruitment experience.' },
            ]
          }
        ]
      }),
      status: 'published',
    },
  })
  await db.cmsPage.create({
    data: {
      title: 'Our Services',
      slug: 'services',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            title: 'Our Services',
            subtitle: 'Comprehensive recruitment solutions for Filipino workers and international employers'
          },
          {
            type: 'services',
            items: [
              { icon: 'users', title: 'Recruitment & Placement', desc: 'We source, screen, and match qualified Filipino workers with international job openings across various industries including healthcare, hospitality, household services, and manufacturing.' },
              { icon: 'file-text', title: 'Document Processing', desc: 'Our team handles all necessary documentation including POEA processing, visa applications, work permits, and contract preparation to ensure a smooth deployment process.' },
              { icon: 'graduation-cap', title: 'Skills Assessment & Training', desc: 'We conduct thorough skills assessment and provide pre-departure training including language courses, cultural orientation, and job-specific skills enhancement.' },
              { icon: 'heart-pulse', title: 'Medical & Health Clearance', desc: 'We coordinate medical examinations and health clearances through accredited clinics to ensure all workers meet the health requirements of the destination country.' },
              { icon: 'plane', title: 'Pre-Departure Orientation', desc: 'Comprehensive orientation programs that prepare workers for their new environment including cultural differences, work expectations, rights awareness, and emergency procedures.' },
              { icon: 'headset', title: 'Post-Deployment Support', desc: 'Ongoing support for deployed workers including regular check-ins, dispute resolution assistance, welfare monitoring, and repatriation services when needed.' },
            ]
          }
        ]
      }),
      status: 'published',
    },
  })
  await db.cmsPage.create({
    data: {
      title: 'Contact Us',
      slug: 'contact',
      content: JSON.stringify({
        address: '59 Boulevard Zerktouni, Residence Les Fleurs, 6ème Etage Appt 19, 20360 Casablanca, Morocco',
        phone: ['+212 6 62 26 14 99', '+212 6 62 26 08 05', '+212 6 62 26 03 36'],
        email: 'manpower@filinternational.ma',
        hours: 'Monday - Friday: 9:00 AM - 6:00 PM (GMT+1)',
      }),
      status: 'published',
    },
  })

  // Application Form Fields
  const formFields = [
    { label: 'First Name', fieldType: 'text', isRequired: true, order: 0, section: 'Personal Information' },
    { label: 'Middle Name', fieldType: 'text', isRequired: false, order: 1, section: 'Personal Information' },
    { label: 'Last Name', fieldType: 'text', isRequired: true, order: 2, section: 'Personal Information' },
    { label: 'Suffix', fieldType: 'text', isRequired: false, order: 3, section: 'Personal Information' },
    { label: 'Gender', fieldType: 'select', options: JSON.stringify(['Male', 'Female', 'Prefer not to say']), isRequired: true, order: 4, section: 'Personal Information' },
    { label: 'Birth Date', fieldType: 'date', isRequired: true, order: 5, section: 'Personal Information' },
    { label: 'Birth Place', fieldType: 'text', isRequired: false, order: 6, section: 'Personal Information' },
    { label: 'Nationality', fieldType: 'text', isRequired: true, order: 7, section: 'Personal Information' },
    { label: 'Civil Status', fieldType: 'select', options: JSON.stringify(['Single', 'Married', 'Widowed', 'Separated']), isRequired: true, order: 8, section: 'Personal Information' },
    { label: 'Religion', fieldType: 'text', isRequired: false, order: 9, section: 'Personal Information' },
    { label: 'Height (cm)', fieldType: 'text', isRequired: false, order: 10, section: 'Physical Details' },
    { label: 'Weight (kg)', fieldType: 'text', isRequired: false, order: 11, section: 'Physical Details' },
    { label: 'Street Address', fieldType: 'text', isRequired: true, order: 12, section: 'Contact Information' },
    { label: 'City', fieldType: 'text', isRequired: true, order: 13, section: 'Contact Information' },
    { label: 'Province', fieldType: 'text', isRequired: true, order: 14, section: 'Contact Information' },
    { label: 'Region', fieldType: 'select', options: JSON.stringify(['NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'CAR', 'ARMM', 'MIMAROPA']), isRequired: true, order: 15, section: 'Contact Information' },
    { label: 'Zip Code', fieldType: 'text', isRequired: false, order: 16, section: 'Contact Information' },
    { label: 'Mobile Number', fieldType: 'text', isRequired: true, order: 17, section: 'Contact Information' },
    { label: 'Alternative Phone', fieldType: 'text', isRequired: false, order: 18, section: 'Contact Information' },
    { label: 'Email Address', fieldType: 'email', isRequired: true, order: 19, section: 'Contact Information' },
    { label: 'Highest Education', fieldType: 'select', options: JSON.stringify(['Elementary', 'High School', 'College/Vocational', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate']), isRequired: true, order: 20, section: 'Education & Career' },
    { label: 'Years of Experience', fieldType: 'text', isRequired: true, order: 21, section: 'Education & Career' },
    { label: 'Preferred Country', fieldType: 'text', isRequired: false, order: 22, section: 'Education & Career' },
    { label: 'Preferred Job', fieldType: 'text', isRequired: false, order: 23, section: 'Education & Career' },
    { label: 'Expected Salary', fieldType: 'text', isRequired: false, order: 24, section: 'Education & Career' },
    { label: 'Availability Date', fieldType: 'text', isRequired: false, order: 25, section: 'Education & Career' },
    { label: 'Passport Number', fieldType: 'text', isRequired: false, order: 26, section: 'Travel Documents' },
    { label: 'Emergency Contact Name', fieldType: 'text', isRequired: true, order: 27, section: 'Emergency Contact' },
    { label: 'Emergency Contact Relationship', fieldType: 'text', isRequired: true, order: 28, section: 'Emergency Contact' },
    { label: 'Emergency Contact Phone', fieldType: 'text', isRequired: true, order: 29, section: 'Emergency Contact' },
  ]
  await Promise.all(formFields.map(f =>
    db.cmsFormField.create({ data: f })
  ))

  // CMS Settings
  await Promise.all([
    db.cmsSettings.create({ data: { key: 'site_name', value: 'FIRA - Fil International Recruitment Agency' } }),
    db.cmsSettings.create({ data: { key: 'site_tagline', value: 'We Recruit. We Deploy. We Monitor. We Deliver Results.' } }),
    db.cmsSettings.create({ data: { key: 'site_address', value: '59 Boulevard Zerktouni, Residence Les Fleurs, 6ème Etage Appt 19, 20360 Casablanca, Morocco' } }),
    db.cmsSettings.create({ data: { key: 'site_phone_1', value: '+212 6 62 26 14 99' } }),
    db.cmsSettings.create({ data: { key: 'site_phone_2', value: '+212 6 62 26 08 05' } }),
    db.cmsSettings.create({ data: { key: 'site_phone_3', value: '+212 6 62 26 03 36' } }),
    db.cmsSettings.create({ data: { key: 'site_email', value: 'manpower@filinternational.ma' } }),
    db.cmsSettings.create({ data: { key: 'site_copyright', value: '© 2025 FIL INTERNATIONAL RECRUITMENT AGENCY. All Rights Reserved.' } }),
  ])

  // Notifications
  await db.notification.create({
    data: {
      userId: users[2].id,
      title: 'Welcome to FIRA!',
      message: 'Complete your profile to increase your chances of getting hired. Upload your documents and keep your information up to date.',
      type: 'info',
    },
  })
  await db.notification.create({
    data: {
      userId: users[0].id,
      title: 'New Applications Received',
      message: 'You have 1 new application to review. Check your dashboard for details.',
      type: 'info',
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('📋 Test Accounts:')
  console.log('   Super Admin: admin@fira.com.ph / admin2025!')
  console.log('   Staff: staff@fira.com.ph / staff2025!')
  console.log('   Applicant: applicant@fira.com.ph / applicant2025!')
  console.log('   Agency: agency@fira.com.ph / agency2025!')
  console.log('   Employer: employer@fira.com.ph / employer2025!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
