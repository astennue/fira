const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const URL = 'postgresql://postgres.vilqiivxemphmjhjiydw:%3FG2%25GAYAhGG%2FfTh@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function run(client, sql, params=[]) {
  const res = await client.query(sql, params);
  return res;
}

async function main() {
  const client = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✓ Connected');

  // Clear existing data
  const tables = ['VerificationCode','CmsSettings','CmsFormField','CmsTermsPrivacy','CmsOrgChart','CmsSocialMedia','CmsTestimonial','CmsFaq','CmsPage','ResumeEnhancement','AIAnalysisResult','Notification','Endorsement','ATSStageHistory','ApplicationCustomResponse','Application','ATSStage','JobCustomField','JobOrder','ApplicantTraining','ApplicantDocument','ApplicantReference','ApplicantCertification','ApplicantLanguage','ApplicantSkill','ApplicantExperience','ApplicantEducation','ApplicantProfile','EmployerProfile','AgencyMember','Agency','"User"'];
  for (const t of tables) {
    try { await client.query(`DELETE FROM ${t}`); } catch(e) {}
  }
  console.log('✓ Cleared data');

  // Create IDs using crypto
  const crypto = require('crypto');
  const id = () => crypto.randomUUID();

  // Users
  const hash = (p) => bcrypt.hashSync(p, 12);
  const users = {};
  const userIds = [
    { id: id(), email: 'admin@fira.com.ph', password: hash('admin2025!'), name: 'FIRA Super Admin', role: 'super_admin', phone: '+212 662 261 499', isActive: true, isApproved: true },
    { id: id(), email: 'staff@fira.com.ph', password: hash('staff2025!'), name: 'FIRA Staff Member', role: 'staff', phone: '+212 662 260 805', isActive: true, isApproved: true },
    { id: id(), email: 'applicant@fira.com.ph', password: hash('applicant2025!'), name: 'Maria Santos', role: 'applicant', phone: '+63 917 123 4567', isActive: true, isApproved: true },
    { id: id(), email: 'agency@fira.com.ph', password: hash('agency2025!'), name: 'Manila Recruitment Corp', role: 'local_agency', phone: '+63 2 8888 5678', isActive: true, isApproved: true },
    { id: id(), email: 'employer@fira.com.ph', password: hash('employer2025!'), name: 'Al Baraka Holding', role: 'employer', phone: '+212 662 260 336', isActive: true, isApproved: true },
  ];

  for (const u of userIds) {
    users[u.email] = u.id;
    await run(client, `INSERT INTO "User" ("id","email","password","name","role","phone","isActive","isApproved","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`, [u.id, u.email, u.password, u.name, u.role, u.phone, u.isActive, u.isApproved]);
  }
  console.log('✓ Users created');

  // Agency
  const agencyId = id();
  await run(client, `INSERT INTO "Agency" VALUES ($1,'Manila Recruitment Corp','local','123 Ayala Ave, Makati City','Makati','Philippines','POEA-LB-2024-001','+63 2 8888 5678','info@manilarecruit.ph',NULL,true,true,NOW(),NOW())`, [agencyId]);
  await run(client, `INSERT INTO "AgencyMember" VALUES ($1,$2,$3,'admin',NOW())`, [id(), users['agency@fira.com.ph'], agencyId]);

  // Employer Profile
  const empId = id();
  await run(client, `INSERT INTO "EmployerProfile" VALUES ($1,$2,'Al Baraka Holding','Casablanca, Morocco','Morocco','Household Services','Ahmed Bennani','ahmed@albaraka.ma','+212 662 260 336','https://albaraka.ma',NOW(),NOW())`, [empId, users['employer@fira.com.ph']]);

  // Applicant Profile
  await run(client, `INSERT INTO "ApplicantProfile" VALUES ($1,$2,'Maria','Garcia','Santos',NULL,'Female',NULL,'Filipino','Single',NULL,'456 Rizal St, Quezon City','Quezon City','Metro Manila','NCR',NULL,'+63 917 123 4567',NULL,'domestic_helper',NULL,NULL,'valid',false,NULL,NULL,NULL,NULL,'college_vocational',3,'Morocco','Household Service Worker',NULL,NULL,'PN1234567','passed',3,true,NOW(),NOW())`, [id(), users['applicant@fira.com.ph']]);

  // Jobs
  const jobs = [];
  const jobData = [
    { title: 'Household Service Worker / Nanny', desc: 'Looking for experienced Filipino household service workers to work in Morocco.', country: 'Morocco', city: 'Casablanca', cat: 'domestic_helper', type: 'domestic_helper', salMin: 400, salMax: 600, slots: 10, req: 'At least 2 years experience. Can cook, clean, and take care of children.', ben: 'Free housing, free food, round-trip airfare, medical insurance', skills: 'Household management, Cooking, Child care, Cleaning' },
    { title: 'Caregiver for Elderly Care', desc: 'Seeking compassionate Filipino caregivers for elderly patients in Morocco.', country: 'Morocco', city: 'Rabat', cat: 'caregiver', type: 'domestic_helper', salMin: 500, salMax: 700, slots: 5, req: 'Certificate in caregiving. At least 1 year experience.', ben: 'Free housing, free food, medical insurance, overtime pay', skills: 'Elderly care, First aid, Patient care' },
    { title: 'Professional Nurse - Hospital', desc: 'Hiring licensed Filipino nurses for a major hospital in Morocco.', country: 'Morocco', city: 'Casablanca', cat: 'nurse', type: 'skills_professional', salMin: 1200, salMax: 1800, slots: 15, req: 'BSN degree, valid PRC license, at least 2 years hospital experience.', ben: 'Free housing, medical insurance, relocation allowance, paid vacations', skills: 'Patient assessment, IV therapy, Medication administration' },
    { title: 'Factory Worker - Electronics Assembly', desc: 'Looking for skilled Filipino workers for electronics manufacturing.', country: 'Morocco', city: 'Tangier', cat: 'factory', type: 'skills_professional', salMin: 600, salMax: 900, slots: 20, req: 'At least high school graduate. Experience in electronics assembly preferred.', ben: 'Free housing, transportation, medical insurance, performance bonus', skills: 'Electronics assembly, Quality control' },
    { title: 'Hotel Staff - Hospitality', desc: 'Hiring experienced Filipino hospitality workers for a luxury hotel chain.', country: 'Morocco', city: 'Marrakech', cat: 'hospitality', type: 'skills_professional', salMin: 700, salMax: 1000, slots: 8, req: 'Experience in hotel or restaurant service.', ben: 'Free housing, meals, uniform, medical insurance, tips', skills: 'Customer service, Housekeeping, Food service' },
  ];

  for (const j of jobData) {
    const jId = id();
    await run(client, `INSERT INTO "JobOrder" ("id","title","description","country","city","category","jobType","salaryMin","salaryMax","salaryCurrency","salaryPeriod","contractType","slots","requirements","benefits","requiredSkills","status","visibility","employerId","agencyId","createdBy","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'USD','monthly','full_time',$10,$11,$12,$13,'open','public',$14,$15,$16,NOW(),NOW())`,
      [jId, j.title, j.desc, j.country, j.city, j.cat, j.type, j.salMin, j.salMax, j.slots, j.req, j.ben, j.skills, empId, agencyId, users['admin@fira.com.ph']]);
    jobs.push(jId);
  }
  console.log('✓ Jobs created');

  // ATS Stages for each job
  for (const jId of jobs) {
    const stages = [{n:'Applied',o:0,c:'#3b82f6'},{n:'Screening',o:1,c:'#f59e0b'},{n:'Interview',o:2,c:'#8b5cf6'},{n:'Assessment',o:3,c:'#ec4899'},{n:'Offer',o:4,c:'#10b981'},{n:'Deployed',o:5,c:'#06b6d4'}];
    for (const s of stages) {
      await run(client, `INSERT INTO "ATSStage" VALUES ($1,$2,$3,$4,$5,true,NOW())`, [id(), jId, s.n, s.o, s.c]);
    }
  }

  // Application
  const appId = id();
  await run(client, `INSERT INTO "Application" VALUES ($1,$2,$3,'applied','I am a hardworking household worker with 3 years experience.',NULL,NULL,NOW(),NOW())`, [appId, users['applicant@fira.com.ph'], jobs[0]]);

  // FAQs
  const faqs = [
    ['What services does FIRA provide?','FIRA provides comprehensive overseas recruitment services including job matching, document processing, skills assessment, pre-departure orientation, and post-deployment monitoring.','General'],
    ['How do I apply for a job?','Register an account, complete your profile, browse available job openings, and submit your application.','Application Process'],
    ['What are the requirements?','Valid Philippine passport, at least 2 years relevant work experience, educational certificates, NBI clearance, and medical certificate.','Requirements'],
    ['Is there any placement fee?','FIRA follows Philippine government regulations. We do not charge illegal fees. Any processing fees are transparent.','Fees'],
    ['How long does the process take?','The recruitment process typically takes 2-6 months depending on the job category and employer requirements.','Application Process'],
    ['What support after deployment?','Regular check-ins, employer concern assistance, 24/7 hotline, repatriation assistance, and reintegration programs.','Support'],
  ];
  for (let i = 0; i < faqs.length; i++) {
    await run(client, `INSERT INTO "CmsFaq" VALUES ($1,$2,$3,$4,$5,true,NOW(),NOW())`, [id(), faqs[i][0], faqs[i][1], faqs[i][2], i]);
  }

  // Testimonials
  const testimonials = [
    ['Rosa Mendoza','Household Service Worker','Deployed to Morocco','FIRA helped me find a good employer in Morocco. The process was smooth and transparent.',5],
    ['Juan Dela Cruz','Caregiver','Deployed to Morocco','The team at FIRA was very supportive from application to deployment. I highly recommend FIRA.',5],
    ['Carmen Reyes','Nurse','Deployed to Morocco','As a nurse, FIRA matched me with a great hospital. The salary and benefits are excellent.',5],
    ['Pedro Santos','Factory Worker','Deployed to Morocco','FIRA made the recruitment process easy and stress-free. Professional service.',4],
    ['Ana Flores','Hotel Staff','Deployed to Morocco','I am very happy with my deployment through FIRA. They truly care about workers.',5],
  ];
  for (const t of testimonials) {
    await run(client, `INSERT INTO "CmsTestimonial" VALUES ($1,$2,$3,$4,$5,$6,true,NOW(),NOW())`, [id(), ...t]);
  }

  // Social Media
  const socials = [
    ['facebook','Facebook','https://facebook.com/filinternational'],
    ['instagram','Instagram','https://instagram.com/filinternational'],
    ['whatsapp','WhatsApp','https://wa.me/212662261499'],
    ['twitter','Twitter','https://twitter.com/filinternational'],
    ['linkedin','LinkedIn','https://linkedin.com/company/filinternational'],
    ['tiktok','TikTok','https://tiktok.com/@filinternational'],
    ['youtube','YouTube','https://youtube.com/@filinternational'],
  ];
  for (let i = 0; i < socials.length; i++) {
    await run(client, `INSERT INTO "CmsSocialMedia" VALUES ($1,$2,$3,$4,true,NOW(),NOW())`, [id(), socials[i][0], socials[i][1], socials[i][2]]);
  }

  // Terms & Privacy
  await run(client, `INSERT INTO "CmsTermsPrivacy" VALUES ($1,'terms_of_service','Terms of Service','TERMS OF SERVICE\n\n1. By using FIRA, you agree to these terms.\n2. Must be 18+ to use the platform.\n3. Provide accurate information.\n4. All fees are transparent.\n5. Governed by Philippine law.\n\nContact: manpower@filinternational.ma','1.0',true,NOW(),NOW())`, [id()]);
  await run(client, `INSERT INTO "CmsTermsPrivacy" VALUES ($1,'data_privacy_consent','Data Privacy Consent','DATA PRIVACY CONSENT\n\nFIRA protects your data per RA 10173.\n\n1. Data: name, contact, education, work experience, IDs.\n2. Purpose: Job matching, deployment processing.\n3. Sharing: employers (with consent), government agencies.\n4. Security: Appropriate measures.\n5. Rights: Access, correction, deletion.\n\nContact: manpower@filinternational.ma','1.0',true,NOW(),NOW())`, [id()]);

  // CMS Settings
  const settings = [
    ['site_name','FIRA - Fil International Recruitment Agency'],
    ['site_tagline','We Recruit. We Deploy. We Monitor. We Deliver Results.'],
    ['site_address','59 Boulevard Zerktouni, Residence Les Fleurs, 6ème Etage Appt 19, 20360 Casablanca, Morocco'],
    ['site_phone_1','+212 6 62 26 14 99'],
    ['site_phone_2','+212 6 62 26 08 05'],
    ['site_email','manpower@filinternational.ma'],
  ];
  for (const [k,v] of settings) {
    await run(client, `INSERT INTO "CmsSettings" VALUES ($1,$2,NOW())`, [id(), k, v]);
  }

  // Notifications
  await run(client, `INSERT INTO "Notification" VALUES ($1,$2,'Welcome to FIRA!','Complete your profile to increase your chances of getting hired.','info',false,NULL,NOW())`, [id(), users['applicant@fira.com.ph']]);
  await run(client, `INSERT INTO "Notification" VALUES ($1,$2,'New Applications Received','You have 1 new application to review.','info',false,NULL,NOW())`, [id(), users['admin@fira.com.ph']]);

  await client.end();
  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 TEST ACCOUNTS:');
  console.log('   Super Admin: admin@fira.com.ph / admin2025!');
  console.log('   Staff:       staff@fira.com.ph / staff2025!');
  console.log('   Applicant:   applicant@fira.com.ph / applicant2025!');
  console.log('   Agency:      agency@fira.com.ph / agency2025!');
  console.log('   Employer:    employer@fira.com.ph / employer2025!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
