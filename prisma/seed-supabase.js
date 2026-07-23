const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const CONNECTION_STRING = 'postgresql://postgres.vilqiivxemphmjhjiydw:%3FG2%25GAYAhGG%2FfTh@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

function cuid() { return 'cl' + crypto.randomBytes(16).toString('hex').slice(0,24); }
function now() { return new Date(); }

function buildInsert(table, data) {
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = cols.map((_, i) => `$${i+1}`).join(', ');
  const quotedCols = cols.map(c => `"${c}"`).join(', ');
  return { sql: `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders})`, values: vals };
}

async function insert(client, table, data) {
  const { sql, values } = buildInsert(table, data);
  await client.query(sql, values);
}

async function main() {
  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('🌱 Seeding FIRA Supabase database...');

  // Clean
  console.log('🗑️ Cleaning...');
  const tables = ['ApplicationCustomResponse','AIAnalysisResult','ATSStageHistory','Endorsement','Application','JobCustomField','ATSStage','JobOrder','ApplicantTraining','ApplicantDocument','ApplicantReference','ApplicantCertification','ApplicantLanguage','ApplicantSkill','ApplicantExperience','ApplicantEducation','ApplicantProfile','ResumeEnhancement','Notification','AgencyMember','Agency','EmployerProfile','User'];
  for (const t of tables) await client.query(`DELETE FROM "${t}"`);
  console.log('✅ Cleaned');

  const pw = async (p) => bcrypt.hash(p, 12);
  const n = now();

  // 1. USERS
  const firaAdminId = cuid();
  await insert(client, 'User', { id: firaAdminId, email: 'admin@fira.com.ph', password: await pw('FiraAdmin2025!'), name: 'FIRA Administrator', role: 'international_agency', phone: '+63 2 8888 1234', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const agencyAdminId = cuid();
  await insert(client, 'User', { id: agencyAdminId, email: 'agency@fira.com.ph', password: await pw('AgencyAdmin2025!'), name: 'Maria Santos', role: 'local_agency', phone: '+63 917 200 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const recruiterId = cuid();
  await insert(client, 'User', { id: recruiterId, email: 'recruiter@fira.com.ph', password: await pw('Recruiter2025!'), name: 'Pedro Reyes', role: 'local_agency', phone: '+63 917 201 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const agency2AdminId = cuid();
  await insert(client, 'User', { id: agency2AdminId, email: 'myk@fira.com.ph', password: await pw('MykAdmin2025!'), name: 'Carmen Garcia', role: 'local_agency', phone: '+63 917 300 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const employerUserId = cuid();
  await insert(client, 'User', { id: employerUserId, email: 'employer@fira.com.ph', password: await pw('Employer2025!'), name: 'Ahmed Al-Rashid', role: 'employer', phone: '+966 50 123 4567', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const employer2UserId = cuid();
  await insert(client, 'User', { id: employer2UserId, email: 'employer2@fira.com.ph', password: await pw('Employer2025!'), name: 'Tanaka Yuki', role: 'employer', phone: '+81 90 1234 5678', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const app1UserId = cuid();
  await insert(client, 'User', { id: app1UserId, email: 'applicant@fira.com.ph', password: await pw('Applicant2025!'), name: 'Juan Dela Cruz', role: 'applicant', phone: '+63 917 400 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const app2UserId = cuid();
  await insert(client, 'User', { id: app2UserId, email: 'rosa@fira.com.ph', password: await pw('Applicant2025!'), name: 'Rosa Mendoza', role: 'applicant', phone: '+63 917 500 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const app3UserId = cuid();
  await insert(client, 'User', { id: app3UserId, email: 'nena@fira.com.ph', password: await pw('Applicant2025!'), name: 'Nena Villanueva', role: 'applicant', phone: '+63 917 600 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const app4UserId = cuid();
  await insert(client, 'User', { id: app4UserId, email: 'mark@fira.com.ph', password: await pw('Applicant2025!'), name: 'Mark Lim', role: 'applicant', phone: '+63 917 700 0000', isActive: true, isApproved: true, createdAt: n, updatedAt: n });
  console.log('✅ All users created');

  // 2. AGENCIES
  const agency1Id = cuid();
  await insert(client, 'Agency', { id: agency1Id, name: 'Starlight Manpower Services', agencyType: 'local', address: '123 Makati Avenue, Brgy. Pio del Pilar', city: 'Makati', country: 'Philippines', licenseNo: 'POEA-LICENSE-2024-001', phone: '+63 2 8888 1234', email: 'info@starlightmanpower.ph', website: 'https://starlightmanpower.ph', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  const agency2Id = cuid();
  await insert(client, 'Agency', { id: agency2Id, name: 'My K International Agency', agencyType: 'local', address: '456 Shaw Boulevard, Mandaluyong', city: 'Mandaluyong', country: 'Philippines', licenseNo: 'POEA-LICENSE-2024-002', phone: '+63 2 8123 4567', email: 'info@mykagency.ph', isActive: true, isApproved: true, createdAt: n, updatedAt: n });

  await insert(client, 'AgencyMember', { id: cuid(), userId: agencyAdminId, agencyId: agency1Id, role: 'admin', joinedAt: n });
  await insert(client, 'AgencyMember', { id: cuid(), userId: recruiterId, agencyId: agency1Id, role: 'recruiter', joinedAt: n });
  await insert(client, 'AgencyMember', { id: cuid(), userId: agency2AdminId, agencyId: agency2Id, role: 'admin', joinedAt: n });
  console.log('✅ Agencies created');

  // 3. EMPLOYERS
  const employerProfileId = cuid();
  await insert(client, 'EmployerProfile', { id: employerProfileId, userId: employerUserId, companyName: 'Al-Rashid Employment Services', companyAddress: 'King Fahd Road, Riyadh', country: 'Saudi Arabia', industry: 'Domestic Services & Healthcare', contactPerson: 'Ahmed Al-Rashid', contactEmail: 'ahmed@alrashid.sa', contactPhone: '+966 50 123 4567', createdAt: n, updatedAt: n });

  const employer2ProfileId = cuid();
  await insert(client, 'EmployerProfile', { id: employer2ProfileId, userId: employer2UserId, companyName: 'Tokyo Home Care Co.', companyAddress: 'Shibuya-ku, Tokyo', country: 'Japan', industry: 'Elderly Care & Domestic Services', contactPerson: 'Tanaka Yuki', contactEmail: 'tanaka@tokyohomecare.jp', contactPhone: '+81 90 1234 5678', createdAt: n, updatedAt: n });
  console.log('✅ Employers created');

  // 4. APPLICANT PROFILES
  const app1ProfileId = cuid();
  await insert(client, 'ApplicantProfile', {
    id: app1ProfileId, userId: app1UserId, firstName: 'Juan', middleName: 'Santos', lastName: 'Dela Cruz',
    gender: 'Male', birthDate: '1990-05-15', birthPlace: 'Manila', nationality: 'Filipino', civilStatus: 'Married',
    religion: 'Roman Catholic', height: '170', weight: '68', address: '456 Rizal Street, Sampaloc', city: 'Manila',
    province: 'Metro Manila', region: 'NCR', zipCode: '1008', phone: '+63 917 400 0000', altPhone: '+63 927 400 0001',
    applicantType: 'domestic_helper',
    householdTasks: JSON.stringify(['General Housekeeping','Cooking / Food Preparation','Laundry / Ironing','Child Care / Babysitting','Elderly Care']),
    passportNo: 'PN1234567', passportExpiry: '2028-05-14', passportStatus: 'valid',
    hasVisa: false, medicalStatus: 'none', highestEducation: 'bachelors', yearsExperience: 5,
    preferredCountry: 'Hong Kong', preferredJob: 'Domestic Helper', salaryExpectation: '500-700 USD',
    resumeText: 'Experienced domestic helper with 5 years in Hong Kong. Skilled in household management, cooking Filipino and Chinese dishes, childcare, and elderly care.',
    emergencyName: 'Rosa Dela Cruz', emergencyRelation: 'Wife', emergencyPhone: '+63 917 400 0002',
    formStep: 7, isComplete: true, createdAt: n, updatedAt: n,
  });

  const app2ProfileId = cuid();
  await insert(client, 'ApplicantProfile', {
    id: app2ProfileId, userId: app2UserId, firstName: 'Rosa', lastName: 'Mendoza',
    gender: 'Female', birthDate: '1992-08-22', birthPlace: 'Quezon City', nationality: 'Filipino', civilStatus: 'Single',
    religion: 'Roman Catholic', height: '158', weight: '52', address: '789 Bonifacio St, Brgy. San Isidro', city: 'Quezon City',
    province: 'Metro Manila', region: 'NCR', phone: '+63 917 500 0000',
    applicantType: 'skills_professional', passportNo: 'PN7654321', passportExpiry: '2027-08-21', passportStatus: 'valid',
    hasVisa: false, medicalStatus: 'none', highestEducation: 'bachelors', yearsExperience: 3,
    preferredCountry: 'Singapore', preferredJob: 'Caregiver', salaryExpectation: '600-800 USD',
    resumeText: 'Certified caregiver with 3 years experience in elderly care. TESDA NC II certified.',
    emergencyName: 'Antonio Mendoza', emergencyRelation: 'Father', emergencyPhone: '+63 917 500 0003',
    formStep: 7, isComplete: true, createdAt: n, updatedAt: n,
  });

  const app3ProfileId = cuid();
  await insert(client, 'ApplicantProfile', {
    id: app3ProfileId, userId: app3UserId, firstName: 'Nena', lastName: 'Villanueva',
    gender: 'Female', birthDate: '1985-12-03', birthPlace: 'Cebu City', nationality: 'Filipino', civilStatus: 'Widowed',
    address: '101 Rizal St, Barangay Ermita', city: 'Cebu City', province: 'Cebu', region: 'Region VII',
    phone: '+63 917 600 0000', applicantType: 'domestic_helper',
    householdTasks: JSON.stringify(['General Housekeeping','Cooking / Food Preparation','Laundry / Ironing','Child Care / Babysitting']),
    passportStatus: 'none', hasVisa: false, medicalStatus: 'none', highestEducation: 'high_school', yearsExperience: 8,
    preferredCountry: 'Middle East', preferredJob: 'Domestic Helper', formStep: 3, isComplete: false,
    createdAt: n, updatedAt: n,
  });

  const app4ProfileId = cuid();
  await insert(client, 'ApplicantProfile', {
    id: app4ProfileId, userId: app4UserId, firstName: 'Mark', middleName: 'Tan', lastName: 'Lim',
    gender: 'Male', birthDate: '1995-03-18', birthPlace: 'Davao City', nationality: 'Filipino', civilStatus: 'Single',
    height: '175', weight: '72', address: '55 Torres Street', city: 'Davao City', province: 'Davao del Sur',
    region: 'Region XI', phone: '+63 917 700 0000', applicantType: 'skills_professional',
    passportNo: 'PN9876543', passportExpiry: '2029-03-17', passportStatus: 'valid',
    hasVisa: true, visaCountry: 'Singapore', visaType: 'Work Pass', visaStatus: 'expired',
    medicalStatus: 'passed', highestEducation: 'bachelors', yearsExperience: 4,
    preferredCountry: 'Singapore, Japan', preferredJob: 'Welder / Fabricator', salaryExpectation: '800-1200 USD',
    resumeText: 'Licensed Mechanical Engineer with 4 years experience in fabrication and welding. AWS CWI certified.',
    emergencyName: 'Linda Lim', emergencyRelation: 'Mother', emergencyPhone: '+63 917 700 0005',
    formStep: 7, isComplete: true, createdAt: n, updatedAt: n,
  });
  console.log('✅ Applicant profiles created');

  // 5. APPLICANT SUB-TABLES
  // Education
  await insert(client, 'ApplicantEducation', { id: cuid(), applicantId: app1ProfileId, institution: 'Pamantasan ng Lungsod ng Maynila', degree: 'Bachelor of Science', fieldOfStudy: 'Nursing', startYear: 2008, endYear: 2012, createdAt: n });
  await insert(client, 'ApplicantEducation', { id: cuid(), applicantId: app2ProfileId, institution: 'Technological Institute of the Philippines', degree: 'Bachelor of Science', fieldOfStudy: 'Caregiving', startYear: 2010, endYear: 2014, createdAt: n });
  await insert(client, 'ApplicantEducation', { id: cuid(), applicantId: app4ProfileId, institution: 'University of Mindanao', degree: 'Bachelor of Science', fieldOfStudy: 'Mechanical Engineering', startYear: 2013, endYear: 2017, createdAt: n });

  // Experience
  await insert(client, 'ApplicantExperience', { id: cuid(), applicantId: app1ProfileId, company: 'Chan Family', position: 'Domestic Helper', country: 'Hong Kong', startDate: '2017-03-01', isCurrent: true, description: 'All-around DH for family of 5.', monthlySalary: 'HKD 5,500', createdAt: n });
  await insert(client, 'ApplicantExperience', { id: cuid(), applicantId: app1ProfileId, company: 'Wong Household', position: 'Domestic Helper', country: 'Hong Kong', startDate: '2014-06-15', endDate: '2017-02-28', isCurrent: false, description: 'DH and caregiver for elderly grandmother.', monthlySalary: 'HKD 4,800', createdAt: n });
  await insert(client, 'ApplicantExperience', { id: cuid(), applicantId: app2ProfileId, company: 'Home Care Plus Singapore', position: 'Caregiver', country: 'Singapore', startDate: '2021-01-15', isCurrent: true, description: 'Elderly care for dementia patient.', monthlySalary: 'SGD 2,200', createdAt: n });
  await insert(client, 'ApplicantExperience', { id: cuid(), applicantId: app4ProfileId, company: 'DMCI Construction', position: 'Welder / Fabricator', country: 'Philippines', startDate: '2017-08-01', endDate: '2021-06-30', isCurrent: false, description: 'Structural steel fabrication and welding.', monthlySalary: 'PHP 35,000', createdAt: n });

  // Skills
  for (const s of [
    { applicantId: app1ProfileId, name: 'General Housekeeping', level: 'expert', yearsExperience: 5 },
    { applicantId: app1ProfileId, name: 'Cooking / Food Preparation', level: 'advanced', yearsExperience: 5 },
    { applicantId: app1ProfileId, name: 'Child Care / Babysitting', level: 'advanced', yearsExperience: 5 },
    { applicantId: app1ProfileId, name: 'Elderly Care', level: 'intermediate', yearsExperience: 3 },
    { applicantId: app1ProfileId, name: 'Laundry / Ironing', level: 'advanced', yearsExperience: 5 },
    { applicantId: app2ProfileId, name: 'Elderly Care', level: 'expert', yearsExperience: 3 },
    { applicantId: app2ProfileId, name: 'Patient Monitoring', level: 'advanced', yearsExperience: 3 },
    { applicantId: app2ProfileId, name: 'Medication Administration', level: 'intermediate', yearsExperience: 3 },
    { applicantId: app2ProfileId, name: 'Dementia Care', level: 'advanced', yearsExperience: 2 },
    { applicantId: app2ProfileId, name: 'First Aid', level: 'advanced', yearsExperience: 4 },
    { applicantId: app4ProfileId, name: 'GTAW (TIG) Welding', level: 'expert', yearsExperience: 4 },
    { applicantId: app4ProfileId, name: 'SMAW (Stick) Welding', level: 'expert', yearsExperience: 4 },
    { applicantId: app4ProfileId, name: 'Structural Fabrication', level: 'advanced', yearsExperience: 4 },
    { applicantId: app4ProfileId, name: 'Blueprint Reading', level: 'advanced', yearsExperience: 4 },
    { applicantId: app4ProfileId, name: 'Quality Inspection', level: 'intermediate', yearsExperience: 3 },
  ]) await insert(client, 'ApplicantSkill', { id: cuid(), createdAt: n, ...s });

  // Languages
  for (const l of [
    { applicantId: app1ProfileId, language: 'English', proficiency: 'advanced', speaking: 'advanced', reading: 'advanced', writing: 'intermediate' },
    { applicantId: app1ProfileId, language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { applicantId: app1ProfileId, language: 'Cantonese', proficiency: 'basic', speaking: 'intermediate', reading: 'basic' },
    { applicantId: app2ProfileId, language: 'English', proficiency: 'fluent', speaking: 'fluent', reading: 'fluent', writing: 'fluent' },
    { applicantId: app2ProfileId, language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { applicantId: app2ProfileId, language: 'Mandarin', proficiency: 'basic', speaking: 'basic', reading: 'basic' },
    { applicantId: app4ProfileId, language: 'English', proficiency: 'fluent', speaking: 'fluent', reading: 'fluent', writing: 'fluent' },
    { applicantId: app4ProfileId, language: 'Filipino', proficiency: 'native', speaking: 'native', reading: 'native', writing: 'native' },
    { applicantId: app4ProfileId, language: 'Japanese', proficiency: 'basic', speaking: 'basic', reading: 'basic' },
  ]) await insert(client, 'ApplicantLanguage', { id: cuid(), createdAt: n, ...l });

  // Certifications
  await insert(client, 'ApplicantCertification', { id: cuid(), applicantId: app2ProfileId, name: 'TESDA Caregiving NC II', issuingBody: 'TESDA', issuedDate: '2014-08-15', credentialId: 'TESDA-CG-2014-98765', createdAt: n });
  await insert(client, 'ApplicantCertification', { id: cuid(), applicantId: app4ProfileId, name: 'AWS Certified Welding Inspector (CWI)', issuingBody: 'American Welding Society', issuedDate: '2019-12-01', expiryDate: '2025-12-01', credentialId: 'AWS-CWI-2019-12345', createdAt: n });

  // Documents
  for (const d of [
    { applicantId: app1ProfileId, documentType: 'nso_birth_cert', fileName: 'birth_cert_juan.pdf', isVerified: true },
    { applicantId: app1ProfileId, documentType: 'valid_id', fileName: 'umid_juan.jpg', isVerified: true },
    { applicantId: app1ProfileId, documentType: 'passport', fileName: 'passport_juan.pdf', isVerified: true },
    { applicantId: app1ProfileId, documentType: 'nbi_clearance', fileName: 'nbi_juan.pdf', isVerified: false },
    { applicantId: app2ProfileId, documentType: 'nso_birth_cert', fileName: 'birth_cert_rosa.pdf', isVerified: true },
    { applicantId: app2ProfileId, documentType: 'valid_id', fileName: 'umid_rosa.jpg', isVerified: true },
    { applicantId: app2ProfileId, documentType: 'passport', fileName: 'passport_rosa.pdf', isVerified: true },
  ]) await insert(client, 'ApplicantDocument', { id: cuid(), uploadedAt: n, ...d });

  // References
  await insert(client, 'ApplicantReference', { id: cuid(), applicantId: app1ProfileId, name: 'Mrs. Chan', company: 'Chan Family', position: 'Employer', phone: '+852 9123 4567', email: 'mrs.chan@email.com', relationship: 'Former Employer', yearsKnown: '5', createdAt: n });
  console.log('✅ Applicant sub-tables created');

  // 6. JOB ORDERS + ATS STAGES
  const STAGES = [
    { name: 'New Application', color: '#10b981' }, { name: 'Document Review', color: '#06b6d4' },
    { name: 'Initial Screening', color: '#3b82f6' }, { name: 'Interview Scheduled', color: '#6366f1' },
    { name: 'Interview Completed', color: '#8b5cf6' }, { name: 'Skills Assessment', color: '#a855f7' },
    { name: 'Background Check', color: '#d946ef' }, { name: 'Medical Examination', color: '#ec4899' },
    { name: 'Government Processing', color: '#f43f5e' }, { name: 'Pre-Departure Orientation', color: '#f97316' },
    { name: 'Contract Signing', color: '#eab308' }, { name: 'Deployment', color: '#84cc16' },
    { name: 'Arrival Confirmed', color: '#22c55e' }, { name: 'Completed', color: '#14b8a6' },
  ];

  async function createJob(data) {
    const jobId = cuid();
    await insert(client, 'JobOrder', { id: jobId, postedDate: n, createdAt: n, updatedAt: n, status: 'open', contractType: 'full_time', salaryCurrency: 'USD', ...data });
    const stageIds = [];
    for (let i = 0; i < STAGES.length; i++) {
      const sid = cuid();
      await insert(client, 'ATSStage', { id: sid, jobOrderId: jobId, name: STAGES[i].name, order: i + 1, color: STAGES[i].color, isDefault: true, createdAt: n });
      stageIds.push(sid);
    }
    return { jobId, stageIds };
  }

  const job1 = await createJob({ title: 'Domestic Helper - All-Round', description: 'Looking for experienced DH for family in Riyadh. 3 children.', country: 'Saudi Arabia', city: 'Riyadh', category: 'domestic_helper', jobType: 'domestic_helper', salaryMin: 400, salaryMax: 600, salaryPeriod: 'monthly', duration: '2 years', slots: 5, requirements: JSON.stringify(['Female, at least 23', 'High school graduate', 'Valid passport', '2 years experience']), benefits: JSON.stringify(['Free accommodation', 'Free food', 'Annual leave', 'Medical insurance']), requiredSkills: JSON.stringify(['General Housekeeping', 'Cooking', 'Child Care', 'Laundry']), visibility: 'public', employerId: employerProfileId, agencyId: agency1Id, createdBy: firaAdminId });

  const job2 = await createJob({ title: 'Caregiver for Elderly with Dementia', description: 'Urgent need for compassionate caregiver for 80-year-old in Singapore.', country: 'Singapore', city: 'Singapore', category: 'caregiver', jobType: 'skills_professional', salaryMin: 600, salaryMax: 800, salaryPeriod: 'monthly', duration: '2 years', slots: 3, requirements: JSON.stringify(['23+ years old', 'TESDA NC II', '2 years experience', 'Good English']), benefits: JSON.stringify(['Free accommodation', 'Medical insurance', 'Annual leave', '13th month pay']), requiredSkills: JSON.stringify(['Elderly Care', 'Patient Monitoring', 'First Aid']), visibility: 'public', employerId: employerProfileId, agencyId: agency1Id, createdBy: firaAdminId });

  const job3 = await createJob({ title: 'Factory Worker - Electronics Assembly', description: 'Hiring factory workers for electronics manufacturing in Taiwan.', country: 'Taiwan', city: 'Taipei', category: 'factory', jobType: 'skills_professional', salaryMin: 500, salaryMax: 700, salaryPeriod: 'monthly', duration: '3 years', slots: 20, requirements: JSON.stringify(['20-40 years old', 'High school graduate', 'Physically fit']), benefits: JSON.stringify(['Free accommodation', 'Free meals', 'Overtime pay']), requiredSkills: JSON.stringify(['Assembly', 'Quality Control', 'Teamwork']), visibility: 'public', agencyId: agency1Id, createdBy: agencyAdminId });

  const job4 = await createJob({ title: 'Registered Nurse - ICU/ER', description: 'Dubai hospital hiring RNs with ICU/ER experience.', country: 'United Arab Emirates', city: 'Dubai', category: 'nurse', jobType: 'skills_professional', salaryMin: 1500, salaryMax: 2500, salaryPeriod: 'monthly', duration: '2 years', slots: 10, requirements: JSON.stringify(['BSN graduate', 'PRC license', '2 years ICU/ER', 'IELTS 6.5+']), benefits: JSON.stringify(['Tax-free salary', 'Free accommodation', 'Medical insurance']), requiredSkills: JSON.stringify(['ICU Nursing', 'Patient Assessment', 'IV Therapy']), visibility: 'agency_only', agencyId: agency1Id, createdBy: firaAdminId });

  const job5 = await createJob({ title: 'Domestic Helper / Care Worker', description: 'Japanese family looking for caring DH. Japanese training provided.', country: 'Japan', city: 'Tokyo', category: 'domestic_helper', jobType: 'domestic_helper', salaryMin: 800, salaryMax: 1200, salaryPeriod: 'monthly', duration: '3 years', slots: 3, requirements: JSON.stringify(['Female, 23-45', 'High school graduate', 'Willing to study Japanese']), benefits: JSON.stringify(['Free accommodation', 'Language training', 'Health insurance', 'Annual leave', 'Bonus']), requiredSkills: JSON.stringify(['Elderly Care', 'Housekeeping', 'Cooking']), visibility: 'public', employerId: employer2ProfileId, agencyId: agency2Id, createdBy: firaAdminId });
  console.log('✅ 5 Job Orders with ATS stages created');

  // 7. APPLICATIONS
  const application1Id = cuid();
  await insert(client, 'Application', { id: application1Id, applicantId: app1UserId, jobOrderId: job1.jobId, status: 'screening', coverLetter: 'Dear Sir/Madam, with 5 years experience in Hong Kong as a domestic helper and a Bachelor\'s degree in Nursing, I am confident I can provide excellent service.', matchScore: 85.5, currentStageId: job1.stageIds[0], createdAt: n, updatedAt: n });
  await insert(client, 'AIAnalysisResult', { id: cuid(), applicationId: application1Id, matchScore: 85.5, semanticScore: 0.82, matchedSkills: JSON.stringify(['General Housekeeping','Cooking','Child Care']), missingSkills: JSON.stringify(['Laundry / Ironing']), explanation: 'Strong candidate with excellent household skills. 5 years experience.', createdAt: n, updatedAt: n });

  const application2Id = cuid();
  await insert(client, 'Application', { id: application2Id, applicantId: app2UserId, jobOrderId: job2.jobId, status: 'applied', coverLetter: 'Certified caregiver with 3 years experience caring for elderly patients, including dementia. TESDA NC II certified.', matchScore: 92.3, currentStageId: job2.stageIds[0], createdAt: n, updatedAt: n });
  await insert(client, 'AIAnalysisResult', { id: cuid(), applicationId: application2Id, matchScore: 92.3, semanticScore: 0.91, matchedSkills: JSON.stringify(['Elderly Care','Patient Monitoring','Medication Administration','First Aid']), missingSkills: JSON.stringify(['Companionship']), explanation: 'Excellent match. Direct dementia care experience.', createdAt: n, updatedAt: n });
  console.log('✅ Applications created');

  // 8. ENDORSEMENTS
  await insert(client, 'Endorsement', { id: cuid(), applicationId: application1Id, endorsedById: agencyAdminId, employerId: employerProfileId, status: 'pending_fira_review', coverNote: 'Highly recommended candidate with strong household skills and nursing background.', agencyNote: 'Verified all documents. Passport valid until 2028. Ready for medical.', createdAt: n, updatedAt: n });
  console.log('✅ Endorsements created');

  // 9. NOTIFICATIONS
  for (const [uid, title, msg, type] of [
    [app1UserId, 'Application Submitted Successfully', 'Your application for Domestic Helper in Riyadh has been submitted.', 'success'],
    [app1UserId, 'Naisantabi ang iyong aplikasyon', 'Na-submit na ang iyong aplikasyon para sa DH sa Riyadh.', 'info'],
    [agencyAdminId, 'New Application Received', 'Juan Dela Cruz has applied for the DH position.', 'info'],
    [app2UserId, 'Application Submitted Successfully', 'Your application for Caregiver in Singapore has been submitted.', 'success'],
    [app3UserId, 'Kumpletohin ang iyong profile', 'May mga impormasyon pang kailangan mong i-complete.', 'warning'],
  ]) await insert(client, 'Notification', { id: cuid(), userId: uid, title, message: msg, type, isRead: false, createdAt: n });
  console.log('✅ Notifications created');

  console.log('\n🎉 Supabase seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('   FIRA Admin:       admin@fira.com.ph / FiraAdmin2025!');
  console.log('   Agency Admin:     agency@fira.com.ph / AgencyAdmin2025!');
  console.log('   Recruiter:        recruiter@fira.com.ph / Recruiter2025!');
  console.log('   Agency 2 Admin:   myk@fira.com.ph / MykAdmin2025!');
  console.log('   Employer (Saudi): employer@fira.com.ph / Employer2025!');
  console.log('   Employer (Japan): employer2@fira.com.ph / Employer2025!');
  console.log('   Juan (DH):        applicant@fira.com.ph / Applicant2025!');
  console.log('   Rosa (CG):        rosa@fira.com.ph / Applicant2025!');
  console.log('   Nena (DH):        nena@fira.com.ph / Applicant2025!');
  console.log('   Mark (Welder):    mark@fira.com.ph / Applicant2025!');
  console.log('\n📊 Jobs: 5 | Applications: 2 | Endorsements: 1');

  await client.end();
  console.log('✅ Disconnected');
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
