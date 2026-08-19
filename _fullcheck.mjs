import pg from 'pg';
const { Client } = pg;
const c = new pg.Client({user:'postgres.vilqiivxemphmjhjiydw',host:'aws-0-ap-southeast-2.pooler.supabase.com',port:6543,database:'postgres',password:'TOg6AtZKRBZ8IIdv',ssl:{rejectUnauthorized:false}});
await c.connect();
console.log('✅ Connected to Supabase\n');

// 1. Check users
const users = await c.query('SELECT id, email, role, name, "isActive", "isApproved" FROM "User"');
console.log('=== USERS (' + users.rows.length + ') ===');
for (const u of users.rows) {
  console.log(' ', u.email, '| role:', u.role, '| active:', u.isActive, '| approved:', u.isApproved);
}

// 2. Check password hashes exist
const noPw = users.rows.filter(u => !u.id);
console.log('\n=== PASSWORD CHECK ===');
const pwCheck = await c.query('SELECT email, password FROM "User" WHERE password IS NULL OR password = \'\'');
if (pwCheck.rows.length > 0) {
  console.log('❌ Users with NO password:', pwCheck.rows.map(r => r.email));
} else {
  console.log('✅ All users have passwords');
}

// 3. Check FK relations exist
console.log('\n=== RELATION CHECKS ===');
const checks = [
  ['ApplicantProfile -> User', 'SELECT ap.id, u.email FROM "ApplicantProfile" ap LEFT JOIN "User" u ON ap."userId" = u.id WHERE u.id IS NULL'],
  ['EmployerProfile -> User', 'SELECT ep.id, u.email FROM "EmployerProfile" ep LEFT JOIN "User" u ON ep."userId" = u.id WHERE u.id IS NULL'],
  ['AgencyMember -> User', 'SELECT am.id, u.email FROM "AgencyMember" am LEFT JOIN "User" u ON am."userId" = u.id WHERE u.id IS NULL'],
  ['Application -> JobOrder', 'SELECT a.id FROM "Application" a LEFT JOIN "JobOrder" j ON a."jobOrderId" = j.id WHERE j.id IS NULL'],
  ['Application -> ApplicantProfile', 'SELECT a.id FROM "Application" a LEFT JOIN "ApplicantProfile" ap ON a."applicantId" = ap.id WHERE ap.id IS NULL'],
];
for (const [name, sql] of checks) {
  const r = await c.query(sql);
  console.log(r.rows.length === 0 ? '✅' : '❌ ' + r.rows.length + ' orphans', name);
}

// 4. Check ApplicantDocument uploadedAt
const adCols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='ApplicantDocument' AND column_name='uploadedAt'");
console.log('\n=== ApplicantDocument.uploadedAt ===');
console.log(adCols.rows.length ? '✅ Column exists' : '❌ Column MISSING');

// 5. Check new tables
for (const t of ['ContactSubmission', 'NewsletterSubscription', 'PartnerInquiry']) {
  const exists = await c.query("SELECT table_name FROM information_schema.tables WHERE table_name='" + t + "'");
  console.log(exists.rows.length ? '✅' : '❌', t);
}

// 6. Check duplicate User table (_User)
const dup = await c.query("SELECT table_name FROM information_schema.tables WHERE table_name='_User'");
console.log('\n=== DUPLICATE TABLE CHECK ===');
console.log(dup.rows.length ? '⚠️  _User table exists (potential issue from schema-supabase.js rename)' : '✅ No duplicate');

// 7. Check if _User has data
if (dup.rows.length) {
  const dupData = await c.query('SELECT count(*) as cnt FROM "_User"');
  console.log('   _User rows:', dupData.rows[0].cnt);
}

// 8. Check for any NOT NULL violations
console.log('\n=== CRITICAL COLUMN CHECKS ===');
const colChecks = [
  ['User.id', 'SELECT count(*) as cnt FROM "User" WHERE id IS NULL'],
  ['User.email', 'SELECT count(*) as cnt FROM "User" WHERE email IS NULL'],
  ['User.password', 'SELECT count(*) as cnt FROM "User" WHERE password IS NULL'],
  ['User.role', 'SELECT count(*) as cnt FROM "User" WHERE role IS NULL'],
];
for (const [name, sql] of colChecks) {
  const r = await c.query(sql);
  console.log(r.rows[0].cnt === 0 ? '✅' : '❌ ' + r.rows[0].cnt + ' nulls', name);
}

await c.end();
console.log('\n✅ Full check complete!');
