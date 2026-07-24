import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase Pooler connection (port 6543 - Supavisor mode)
// pgbouncer=true disables prepared statements required for transaction-mode poolers
const SUPABASE_URL = 'postgresql://postgres.vilqiivxemphmjhjiydw:%3FG2%25GAYAhGG%2FfTh@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: SUPABASE_URL,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
