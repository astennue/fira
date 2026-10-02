import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Fail fast with an actionable message when DATABASE_URL is missing or
 * mismatches the Prisma provider (e.g. postgres client + sqlite URL).
 * This turns cryptic "Internal server error" logins into diagnosable errors.
 * Provider-aware: reads the active prisma/schema.prisma datasource provider.
 */
function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '[FIRA/db] DATABASE_URL is not set. Copy .env.example to .env (local) ' +
        'or configure it in your hosting provider (Vercel → Settings → Environment Variables).'
    )
  }

  // Detect the active provider from the GENERATED client (source of truth at runtime),
  // falling back to prisma/schema.prisma (source of truth at generate time).
  let provider = 'postgresql'
  const candidates = [
    path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'schema.prisma'),
    path.join(process.cwd(), 'prisma', 'schema.prisma'),
  ]
  for (const p of candidates) {
    try {
      const schema = fs.readFileSync(p, 'utf8')
      const m = schema.match(/datasource\s+db\s*{[^}]*?provider\s*=\s*"([^"]+)"/)
      if (m) { provider = m[1]; break }
    } catch {
      // try next candidate
    }
  }

  if (provider === 'sqlite') {
    if (!url.startsWith('file:')) {
      throw new Error(
        '[FIRA/db] prisma/schema.prisma uses sqlite but DATABASE_URL is not a file: URL. ' +
          'Set DATABASE_URL="file:" + path to your dev.db, or run db:prod:switch for Supabase.'
      )
    }
    return
  }

  // postgresql (Supabase prod parity)
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
