/** Throwaway validation of approve/reject status transitions (then cleanup). */
const { createRequire } = require('module')
const req = createRequire('/home/z/my-project/download/gdrive_workspace/extracted/package.json')
const { PrismaClient } = req('@prisma/client')
const db = new PrismaClient()

;(async () => {
  const j = await db.jobOrder.create({
    data: {
      title: 'THROWAWAY approve-test', description: 'x', country: 'Test',
      category: 'Other', requirements: 'x', requiredSkills: 'x',
      status: 'pending', visibility: 'hidden',
    },
  })
  const a = await db.jobOrder.update({ where: { id: j.id }, data: { status: 'approved', visibility: 'public' } })
  console.log('approve transition OK:', a.status, '/', a.visibility)
  const r = await db.jobOrder.update({ where: { id: j.id }, data: { status: 'rejected', visibility: 'hidden' } })
  console.log('reject transition OK:', r.status, '/', r.visibility)
  await db.jobOrder.delete({ where: { id: j.id } })
  console.log('throwaway deleted')
  await db.$disconnect()
})().catch((e) => { console.error('FAIL:', e.message.slice(0, 150)); process.exit(1) })
