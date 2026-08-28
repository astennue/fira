-- =============================================
-- FIRA Supabase Migration: uploadedAt + 3 new tables
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Add missing 'uploadedAt' column to ApplicantDocument
DO $$ BEGIN
  ALTER TABLE "ApplicantDocument" ADD COLUMN "uploadedAt" TIMESTAMP DEFAULT NOW();
  EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'uploadedAt already exists, skipping';
END $$;

-- 2. Create ContactSubmission table (for Contact Us form)
CREATE TABLE IF NOT EXISTS "ContactSubmission" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Create NewsletterSubscription table
CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 4. Create PartnerInquiry table (for employer/agency partnership form)
CREATE TABLE IF NOT EXISTS "PartnerInquiry" (
  "id" TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "country" TEXT,
  "industry" TEXT,
  "workerCount" TEXT,
  "message" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Verify
SELECT 'ApplicantDocument.uploadedAt' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ApplicantDocument' AND column_name = 'uploadedAt'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'ContactSubmission' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'ContactSubmission'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'NewsletterSubscription' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'NewsletterSubscription'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'PartnerInquiry' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'PartnerInquiry'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
