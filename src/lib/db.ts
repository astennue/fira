import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Fail fast with an actionable message when DATABASE_URL is missing or
 * mismatches the Prisma provider (e.g. postgres client + sqlite URL).
 * This turns cryptic "Internal server error" logins into diagnosable errors.
 */
function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '[FIRA/db] DATABASE_URL is not set. Copy .env.example to .env (local) ' +
        'or configure it in your hosting provider (Vercel → Settings → Environment Variables).'
    )
  }
  // schema.prisma provider = postgresql (Supabase prod parity)
  if (url.startsWith('file:')) {
    throw new Error(
      '[FIRA/db] DATABASE_URL points to a SQLite file but prisma/schema.prisma uses the "postgresql" provider. ' +
        'For offline SQLite dev run: npm run db:dev:switch && npm run db:dev:setup. ' +
        'Otherwise set DATABASE_URL to your Supabase pooled connection string.'
    )
  }
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error(
      '[FIRA/db] DATABASE_URL protocol does not match the Prisma provider ' +
        '(expected postgresql:// for Supabase Postgres). Got: ' +
        url.split(':')[0] + ':// — check your .env or hosting env vars.'
    )
  }
}

assertDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
