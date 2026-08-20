# Task 4b - i18n-landing-shared

## Summary
Fixed broken i18n translations across 12 files in landing, shared, and dashboard components.

## Key Findings
- **Two L() conventions exist**: `L(fil, en)` in landing pages vs `L(en, fil)` in shared/dashboard pages
- `super-admin-users-page.tsx` was already fully translated — no changes needed
- `app-nav.tsx` was already fully translated — no changes needed

## Files Modified (12 total)
1. `src/components/landing/landing-page.tsx` — 7 fixes (swapped args, service desc, footer)
2. `src/components/landing/job-listing-page.tsx` — 2 fixes (slots, Competitive)
3. `src/components/landing/contact-page.tsx` — 6 fixes (badge, heading, paragraph, placeholders, Sent!)
4. `src/components/landing/employer-partnership-page.tsx` — 5 fixes (badges, contact cards)
5. `src/components/landing/about-page.tsx` — 1 fix (badge)
6. `src/components/landing/services-page.tsx` — 1 fix (badge)
7. `src/components/landing/faq-page.tsx` — 1 fix (badge)
8. `src/components/landing/terms-public-page.tsx` — 1 fix (badge)
9. `src/components/shared/user-settings-page.tsx` — 2 fixes (Settings, Profile Picture)
10. `src/components/dashboard/employer-jobs-page.tsx` — 1 fix (applicants)
11. `src/components/dashboard/employer-endorsed-page.tsx` — 3 fixes (Passport, Medical, Decline)
12. `src/components/dashboard/fira-employers-page.tsx` — 1 fix (Approved)
13. `src/components/dashboard/employer-dashboard.tsx` — 1 fix (Decline)

## Files Verified (no changes needed)
- `src/components/shared/super-admin-users-page.tsx` — already fully translated
- `src/components/shared/app-nav.tsx` — already fully translated

## Lint
No new errors introduced. All 5 pre-existing errors remain (prisma files + auth-modal).