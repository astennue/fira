import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// Default ATS stages (NO VISA - can be added as custom stage)
const DEFAULT_ATS_STAGES = [
  { name: 'New Application', color: '#10b981' },
  { name: 'Document Review', color: '#06b6d4' },
  { name: 'Initial Screening', color: '#3b82f6' },
  { name: 'Interview Scheduled', color: '#6366f1' },
  { name: 'Interview Completed', color: '#8b5cf6' },
  { name: 'Skills Assessment', color: '#a855f7' },
  { name: 'Background Check', color: '#d946ef' },
  { name: 'Medical Examination', color: '#ec4899' },
  { name: 'Government Processing', color: '#f43f5e' },
  { name: 'Pre-Departure Orientation', color: '#f97316' },
  { name: 'Contract Signing', color: '#eab308' },
  { name: 'Deployment', color: '#84cc16' },
  { name: 'Arrival Confirmed', color: '#22c55e' },
  { name: 'Completed', color: '#14b8a6' },
];

// Predefined household tasks for domestic helpers
const HOUSEHOLD_TASKS = [
  'General Housekeeping',
  'Cooking / Food Preparation',
  'Laundry / Ironing',
  'Child Care / Babysitting',
  'Elderly Care',
  'Pet Care',
  'Grocery Shopping',
  'Car Washing',
  'Gardening',
  'Sewing / Mending',
  'First Aid',
  'Driving',
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding FIRA database...');

  // Clean existing data in correct order (respect foreign keys)
  console.log('🗑️ Cleaning existing data...');
  // Delete tables that reference Application first
  await db.applicationCustomResponse.deleteMany();
  await db.aIAnalysisResult.deleteMany();
  await db.aTSStageHistory.deleteMany();
  await db.endorsement.deleteMany();
  // Now delete Application
  await db.application.deleteMany();
  // Delete tables that reference JobOrder
  await db.jobCustomField.deleteMany();
  await db.aTSStage.deleteMany();
  await db.jobOrder.deleteMany();
  // Delete tables that reference ApplicantProfile
  await db.applicantTraining.deleteMany();
  await db.applicantDocument.deleteMany();
  await db.applicantReference.deleteMany();
  await db.applicantCertification.deleteMany();
  await db.applicantLanguage.deleteMany();
  await db.applicantSkill.deleteMany();
  await db.applicantExperience.deleteMany();
  await db.applicantEducation.deleteMany();
  await db.applicantProfile.deleteMany();
  // Delete tables that reference User
  await db.resumeEnhancement.deleteMany();
  await db.notification.deleteMany();
  // Delete org-level tables
  await db.agencyMember.deleteMany();
  await db.agency.deleteMany();
  await db.employerProfile.deleteMany();
  await db.user.deleteMany();

  console.log('✅ Data cleaned');

  // ============ 1. FIRA SUPER ADMIN (International Agency) ============
  const firaAdmin = await db.user.create({
    data: {
      email: 'admin@fira.com.ph',
      password: await hashPassword('FiraAdmin2025!'),
      name: 'FIRA Administrator',
      role: 'international_agency',
      phone: '+63 2 8888 1234',
      isActive: true,
      isApproved: true,
    },
  });
  console.log('✅ FIRA Admin (International Agency) created');

  // ============ 2. LOCAL AGENCY (Philippine-based) ============
  const localAgency = await db.agency.create({
    data: {
      name: 'Starlight Manpower Services',
      agencyType: 'local',
      address: '123 Makati Avenue, Brgy. Pio del Pilar',
      city: 'Makati',
      country: 'Philippines',
      licenseNo: 'POEA-LICENSE-2024-001',
      phone: '+63 2 8888 1234',
      email: 'info@starlightmanpower.ph',
      website: 'https://starlightmanpower.ph',
      isActive: true,
      isApproved: true,
    },
  });

  // Local Agency Admin
  const localAgencyAdmin = await db.user.create({
    data: {
      email: 'agency@fira.com.ph',
      password: await hashPassword('AgencyAdmin2025!'),
      name: 'Maria Santos',
      role: 'local_agency',
      phone: '+63 917 200 0000',
      isActive: true,
      isApproved: true,
    },
  });

  await db.agencyMember.create({
    data: {
      userId: localAgencyAdmin.id,
      agencyId: localAgency.id,
      role: 'admin',
    },
  });

  // Local Agency Recruiter
  const localRecruiter = await db.user.create({
    data: {
      email: 'recruiter@fira.com.ph',
      password: await hashPassword('Recruiter2025!'),
      name: 'Pedro Reyes',
      role: 'local_agency',
      phone: '+63 917 201 0000',
      isActive: true,
      isApproved: true,
    },
  });

  await db.agencyMember.create({
    data: {
      userId: localRecruiter.id,
      agencyId: localAgency.id,
      role: 'recruiter',
    },
  });

  // Second local agency
  const localAgency2 = await db.agency.create({
    data: {
      name: 'My K International Agency',
      agencyType: 'local',
      address: '456 Shaw Boulevard, Mandaluyong',
      city: 'Mandaluyong',
      country: 'Philippines',
      licenseNo: 'POEA-LICENSE-2024-002',
      phone: '+63 2 8123 4567',
      email: 'info@mykagency.ph',
      isActive: true,
      isApproved: true,
    },
  });

  const localAgency2Admin = await db.user.create({
    data: {
      email: 'myk@fira.com.ph',
      password: await hashPassword('MykAdmin2025!'),
      name: 'Carmen Garcia',
      role: 'local_agency',
      phone: '+63 917 300 0000',
      isActive: true,
      isApproved: true,
    },
  });

  await db.agencyMember.create({
    data: {
      userId: localAgency2Admin.id,
      agencyId: localAgency2.id,
      role: 'admin',
    },
  });
  console.log('✅ Local Agencies created (Starlight + My K)');

  // ============ 3. EMPLOYER ============
  const employerUser = await db.user.create({
    data: {
      email: 'employer@fira.com.ph',
      password: await hashPassword('Employer2025!'),
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

  // Second employer
  const employer2User = await db.user.create({
    data: {
      email: 'employer2@fira.com.ph',
      password: await hashPassword('Employer2025!'),
      name: 'Tanaka Yuki',
      role: 'employer',
      phone: '+81 90 1234 5678',
      isActive: true,
      isApproved: true,
    },
  });

  const employer2Profile = await db.employerProfile.create({
    data: {
      userId: employer2User.id,
      companyName: 'Tokyo Home Care Co.',
      companyAddress: 'Shibuya-ku, Tokyo',
      country: 'Japan',
      industry: 'Elderly Care & Domestic Services',
      contactPerson: 'Tanaka Yuki',
      contactEmail: 'tanaka@tokyohomecare.jp',
      contactPhone: '+81 90 1234 5678',
    },
  });
  console.log('✅ Employers created');

  // ============ 4. APPLICANTS ============

  // Applicant 1: Domestic Helper
  const applicant1User = await db.user.create({
    data: {
      email: 'applicant@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Juan Dela Cruz',
      role: 'applicant',
      phone: '+63 917 400 0000',
      isActive: true,
      isApproved: true,
    },
  });

  const applicant1Profile = await db.applicantProfile.create({
    data: {
      userId: applicant1User.id,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      gender: 'Male',
      birthDate: new Date('1990-05-15'),
      birthPlace: 'Manila',
      nationality: 'Filipino',
      civilStatus: 'Married',
      religion: 'Roman Catholic',
      height: '170',
      weight: '68',
      address: '456 Rizal Street, Sampaloc',
      city: 'Manila',
      province: 'Metro Manila',
      region: 'NCR',
      zipCode: '1008',
      phone: '+63 917 400 0000',
      altPhone: '+63 927 400 0001',
      applicantType: 'domestic_helper',
      householdTasks: JSON.stringify(['General Housekeeping', 'Cooking / Food Preparation', 'Laundry / Ironing', 'Child Care / Babysitting', 'Elderly Care']),
      passportNo: 'PN1234567',
      passportExpiry: new Date('2028-05-14'),
      passportStatus: 'valid',
      hasVisa: false,
      medicalStatus: 'none',
      highestEducation: 'bachelors',
      yearsExperience: 5,
      preferredCountry: 'Hong Kong',
      preferredJob: 'Domestic Helper',
      salaryExpectation: '500-700 USD',
      resumeText: 'Experienced domestic helper with 5 years of work in Hong Kong. Proficient in household management, cooking Filipino and Chinese dishes, child care, and elderly care. Licensed Nurse in the Philippines.',
      emergencyName: 'Maria Dela Cruz',
      emergencyRelation: 'Wife',
      emergencyPhone: '+63 917 400 0002',
      formStep: 7,
      isComplete: true,
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
      description: 'Managing household of 5 members. Cooking Chinese and Filipino cuisine daily. Child care for 2 children ages 8 and 12. Elderly care for 70-year-old grandmother with diabetes.',
      monthlySalary: 'HKD 5,000',
      employerContact: '+852 9123 4567',
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
      description: 'Patient care in medical-surgical ward. Administered medications and monitored vital signs.',
      monthlySalary: 'PHP 25,000',
    },
  });

  // Juan's Skills
  for (const skill of [
    { name: 'Household Management', level: 'expert', yearsExperience: 5 },
    { name: 'Cooking', level: 'advanced', yearsExperience: 7 },
    { name: 'Child Care', level: 'advanced', yearsExperience: 5 },
    { name: 'Elderly Care', level: 'advanced', yearsExperience: 5 },
    { name: 'First Aid', level: 'advanced', yearsExperience: 12 },
    { name: 'Nursing', level: 'advanced', yearsExperience: 7 },
  ]) {
    await db.applicantSkill.create({ data: { ...skill, applicantId: applicant1Profile.id } });
  }

  // Juan's Languages
  for (const lang of [
    { language: 'English', proficiency: 'fluent', speaking: 'fluent', reading: 'fluent', writing: 'advanced' },
    { language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { language: 'Cantonese', proficiency: 'conversational', speaking: 'conversational', reading: 'basic', writing: 'basic' },
  ]) {
    await db.applicantLanguage.create({ data: { ...lang, applicantId: applicant1Profile.id } });
  }

  // Juan's Certifications
  await db.applicantCertification.create({
    data: {
      applicantId: applicant1Profile.id,
      name: 'TESDA Household Services NC II',
      issuingBody: 'TESDA',
      issuedDate: new Date('2018-06-15'),
      expiryDate: null,
      credentialId: 'TESDA-HS-2018-00123',
    },
  });
  await db.applicantCertification.create({
    data: {
      applicantId: applicant1Profile.id,
      name: 'Professional Regulation Commission - Nurse License',
      issuingBody: 'PRC',
      issuedDate: new Date('2012-07-01'),
      credentialId: 'PRC-RN-2012-45678',
    },
  });

  // Juan's Documents
  for (const doc of [
    { documentType: 'nso_birth_cert', fileName: 'birth_cert_juan.pdf' },
    { documentType: 'valid_id', fileName: 'umid_juan.jpg' },
    { documentType: 'passport', fileName: 'passport_juan.pdf' },
    { documentType: 'nbi_clearance', fileName: 'nbi_juan.pdf' },
  ]) {
    await db.applicantDocument.create({ data: { ...doc, applicantId: applicant1Profile.id, isVerified: true } });
  }

  // Juan's References
  await db.applicantReference.create({
    data: {
      applicantId: applicant1Profile.id,
      name: 'Mrs. Chan',
      company: 'Chan Family Household',
      position: 'Employer',
      phone: '+852 9123 4567',
      email: 'mrs.chan@email.com',
      relationship: 'Former Employer',
      yearsKnown: '5',
    },
  });

  console.log('✅ Applicant 1 (Juan Dela Cruz - Domestic Helper) created');

  // Applicant 2: Skills Professional (Caregiver)
  const applicant2User = await db.user.create({
    data: {
      email: 'rosa@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Rosa Mendoza',
      role: 'applicant',
      phone: '+63 917 500 0000',
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
      birthPlace: 'Quezon City',
      nationality: 'Filipino',
      civilStatus: 'Single',
      religion: 'Roman Catholic',
      height: '158',
      weight: '52',
      address: '789 Bonifacio St, Brgy. San Isidro',
      city: 'Quezon City',
      province: 'Metro Manila',
      region: 'NCR',
      phone: '+63 917 500 0000',
      applicantType: 'skills_professional',
      passportNo: 'PN7654321',
      passportExpiry: new Date('2027-08-21'),
      passportStatus: 'valid',
      hasVisa: false,
      medicalStatus: 'none',
      highestEducation: 'bachelors',
      yearsExperience: 3,
      preferredCountry: 'Singapore',
      preferredJob: 'Caregiver',
      salaryExpectation: '600-800 USD',
      resumeText: 'Certified caregiver with 3 years experience in elderly care and nursing assistance. TESDA NC II certified. Experienced with dementia patients.',
      emergencyName: 'Antonio Mendoza',
      emergencyRelation: 'Father',
      emergencyPhone: '+63 917 500 0003',
      formStep: 7,
      isComplete: true,
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
      description: 'Providing care for elderly patient with dementia. Medication management, daily activities assistance, companionship.',
      monthlySalary: 'SGD 2,200',
      employerContact: '+65 9123 4567',
    },
  });

  for (const skill of [
    { name: 'Elderly Care', level: 'expert', yearsExperience: 3 },
    { name: 'Patient Monitoring', level: 'advanced', yearsExperience: 3 },
    { name: 'Medication Administration', level: 'intermediate', yearsExperience: 3 },
    { name: 'Dementia Care', level: 'advanced', yearsExperience: 2 },
    { name: 'First Aid', level: 'advanced', yearsExperience: 4 },
  ]) {
    await db.applicantSkill.create({ data: { ...skill, applicantId: applicant2Profile.id } });
  }

  for (const lang of [
    { language: 'English', proficiency: 'fluent', speaking: 'fluent', reading: 'fluent', writing: 'fluent' },
    { language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { language: 'Mandarin', proficiency: 'basic', speaking: 'basic', reading: 'basic', writing: null },
  ]) {
    await db.applicantLanguage.create({ data: { ...lang, applicantId: applicant2Profile.id } });
  }

  await db.applicantCertification.create({
    data: {
      applicantId: applicant2Profile.id,
      name: 'TESDA Caregiving NC II',
      issuingBody: 'TESDA',
      issuedDate: new Date('2014-08-15'),
      credentialId: 'TESDA-CG-2014-98765',
    },
  });

  for (const doc of [
    { documentType: 'nso_birth_cert', fileName: 'birth_cert_rosa.pdf' },
    { documentType: 'valid_id', fileName: 'umid_rosa.jpg' },
    { documentType: 'passport', fileName: 'passport_rosa.pdf' },
  ]) {
    await db.applicantDocument.create({ data: { ...doc, applicantId: applicant2Profile.id, isVerified: true } });
  }

  console.log('✅ Applicant 2 (Rosa Mendoza - Caregiver/Professional) created');

  // Applicant 3: Domestic Helper (incomplete profile)
  const applicant3User = await db.user.create({
    data: {
      email: 'nena@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Nena Villanueva',
      role: 'applicant',
      phone: '+63 917 600 0000',
      isActive: true,
      isApproved: true,
    },
  });

  const applicant3Profile = await db.applicantProfile.create({
    data: {
      userId: applicant3User.id,
      firstName: 'Nena',
      lastName: 'Villanueva',
      gender: 'Female',
      birthDate: new Date('1985-12-03'),
      birthPlace: 'Cebu City',
      nationality: 'Filipino',
      civilStatus: 'Widowed',
      address: '101 Rizal St, Barangay Ermita',
      city: 'Cebu City',
      province: 'Cebu',
      region: 'Region VII',
      phone: '+63 917 600 0000',
      applicantType: 'domestic_helper',
      householdTasks: JSON.stringify(['General Housekeeping', 'Cooking / Food Preparation', 'Laundry / Ironing', 'Child Care / Babysitting']),
      passportNo: '',
      passportStatus: 'none',
      hasVisa: false,
      medicalStatus: 'none',
      highestEducation: 'high_school',
      yearsExperience: 8,
      preferredCountry: 'Middle East',
      preferredJob: 'Domestic Helper',
      formStep: 3,
      isComplete: false,
    },
  });

  console.log('✅ Applicant 3 (Nena Villanueva - Domestic Helper, incomplete) created');

  // Applicant 4: Skills Professional (Engineer)
  const applicant4User = await db.user.create({
    data: {
      email: 'mark@fira.com.ph',
      password: await hashPassword('Applicant2025!'),
      name: 'Mark Lim',
      role: 'applicant',
      phone: '+63 917 700 0000',
      isActive: true,
      isApproved: true,
    },
  });

  const applicant4Profile = await db.applicantProfile.create({
    data: {
      userId: applicant4User.id,
      firstName: 'Mark',
      lastName: 'Lim',
      middleName: 'Tan',
      gender: 'Male',
      birthDate: new Date('1995-03-18'),
      birthPlace: 'Davao City',
      nationality: 'Filipino',
      civilStatus: 'Single',
      height: '175',
      weight: '72',
      address: '55 Torres Street',
      city: 'Davao City',
      province: 'Davao del Sur',
      region: 'Region XI',
      phone: '+63 917 700 0000',
      applicantType: 'skills_professional',
      passportNo: 'PN9876543',
      passportExpiry: new Date('2029-03-17'),
      passportStatus: 'valid',
      hasVisa: true,
      visaCountry: 'Singapore',
      visaType: 'Work Pass',
      visaStatus: 'expired',
      medicalStatus: 'passed',
      highestEducation: 'bachelors',
      yearsExperience: 4,
      preferredCountry: 'Singapore, Japan',
      preferredJob: 'Welder / Fabricator',
      salaryExpectation: '800-1200 USD',
      resumeText: 'Licensed Mechanical Engineer with 4 years experience in fabrication and welding. Certified AWS CWI. Experienced in structural steel, pipe welding, and quality inspection.',
      emergencyName: 'Linda Lim',
      emergencyRelation: 'Mother',
      emergencyPhone: '+63 917 700 0005',
      formStep: 7,
      isComplete: true,
    },
  });

  await db.applicantEducation.create({
    data: {
      applicantId: applicant4Profile.id,
      institution: 'University of Mindanao',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Mechanical Engineering',
      startYear: 2013,
      endYear: 2017,
      honors: null,
    },
  });

  await db.applicantExperience.create({
    data: {
      applicantId: applicant4Profile.id,
      company: 'DMCI Construction',
      position: 'Welder / Fabricator',
      country: 'Philippines',
      startDate: new Date('2017-08-01'),
      endDate: new Date('2021-06-30'),
      description: 'Structural steel fabrication and welding for high-rise buildings. GTAW and SMAW certified.',
      monthlySalary: 'PHP 35,000',
    },
  });

  for (const skill of [
    { name: 'GTAW (TIG) Welding', level: 'expert', yearsExperience: 4 },
    { name: 'SMAW (Stick) Welding', level: 'expert', yearsExperience: 4 },
    { name: 'Structural Fabrication', level: 'advanced', yearsExperience: 4 },
    { name: 'Blueprint Reading', level: 'advanced', yearsExperience: 4 },
    { name: 'Quality Inspection', level: 'intermediate', yearsExperience: 3 },
  ]) {
    await db.applicantSkill.create({ data: { ...skill, applicantId: applicant4Profile.id } });
  }

  for (const lang of [
    { language: 'English', proficiency: 'fluent', speaking: 'fluent', reading: 'fluent', writing: 'fluent' },
    { language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { language: 'Japanese', proficiency: 'basic', speaking: 'basic', reading: 'basic', writing: null },
  ]) {
    await db.applicantLanguage.create({ data: { ...lang, applicantId: applicant4Profile.id } });
  }

  await db.applicantCertification.create({
    data: {
      applicantId: applicant4Profile.id,
      name: 'AWS Certified Welding Inspector (CWI)',
      issuingBody: 'American Welding Society',
      issuedDate: new Date('2019-12-01'),
      expiryDate: new Date('2025-12-01'),
      credentialId: 'AWS-CWI-2019-12345',
    },
  });

  console.log('✅ Applicant 4 (Mark Lim - Welder/Professional) created');

  // ============ 5. JOB ORDERS ============

  async function createJobWithStages(data: {
    title: string;
    description: string;
    country: string;
    city: string;
    category: string;
    jobType?: string;
    salaryMin: number;
    salaryMax: number;
    salaryCurrency: string;
    salaryPeriod?: string;
    duration: string;
    slots: number;
    requirements: string;
    benefits: string;
    requiredSkills: string;
    status: string;
    visibility: string;
    employerId?: string;
    agencyId?: string;
    createdBy?: string;
    customFields?: Array<{ label: string; fieldType: string; options?: string[]; isRequired: boolean }>;
  }) {
    const { customFields, ...jobData } = data;
    const job = await db.jobOrder.create({ data: jobData });

    for (let i = 0; i < DEFAULT_ATS_STAGES.length; i++) {
      await db.aTSStage.create({
        data: {
          jobOrderId: job.id,
          name: DEFAULT_ATS_STAGES[i].name,
          order: i + 1,
          color: DEFAULT_ATS_STAGES[i].color,
          isDefault: true,
        },
      });
    }

    if (customFields) {
      for (const field of customFields) {
        await db.jobCustomField.create({
          data: {
            jobOrderId: job.id,
            label: field.label,
            fieldType: field.fieldType,
            options: field.options ? JSON.stringify(field.options) : null,
            isRequired: field.isRequired,
          },
        });
      }
    }

    return job;
  }

  // Job 1: Domestic Helper Saudi Arabia
  const job1 = await createJobWithStages({
    title: 'Domestic Helper - All-Round',
    description: 'Looking for experienced Domestic Helper for a family in Riyadh. Must be hardworking, trustworthy, and skilled in household management, cooking, and childcare. Family has 3 children ages 5, 8, and 12.',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    category: 'domestic_helper',
    jobType: 'domestic_helper',
    salaryMin: 400,
    salaryMax: 600,
    salaryCurrency: 'USD',
    salaryPeriod: 'monthly',
    duration: '2 years',
    slots: 5,
    requirements: JSON.stringify([
      'Female, at least 23 years old',
      'At least high school graduate',
      'With valid passport (at least 6 months validity)',
      'At least 2 years domestic work experience',
      'Can cook Arabic and Filipino dishes',
      'Willing to work without day off (negotiable)',
    ]),
    benefits: JSON.stringify([
      'Free accommodation (private room)',
      'Free food',
      'Monthly salary $400-600',
      'Annual leave with paid round-trip flight',
      'Medical insurance',
      'Overtime pay available',
    ]),
    requiredSkills: JSON.stringify(['General Housekeeping', 'Cooking / Food Preparation', 'Child Care / Babysitting', 'Laundry / Ironing']),
    status: 'open',
    visibility: 'public',
    employerId: employerProfile.id,
    agencyId: localAgency.id,
    createdBy: firaAdmin.id,
    customFields: [
      { label: 'Can you cook Arabic food?', fieldType: 'select', options: ['Yes', 'No', 'Willing to learn'], isRequired: true },
      { label: 'Are you willing to work without day off?', fieldType: 'select', options: ['Yes', 'Prefer with day off', 'Negotiable'], isRequired: true },
    ],
  });

  // Job 2: Caregiver Singapore
  const job2 = await createJobWithStages({
    title: 'Caregiver for Elderly with Dementia',
    description: 'Urgent need for a compassionate caregiver to provide daily care for an 80-year-old patient with dementia in Singapore. Must be patient, caring, and experienced in elderly care.',
    country: 'Singapore',
    city: 'Singapore',
    category: 'caregiver',
    jobType: 'skills_professional',
    salaryMin: 600,
    salaryMax: 800,
    salaryCurrency: 'USD',
    salaryPeriod: 'monthly',
    duration: '2 years',
    slots: 3,
    requirements: JSON.stringify([
      'At least 23 years old',
      'TESDA Caregiving NC II certified',
      'At least 2 years caregiving experience',
      'Experience with dementia patients preferred',
      'Good English communication skills',
      'Valid passport',
    ]),
    benefits: JSON.stringify([
      'Free accommodation (separate room)',
      'Monthly salary SGD 2,200-2,800',
      'Medical insurance',
      'Annual leave with paid flight',
      '13th month pay',
      'Rest days: 1 per week',
    ]),
    requiredSkills: JSON.stringify(['Elderly Care', 'Patient Monitoring', 'Medication Administration', 'First Aid', 'Companionship']),
    status: 'open',
    visibility: 'public',
    employerId: employerProfile.id,
    agencyId: localAgency.id,
    createdBy: firaAdmin.id,
  });

  // Job 3: Factory Worker Taiwan
  const job3 = await createJobWithStages({
    title: 'Factory Worker - Electronics Assembly',
    description: 'Hiring Factory Workers for a major electronics manufacturing company in Taiwan. Training provided for qualified candidates. Must be willing to work in shifts and overtime.',
    country: 'Taiwan',
    city: 'Taipei',
    category: 'factory',
    jobType: 'skills_professional',
    salaryMin: 500,
    salaryMax: 700,
    salaryCurrency: 'USD',
    salaryPeriod: 'monthly',
    duration: '3 years',
    slots: 20,
    requirements: JSON.stringify([
      'At least 20 years old, maximum 40 years old',
      'High school graduate or vocational course',
      'Physically fit (will undergo medical exam)',
      'Willing to work in rotating shifts',
      'No criminal record',
      'Valid passport',
    ]),
    benefits: JSON.stringify([
      'Free shared accommodation',
      'Free meals at factory cafeteria',
      'Overtime pay (1.33x regular rate)',
      'Medical insurance',
      'Performance bonus quarterly',
      'Annual leave with paid flight',
    ]),
    requiredSkills: JSON.stringify(['Assembly', 'Quality Control', 'Teamwork', 'Attention to Detail']),
    status: 'open',
    visibility: 'public',
    agencyId: localAgency.id,
    createdBy: localAgencyAdmin.id,
  });

  // Job 4: Nurse Dubai
  const job4 = await createJobWithStages({
    title: 'Registered Nurse - ICU/ER',
    description: 'Prestigious hospital in Dubai urgently hiring Registered Nurses with ICU or ER experience. Competitive tax-free salary with comprehensive benefits package.',
    country: 'United Arab Emirates',
    city: 'Dubai',
    category: 'nurse',
    jobType: 'skills_professional',
    salaryMin: 1500,
    salaryMax: 2500,
    salaryCurrency: 'USD',
    salaryPeriod: 'monthly',
    duration: '2 years',
    slots: 10,
    requirements: JSON.stringify([
      'BSN graduate from accredited university',
      'Active PRC license',
      'At least 2 years ICU or ER experience',
      'IELTS score of 6.5 or higher',
      'BLS and ACLS certification',
      'Valid passport',
    ]),
    benefits: JSON.stringify([
      'Tax-free salary',
      'Free furnished accommodation',
      'Transportation allowance',
      'Comprehensive medical insurance',
      'Annual leave with paid round-trip flight',
      'Professional development allowance',
    ]),
    requiredSkills: JSON.stringify(['ICU Nursing', 'Patient Assessment', 'IV Therapy', 'Emergency Response', 'Medical Documentation']),
    status: 'open',
    visibility: 'agency_only',
    agencyId: localAgency.id,
    createdBy: firaAdmin.id,
  });

  // Job 5: Domestic Helper Japan
  const job5 = await createJobWithStages({
    title: 'Domestic Helper / Care Worker',
    description: 'Japanese family looking for a caring domestic helper who can also assist with elderly care. Must be willing to learn basic Japanese. Training and Japanese language classes provided.',
    country: 'Japan',
    city: 'Tokyo',
    category: 'domestic_helper',
    jobType: 'domestic_helper',
    salaryMin: 800,
    salaryMax: 1200,
    salaryCurrency: 'USD',
    salaryPeriod: 'monthly',
    duration: '3 years',
    slots: 3,
    requirements: JSON.stringify([
      'Female, at least 23 years old, maximum 45 years old',
      'At least high school graduate',
      'Willing to study Japanese language',
      'Experience in caregiving or domestic work',
      'Valid passport',
    ]),
    benefits: JSON.stringify([
      'Free accommodation',
      'Free meals during working days',
      'Japanese language training',
      'National health insurance',
      'Annual paid leave',
      'Bonus twice a year',
    ]),
    requiredSkills: JSON.stringify(['Elderly Care', 'General Housekeeping', 'Cooking / Food Preparation']),
    status: 'open',
    visibility: 'public',
    employerId: employer2Profile.id,
    agencyId: localAgency2.id,
    createdBy: firaAdmin.id,
    customFields: [
      { label: 'Are you willing to study Japanese?', fieldType: 'select', options: ['Yes, very willing', 'Yes, if required', 'No'], isRequired: true },
      { label: 'Any previous experience in Japan?', fieldType: 'select', options: ['Yes - worked there', 'Yes - visited', 'No'], isRequired: false },
    ],
  });

  console.log('✅ 5 Job Orders created');

  // ============ 6. APPLICATIONS ============

  // Juan applies to Domestic Helper Saudi Arabia
  const firstStage1 = await db.aTSStage.findFirst({ where: { jobOrderId: job1.id, order: 1 } });
  const application1 = await db.application.create({
    data: {
      applicantId: applicant1User.id,
      jobOrderId: job1.id,
      status: 'screening',
      coverLetter: 'Dear Sir/Madam, I am writing to express my sincere interest in the Domestic Helper position. With 5 years of experience in Hong Kong as a domestic helper and a Bachelor\'s degree in Nursing, I am confident I can provide excellent service to your family. I am skilled in cooking Filipino and Chinese dishes, childcare, and elderly care. I am hardworking, patient, and trustworthy. Thank you for considering my application.',
      matchScore: 85.5,
      currentStageId: firstStage1?.id,
    },
  });

  await db.aIAnalysisResult.create({
    data: {
      applicationId: application1.id,
      matchScore: 85.5,
      semanticScore: 0.82,
      matchedSkills: JSON.stringify(['General Housekeeping', 'Cooking / Food Preparation', 'Child Care / Babysitting']),
      missingSkills: JSON.stringify(['Laundry / Ironing']),
      explanation: 'Strong candidate with excellent household management and caregiving skills. 5 years of relevant experience in Hong Kong. Nursing background provides additional value for elderly care. Missing formal laundry management but this is easily trainable.',
    },
  });

  // Custom response for Job 1
  const job1Fields = await db.jobCustomField.findMany({ where: { jobOrderId: job1.id } });
  if (job1Fields.length > 0) {
    await db.applicationCustomResponse.create({
      data: { applicationId: application1.id, fieldId: job1Fields[0].id, value: 'Willing to learn' },
    });
  }

  console.log('✅ Application 1 (Juan -> Domestic Helper Saudi Arabia) created');

  // Rosa applies to Caregiver Singapore
  const firstStage2 = await db.aTSStage.findFirst({ where: { jobOrderId: job2.id, order: 1 } });
  const application2 = await db.application.create({
    data: {
      applicantId: applicant2User.id,
      jobOrderId: job2.id,
      status: 'applied',
      coverLetter: 'I am a certified caregiver with 3 years of hands-on experience caring for elderly patients, including those with dementia. I have my TESDA NC II certification and I am passionate about providing quality elderly care.',
      matchScore: 92.3,
      currentStageId: firstStage2?.id,
    },
  });

  await db.aIAnalysisResult.create({
    data: {
      applicationId: application2.id,
      matchScore: 92.3,
      semanticScore: 0.91,
      matchedSkills: JSON.stringify(['Elderly Care', 'Patient Monitoring', 'Medication Administration', 'First Aid']),
      missingSkills: JSON.stringify(['Companionship']),
      explanation: 'Excellent match. Candidate has direct dementia care experience which is specifically required. All core skills present. TESDA certified. Strong recommendation for this position.',
    },
  });

  console.log('✅ Application 2 (Rosa -> Caregiver Singapore) created');

  // ============ 7. ENDORSEMENTS ============
  // Juan's application endorsed by Local Agency to FIRA
  await db.endorsement.create({
    data: {
      applicationId: application1.id,
      endorsedById: localAgencyAdmin.id,
      employerId: employerProfile.id,
      status: 'pending_fira_review',
      coverNote: 'Highly recommended candidate. Strong household skills and nursing background. Passes initial screening with flying colors.',
      agencyNote: 'Verified all documents. Passport valid until 2028. Ready for medical examination.',
    },
  });

  console.log('✅ Endorsement created (Juan -> FIRA review)');

  // ============ 8. NOTIFICATIONS ============
  await db.notification.create({
    data: {
      userId: applicant1User.id,
      title: 'Application Submitted Successfully',
      message: 'Your application for Domestic Helper in Riyadh, Saudi Arabia has been submitted. You are now being screened.',
      type: 'success',
    },
  });

  await db.notification.create({
    data: {
      userId: applicant1User.id,
      title: 'Naisantabi ang iyong aplikasyon',
      message: 'Matagumpay na na-submit ang iyong aplikasyon para sa Domestic Helper sa Riyadh, Saudi Arabia. Kasalukuyang sinusuri na ito.',
      type: 'info',
    },
  });

  await db.notification.create({
    data: {
      userId: localAgencyAdmin.id,
      title: 'New Application Received',
      message: 'Juan Dela Cruz has applied for the Domestic Helper position in Riyadh.',
      type: 'info',
    },
  });

  await db.notification.create({
    data: {
      userId: applicant2User.id,
      title: 'Application Submitted Successfully',
      message: 'Your application for Caregiver position in Singapore has been submitted.',
      type: 'success',
    },
  });

  await db.notification.create({
    data: {
      userId: applicant3User.id,
      title: 'Kumpletohin ang iyong profile',
      message: 'May mga ilang impormasyon pa na kailangan mong i-complete sa iyong profile bago ka makapag-apply.',
      type: 'warning',
    },
  });

  console.log('✅ Notifications created');

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   FIRA Admin (International): admin@fira.com.ph / FiraAdmin2025!');
  console.log('   Local Agency Admin:         agency@fira.com.ph / AgencyAdmin2025!');
  console.log('   Local Agency Recruiter:     recruiter@fira.com.ph / Recruiter2025!');
  console.log('   Local Agency 2 Admin:       myk@fira.com.ph / MykAdmin2025!');
  console.log('   Employer (Saudi):           employer@fira.com.ph / Employer2025!');
  console.log('   Employer (Japan):           employer2@fira.com.ph / Employer2025!');
  console.log('   Applicant 1 (Juan - DH):    applicant@fira.com.ph / Applicant2025!');
  console.log('   Applicant 2 (Rosa - CG):     rosa@fira.com.ph / Applicant2025!');
  console.log('   Applicant 3 (Nena - DH):    nena@fira.com.ph / Applicant2025!');
  console.log('   Applicant 4 (Mark - Welder): mark@fira.com.ph / Applicant2025!');
  console.log('');
  console.log('💼 Jobs Created: 5 (3 public, 1 agency_only, 1 public w/ Japan employer)');
  console.log('📋 Applications: 2');
  console.log('📤 Endorsements: 1');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
