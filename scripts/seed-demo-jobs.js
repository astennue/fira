/**
 * FIRA demo job seeder — creates 2 demo jobs in PROD to demonstrate the
 * new Employer→FIRA approval workflow:
 *   1. PENDING job (employer-endorsed)  → appears in staff "Pending Approvals"
 *   2. APPROVED + PUBLIC job            → appears on the public jobs board
 * Idempotent: skips if a job with the same demo title already exists.
 */
// Resolve @prisma/client from the FIRA project (not the sandbox root,
// which ships its own SQLite-based Prisma client).
const { createRequire } = require('module')
const projectRequire = createRequire('/home/z/my-project/download/gdrive_workspace/extracted/package.json')
const { PrismaClient } = projectRequire('@prisma/client')
const db = new PrismaClient()

const DEFAULT_STAGES = [
  'New Application', 'Document Review', 'Initial Screening', 'Interview Scheduled',
  'Interview Completed', 'Skills Assessment', 'Background Check', 'Medical Examination',
  'Government Processing', 'Pre-Departure Orientation', 'Contract Signing',
  'Deployment', 'Arrival Confirmed', 'Completed',
]

async function findUser(email) {
  return db.user.findUnique({ where: { email } })
}

async function createJob(data) {
  const job = await db.jobOrder.create({ data })
  const stages = DEFAULT_STAGES.map((name, index) => ({
    jobOrderId: job.id, name, order: index + 1, isDefault: true,
  }))
  await db.aTSStage.createMany({ data: stages })
  return job
}

;(async () => {
  const employer = await findUser('employer@fira.com.ph')
  const staff = await findUser('staff@fira.com.ph')
  if (!employer || !staff) {
    console.error('Demo accounts not found in prod — aborting.')
    process.exit(1)
  }
  const employerProfile = await db.employerProfile.findUnique({ where: { userId: employer.id } })

  // ── 1. Pending: employer-endorsed job order awaiting FIRA approval ──
  const pendingTitle = 'Domestic Helper — Riyadh (DEMO endorsement)'
  const existingPending = await db.jobOrder.findFirst({ where: { title: pendingTitle } })
  if (!existingPending) {
    const job = await createJob({
      title: pendingTitle,
      description:
        'DEMO job order endorsed by the employer through the new Employer → FIRA approval workflow. ' +
        'Responsible for household cleaning, laundry, ironing, and meal preparation. ' +
        'Private room provided. Day off once a week. Contract duration of 2 years, renewable.',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      category: 'Domestic Helper',
      jobType: 'Full Time',
      contractType: 'Full Time',
      duration: '2 years',
      slots: 3,
      salaryMin: 900,
      salaryMax: 1100,
      salaryCurrency: 'USD',
      salaryPeriod: 'Monthly',
      requirements:
        'Age 23-45 years old\nAt least 2 years domestic helper experience\nWilling to work in Riyadh\nAble to communicate in basic English',
      benefits: 'Free private room, food allowance, yearly air ticket, medical insurance',
      requiredSkills: 'Housekeeping, Laundry, Cooking, Child care',
      status: 'pending',
      visibility: 'hidden',
      employerId: employerProfile?.id || null,
      createdBy: employer.id,
    })
    console.log('CREATED pending job:', job.id)
  } else {
    console.log('SKIP pending job (exists):', existingPending.id)
  }

  // ── 2. Approved + public: live job on the public board ──
  const publicTitle = 'Caregiver — Casablanca (DEMO approved)'
  const existingPublic = await db.jobOrder.findFirst({ where: { title: publicTitle } })
  if (!existingPublic) {
    const job = await createJob({
      title: publicTitle,
      description:
        'DEMO approved job order published to the public board. ' +
        'Provide care for elderly clients: mobility support, medication reminders, companionship, and light housekeeping. ' +
        'Friendly household, private room, competitive package. 2-year contract.',
      country: 'Morocco',
      city: 'Casablanca',
      category: 'Caregiver',
      jobType: 'Full Time',
      contractType: 'Full Time',
      duration: '2 years',
      slots: 2,
      salaryMin: 800,
      salaryMax: 1000,
      salaryCurrency: 'USD',
      salaryPeriod: 'Monthly',
      requirements:
        'Caregiver NCII or equivalent training\nAt least 1 year caregiving experience\nPatient and compassionate\nBasic English communication',
      benefits: 'Free lodging, food, health insurance, paid vacation leave',
      requiredSkills: 'Elderly care, First aid, Meal preparation, Light housekeeping',
      status: 'approved',
      visibility: 'public',
      createdBy: staff.id,
    })
    console.log('CREATED approved/public job:', job.id)
  } else {
    console.log('SKIP public job (exists):', existingPublic.id)
  }

  const total = await db.jobOrder.count()
  const pending = await db.jobOrder.count({ where: { status: 'pending' } })
  console.log(`DONE — prod jobs now: ${total} total, ${pending} pending approval`)
  await db.$disconnect()
})().catch((e) => {
  console.error('SEED ERROR:', e.message)
  process.exit(1)
})
