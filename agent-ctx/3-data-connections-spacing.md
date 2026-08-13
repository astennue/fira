# Task 3 — Data Connections Audit & Spacing Fixes

## Files Modified

### API Routes (data connection fixes)
- `src/app/api/users/route.ts` — expanded allowed roles
- `src/app/api/endorsements/route.ts` — added role-based auto-filtering
- `src/app/api/jobs/route.ts` — added employer-specific job filtering
- `src/lib/auth.ts` — exported AuthResult interface

### Dashboard Pages (unused imports + spacing)
- `src/components/dashboard/fira-applicants-page.tsx`
- `src/components/dashboard/fira-jobs-page.tsx`
- `src/components/dashboard/agency-applicants-page.tsx`
- `src/components/dashboard/agency-endorsements-page.tsx`
- `src/components/dashboard/employer-endorsed-page.tsx`
- `src/components/dashboard/employer-jobs-page.tsx`
- `src/components/dashboard/applicant-applications-page.tsx`
- `src/components/dashboard/applicant-jobs-page.tsx`

## Key Decisions

1. **Endorsements auto-filtering done server-side** — more secure than passing IDs from frontend
2. **Employer jobs filtered by `employer.userId`** — joins through the EmployerProfile relation
3. **Kept `fira-applicant-detail` navigation** in agency page — `agency-applicant-detail` doesn't exist as a view; the fira version at least shows a Coming Soon placeholder
4. **Spacing standardized to p-6 for CardContent** — consistent with design system requirements
