import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding FIRA database...');

  // Create FIRA Super Admin
  const adminPassword = await hash('FiraAdmin2025!', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@fira.com.ph' },
    update: {},
    create: {
      email: 'admin@fira.com.ph',
      passwordHash: adminPassword,
      name: 'FIRA Administrator',
      role: 'fira',
      isActive: true,
    },
  });

  // Create Employer User
  const employerPassword = await hash('FiraEmployer2025!', 12);
  const employerUser = await db.user.upsert({
    where: { email: 'employer@fira.com.ph' },
    update: {},
    create: {
      email: 'employer@fira.com.ph',
      passwordHash: employerPassword,
      name: 'Demo Employer',
      role: 'employer',
      isActive: true,
    },
  });

  // Create Employer Profile
  const employerProfile = await db.employerProfile.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      companyName: 'Al-Rashid Employment Services',
      companyAddress: 'Riyadh, Kingdom of Saudi Arabia',
      country: 'Saudi Arabia',
      contactPerson: 'Ahmed Al-Rashid',
      contactPhone: '+966-50-123-4567',
      contactEmail: 'hr@alrashid.sa',
      industry: 'Domestic Helper Services',
      isApproved: true,
    },
  });

  // Create Sample Agency
  const agencyPassword = await hash('AgencyAdmin2025!', 12);
  const agencyUser = await db.user.upsert({
    where: { email: 'agency@fira.com.ph' },
    update: {},
    create: {
      email: 'agency@fira.com.ph',
      passwordHash: agencyPassword,
      name: 'Maria Santos',
      role: 'agency_admin',
      isActive: true,
    },
  });

  const agency = await db.agency.upsert({
    where: { id: 'agency-demo-001' },
    update: {},
    create: {
      id: 'agency-demo-001',
      name: 'Starlight Manpower Services',
      licenseNo: 'POEA-LB-2024-00123',
      address: '123 Makati Avenue, Makati City, Philippines',
      phone: '+63-2-8123-4567',
      email: 'info@starlightmanpower.ph',
      isApproved: true,
      ownerId: agencyUser.id,
    },
  });

  await db.agencyMember.upsert({
    where: { userId: agencyUser.id },
    update: {},
    create: {
      userId: agencyUser.id,
      agencyId: agency.id,
      role: 'admin',
    },
  });

  // Create Sample Applicant
  const applicantPassword = await hash('Applicant2025!', 12);
  const applicantUser = await db.user.upsert({
    where: { email: 'applicant@fira.com.ph' },
    update: {},
    create: {
      email: 'applicant@fira.com.ph',
      passwordHash: applicantPassword,
      name: 'Juan Dela Cruz',
      role: 'applicant',
      isActive: true,
    },
  });

  const applicantProfile = await db.applicantProfile.upsert({
    where: { userId: applicantUser.id },
    update: {},
    create: {
      userId: applicantUser.id,
      agencyId: agency.id,
      firstName: 'Juan',
      middleName: 'Reyes',
      lastName: 'Dela Cruz',
      nickname: 'Juan',
      birthDate: new Date('1990-05-15'),
      gender: 'male',
      civilStatus: 'single',
      nationality: 'Filipino',
      religion: 'Roman Catholic',
      heightCm: 170,
      weightKg: 68,
      bloodType: 'O+',
      mobileNumber: '+63-917-123-4567',
      emailAddress: 'juan.delacruz@email.com',
      presentAddress: '456 Sampaloc, Manila, Philippines',
      permanentAddress: '456 Sampaloc, Manila, Philippines',
      emergencyName: 'Maria Dela Cruz',
      emergencyRelation: 'Mother',
      emergencyPhone: '+63-918-765-4321',
      passportNumber: 'PH1234567',
      sssNumber: '03-1234567-8',
      pagibigNumber: '1234-5678-9012',
      preferredCountry: 'Saudi Arabia',
      preferredJobCategory: 'domestic_helper',
      salaryExpectation: 600,
      isProfileComplete: true,
    },
  });

  // Add education
  for (const edu of [{
      profileId: applicantProfile.id, level: 'college', schoolName: 'University of Santo Tomas',
      course: 'Bachelor of Science in Nursing', fromYear: 2008, toYear: 2012, isGraduated: true,
    }]) {
    await db.applicantEducation.create({ data: edu });
  }

  // Add work experience
  for (const exp of [{
      profileId: applicantProfile.id, employerName: 'Hong Kong Family', country: 'Hong Kong',
      position: 'Domestic Helper', fromDate: new Date('2015-03-01'), toDate: new Date('2020-02-28'),
      duties: 'Childcare, cooking, housekeeping, laundry', salary: 550,
    }]) {
    await db.applicantExperience.create({ data: exp });
  }

  // Add skills
  for (const skill of [
    { profileId: applicantProfile.id, category: 'childcare', name: 'Infant Care', proficiency: 'advanced', yearsExperience: 5 },
    { profileId: applicantProfile.id, category: 'childcare', name: 'Childcare (2-6 years)', proficiency: 'expert', yearsExperience: 8 },
    { profileId: applicantProfile.id, category: 'cooking', name: 'Filipino Cuisine', proficiency: 'expert', yearsExperience: 10 },
    { profileId: applicantProfile.id, category: 'cooking', name: 'Chinese Cuisine', proficiency: 'intermediate', yearsExperience: 3 },
    { profileId: applicantProfile.id, category: 'housekeeping', name: 'General Housekeeping', proficiency: 'expert', yearsExperience: 10 },
    { profileId: applicantProfile.id, category: 'housekeeping', name: 'Laundry & Ironing', proficiency: 'expert', yearsExperience: 10 },
  ]) {
    await db.applicantSkill.create({ data: skill });
  }

  // Add languages
  for (const lang of [
    { profileId: applicantProfile.id, language: 'Filipino', proficiency: 'native' },
    { profileId: applicantProfile.id, language: 'English', proficiency: 'fluent' },
    { profileId: applicantProfile.id, language: 'Mandarin', proficiency: 'basic' },
  ]) {
    await db.applicantLanguage.create({ data: lang });
  }

  // Create Sample Job Order
  const jobOrder = await db.jobOrder.create({
    data: {
      title: 'Domestic Helper - Riyadh',
      description: 'Looking for an experienced domestic helper for a family of 4 in Riyadh. Duties include childcare, cooking, and general housekeeping.',
      country: 'Saudi Arabia',
      jobCategory: 'domestic_helper',
      salaryMin: 600,
      salaryMax: 800,
      currency: 'USD',
      contractDuration: '2 years',
      vacancies: 3,
      status: 'open',
      isUrgent: true,
      employerId: employerProfile.id,
      agencyId: agency.id,
      createdById: admin.id,
    },
  });

  // Create default ATS stages
  const defaultStages = [
    'Applied', 'Screening', 'Interview', 'Assessment', 'Document Verification',
    'Medical Exam', 'Endorsement', 'Employer Review', 'Accepted', 'Contract Signing',
    'Visa Processing', 'Orientation', 'Deployed', 'On-Probation', 'Regularized',
    'Contract Renewal', 'Repatriation', 'Contract Completed', 'Terminated'
  ];

  for (let i = 0; i < defaultStages.length; i++) {
    await db.aTSStage.create({
      data: {
        jobOrderId: jobOrder.id,
        name: defaultStages[i],
        order: i,
        color: ['#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#64748b', '#16a34a', '#dc2626'][i],
        isDefault: true,
      },
    });
  }

  // Create a sample application
  const application = await db.application.create({
    data: {
      applicantId: applicantUser.id,
      jobOrderId: jobOrder.id,
      status: 'pending',
      coverLetter: 'I am an experienced domestic helper with 5 years of work experience in Hong Kong...',
      matchScore: 85.5,
    },
  });

  // Move to first stage
  const firstStage = await db.aTSStage.findFirst({
    where: { jobOrderId: jobOrder.id, order: 0 },
  });
  if (firstStage) {
    await db.aTSStageHistory.create({
      data: {
        applicationId: application.id,
        stageId: firstStage.id,
        movedById: applicantUser.id,
        notes: 'Application submitted',
      },
    });
  }

  // Create second sample applicant & job for variety
  const applicant2Password = await hash('Applicant2025!', 12);
  const applicant2User = await db.user.upsert({
    where: { email: 'rosa@fira.com.ph' },
    update: {},
    create: {
      email: 'rosa@fira.com.ph',
      passwordHash: applicant2Password,
      name: 'Rosa Mendoza',
      role: 'applicant',
      isActive: true,
    },
  });

  await db.applicantProfile.upsert({
    where: { userId: applicant2User.id },
    update: {},
    create: {
      userId: applicant2User.id,
      agencyId: agency.id,
      firstName: 'Rosa',
      lastName: 'Mendoza',
      birthDate: new Date('1988-08-22'),
      gender: 'female',
      civilStatus: 'married',
      nationality: 'Filipino',
      heightCm: 158,
      weightKg: 55,
      mobileNumber: '+63-929-876-5432',
      emailAddress: 'rosa.mendoza@email.com',
      presentAddress: '789 Quezon City, Philippines',
      emergencyName: 'Pedro Mendoza',
      emergencyRelation: 'Husband',
      emergencyPhone: '+63-929-111-2222',
      preferredCountry: 'Singapore',
      preferredJobCategory: 'caregiver',
      isProfileComplete: true,
    },
  });

  // Second job order
  await db.jobOrder.create({
    data: {
      title: 'Caregiver - Singapore',
      description: 'Elderly care for a 78-year-old patient in Singapore. Must have nursing background.',
      country: 'Singapore',
      jobCategory: 'caregiver',
      salaryMin: 700,
      salaryMax: 900,
      currency: 'USD',
      contractDuration: '2 years',
      vacancies: 2,
      status: 'open',
      employerId: employerProfile.id,
      agencyId: agency.id,
      createdById: admin.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log('📧 Test accounts:');
  console.log('   FIRA Admin: admin@fira.com.ph / FiraAdmin2025!');
  console.log('   Employer: employer@fira.com.ph / FiraEmployer2025!');
  console.log('   Agency: agency@fira.com.ph / AgencyAdmin2025!');
  console.log('   Applicant: applicant@fira.com.ph / Applicant2025!');
  console.log('   Applicant 2: rosa@fira.com.ph / Applicant2025!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());