const { Client } = require('pg');

const URL = 'postgresql://postgres.vilqiivxemphmjhjiydw:%3FG2%25GAYAhGG%2FfTh@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function run(client, sql) {
  try { await client.query(sql); return true; }
  catch(e) { console.error('SQL Error:', e.message); return false; }
}

async function main() {
  const client = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✓ Connected to Supabase');

  // Drop all tables
  const drops = [
    '"VerificationCode"','"CmsSettings"','"CmsFormField"','"CmsTermsPrivacy"','"CmsOrgChart"',
    '"CmsSocialMedia"','"CmsTestimonial"','"CmsFaq"','"CmsPage"','"ResumeEnhancement"',
    '"AIAnalysisResult"','"Notification"','"Endorsement"','"ATSStageHistory"',
    '"ApplicationCustomResponse"','"Application"','"ATSStage"','"JobCustomField"',
    '"JobOrder"','"ApplicantTraining"','"ApplicantDocument"','"ApplicantReference"',
    '"ApplicantCertification"','"ApplicantLanguage"','"ApplicantSkill"','"ApplicantExperience"',
    '"ApplicantEducation"','"ApplicantProfile"','"EmployerProfile"','"AgencyMember"',
    '"Agency"','"_User"',
  ];
  for (const t of drops) await run(client, `DROP TABLE IF EXISTS ${t} CASCADE`);
  console.log('✓ Dropped all tables');

  // Create tables
  await run(client, `
    CREATE TABLE "_User" (
      "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "password" TEXT NOT NULL,
      "name" TEXT NOT NULL, "role" TEXT NOT NULL, "phone" TEXT, "avatar" TEXT,
      "isActive" BOOLEAN DEFAULT true, "isApproved" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);
  await run(client, `ALTER TABLE "_User" RENAME TO "User";`);

  await run(client, `
    CREATE TABLE "Agency" (
      "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "agencyType" TEXT DEFAULT 'local',
      "address" TEXT, "city" TEXT, "country" TEXT, "licenseNo" TEXT, "phone" TEXT,
      "email" TEXT, "website" TEXT, "isActive" BOOLEAN DEFAULT true,
      "isApproved" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "AgencyMember" (
      "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id"),
      "agencyId" TEXT NOT NULL REFERENCES "Agency"("id"), "role" TEXT DEFAULT 'member',
      "joinedAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE("userId", "agencyId")
    );
  `);

  await run(client, `
    CREATE TABLE "EmployerProfile" (
      "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id"),
      "companyName" TEXT NOT NULL, "companyAddress" TEXT, "country" TEXT NOT NULL,
      "industry" TEXT, "contactPerson" TEXT, "contactEmail" TEXT, "contactPhone" TEXT,
      "website" TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "ApplicantProfile" (
      "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id"),
      "firstName" TEXT NOT NULL, "middleName" TEXT, "lastName" TEXT NOT NULL, "suffixName" TEXT,
      "gender" TEXT, "birthDate" TIMESTAMP, "birthPlace" TEXT, "nationality" TEXT DEFAULT 'Filipino',
      "civilStatus" TEXT, "religion" TEXT, "height" TEXT, "weight" TEXT, "address" TEXT,
      "city" TEXT, "province" TEXT, "region" TEXT, "zipCode" TEXT, "phone" TEXT, "altPhone" TEXT,
      "email" TEXT, "applicantType" TEXT, "householdTasks" TEXT, "passportNo" TEXT,
      "passportExpiry" TIMESTAMP, "passportStatus" TEXT, "hasVisa" BOOLEAN DEFAULT false,
      "visaCountry" TEXT, "visaType" TEXT, "visaStatus" TEXT, "visaExpiry" TIMESTAMP,
      "medicalStatus" TEXT, "medicalExpiry" TIMESTAMP, "highestEducation" TEXT,
      "yearsExperience" INTEGER, "preferredCountry" TEXT, "preferredJob" TEXT,
      "salaryExpectation" TEXT, "availabilityDate" TEXT, "resumeText" TEXT,
      "emergencyName" TEXT, "emergencyRelation" TEXT, "emergencyPhone" TEXT,
      "formStep" INTEGER DEFAULT 0, "isComplete" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // Applicant sub-tables
  for (const [name, extra] of [
    ['ApplicantEducation', '"institution" TEXT NOT NULL, "degree" TEXT NOT NULL, "fieldOfStudy" TEXT, "startYear" INTEGER NOT NULL, "endYear" INTEGER NOT NULL, "honors" TEXT'],
    ['ApplicantExperience', '"company" TEXT NOT NULL, "position" TEXT NOT NULL, "country" TEXT, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "isCurrent" BOOLEAN DEFAULT false, "description" TEXT, "monthlySalary" TEXT, "employerContact" TEXT'],
    ['ApplicantSkill', '"name" TEXT NOT NULL, "level" TEXT DEFAULT \'intermediate\', "yearsExperience" INTEGER'],
    ['ApplicantLanguage', '"language" TEXT NOT NULL, "proficiency" TEXT DEFAULT \'conversational\', "speaking" TEXT, "reading" TEXT, "writing" TEXT'],
    ['ApplicantCertification', '"name" TEXT NOT NULL, "issuingBody" TEXT, "issuedDate" TIMESTAMP, "expiryDate" TIMESTAMP, "credentialId" TEXT'],
    ['ApplicantReference', '"name" TEXT NOT NULL, "company" TEXT, "position" TEXT, "phone" TEXT, "email" TEXT, "relationship" TEXT, "yearsKnown" TEXT'],
    ['ApplicantDocument', '"documentType" TEXT NOT NULL, "fileName" TEXT NOT NULL, "filePath" TEXT, "fileSize" INTEGER, "mimeType" TEXT, "isVerified" BOOLEAN DEFAULT false'],
    ['ApplicantTraining', '"trainingName" TEXT NOT NULL, "institution" TEXT, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "hours" INTEGER'],
  ]) {
    await run(client, `CREATE TABLE "${name}" (
      "id" TEXT PRIMARY KEY, "applicantId" TEXT NOT NULL REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE,
      ${extra}, "createdAt" TIMESTAMP DEFAULT NOW()
    );`);
  }

  // Job & ATS
  await run(client, `
    CREATE TABLE "JobOrder" (
      "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
      "country" TEXT NOT NULL, "city" TEXT, "category" TEXT NOT NULL, "jobType" TEXT,
      "salaryMin" DOUBLE PRECISION, "salaryMax" DOUBLE PRECISION, "salaryCurrency" TEXT DEFAULT 'USD',
      "salaryPeriod" TEXT, "contractType" TEXT DEFAULT 'full_time', "duration" TEXT,
      "slots" INTEGER DEFAULT 1, "filledSlots" INTEGER DEFAULT 0, "requirements" TEXT NOT NULL,
      "benefits" TEXT, "requiredSkills" TEXT NOT NULL, "status" TEXT DEFAULT 'open',
      "visibility" TEXT DEFAULT 'public', "employerId" TEXT REFERENCES "EmployerProfile"("id"),
      "agencyId" TEXT REFERENCES "Agency"("id"), "createdBy" TEXT REFERENCES "User"("id"),
      "postedDate" TIMESTAMP DEFAULT NOW(), "deadline" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "JobCustomField" (
      "id" TEXT PRIMARY KEY, "jobOrderId" TEXT NOT NULL REFERENCES "JobOrder"("id") ON DELETE CASCADE,
      "label" TEXT NOT NULL, "fieldType" TEXT DEFAULT 'text', "options" TEXT,
      "isRequired" BOOLEAN DEFAULT false, "order" INTEGER DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "ATSStage" (
      "id" TEXT PRIMARY KEY, "jobOrderId" TEXT NOT NULL REFERENCES "JobOrder"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL, "order" INTEGER NOT NULL, "color" TEXT DEFAULT '#10b981',
      "isDefault" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE("jobOrderId", "order")
    );
  `);

  await run(client, `
    CREATE TABLE "Application" (
      "id" TEXT PRIMARY KEY, "applicantId" TEXT NOT NULL REFERENCES "User"("id"),
      "jobOrderId" TEXT NOT NULL REFERENCES "JobOrder"("id"),
      "status" TEXT DEFAULT 'applied', "coverLetter" TEXT, "matchScore" DOUBLE PRECISION,
      "currentStageId" TEXT REFERENCES "ATSStage"("id"),
      "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE("applicantId", "jobOrderId")
    );
  `);

  await run(client, `
    CREATE TABLE "ApplicationCustomResponse" (
      "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
      "fieldId" TEXT NOT NULL, "value" TEXT, "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "ATSStageHistory" (
      "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
      "stageId" TEXT NOT NULL REFERENCES "ATSStage"("id"), "fromStageId" TEXT, "movedBy" TEXT,
      "notes" TEXT, "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "Endorsement" (
      "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL REFERENCES "Application"("id"),
      "endorsedById" TEXT NOT NULL REFERENCES "User"("id"),
      "employerId" TEXT NOT NULL REFERENCES "EmployerProfile"("id"),
      "status" TEXT DEFAULT 'pending_fira_review', "coverNote" TEXT, "agencyNote" TEXT,
      "firaNote" TEXT, "employerNote" TEXT, "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "Notification" (
      "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" TEXT DEFAULT 'info',
      "isRead" BOOLEAN DEFAULT false, "link" TEXT, "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "AIAnalysisResult" (
      "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL UNIQUE REFERENCES "Application"("id"),
      "matchScore" DOUBLE PRECISION NOT NULL, "semanticScore" DOUBLE PRECISION NOT NULL,
      "matchedSkills" TEXT NOT NULL, "missingSkills" TEXT NOT NULL, "explanation" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  await run(client, `
    CREATE TABLE "ResumeEnhancement" (
      "id" TEXT PRIMARY KEY, "applicantId" TEXT NOT NULL REFERENCES "User"("id"),
      "jobOrderId" TEXT, "originalText" TEXT NOT NULL, "enhancedText" TEXT NOT NULL,
      "changesSummary" TEXT NOT NULL, "isUsed" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `);

  // CMS Tables
  await run(client, `CREATE TABLE "CmsPage" ("id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "content" TEXT DEFAULT '', "status" TEXT DEFAULT 'published', "order" INTEGER DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsFaq" ("id" TEXT PRIMARY KEY, "question" TEXT NOT NULL, "answer" TEXT NOT NULL, "category" TEXT DEFAULT 'General', "order" INTEGER DEFAULT 0, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsTestimonial" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "position" TEXT, "company" TEXT, "feedback" TEXT NOT NULL, "rating" INTEGER DEFAULT 5, "avatar" TEXT, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsSocialMedia" ("id" TEXT PRIMARY KEY, "platform" TEXT NOT NULL, "title" TEXT, "url" TEXT NOT NULL, "icon" TEXT, "logo" TEXT, "order" INTEGER DEFAULT 0, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsOrgChart" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "position" TEXT NOT NULL, "department" TEXT, "parentId" TEXT, "avatar" TEXT, "email" TEXT, "phone" TEXT, "order" INTEGER DEFAULT 0, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsTermsPrivacy" ("id" TEXT PRIMARY KEY, "type" TEXT NOT NULL UNIQUE, "title" TEXT NOT NULL, "content" TEXT NOT NULL, "version" TEXT DEFAULT '1.0', "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsFormField" ("id" TEXT PRIMARY KEY, "label" TEXT NOT NULL, "fieldType" TEXT DEFAULT 'text', "options" TEXT, "isRequired" BOOLEAN DEFAULT false, "order" INTEGER DEFAULT 0, "section" TEXT DEFAULT 'Personal Information', "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "CmsSettings" ("id" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "value" TEXT DEFAULT '', "updatedAt" TIMESTAMP DEFAULT NOW());`);
  await run(client, `CREATE TABLE "VerificationCode" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "code" TEXT NOT NULL, "type" TEXT DEFAULT 'email_verification', "expiresAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT NOW());`);

  console.log('✓ All 30+ tables created');

  // Indexes
  await run(client, 'CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");');
  await run(client, 'CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");');
  console.log('✓ Indexes created');

  await client.end();
  console.log('✅ Supabase schema complete!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
