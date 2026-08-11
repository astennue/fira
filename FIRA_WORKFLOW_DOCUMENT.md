# FIRA — Complete System Workflow Document

> **Fil International Recruitment Agency (FIRA)** — Full System Workflow per User Role & Service
> Version 1.0 | For Review & Correction Before Implementation

---

## TABLE OF CONTENTS

1. [System Overview & Key Principles](#1-system-overview--key-principles)
2. [User Roles](#2-user-roles)
3. [Workflow per User Role](#3-workflow-per-user-role)
   - 3.1 [Applicant (Job Seeker)](#31-applicant-job-seeker)
   - 3.2 [Employer (Foreign Company)](#32-employer-foreign-company)
   - 3.3 [Local Agency (Philippine Recruitment Agency)](#33-local-agency-philippine-recruitment-agency)
   - 3.4 [FIRA Staff](#34-fira-staff)
   - 3.5 [Super Admin](#35-super-admin)
4. [Workflow per Service/Module](#4-workflow-per-servicemodule)
   - 4.1 [Job Listings](#41-job-listings)
   - 4.2 [Applications](#42-applications)
   - 4.3 [ATS Pipeline](#43-ats-pipeline)
   - 4.4 [AI Matching](#44-ai-matching)
   - 4.5 [Resume Enhancement](#45-resume-enhancement)
   - 4.6 [Endorsements](#46-endorsements)
   - 4.7 [Messaging](#47-messaging)
   - 4.8 [Employer Partnership / Accreditation](#48-employer-partnership--accreditation)
   - 4.9 [User Management](#49-user-management)
   - 4.10 [CMS Modules](#410-cms-modules)
5. [Cross-Role Workflows (End-to-End)](#5-cross-role-workflows-end-to-end)
6. [Important Business Rules](#6-important-business-rules)

---

## 1. System Overview & Key Principles

### What FIRA Is
FIRA (Fil International Recruitment Agency) is an OFW recruitment platform based in Casablanca, Morocco. It connects Filipino workers with trusted employers worldwide.

### Core Business Model
- **FIRA acts as the international agency/principal** — they are the bridge between Philippine-based local agencies and foreign employers.
- **Employers do NOT create job orders directly.** They inquire with FIRA, and **FIRA creates the job order** on the system.
- **No payment processing** is handled by the system. All financial transactions happen offline.

### Key Principle: Who Does What
| Action | Who Does It |
|--------|-------------|
| Create Job Order | **FIRA** (Super Admin / Staff) |
| Apply for Jobs | **Applicant** |
| Endorse Candidates | **Local Agency** → **FIRA reviews** → **Employer decides** |
| Approve/Reject Agencies | **FIRA** (Super Admin / Staff) |
| Approve/Reject Employers | **FIRA** (Super Admin / Staff) |
| Manage ATS Pipeline | **FIRA / Local Agency** (with per-applicant modifications, but a default pipeline exists) |
| AI Matching & Resume Enhancement | Available to **FIRA**, **Local Agencies**, and **Applicants** |
| CMS & Site Content | **FIRA** (Super Admin / Staff) only |

---

## 2. User Roles

| Role | Description | Can Register? | Approval Needed? |
|------|-------------|---------------|-------------------|
| **Super Admin** | Full system owner. Manages everything. | No (pre-created) | N/A |
| **Staff** | FIRA staff member. Same dashboard as Super Admin minus user management. | No (created by Super Admin) | No (created approved) |
| **Applicant** | Filipino job seeker (OFW hopeful). | **Yes** (self-registration) | **Auto-approved** on registration |
| **Local Agency** | Philippine-based recruitment agency (DOLE-licensed partner). | No (created by FIRA) | **Yes** — must submit requirements, evaluated by FIRA |
| **Employer** | Foreign company needing Filipino workers. | No (created by FIRA during inquiry) | **Yes** — goes through accreditation process |

### Important Note on Employer Accounts
When a foreign employer inquires with FIRA:
1. **FIRA creates an account for the employer** (for evaluation purposes).
2. The employer's status is **"accredited employer applicant"** — pending evaluation.
3. The employer **submits requirements** (business documents, licenses, etc.).
4. **FIRA evaluates** the submitted requirements.
5. Upon approval, the account becomes active. The employer uses it **as an admin** for their company.
6. From there, the employer can **create their own company profile** and manage their job-related activities (view endorsed candidates, accept/decline).

---

## 3. Workflow per User Role

---

### 3.1 Applicant (Job Seeker)

#### Registration & Onboarding
```
Landing Page → Click "Register" → Fill Form (Name, Email, Phone, Password)
→ Agree to Terms & Privacy → Click "Create Account"
→ Auto-approved → Redirected to Applicant Dashboard
```
- **Auto-approved**: No FIRA approval needed. Applicant can immediately use the system.
- **First action**: Prompted to "Complete Profile" to fill out detailed information.

#### Available Navigation
| Page | Description |
|------|-------------|
| Dashboard | Overview: profile completion, recent applications, recommended jobs |
| Messages | In-app messaging with agencies/FIRA |
| Find Jobs | Browse/search public job listings |
| My Applications | Track all submitted applications and their status |
| My Profile | View and edit complete applicant profile (multi-step form) |
| AI Resume Boost | Paste resume + job description → AI enhances resume |
| Settings | Account settings (theme, language, accessibility, password) |

#### Applicant Profile (Multi-Step Form)
The profile is a comprehensive multi-step form:
1. **Personal Information** — Name, gender, birth date, birth place, nationality, civil status, religion, height, weight
2. **Contact Information** — Address, city, province, region, zip code, phone, alternate phone, email
3. **Applicant Type** — Domestic Helper OR Skills Professional
4. **Passport & Visa** — Passport number, expiry, status, visa details
5. **Medical** — Medical status, expiry
6. **Education** — Multiple entries: institution, degree, field, years, honors
7. **Work Experience** — Multiple entries: company, position, country, dates, salary, description
8. **Skills** — Multiple entries: name, level, years of experience
9. **Languages** — Multiple entries: language, proficiency, speaking/reading/writing levels
10. **Certifications** — Multiple entries: name, issuing body, dates, credential ID
11. **References** — Multiple entries: name, company, position, contact, relationship
12. **Training** — Multiple entries: training name, institution, dates, hours
13. **Documents** — Upload files: resume, passport, certificates, etc.
14. **Preferences** — Preferred country, preferred job, salary expectation, availability date
15. **Emergency Contact** — Name, relation, phone

#### Job Application Flow
```
Find Jobs → Search/Filter (country, category, type) → Click Job
→ View Job Detail (description, requirements, benefits, skills, salary, custom fields)
→ Click "Apply Now"
→ (If custom fields exist on the job, fill those out)
→ Application Created → Status: "applied"
→ Redirected to "My Applications" to track progress
```

#### Application Status Tracking
Applicant can see their application move through stages:
- `applied` → Application submitted
- ATS pipeline stages (configurable per job, but with a **default pipeline**)
- `endorsed` → Agency endorsed to employer
- `accepted` / `rejected` → Final decision

---

### 3.2 Employer (Foreign Company)

#### Account Creation (By FIRA)
```
Employer Inquires (via Contact page / email / walk-in)
→ FIRA Staff creates employer account in the system
→ Employer status: Pending Accreditation (isApproved = false)
→ FIRA provides login credentials to employer
→ Employer logs in → Sees limited functionality (pending approval)
```

#### Accreditation Process
```
FIRA creates account → Employer submits requirements
  (business documents, company registration, POEA/DMW equivalent,
   job orders, terms of employment, etc.)
→ FIRA evaluates documents
→ DECISION:
  ├── APPROVED: Employer account activated (isApproved = true)
  │   → Employer can now use the system fully
  │   → Employer sets up company profile (EmployerProfile)
  │   → Employer can view endorsed candidates
  │   → Employer can accept/decline endorsements
  └── REJECTED: Employer notified, account stays inactive
```

#### Available Navigation (After Approval)
| Page | Description |
|------|-------------|
| Dashboard | Overview: active jobs, endorsed candidates, recent activity |
| Messages | In-app messaging with FIRA/agencies |
| My Jobs | View job orders created by FIRA for this employer |
| Endorsed Candidates | View candidates endorsed by agencies, with FIRA approval |
| AI Matching | View AI-matched candidates for employer's jobs |
| Settings | Account settings |

#### Employer's Interaction with Jobs
- **Employer does NOT create job orders.** FIRA creates job orders on behalf of the employer.
- Employer can **view** their job orders and see applicant activity.
- Employer receives **endorsed candidates** from agencies (after FIRA approval).
- Employer can **accept or decline** endorsed candidates.

#### Endorsement Review Flow
```
Agency endorses candidate → FIRA reviews endorsement
→ FIRA approves → Employer sees candidate in "Endorsed Candidates"
→ Employer reviews candidate profile, documents, match score
→ DECISION:
  ├── Accept: Candidate moves to next stage (pre-deployment)
  └── Decline: Candidate returned with reason
```

---

### 3.3 Local Agency (Philippine Recruitment Agency)

#### Account Creation
```
Local agency applies (offline/external process)
→ FIRA creates agency account + agency member (admin role) in the system
→ Agency status: Pending (isApproved = false)
→ FIRA provides login credentials
→ Agency logs in → Limited functionality until approved
→ FIRA evaluates and approves agency
→ Agency fully activated
```

#### Available Navigation (After Approval)
| Page | Description |
|------|-------------|
| Dashboard | Overview: jobs, applicants, endorsements, recent activity |
| Messages | In-app messaging with FIRA/employers/applicants |
| Jobs | View job orders assigned to or available for this agency |
| Applicants | View and manage applicants associated with this agency |
| Endorsements | Endorse candidates to employers (with cover notes) |
| ATS Pipeline | Kanban board view of applications per job order |
| Members | Manage agency team members (recruiters, processors, etc.) |
| Settings | Account settings |

#### Agency Workflow: Endorsing a Candidate
```
Agency views applicants → Selects a candidate for a specific job
→ Fills out endorsement form:
  - Cover Note (agency's recommendation)
  - Agency Note (internal notes)
→ Submits endorsement → Status: pending_fira_review
→ FIRA reviews:
  ├── FIRA Approved → Status: fira_approved → Sent to Employer
  │   → Employer reviews:
  │     ├── Employer Accepted → Status: employer_accepted
  │     └── Employer Declined → Status: employer_declined
  └── FIRA Rejected → Status: fira_rejected (with FIRA note)
```

#### ATS Pipeline Management
- Agency can view the **ATS Pipeline** for job orders.
- The pipeline shows applications in **kanban columns** (stages).
- **Default pipeline stages exist** (e.g., Applied → Screening → Interview → Assessment → Document Verification → Endorsement → Deployed).
- **Per-job and per-applicant modifications are possible** — FIRA or the agency can configure custom stages for specific job orders.
- Agency can **move applications between stages**.

---

### 3.4 FIRA Staff

#### Account Creation
Created by **Super Admin** via User Management. No self-registration.

#### Available Navigation
| Page | Description |
|------|-------------|
| Dashboard | Full overview: agencies, employers, applicants, jobs, pending approvals |
| Messages | In-app messaging |
| Agencies | View/manage all local agencies (approve, deactivate) |
| Employers | View/manage all employers (accreditation evaluation) |
| Applicants | View/manage all applicants across the system |
| All Jobs | View/manage all job orders (create, edit, close) |
| ATS Pipeline | Full pipeline visibility across all jobs |
| AI Matching | Run AI matching for any job order |
| Settings | Account settings |

#### Staff Responsibilities
1. **Job Order Creation**: Create job orders based on employer inquiries.
2. **Agency Management**: Evaluate and approve/reject agency applications.
3. **Employer Accreditation**: Evaluate employer requirements, approve/reject accreditation.
4. **Application Oversight**: Monitor the full pipeline, move applicants through stages.
5. **Endorsement Review**: Review agency endorsements before sending to employers.
6. **AI Matching**: Use AI to find the best candidates for job orders.

---

### 3.5 Super Admin

#### Has everything Staff has, PLUS:
| Additional Page | Description |
|----------------|-------------|
| Manage Users | Create, edit, deactivate any user account. Assign roles. |

#### Super Admin Exclusive Responsibilities
1. **User Management**: Create staff accounts, manage all user roles.
2. **CMS Full Access**: All CMS modules (Pages, FAQ, Testimonials, Social Media, Org Chart, Terms, Form Builder, Settings).
3. **System Configuration**: Site-wide settings, form field definitions, org chart.

> **Note**: Staff and Super Admin share the same FIRA Dashboard. The difference is that Super Admin has access to "Manage Users" while Staff does not. Both have full CMS access.

---

## 4. Workflow per Service/Module

---

### 4.1 Job Listings

#### Who Can Do What
| Action | Applicant | Agency | FIRA Staff/Admin | Employer |
|--------|-----------|--------|-------------------|----------|
| View public jobs | ✅ | ✅ | ✅ | ✅ |
| Search/Filter jobs | ✅ | ✅ | ✅ | ✅ |
| View job detail | ✅ | ✅ | ✅ | ✅ |
| **Create job order** | ❌ | ❌ | **✅** | ❌ |
| Edit job order | ❌ | ❌ | **✅** | ❌ |
| Close/reopen job | ❌ | ❌ | **✅** | ❌ |

#### Job Order Creation Flow (FIRA Only)
```
Employer inquires with FIRA (specifies: job title, country, requirements, slots, salary, etc.)
→ FIRA Staff navigates to "All Jobs" → "Create New Job"
→ Fills out job order form:
  - Title, Description, Country, City
  - Category (Domestic Helper, Skills Professional, etc.)
  - Salary (min, max, currency, period)
  - Contract Type, Duration
  - Number of Slots
  - Requirements (text)
  - Benefits (text)
  - Required Skills (comma-separated or tags)
  - Custom Fields (optional, from Form Builder)
  - Assign to Employer (link to EmployerProfile)
  - Assign to Agency (optional, link to Agency)
  - Visibility: public (visible on job listing page) or private
  - Application Deadline (optional)
→ Save → Job Order created
→ If visibility = "public": Job appears on public job listing page
```

#### Public Job Listing Page
```
Landing Page → Click "Jobs" or search
→ Job Listing Page:
  - Search bar (title, country, keyword)
  - Filters: Country, Category, Job Type
  - Grid/List of job cards:
    - Title, Country, Category badge
    - Salary range
    - Slots available
    - Posted date
    - Apply Now button (if logged in as applicant)
→ Click job card → Job Detail Page
```

#### Job Statuses
| Status | Meaning |
|--------|---------|
| `open` | Accepting applications |
| `closed` | No longer accepting applications |
| `filled` | All slots have been filled |

---

### 4.2 Applications

#### Application Creation
```
Applicant browses jobs → Clicks job → Views detail
→ Clicks "Apply Now" (must be logged in)
→ If job has custom fields (from Form Builder):
  → Applicant fills out additional fields
→ Application created with status: "applied"
→ Applicant redirected to "My Applications"
```

#### Application Data Model
- Each application links: **Applicant** + **Job Order**
- One applicant can only apply **once per job** (enforced by unique constraint)
- Application has: status, cover letter, match score, current ATS stage
- Application can have: AI analysis result, custom field responses, endorsements

#### Who Can View Applications
| View | Who |
|------|-----|
| Applicant's own applications | The applicant themselves |
| Applications for agency's jobs | The assigned agency |
| All applications across the system | FIRA (Staff / Super Admin) |
| Applications for employer's jobs | The employer (via endorsed candidates) |

#### Application Statuses
| Status | Meaning |
|--------|---------|
| `applied` | Initial submission |
| ATS stage names (customizable per job) | Movement through pipeline |

---

### 4.3 ATS Pipeline

#### Overview
The ATS (Applicant Tracking System) Pipeline is a **Kanban board** view of all applications for a specific job order, organized by stages.

#### Default Pipeline Stages
Every new job order gets a **default set of stages**:
1. **Applied** — Application received
2. **Screening** — Initial resume/profile review
3. **Interview** — Interview scheduled/conducted
4. **Assessment** — Skills test, medical, etc.
5. **Document Verification** — Checking documents
6. **Endorsement** — Ready to endorse to employer
7. **Deployed** — Successfully deployed

> **Note**: These stages can be **modified and configured** for each applicant or job order, but a **default pipeline always exists** for consistency.

#### Who Can Access
| Action | Agency | FIRA Staff/Admin |
|--------|--------|-------------------|
| View pipeline | ✅ (their assigned jobs) | ✅ (all jobs) |
| Move applicant between stages | ✅ | ✅ |
| Add/remove pipeline stages | ✅ (per job) | ✅ (per job) |
| Configure default pipeline | ❌ | **✅** (system-wide) |

#### Pipeline Interaction
```
Select Job Order → Kanban board loads with stages as columns
→ Each column shows application cards:
  - Applicant name, match score, date applied
→ Drag-and-drop (or click move) application between stages
→ Stage history is recorded (who moved, when, from where, notes)
→ All changes tracked in ATSStageHistory
```

---

### 4.4 AI Matching

#### Overview
AI Matching uses AI to **score and rank applicants** against a specific job order's requirements.

#### Who Can Use
| Role | Access |
|------|--------|
| FIRA (Staff/Admin) | ✅ Full access — run matching for any job |
| Local Agency | ❌ (currently not in nav) |
| Employer | ✅ Can view AI-matched candidates for their jobs |
| Applicant | ❌ |

#### AI Matching Flow
```
Navigate to AI Matching → Select a Job Order
→ Click "Run AI Matching"
→ System analyzes all applicants for that job:
  - Compares applicant skills, experience, education vs. job requirements
  - Generates: match score, semantic score, matched skills, missing skills, explanation
→ Results displayed as ranked list:
  - Score (percentage)
  - Matched Skills (green badges)
  - Missing Skills (red badges)
  - Explanation (AI-generated reasoning)
→ Quick actions: View applicant profile, move to pipeline
```

#### AI Analysis Data (Stored per application)
- `matchScore` — Overall match percentage
- `semanticScore` — Semantic/skill-based score
- `matchedSkills` — JSON string of matched skill names
- `missingSkills` — JSON string of missing skill names
- `explanation` — AI-generated explanation text

---

### 4.5 Resume Enhancement

#### Overview
An AI-powered tool that **improves an applicant's resume** based on a target job description.

#### Who Can Use
| Role | Access |
|------|--------|
| Applicant | ✅ Available in their sidebar as "AI Resume Boost" |
| FIRA/Agency | ❌ (via their own nav if applicable) |

#### Resume Enhancement Flow
```
Applicant navigates to "AI Resume Boost"
→ Two text areas:
  1. Job Description — Paste the target job's description
  2. Current Resume — Paste their current resume text
→ Click "Enhance Resume"
→ AI processes and returns:
  - Enhanced Resume (improved version)
  - Changes Summary (what was changed and why)
→ Applicant can review, copy, or use the enhanced version
→ Enhancement saved in database (for history)
```

---

### 4.6 Endorsements

#### Overview
Endorsement is the process of a **local agency recommending a candidate** to a **foreign employer** for a specific job. FIRA acts as the intermediary reviewer.

#### Endorsement Flow (Full Cycle)
```
1. AGENCY ENDORSES
   Agency selects applicant + job order
   → Fills endorsement form:
     - Cover Note (recommendation letter)
     - Agency Note (internal agency notes)
   → Status: pending_fira_review

2. FIRA REVIEWS
   FIRA staff sees pending endorsement
   → Reviews: candidate profile, match score, agency recommendation
   → Adds FIRA Note (internal review notes)
   → DECISION:
     ├── APPROVE → Status: fira_approved
     │   → Endorsement forwarded to Employer
     └── REJECT → Status: fira_rejected
         → Agency notified with FIRA's reason

3. EMPLOYER REVIEWS
   Employer sees endorsed candidate in "Endorsed Candidates"
   → Reviews: full candidate profile, documents, agency cover note
   → Adds Employer Note (optional)
   → DECISION:
     ├── ACCEPT → Status: employer_accepted
     │   → Candidate proceeds to pre-deployment
     └── DECLINE → Status: employer_declined
         → Agency/FIRA notified with employer's reason
```

#### Endorsement Statuses
| Status | Who | Meaning |
|--------|-----|---------|
| `pending_fira_review` | Agency → FIRA | Awaiting FIRA review |
| `fira_approved` | FIRA → Employer | FIRA approved, sent to employer |
| `fira_rejected` | FIRA → Agency | FIRA rejected the endorsement |
| `pending_employer_review` | FIRA → Employer | Waiting for employer response |
| `employer_accepted` | Employer | Employer accepted the candidate |
| `employer_declined` | Employer | Employer declined the candidate |

#### Who Can See Endorsements
| View | Who |
|------|-----|
| Create endorsement | Local Agency |
| Review (approve/reject) | FIRA Staff/Admin |
| View endorsements for their candidates | Employer |
| Track endorsement status | Agency (their own endorsements) |

---

### 4.7 Messaging

#### Overview
In-app messaging system for communication between all user roles.

#### Who Can Message Whom
- **All authenticated users** have access to the Messages page.
- Messaging is available to: Super Admin, Staff, Applicant, Local Agency, Employer.
- Messages facilitate communication about applications, endorsements, job details, etc.

#### Note on Implementation
- Currently uses a **mock/polling-based** messaging UI.
- Can be upgraded to real-time (WebSocket/Socket.IO) in the future.

---

### 4.8 Employer Partnership / Accreditation

#### Overview
This is the process of **onboarding a new foreign employer** as an accredited partner of FIRA.

#### Important: Employers Cannot Self-Register
Employers do NOT register themselves on the platform. The process is:

```
STEP 1: INQUIRY
  Employer contacts FIRA (via website Contact page, email, phone, or in-person)
  → Specifies: company name, country, industry, job needs, etc.

STEP 2: FIRA CREATES ACCOUNT
  FIRA Staff creates an account for the employer:
  - User account with role = "employer"
  - isApproved = false (pending accreditation)
  - Basic EmployerProfile created (company name, country)
  → Login credentials provided to employer

STEP 3: EMPLOYER SUBMITS REQUIREMENTS
  Employer logs in with provided credentials
  → Submits accreditation requirements:
    - Business registration documents
    - Company licenses/permits
    - Job order specifications
    - Terms of employment
    - Company profile details
    - Contact person information
  → Updates their EmployerProfile

STEP 4: FIRA EVALUATES
  FIRA Staff reviews submitted requirements:
  - Verifies business documents
  - Checks company legitimacy
  - Reviews job terms (salary, benefits, contract)
  - Assesses employer's track record

STEP 5: DECISION
  ├── APPROVED:
  │   → Employer account: isApproved = true
  │   → Employer receives full system access
  │   → Employer is now an "Accredited Employer"
  │   → FIRA can now create job orders for this employer
  │   → Employer appears in public testimonials/partners (if applicable)
  └── REJECTED:
      → Employer notified with reasons
      → Account remains inactive
      → May re-apply with corrected documents

STEP 6: ONGOING PARTNERSHIP
  FIRA creates job orders based on employer's needs
  → Agencies endorse candidates to employer
  → Employer reviews and accepts/declines
  → Cycle continues
```

#### Employer Partnership Page (Public)
A public landing page section ("For Employers") that explains the partnership process to prospective employers, with a contact/inquiry form.

---

### 4.9 User Management

#### Overview
Only accessible by **Super Admin**. Manages all user accounts in the system.

#### Capabilities
| Action | Super Admin |
|--------|-------------|
| View all users | ✅ |
| Create new user (any role) | ✅ |
| Edit user details | ✅ |
| Change user role | ✅ |
| Activate/deactivate user | ✅ |
| Approve agency/employer accounts | ✅ |
| Reset password | ✅ |

#### User Management Flow
```
Super Admin → "Manage Users"
→ View list of all users (searchable)
→ Filter by role
→ Actions per user:
  - View details (dialog: email, role, status, created date)
  - Edit (name, email, role, active status, approved status)
  - Deactivate/Reactivate account
```

---

### 4.10 CMS Modules

#### Overview
Content Management System modules available only to **FIRA (Super Admin / Staff)** for managing the public-facing website content.

#### CMS Modules

| Module | Purpose | Key Fields |
|--------|---------|------------|
| **CMS Pages** | Create/edit public content pages | Title, slug, content (rich text), status (draft/published), order |
| **FAQ Management** | Manage frequently asked questions | Question, answer, category, order, active/inactive |
| **Testimonials** | Manage OFW success stories | Name, position, company, feedback, rating (1-5), avatar, active |
| **Social Media** | Manage social media links | Platform, title, URL, icon/logo, order, active |
| **Org Chart** | Display FIRA organizational structure | Name, position, department, parent (hierarchy), avatar, email, phone |
| **Terms & Privacy** | Manage legal documents | Type (terms_of_service / data_privacy_consent), title, content, version |
| **Form Builder** | Define custom fields for applications | Label, field type, options, required, section, order |
| **Site Settings** | Global site configuration | Key-value pairs for site-wide settings |

#### Form Builder (Application Custom Fields)
```
FIRA Admin → "Form Builder"
→ Define custom fields that appear on job applications:
  - Field Type: text, textarea, select, multiselect, checkbox, date, number, file, email, phone
  - Section grouping (e.g., "Personal Information", "Work Experience")
  - Required/optional toggle
  - Order/priority
→ When a job order includes custom fields:
  → Applicants see these fields when applying
  → Responses stored in ApplicationCustomResponse
```

---

## 5. Cross-Role Workflows (End-to-End)

### 5.1 Complete Applicant Journey (End-to-End)

```
1. APPLICANT REGISTERS
   Applicant → Landing Page → Register → Fill form → Account created (auto-approved)

2. APPLICANT COMPLETES PROFILE
   Applicant → Dashboard → "Complete Profile"
   → Fills out all profile sections (personal, education, experience, skills, documents, etc.)

3. APPLICANT BROWSES AND APPLIES
   Applicant → Find Jobs → Search/Filter → Select Job → View Detail
   → Click "Apply Now" → Fill any custom fields → Application submitted

4. FIRA/AGENCY REVIEWS APPLICATION
   FIRA/Agency → ATS Pipeline → See application in "Applied" stage
   → Move through stages: Screening → Interview → Assessment → Document Verification

5. AGENCY ENDORSES TO EMPLOYER
   Agency → Endorsements → Select candidate + job → Fill cover note
   → Submit → Status: pending_fira_review

6. FIRA REVIEWS ENDORSEMENT
   FIRA → Endorsements → Review candidate, documents, agency recommendation
   → Approve → Forwarded to Employer

7. EMPLOYER ACCEPTS
   Employer → Endorsed Candidates → Review candidate
   → Accept → Candidate proceeds to pre-deployment

8. DEPLOYMENT
   FIRA/Agency → ATS Pipeline → Move to "Deployed" stage
   → Applicant notified of successful deployment
```

### 5.2 Complete Employer Onboarding Journey

```
1. EMPLOYER INQUIRES
   Employer → Website Contact Page (or email/phone)
   → Submits inquiry about hiring Filipino workers

2. FIRA CREATES EMPLOYER ACCOUNT
   FIRA Staff → System → Creates User (role: employer) + EmployerProfile
   → isApproved = false → Provides credentials to employer

3. EMPLOYER SUBMITS REQUIREMENTS
   Employer → Logs in → Submits business documents, company details

4. FIRA EVALUATES & APPROVES
   FIRA Staff → Reviews documents → Approves accreditation
   → Employer account: isApproved = true

5. FIRA CREATES JOB ORDERS
   FIRA Staff → All Jobs → Create New Job
   → Fills job details based on employer's requirements
   → Links job to employer

6. APPLICANTS APPLY & GET ENDORSED
   (See 5.1 flow above)

7. EMPLOYER REVIEWS ENDORSED CANDIDATES
   Employer → Endorsed Candidates → Accept/Decline
```

### 5.3 Agency Endorsement Lifecycle

```
1. Agency reviews applicants in their pipeline
2. Agency selects a qualified candidate for a specific job
3. Agency creates endorsement with cover note
4. FIRA reviews endorsement (documents, match score, candidate readiness)
5. FIRA approves → Employer receives the endorsement
6. Employer reviews candidate profile and documents
7. Employer accepts or declines:
   - Accept: Pre-deployment processing begins
   - Decline: Feedback sent back to agency
```

---

## 6. Important Business Rules

### 6.1 Registration Rules
- **Only applicants can self-register.** Agencies and employers are created by FIRA.
- Applicants are **auto-approved** upon registration (no FIRA approval needed).
- Agencies and employers require **FIRA approval** before they can fully use the system.

### 6.2 Job Order Rules
- **Only FIRA creates job orders.** Employers and agencies cannot create jobs.
- Job orders are created based on employer inquiries/requests.
- Jobs can be **public** (visible on job listing page) or **private** (internal only).
- Jobs have statuses: `open`, `closed`, `filled`.

### 6.3 Application Rules
- An applicant can only apply **once per job order** (unique constraint).
- Applications track their current ATS stage.
- Stage history is fully audited (who moved, when, from/to, notes).

### 6.4 ATS Pipeline Rules
- Every job order has a **default pipeline** with standard stages.
- Pipelines can be **customized per job order** (add/remove/rename stages).
- Per-applicant pipeline modifications are also possible.
- Both FIRA and Local Agency can move applicants through stages.

### 6.5 Endorsement Rules
- Only **local agencies** can create endorsements.
- **FIRA must review** every endorsement before it reaches the employer.
- Employers can **accept or decline** endorsed candidates.
- The full endorsement chain: Agency → FIRA Review → Employer Decision.

### 6.6 Payment Rules
- **No payment processing** is handled by the FIRA system.
- All financial transactions (placement fees, processing fees, etc.) happen **offline**.

### 6.7 Employer Accreditation Rules
- Employers **cannot self-register** on the platform.
- FIRA creates the employer account during the inquiry/accreditation process.
- The employer starts with a **pending evaluation** account.
- Upon approval, the employer uses their account **as admin** and can set up their company profile.

---

## Appendix: System Screens per Role

### Applicant Screens
| Screen | View Name |
|--------|-----------|
| Dashboard | `applicant-dashboard` |
| Find Jobs | `applicant-jobs` |
| My Applications | `applicant-applications` |
| My Profile | `applicant-profile` |
| Edit Profile | `applicant-profile-edit` |
| AI Resume Boost | `resume-enhancement` |
| Messages | `messages` |
| Settings | `user-settings` |

### Local Agency Screens
| Screen | View Name |
|--------|-----------|
| Dashboard | `agency-dashboard` |
| Jobs | `agency-jobs` |
| Create Job | `agency-job-create` |
| Applicants | `agency-applicants` |
| Applicant Detail | `agency-applicant-detail` |
| Endorsements | `agency-endorsements` |
| ATS Pipeline | `ats-pipeline` |
| Members | `agency-members` |
| Messages | `messages` |
| Settings | `user-settings` |

### FIRA (Staff/Admin) Screens
| Screen | View Name |
|--------|-----------|
| Dashboard | `fira-dashboard` |
| Agencies | `fira-agencies` |
| Employers | `fira-employers` |
| Applicants | `fira-applicants` |
| Applicant Detail | `fira-applicant-detail` |
| All Jobs | `fira-jobs` |
| Create Job | `fira-job-create` |
| ATS Pipeline | `ats-pipeline` |
| AI Matching | `ai-matching` |
| Messages | `messages` |
| Settings | `user-settings` |
| **Super Admin Only:** | |
| Manage Users | `super-admin-users` |

### Employer Screens
| Screen | View Name |
|--------|-----------|
| Dashboard | `employer-dashboard` |
| My Jobs | `employer-jobs` |
| Endorsed Candidates | `employer-endorsed` |
| Candidate Detail | `employer-candidate-detail` |
| AI Matching | `ai-matching` |
| Messages | `messages` |
| Settings | `user-settings` |

### Public Screens
| Screen | View Name |
|--------|-----------|
| Landing Page | `landing` |
| Job Listings | `job-listing` |
| Job Detail | `job-detail` |
| About | `about` |
| Services | `services` |
| FAQ | `faq` |
| Contact | `contact` |
| Terms & Privacy (Public) | `terms-public` |
| Employer Partnership | `employer-partnership` |

---

> **END OF WORKFLOW DOCUMENT**
> Please review and provide corrections. Once approved, this will be applied to the system.
