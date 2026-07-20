# FIRA System — Comprehensive Rebuild Plan

## Session: Requirements Analysis & Planning
- Date: 2025-07-15
- Task: Analyze existing FIRA repo, research reference systems (DMW, Workabroad, IPMAS), and create rebuild plan

---

## Task 2-a: Applicant Multi-Step Application Form
- Date: 2025-07-20
- Agent: Main

### Summary
Built the complete Applicant Multi-Step Application Form at `/home/z/fira/src/components/applicant/application-form/`. The form consists of 10 steps (9 visible for domestic helpers) with a wizard-style navigation, validation, and review/submit flow.

### Files Written

1. **`types.ts`** — Updated `FormData` interface to include `first_name` and `last_name` fields. Updated `createEmptyFormData()` and `profileToFormData()` accordingly.

2. **`MultiStepForm.tsx`** — Full rewrite with new props (`mode`, `initialData?`, `onSubmit`, `jobOrderId?`). Features:
   - 0-based `currentStep` state, `formData` state, `isSubmitting` state
   - Progress bar with "Step X of Y" label and clickable step dots
   - Back/Next navigation buttons; Submit button with shadcn `AlertDialog` confirmation on last step
   - Exports `StepProps` interface with `applicantType` and `goToStep` for child steps
   - Conditional step visibility (household skills hidden for non-DH applicants)

3. **`PersonalInfoStep.tsx`** — All requested fields: firstName, lastName, middleName, suffix, nickname, dateOfBirth, sex (select), civilStatus (select), placeOfBirth, heightCm, weightKg, nationality (default "Filipino"), religion, permanent address (4 fields), current address (2 fields), phone, alternativePhone. Mobile-first grid layout, large labels, red asterisks for required fields.

4. **`FamilyBackgroundStep.tsx`** — Father/Mother/Spouse fieldsets with name, occupation, contact. Children fields (number + ages). Emergency contact with name, relationship (**Select** with 7 options), phone. Required field validation markers.

5. **`EducationStep.tsx`** — Dynamic list with Add/Remove. Each entry: level (select), schoolName, degreeCourse, yearGraduated, isCompleted (checkbox). Shows validation error when no entries exist. Empty state with icon.

6. **`WorkExperienceStep.tsx`** — Dynamic list. Each entry: country, employerName, employerType (select: household/company/other), position, dateFrom, dateTo (disabled when isCurrent), isCurrent checkbox, duties (textarea), reasonForLeaving (textarea, hidden when current).

7. **`HouseholdSkillsStep.tsx`** — Imports `HOUSEHOLD_SKILL_CATEGORIES` from fira-types. Grouped checkboxes by category with proficiency selector (basic/intermediate/advanced) appearing when selected. Custom skill input at bottom with Enter key support. When `applicantType !== 'domestic_helper'`, shows redirect message and auto-advances via `goToStep`.

8. **`LanguagesStep.tsx`** — New file (renamed from `LanguageStep.tsx`). Dynamic list with `<datalist>` of 40+ common languages for autocomplete. Each entry: language input, speaking/reading/writing level selects (basic/conversational/fluent/native).

9. **`CertificationsStep.tsx`** — Dynamic list. Each: name, issuingBody, certificateNumber, dateIssued, expiryDate, file upload button (optional).

10. **`DocumentsStep.tsx`** — 11 document types from `DocumentType` union. Each shown as a card with upload button. Simulated upload with progress bar animation. Delete button for uploaded docs. Warning banner about document clarity.

11. **`ReferencesStep.tsx`** — Dynamic list. Each: name, company, position, contact (phone), relationship. Grid layout.

12. **`ReviewStep.tsx`** — Read-only summary organized by section (Personal Info, Family, Education, Work, Household Skills, Languages, Certifications, Documents, References). Each section rendered in a Card with an **Edit** button that calls `goToStep()` to navigate to the corresponding step. Household Skills section conditionally shown for domestic helpers.

13. **`ApplicationForm.tsx`** — Updated wrapper to use new `MultiStepForm` props (`mode`, `initialData`, `onSubmit`, `jobOrderId`).

### Deleted
- `steps/LanguageStep.tsx` — Replaced by `LanguagesStep.tsx`

### Design Decisions
- All components use `'use client'` directive
- `useState` and `useCallback` for controlled state management
- Mobile-first responsive layout using Tailwind `grid-cols-1 sm:grid-cols-2`
- All interactive elements use `min-h-[44px]` for touch targets
- Used shadcn `AlertDialog` directly in MultiStepForm for submit confirmation (instead of shared `WarningDialog`)
- `StepProps` interface extended with `applicantType` and `goToStep` to support household skills auto-advance and review edit navigation
- Education step validates at least one entry is required
- Personal info step validates sex, civil status, date of birth, and phone

---

## Task 2-b: Agency Module — Dashboard, Pipeline, Applicants, Members, Endorsements
- Date: 2025-07-20
- Agent: Main

### Summary
Built the complete Agency Module at `/home/z/fira/src/app/(agency)/` with 5 pages and a shared layout. All pages are `'use client'`, mobile-first with 44px touch targets, and use the Supabase browser client, `useAuth()`, `useI18n()`, shadcn/ui components, and lucide-react icons.

