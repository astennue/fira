# Task 1 - Full-Stack Developer (Resume Integration)

## Files Created/Modified

### 1. `src/components/dashboard/applicant-profile-edit-page.tsx` (NEW - ~950 lines)
5-step multi-step form wizard for applicant profile editing:
- Step 1: Resume Upload & Personal Info (drag-drop, VLM parse, all personal fields, household tasks)
- Step 2: Education & Experience (add/edit/delete via Dialogs)
- Step 3: Skills, Languages & Certifications (with proficiency sub-levels)
- Step 4: Travel, Medical & Preferences (passport, visa, medical, preferences)
- Step 5: Documents, References & Trainings

### 2. `src/app/page.tsx` (MODIFIED)
- Added lazy import for ApplicantProfileEditPage
- Changed `applicant-profile-edit` case to render the new component

### 3. `src/app/api/resume/parse/route.ts` (MODIFIED)
- Replaced placeholder with VLM (z-ai-web-dev-sdk) integration
- Fetches resume data URI from DB, sends to GLM-4.6V model
- Graceful error handling if VLM fails

### 4. `src/components/dashboard/applicant-profile-page.tsx` (MODIFIED)
- Added resume section at top with highlighted card
- Added References and Trainings sections
- Enhanced Documents to show filename

## Key Decisions
- Used useState for form data (single large object) instead of form libraries for simplicity
- Generic EntryList component for all add/edit/delete list patterns
- Popover+Calendar for all date fields (consistent UX)
- Toggle buttons (Badge-based) for household tasks
- Conditional visa section (shown only when hasVisa Switch is on)
- Documents section is read-only in edit page (managed by FIRA)
- Progress stepper is clickable for easy navigation
- framer-motion AnimatePresence for step transitions
