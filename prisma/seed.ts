import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const ATS_STAGE_NAMES = [
  'New Application',
  'Document Review',
  'Initial Screening',
  'Skills Assessment',
  'Language Proficiency Test',
  'Background Check',
  'Medical Examination',
  'Interview Scheduled',
  'Interview Completed',
  'Employer Shortlist',
  'Employer Interview',
  'Job Offer',
  'Offer Accepted',
  'Contract Signing',
  'Visa Processing',
  'Pre-Departure Orientation',
  'Travel Arrangements',
  'Deployed',
  'Completed',
];

const ATS_STAGE_COLORS = [
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0891b2',
  '#0284c7', '#4f46e5', '#7c3aed', '#9333ea',
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding FIRA database...');

  // Clean existing data
  console.log('🗑️ Cleaning existing data...');
  await db.aIAnalysisResult.deleteMany();
  await db.resumeEnhancement.deleteMany();
  await db.ATSStageHistory.deleteMany();
  await db.application.deleteMany();
  await db.endorsement.deleteMany();
  await db.ATSStage.deleteMany();
  await db.jobOrder.deleteMany();
  await db.notification.deleteMany();
  await db.ATSCustomField.deleteMany();
  await db.applicantDocument.deleteMany();
  await db.applicantReference.deleteMany();
  await db.applicantCertification.deleteMany();
  await db.applicantLanguage.deleteMany();
  await db.applicantSkill.deleteMany();
  await db.applicantExperience.deleteMany();
  await db.applicantEducation.deleteMany();
  await db.applicantProfile.deleteMany();
  await db.agencyMember.deleteMany();
  await db.agency.deleteMany();
  await db.employerProfile.deleteMany();
  await db.user.deleteMany();

  console.log('✅ Data cleaned');

  // ============ CREATE USERS ============

  // 1. FIRA Admin
  const firaAdmin = await db.user.create({
    data: {
      email: 'admin@fira.com.ph',
      password: await hashPassword('FiraAdmin2025!'),
      name: 'FIRA Administrator',
      role: 'fira',
      phone: '+63 917 100 0000',
      isActive: true,
      isApproved: true,
    },
  });
  console.log('✅ FIRA Admin created');

  // 2. Employer
  const employerUser = await db.user.create({
    data: {
      email: 'employer@fira.com.ph',
      password: await hashPassword('FiraEmployer2025!'),
      name: 'Ahmed Al-Rashid',
      role: 'employer',
      phone: '+966 50 123 4567',
      isActive: true,
      isApproved: true,
    },
  });

  const employerProfile = await db.employerProfile.create({
    data: {
      userId: employerUser.id,
      companyName: 'Al-Rashid Employment Services',
      companyAddress: 'King Fahd Road, Riyadh',
      country: 'Saudi Arabia',
      industry: 'Domestic Services & Healthcare',
      contactPerson: 'Ahmed Al-Rashid',
      contactEmail: 'ahmed@alrashid.sa',
      contactPhone: '+966 50 123 4567',
    },
  });
  console.log('✅ Employer created');

  // 3. Agency + Agency Admin
  const agency = await db.agency.create({
    data: {
      name: 'Starlight Manpower Services',
      address: '123 Makati Avenue',
      city: 'Makati',
      country: 'Philippines',
      licenseNo: 'POEA-LICENSE-2024-001',
      phone: '+63 2 8888 1234',
      email: 'info@starlightmanpower.ph',
      website: 'https://starlightmanpower.ph',
      isActive: true,
    },
  });

  const agencyAdminUser = await db.user.create({
    data: {
      email: 'agency@fira.com.ph',
      password: await hashPassword('AgencyAdmin2025!'),
      name: 'Maria Santos',
      role: 'agency_admin',
      phone: '+63 917 200 0000',
      isActive: true,
      isApproved: true,
    },
  });

  await db.agencyMember.create({
    data: {
      userId: agencyAdminUser.id,
      agencyId: agency.id,
      role: 'admin',
    },
  });
  console.log('✅ Agency Admin created');

  // 4. Applicant 1 - Juan Dela Cruz
  const applicant1User = await db.user.create({
    data: {
      email: 'applicant@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Juan Dela Cruz',
      role: 'applicant',
      phone: '+63 917 300 0000',
      isActive: true,
      isApproved: true,
    },
  });

  const applicant1Profile = await db.applicantProfile.create({
    data: {
      userId: applicant1User.id,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      gender: 'Male',
      birthDate: new Date('1990-05-15'),
      nationality: 'Filipino',
      address: '456 Rizal Street, Sampaloc',
      city: 'Manila',
      province: 'Metro Manila',
      civilStatus: 'Married',
      passportNo: 'PN1234567',
      preferredCountry: 'Hong Kong',
      preferredJob: 'Domestic Helper',
      resumeText: 'Experienced domestic helper with 5 years of work in Hong Kong. Proficient in household management, cooking, child care, and elderly care. Graduate of Bachelor of Science in Nursing from University of Santo Tomas.',
      yearsExperience: 5,
    },
  });

  // Juan's Education
  await db.applicantEducation.create({
    data: {
      applicantId: applicant1Profile.id,
      institution: 'University of Santo Tomas',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Nursing',
      startYear: 2008,
      endYear: 2012,
      honors: 'Cum Laude',
    },
  });

  // Juan's Experience
  await db.applicantExperience.create({
    data: {
      applicantId: applicant1Profile.id,
      company: 'Chan Family Household',
      position: 'Domestic Helper',
      country: 'Hong Kong',
      startDate: new Date('2019-03-01'),
      isCurrent: true,
      description: 'Managing household of 5 members. Cooking Chinese and Filipino cuisine. Child care for 2 children ages 8 and 12. Elderly care for 70-year-old grandmother with diabetes.',
    },
  });

  await db.applicantExperience.create({
    data: {
      applicantId: applicant1Profile.id,
      company: 'General Santos Medical Center',
      position: 'Staff Nurse',
      country: 'Philippines',
      startDate: new Date('2012-06-01'),
      endDate: new Date('2019-01-31'),
      description: 'Provided patient care in the medical-surgical ward. Administered medications and monitored vital signs. Assisted doctors in procedures.',
    },
  });

  // Juan's Skills
  const juanSkills = [
    { name: 'Household Management', level: 'expert', yearsExperience: 5 },
    { name: 'Cooking', level: 'advanced', yearsExperience: 7 },
    { name: 'Child Care', level: 'advanced', yearsExperience: 5 },
    { name: 'Elderly Care', level: 'advanced', yearsExperience: 5 },
    { name: 'First Aid', level: 'advanced', yearsExperience: 12 },
    { name: 'Nursing', level: 'advanced', yearsExperience: 7 },
  ];
  for (const skill of juanSkills) {
    await db.applicantSkill.create({ data: { ...skill, applicantId: applicant1Profile.id } });
  }

  // Juan's Languages
  const juanLanguages = [
    { language: 'English', proficiency: 'fluent' },
    { language: 'Filipino', proficiency: 'native' },
    { language: 'Cantonese', proficiency: 'conversational' },
  ];
  for (const lang of juanLanguages) {
    await db.applicantLanguage.create({ data: { ...lang, applicantId: applicant1Profile.id } });
  }

  console.log('✅ Applicant 1 (Juan Dela Cruz) created');

  // 5. Applicant 2 - Rosa Mendoza
  const applicant2User = await db.user.create({
    data: {
      email: 'rosa@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Rosa Mendoza',
      role: 'applicant',
      phone: '+63 917 400 0000',
      isActive: true,
      isApproved: true,
    },
  });

  const applicant2Profile = await db.applicantProfile.create({
    data: {
      userId: applicant2User.id,
      firstName: 'Rosa',
      lastName: 'Mendoza',
      gender: 'Female',
      birthDate: new Date('1992-08-22'),
      nationality: 'Filipino',
      address: '789 Bonifacio St, Barangay San Isidro',
      city: 'Quezon City',
      province: 'Metro Manila',
      civilStatus: 'Single',
      passportNo: 'PN7654321',
      preferredCountry: 'Singapore',
      preferredJob: 'Caregiver',
      resumeText: 'Certified caregiver with experience in elderly care and nursing assistance. TESDA-certified. Looking for caregiver opportunities in Singapore.',
      yearsExperience: 3,
    },
  });

  await db.applicantEducation.create({
    data: {
      applicantId: applicant2Profile.id,
      institution: 'Technological Institute of the Philippines',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Caregiving',
      startYear: 2010,
      endYear: 2014,
    },
  });

  await db.applicantExperience.create({
    data: {
      applicantId: applicant2Profile.id,
      company: 'Home Care Plus Singapore',
      position: 'Caregiver',
      country: 'Singapore',
      startDate: new Date('2021-01-15'),
      isCurrent: true,
      description: 'Providing care for elderly patient with dementia. Administering medication, assisting with daily activities, and providing companionship.',
    },
  });

  const rosaSkills = [
    { name: 'Elderly Care', level: 'expert', yearsExperience: 3 },
    { name: 'Patient Monitoring', level: 'advanced', yearsExperience: 3 },
    { name: 'Medication Administration', level: 'intermediate', yearsExperience: 3 },
    { name: 'Dementia Care', level: 'advanced', yearsExperience: 2 },
  ];
  for (const skill of rosaSkills) {
    await db.applicantSkill.create({ data: { ...skill, applicantId: applicant2Profile.id } });
  }

  const rosaLanguages = [
    { language: 'English', proficiency: 'fluent' },
    { language: 'Filipino', proficiency: 'native' },
    { language: 'Mandarin', proficiency: 'basic' },
  ];
  for (const lang of rosaLanguages) {
    await db.applicantLanguage.create({ data: { ...lang, applicantId: applicant2Profile.id } });
  }

  console.log('✅ Applicant 2 (Rosa Mendoza) created');

  // ============ CREATE JOB ORDERS ============

  // Helper function to create job with ATS stages
  async function createJobWithStages(data: {
    title: string;
    description: string;
    country: string;
    city: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
    salaryCurrency: string;
    duration: string;
    slots: number;
    requirements: string;
    benefits: string;
    requiredSkills: string;
    status: string;
    visibility: string;
    employerId?: string;
    agencyId?: string;
  }) {
    const job = await db.jobOrder.create({ data });

    for (let i = 0; i < ATS_STAGE_NAMES.length; i++) {
      await db.aTSStage.create({
        data: {
          jobOrderId: job.id,
          name: ATS_STAGE_NAMES[i],
          order: i + 1,
          color: ATS_STAGE_COLORS[i],
        },
      });
    }

    return job;
  }

  // Job 1: Domestic Helper Riyadh (Public)
  const job1 = await createJobWithStages({
    title: 'Domestic Helper',
    description: 'We are looking for a reliable and experienced Domestic Helper to join a household in Riyadh. The ideal candidate should be hardworking, trustworthy, and have experience in household management, cooking, and childcare.',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    category: 'domestic_helper',
    salaryMin: 400,
    salaryMax: 600,
    salaryCurrency: 'USD',
    duration: '2 years',
    slots: 5,
    requirements: JSON.stringify(['At least 21 years old', 'With valid passport', 'At least high school graduate', 'With experience in domestic work']),
    benefits: JSON.stringify(['Free accommodation', 'Free food', 'Annual leave with paid flight', 'Medical insurance', 'Overtime pay']),
    requiredSkills: JSON.stringify(['Household Management', 'Cooking', 'Child Care', 'Cleaning', 'Laundry']),
    status: 'open',
    visibility: 'public',
    employerId: employerProfile.id,
    agencyId: agency.id,
  });
  console.log('✅ Job 1: Domestic Helper Riyadh created');

  // Job 2: Caregiver Singapore (Public)
  const job2 = await createJobWithStages({
    title: 'Caregiver for Elderly',
    description: 'Seeking a compassionate and experienced Caregiver to provide daily care for an elderly patient in Singapore. Duties include assisting with daily activities, medication management, and companionship.',
    country: 'Singapore',
    city: 'Singapore',
    category: 'caregiver',
    salaryMin: 600,
    salaryMax: 800,
    salaryCurrency: 'USD',
    duration: '2 years',
    slots: 3,
    requirements: JSON.stringify(['At least 23 years old', 'TESDA Caregiving NC II certified', 'At least 2 years caregiving experience', 'Good English communication']),
    benefits: JSON.stringify(['Free accommodation', 'Monthly salary + allowance', 'Medical insurance', 'Annual leave with paid flight', '13th month pay']),
    requiredSkills: JSON.stringify(['Elderly Care', 'Patient Monitoring', 'Medication Administration', 'First Aid', 'Companionship']),
    status: 'open',
    visibility: 'public',
    employerId: employerProfile.id,
    agencyId: agency.id,
  });
  console.log('✅ Job 2: Caregiver Singapore created');

  // Job 3: Factory Worker Taiwan (Public)
  const job3 = await createJobWithStages({
    title: 'Factory Worker - Electronics Assembly',
    description: 'Hiring Factory Workers for an electronics manufacturing company in Taiwan. No experience required as training will be provided. Must be willing to work in shifts.',
    country: 'Taiwan',
    city: 'Taipei',
    category: 'factory',
    salaryMin: 500,
    salaryMax: 700,
    salaryCurrency: 'USD',
    duration: '3 years',
    slots: 20,
    requirements: JSON.stringify(['At least 20 years old', 'High school graduate', 'Physically fit', 'Willing to work in shifts']),
    benefits: JSON.stringify(['Free accommodation', 'Free meals at factory', 'Overtime pay', 'Medical insurance', 'Performance bonus']),
    requiredSkills: JSON.stringify(['Assembly', 'Quality Control', 'Teamwork', 'Attention to Detail']),
    status: 'open',
    visibility: 'public',
    agencyId: agency.id,
  });
  console.log('✅ Job 3: Factory Worker Taiwan created');

  // Job 4: Nurse Dubai (Agency Only)
  const job4 = await createJobWithStages({
    title: 'Registered Nurse - ICU',
    description: 'Urgent hiring for Registered Nurses with ICU experience for a prestigious hospital in Dubai. Must have PRC license and valid PRC ID.',
    country: 'United Arab Emirates',
    city: 'Dubai',
    category: 'nurse',
    salaryMin: 1500,
    salaryMax: 2500,
    salaryCurrency: 'USD',
    duration: '2 years',
    slots: 10,
    requirements: JSON.stringify(['BSN graduate', 'Active PRC license', 'At least 2 years ICU experience', 'IELTS score of 6.5 or higher']),
    benefits: JSON.stringify(['Free accommodation', 'Transportation allowance', 'Medical insurance', 'Annual leave with paid flight', 'Tax-free salary']),
    requiredSkills: JSON.stringify(['ICU Nursing', 'Patient Assessment', 'IV Therapy', 'Emergency Response', 'Medical Documentation']),
    status: 'open',
    visibility: 'agency_only',
    agencyId: agency.id,
  });
  console.log('✅ Job 4: Nurse Dubai (agency_only) created');

  // Job 5: Hotel Staff Qatar (Private)
  const job5 = await createJobWithStages({
    title: 'Hotel Staff - Front Desk',
    description: 'Luxury hotel in Doha is hiring front desk staff. Must have excellent customer service skills and hospitality experience.',
    country: 'Qatar',
    city: 'Doha',
    category: 'hospitality',
    salaryMin: 800,
    salaryMax: 1200,
    salaryCurrency: 'USD',
    duration: '2 years',
    slots: 5,
    requirements: JSON.stringify(['At least 22 years old', 'Hotel/hospitality experience', 'Excellent English', 'Customer service oriented']),
    benefits: JSON.stringify(['Free accommodation', 'Meals provided', 'Medical insurance', 'Annual leave', 'Gratuity pay']),
    requiredSkills: JSON.stringify(['Customer Service', 'Front Desk Operations', 'Hotel Management', 'English Communication', 'Computer Literacy']),
    status: 'open',
    visibility: 'private',
  });
  console.log('✅ Job 5: Hotel Staff Qatar (private) created');

  // ============ CREATE APPLICATION ============

  // Juan applies to Domestic Helper Riyadh
  const firstStage = await db.aTSStage.findFirst({
    where: { jobOrderId: job1.id, order: 1 },
  });

  const application = await db.application.create({
    data: {
      applicantId: applicant1User.id,
      jobOrderId: job1.id,
      status: 'applied',
      coverLetter: 'Dear Sir/Madam, I am writing to express my interest in the Domestic Helper position. With 5 years of experience working in Hong Kong as a domestic helper and a Bachelor\'s degree in Nursing, I am confident I can provide excellent service to your household. I am skilled in cooking, childcare, and elderly care. Thank you for considering my application.',
      matchScore: 85.5,
      currentStageId: firstStage?.id,
    },
  });

  // Create AI analysis for this application
  await db.aIAnalysisResult.create({
    data: {
      applicationId: application.id,
      matchScore: 85.5,
      semanticScore: 0.82,
      matchedSkills: JSON.stringify(['Household Management', 'Cooking', 'Child Care', 'Elderly Care']),
      missingSkills: JSON.stringify(['Cleaning', 'Laundry']),
      explanation: 'Strong candidate with excellent household management and caregiving skills. 5 years of relevant experience in Hong Kong. Nursing background provides additional value for elderly care. Missing some specific skills like formal cleaning and laundry management but these are easily trainable.',
    },
  });
  console.log('✅ Application (Juan -> Domestic Helper Riyadh) created');

  // ============ CREATE NOTIFICATIONS ============
  await db.notification.create({
    data: {
      userId: applicant1User.id,
      title: 'Application Submitted',
      message: 'Your application for Domestic Helper in Riyadh, Saudi Arabia has been successfully submitted.',
      type: 'success',
    },
  });

  await db.notification.create({
    data: {
      userId: agencyAdminUser.id,
      title: 'New Application Received',
      message: 'Juan Dela Cruz has applied for the Domestic Helper position in Riyadh.',
      type: 'info',
    },
  });
  console.log('✅ Notifications created');

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   FIRA Admin:     admin@fira.com.ph / FiraAdmin2025!');
  console.log('   Employer:       employer@fira.com.ph / FiraEmployer2025!');
  console.log('   Agency Admin:   agency@fira.com.ph / AgencyAdmin2025!');
  console.log('   Applicant 1:    applicant@fira.com.ph / Applicant2025!');
  console.log('   Applicant 2:    rosa@fira.com.ph / Applicant2025!');
  console.log('');
  console.log('💼 Jobs Created: 5 (3 public, 1 agency_only, 1 private)');
  console.log('📋 Applications: 1 (Juan -> Domestic Helper Riyadh)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