### Files Written

1. **`src/app/(agency)/layout.tsx`** — Agency shared layout
   - Sticky header with FIRA logo + "Agency" label, desktop nav (Dashboard, Applicants, Members, Endorsements), LanguageToggle, sign-out button
   - Mobile hamburger menu with full nav dropdown
   - Footer with copyright
   - Follows same pattern as applicant layout, max-w-5xl for wider agency content

2. **`src/app/(agency)/dashboard/page.tsx`** — Agency Dashboard
   - 4 stat cards in 2×2 / 4-col grid: Total Applicants (count from `applications` where `agency_id` matches), Active Job Orders, Pending Review (status=screening), Deployed (status=deployed)
   - Each stat card uses distinct color scheme with icon (Users, Briefcase, Clock, Plane)
   - Recent applications table (last 10) with: applicant name, job title, country, status badge (color-coded), date
   - Desktop table view + mobile card view with `md:hidden`/`hidden md:block` responsive pattern
   - 3 quick action buttons: "View All Applicants", "View Pipeline", "Manage Members" (all Link to respective routes)
   - Loading skeleton states and error handling

3. **`src/app/(agency)/pipeline/[jobOrderId]/page.tsx`** — ATS Pipeline (Kanban Board)
   - Fetches job order details and custom `ats_stages` from Supabase
   - Falls back to `DEFAULT_ATS_STAGES` from `@/lib/fira-types` if no custom stages exist
   - Horizontal scrollable Kanban board with CSS `flex overflow-x-auto`
   - Each column = one stage, color-coded header from a 19-color palette (no indigo/blue)
   - Application cards show: applicant name, match score badge (color by score tier), key skills tags, date
   - Click "Move to [Next Stage]" button on each card → opens Dialog for notes → calls Supabase to update `applications.status` and inserts into `ats_stage_history`
   - "Add Custom Stage" button opens Dialog with: stage name (en/tl), description (en/tl), mandatory toggle (Switch)
   - Back navigation with ArrowLeft button

4. **`src/app/(agency)/applicants/page.tsx`** — Applicant List
   - Search bar (by name with clear button), filter by job order (Select dropdown), filter by status (Select dropdown with all DEFAULT_ATS_STAGES + rejected/withdrawn)
   - Desktop table view with: name, applicant type badge, skills summary, stage badge, job title, actions (View, Move, Endorse, Verify Docs)
   - Mobile card view with same data in stacked layout
   - Pagination with prev/next buttons and page indicator (PAGE_SIZE=15)
   - "Endorse to FIRA" dialog: cover note textarea → inserts into `endorsements` table
   - "Verify Documents" dialog: fetches `applicant_documents` for the applicant's profile, shows list with Verify/Reject buttons per document; updates `is_verified`, `verified_by`, `verified_at`
   - "Move to Stage" dialog: Select dropdown of next available stages from DEFAULT_ATS_STAGES

5. **`src/app/(agency)/members/page.tsx`** — Team Members
   - Lists `agency_members` joined with `users` table: name, email, role badge (color-coded per AgencyMemberRole), active/inactive status
   - Desktop table + mobile card responsive layout
   - "Invite Member" button (admin-only): Dialog with email input and role Select (Agency Admin, Recruiter, Document Officer, Deployment Officer). Validates: user exists, is agency role, not already a member
   - Admin can deactivate members (with AlertDialog confirmation) and reactivate inactive members
   - Admin detection: checks if current user's member_role === 'agency_admin'

6. **`src/app/(agency)/endorsements/page.tsx`** — Endorsements
   - Lists endorsements from `endorsements` table joined with `applications`, `users`, `job_orders`, `employers`
   - Status filter dropdown (All, Pending, Viewed, Shortlisted, Accepted, Declined, Returned)
   - Summary stat cards row (count per status) when endorsements exist
   - Desktop table: applicant name, job title, endorsed to (FIRA/Employer), status badge with icon, date, decision date
   - Mobile cards: same data in stacked layout with cover note preview
   - 6 status badge configs with unique colors and icons (Clock, Eye, ArrowRight, CheckCircle, XCircle, AlertCircle)

### Design Decisions
- All pages use `'use client'` directive as specified
- Supabase browser client via `getSupabaseClient()` throughout
- `agencyId` from `useAuth()` hook for all queries
- Mobile-first responsive: `grid-cols-2 md:grid-cols-4`, `hidden md:block` / `md:hidden` patterns
- Minimum 44px touch targets on all interactive elements (`min-h-[44px]`, `min-w-[44px]`)
- Status badges color-coded with `STATUS_COLORS` map (19 ApplicationStatus values)
- Consistent use of shadcn: Card, Badge, Button, Table, Dialog, AlertDialog, Select, Input, Textarea, Switch, Skeleton
- Lucide icons throughout: Users, Briefcase, Clock, Plane, ArrowRight, Search, Eye, Send, FileCheck, ChevronLeft/Right, Plus, UserPlus, Shield/ShieldOff, etc.
- No indigo/blue primary colors used
- i18n labels used from `t.agency.*`, `t.nav.*`, `t.common.*` where available