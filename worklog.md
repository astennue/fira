---
Task ID: 1
Agent: Main
Task: Functional audit, bug fixes, and accessibility improvements for FIRA

Work Log:
- Fixed CSS @import order for OpenDyslexic font (was after Tailwind output causing 500)
- Fixed accessibility-toolbar.tsx: missing store destructuring (dyslexiaFont, fontSize, etc. undefined)
- Fixed accessibility-toolbar.tsx: moved AccessSlider component outside parent to prevent re-creation
- Added font-size application to document.body in accessibility useEffect
- Removed unused eslint-disable directive from accessibility-toolbar.tsx
- Fixed applications API 500 error (invalid select+include mix on applicant relation)
- Fixed job-detail-page.tsx: wrong API param (search= instead of /jobs/[id] route)
- Fixed job-detail-page.tsx: Apply button had no onClick handler (added useMutation + toast)
- Added 'staff' to UserRole type, getDashboardView, getNavItems, roleDisplayNames
- Added 6 missing ViewRenderer cases (agency-members, applicant-profile-edit, fira-applicant-detail, fira-job-create, agency-job-create, employer-candidate-detail) with placeholder components
- Fixed ATS pipeline: isFira check now includes 'staff' and 'international_agency' roles
- Fixed Filipino label for Settings ('Settings' → 'Mga Setting')
- Fixed roleDisplayNames crash protection with optional chaining
- Removed 11 unused imports/variables across 7 files
- Verified all 5 test accounts login successfully (admin, staff, applicant, agency, employer)
- Verified all API endpoints return correct status codes (16/16 tested)

Stage Summary:
- 17 bugs fixed (4 critical, 2 logic, 11 unused imports)
- Accessibility toolbar fully functional with OpenDyslexic font, text size, line height, letter spacing, dyslexia font, reading ruler, text-to-speech, large cursors, reduce animations, high contrast, inverted contrast, color overlays
- All APIs verified working via curl
- Pushed to GitHub under astennue/fira
