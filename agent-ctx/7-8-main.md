# Agent: Main — Tasks 7 & 8

## Task 7: Flexible Applicant Status

### Files Modified
- `src/components/dashboard/applicant-applications-page.tsx`

### Changes
- Imported `getStatusLabel`, `getStatusColor`, `getNextStatuses` from `@/lib/status`
- Removed inline `statusColor()` function
- Status badges now use `getStatusColor(app.status)` for Tailwind classes and `getStatusLabel(app.status, isFil)` for bilingual labels
- Added `useMutation` + `useQueryClient` for PATCH `/api/applications` status updates
- Added `Select` dropdown per application showing only valid next statuses via `getNextStatuses(app.status, user.role)`
- For applicant role, only 'withdrawn' appears (per the status system's allowedBy config)
- Bilingual toast notifications on success/error via sonner
- Query invalidation on success to refresh list

## Task 8: Real Data — FIRA Applicant Detail Page

### Files Created
- `src/components/dashboard/fira-applicant-detail-page.tsx`

### Files Modified
- `src/app/page.tsx` (lazy import + stub replacement)

### Detail Page Features
- Fetches profile via `GET /api/applicant-profile?userId=XX`
- Fetches applications via `GET /api/applications?applicantId=XX`
- Sections: Header, Personal Info, Address & Contact, Passport & Visa, Emergency Contact, Education, Experience, Skills, Languages, Certifications, Trainings, Documents, Applications Table
- Applications table has per-row status change Select for FIRA roles
- Skeleton loading state
- Fully bilingual (isFil)
- Back button to fira-applicants

### Dashboard Verification
- `fira-dashboard.tsx` verified: all 6 stats derive from real API data (users, jobs, endorsements, agencies APIs)
- No hardcoded/placeholder numbers found

### Lint
- All new/modified files pass lint
- Pre-existing errors in prisma/*.js and auth-modal.tsx remain unchanged
