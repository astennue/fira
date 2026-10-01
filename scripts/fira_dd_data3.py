# FIRA Data Dictionary - Part 3: Algorithm mapping, status machine, relationships

# ---------- Application status state machine (code-verified: src/lib/status.ts) ----------
# (status, category, meaning, allowedBy roles, next statuses, terminal)
STATUS_MACHINE = [
("applied", "info", "Application submitted.", "super_admin, staff, international_agency", "screening, shortlisted, under_review, rejected, withdrawn", "No"),
("screening", "active", "Under initial review.", "super_admin, staff, international_agency, local_agency", "shortlisted, interview, under_review, rejected, withdrawn", "No"),
("shortlisted", "active", "Selected for further consideration.", "super_admin, staff, international_agency", "interview, assessment, under_review, pending_fira_review, rejected, withdrawn", "No"),
("interview", "active", "Scheduled for interview.", "super_admin, staff, international_agency, local_agency", "assessment, offered, pending_fira_review, rejected, withdrawn", "No"),
("assessment", "active", "Taking tests or assessments.", "super_admin, staff, international_agency", "offered, pending_fira_review, rejected, withdrawn", "No"),
("under_review", "active", "Being reviewed by FIRA.", "super_admin, staff, international_agency", "shortlisted, interview, pending_fira_review, rejected, withdrawn", "No"),
("pending_fira_review", "active", "Awaiting FIRA review for endorsement.", "super_admin, staff, international_agency", "fira_approved, fira_rejected, rejected, withdrawn", "No"),
("fira_approved", "success", "Approved by FIRA; ready for employer review.", "super_admin, staff, international_agency", "pending_employer_review, withdrawn", "No"),
("fira_rejected", "failure", "Rejected by FIRA.", "super_admin, staff, international_agency", "applied, screening, withdrawn", "No"),
("pending_employer_review", "active", "Endorsed to employer; awaiting response.", "super_admin, staff, international_agency", "employer_accepted, employer_declined, withdrawn", "No"),
("employer_accepted", "success", "Employer accepted the candidate.", "employer, super_admin, staff, international_agency", "offered, processing, deployed, withdrawn", "No"),
("employer_declined", "failure", "Employer declined the candidate.", "employer, super_admin, staff, international_agency", "withdrawn", "No"),
("offered", "success", "Job offer extended.", "super_admin, staff, international_agency", "hired, processing, withdrawn", "No"),
("hired", "success", "Candidate accepted the offer.", "super_admin, staff, international_agency", "processing, deployed", "No"),
("processing", "active", "Processing documents and requirements.", "super_admin, staff, international_agency, local_agency", "deployed, withdrawn", "No"),
("deployed", "success", "Successfully deployed to work site.", "super_admin, staff, international_agency", "completed", "No"),
("completed", "info", "Contract completed (terminal).", "super_admin, staff, international_agency", "(none)", "Yes"),
("rejected", "failure", "Application rejected (recoverable to applied).", "super_admin, staff, international_agency", "applied, withdrawn", "No"),
("withdrawn", "info", "Withdrawn by applicant (terminal).", "applicant, super_admin, staff, international_agency", "(none)", "Yes"),
]

# ---------- Algorithm pipeline (Step, Stage, Component, Inputs, Output, Description) ----------
PIPELINE = [
("1", "Job order setup", "POST /api/jobs (Next.js)", "JobOrder.requiredSkills, description, category, country, salaryMin/Max", "Normalized demand profile", "Creator supplies requiredSkills as JSON array or comma-separated text; parser tolerates both (JSON.parse with CSV fallback). Job must have status='open' to be public."),
("2", "Candidate pool selection", "POST /api/matching (Next.js)", "User.role='applicant' AND isActive=true AND isApproved=true; ApplicantProfile exists", "Eligible candidates with profile + skills + experience + education", "Only approved, active applicant accounts enter scoring; profile completeness (isComplete) is NOT currently enforced."),
("3", "Feature extraction", "POST /api/matching (Next.js)", "ApplicantProfile.resumeText, yearsExperience; ApplicantSkill.name (list)", "AI request payload", "Payload: { resume_text, job_description, applicant_skills[], required_skills[], experience_years }."),
("4", "Semantic similarity", "python-ai service: POST {AI_SERVICE_URL}/match, 5s timeout", "resume_text vs job_description", "semanticScore (0-1, 4 dp)", "SBERT sentence embeddings + cosine similarity; falls back to word-overlap heuristic if SBERT fails."),
("5", "Skill overlap analysis", "python-ai analyze_skills", "applicant_skills[] vs required_skills[]", "matched_skills[], missing_skills[], skill_match_ratio (0-1)", "Case-insensitive skill matching; ratio = matched / required (1.0 if no requirements)."),
("6", "Suitability scoring (AI path)", "python-ai predict_suitability", "[similarity, skill_match_ratio, exp_factor=min(years/10,1)]", "matchScore (0-100, 1 dp)", "RandomForest classifier probability x100 when a fitted model exists; otherwise weighted heuristic."),
("7", "Fallback scoring (JS path)", "computeFallbackScore in /api/matching", "applicantSkills[], requiredSkills[]", "matchScore (0-99), semanticScore", "Used when AI service errors or times out (>5s): ratio=matched/required (0.5 if none); semantic=ratio*0.8+0.15; score=(semantic*0.7+ratio*0.3)*100 rounded to 1 dp, capped at 99."),
("8", "Ranking", "POST /api/matching", "matchScore per candidate", "Candidates sorted by matchScore DESC", "Higher score = stronger fit; front-end shortlists consume this order."),
("9", "Persistence", "Prisma upsert (AIAnalysisResult) + Application.update", "Analysis outputs", "AIAnalysisResult row (per application) + Application.matchScore", "Results are ONLY persisted for candidates who already have an Application row; both stores updated together."),
]

# ---------- Formula variants (Variant, Formula, Range, When used) ----------
FORMULAS = [
("AI - RandomForest", "score = predict_proba([[similarity, skill_ratio, exp_factor]])[class 1] x 100", "0 - 100", "Fitted RF model file present in python-ai"),
("Heuristic (python)", "score = (similarity*0.4 + skill_ratio*0.4 + exp_factor*0.2) x 100;  exp_factor = min(experience_years/10, 1)", "0 - 100", "No RF model available"),
("Fallback (Next.js JS)", "semantic = ratio*0.8 + 0.15;  score = round((semantic*0.7 + ratio*0.3) x 100, 1), cap 99;  ratio = matched/required (0.5 if no required skills)", "0 - 99", "AI service unreachable or >5s response"),
("Semantic fallback (python)", "sim_score = word-overlap of resume_text vs job_description", "0 - 1", "SBERT embedding failure"),
]

# ---------- Feature-to-field mapping (Feature, Source Table.Field, Scale, Weight, Notes) ----------
FEATURES = [
("Semantic similarity (resume vs job description)", "ApplicantProfile.resumeText x JobOrder.description", "0 - 1", "0.4 (heuristic); input to RF", "Strongest content signal; requires resumeText to be filled - empty resumes degrade all scores."),
("Skill match ratio", "ApplicantSkill.name (set) vs JobOrder.requiredSkills (list)", "0 - 1", "0.4 (heuristic); input to RF", "Exact case-insensitive matching - no fuzzy/semantic skill matching yet; free-text skill names cause misses."),
("Experience factor", "ApplicantProfile.yearsExperience", "0 - 1 (min(yrs/10, 1))", "0.2 (heuristic); input to RF", "Self-reported total years; saturates at 10 years."),
("matchScore (RANKING KEY)", "AIAnalysisResult.matchScore; denormalized copy in Application.matchScore", "0 - 100", "-", "Sorting key for candidate lists; both copies must stay in sync (route updates both)."),
("semanticScore (diagnostic)", "AIAnalysisResult.semanticScore", "0 - 1", "-", "Explanatory output; not currently a separate ranking key."),
("matchedSkills / missingSkills", "AIAnalysisResult.matchedSkills / .missingSkills (JSON arrays)", "list", "-", "Explainability + gap analysis for upskilling recommendations."),
("explanation", "AIAnalysisResult.explanation", "text", "-", "Human-readable justification shown to reviewers."),
]

# ---------- Data quality / alignment notes (Topic, Current behavior, Why it matters, Recommendation) ----------
QUALITY_NOTES = [
("requiredSkills dual format", "Stored as JSON array string OR comma-separated text; matching parser accepts both.", "Fragile input contract; a malformed value silently degrades skill matching.", "Standardize on JSON array at write time; add schema validation."),
("Free-text skill names", "ApplicantSkill.name and requiredSkills entries are free text; matching is exact case-insensitive.", "Synonyms ('child care' vs 'childcare') cause false negatives in skill_match_ratio.", "Introduce a controlled skill taxonomy (e.g. map to HOUSEHOLD_TASKS + TESDA/DMW skill lists) with canonical IDs."),
("matchScore stored twice", "Application.matchScore is a denormalized copy of AIAnalysisResult.matchScore.", "Divergence risk; consumers may read different values from each store.", "Keep the existing dual-write, or read through to AIAnalysisResult as single source of truth."),
("Experience text fields not numeric", "salaryExpectation, availabilityDate, duration are free text.", "Cannot be used directly in numeric salary-fit or availability features.", "Add structured numeric/date fields or parse at ingest."),
("Pool gates vs profile completeness", "Matching pool = role+isActive+isApproved; ApplicantProfile.isComplete exists but is NOT enforced.", "Incomplete profiles (no resumeText/skills) score low and pollute ranked lists.", "Enforce isComplete (or resumeText non-empty) as a pool filter."),
("Persistence requires existing Application", "AIAnalysisResult rows are only written when the applicant already applied.", "Ranking data absent for proactive (pre-application) candidate suggestions.", "Add a jobless-scoped store or persist candidate-level results separately."),
("Two parallel lifecycles", "Application.status (19-state machine) coexists with per-job ATSStage pipeline (currentStageId).", "Reporting must reconcile both; stage moves do not change status.", "Define an explicit mapping table between statuses and ATS stages."),
("Job status model", "This build: create sets status='open'; PATCH can set arbitrary values; public board lists 'open'; dashboards also reference 'pending'.", "Ambiguous lifecycle states could expose unapproved jobs if visibility misused.", "Restrict PATCH to an enumerated set (open | pending | closed) server-side."),
("contractType / jobType duplication", "Create form writes the jobType UI value into contractType.", "Inconsistent taxonomies ('Full Time' vs 'full_time').", "Unify to a single enumerated field."),
("Demo/manual slot tracking", "JobOrder.filledSlots is manually maintained; no automation on hire.", "Quota-based ranking/urgency features would be unreliable.", "Auto-increment filledSlots on application status change to hired/deployed."),
]

# ---------- Relationship map (From, Relationship, To, Key/FK, Cardinality, Description) ----------
RELATIONSHIPS = [
("User", "has profile", "EmployerProfile", "EmployerProfile.userId -> User.id", "1 : 0..1", "An employer account owns exactly one company profile."),
("User", "has profile", "ApplicantProfile", "ApplicantProfile.userId -> User.id", "1 : 0..1", "An applicant account owns exactly one job-seeker profile (the matching-side entity)."),
("User", "joins", "AgencyMember", "AgencyMember.userId -> User.id", "1 : N", "A user can be a member of multiple agencies."),
("Agency", "has members", "AgencyMember", "AgencyMember.agencyId -> Agency.id", "1 : N", "Agency roster of users with functional roles."),
("Agency", "owns job orders", "JobOrder", "JobOrder.agencyId -> Agency.id", "1 : N", "Agency-attributed job orders."),
("EmployerProfile", "owns job orders", "JobOrder", "JobOrder.employerId -> EmployerProfile.id", "1 : N", "Employer's vacancies; null employerId = FIRA-posted."),
("User", "creates", "JobOrder", "JobOrder.createdBy -> User.id", "0..1 : N", "Audit: which account created the job order."),
("JobOrder", "receives", "Application", "Application.jobOrderId -> JobOrder.id", "1 : N", "Applications to the vacancy (cascade delete)."),
("User", "submits", "Application", "Application.applicantId -> User.id", "1 : N", "Applications per applicant; UNIQUE(applicantId, jobOrderId) prevents duplicates."),
("Application", "is analyzed by", "AIAnalysisResult", "AIAnalysisResult.applicationId -> Application.id", "1 : 0..1", "Persisted matching output (scores + skill evidence); unique per application."),
("Application", "is endorsed via", "Endorsement", "Endorsement.applicationId -> Application.id", "1 : N", "Endorsements raise the application into the FIRA + employer approval flow."),
("User", "endorses", "Endorsement", "Endorsement.endorsedById -> User.id", "1 : N", "FIRA staff / agency user who created the endorsement."),
("EmployerProfile", "receives", "Endorsement", "Endorsement.employerId -> EmployerProfile.id", "1 : N", "Employer inbox of endorsed candidates."),
("JobOrder", "defines stages", "ATSStage", "ATSStage.jobOrderId -> JobOrder.id", "1 : N", "11 default stages auto-created per job (New Application ... Contract Signing)."),
("ATSStage", "marks", "Application", "Application.currentStageId -> ATSStage.id", "1 : N", "Current pipeline position of an application (parallel to status)."),
("Application", "logs moves", "ATSStageHistory", "ATSStageHistory.applicationId -> Application.id", "1 : N", "Immutable stage-move audit trail."),
("ATSStage", "logged in", "ATSStageHistory", "ATSStageHistory.stageId -> ATSStage.id", "1 : N", "Destination stage of each move (fromStageId is a soft self-reference)."),
("Application", "answers", "ApplicationCustomResponse", "ApplicationCustomResponse.applicationId -> Application.id", "1 : N", "Answers to the job's custom screening questions."),
("JobOrder", "asks", "JobCustomField", "JobCustomField.jobOrderId -> JobOrder.id", "1 : N", "Custom screening questions (answered via fieldId soft reference)."),
("User", "receives", "Notification", "Notification.userId -> User.id", "1 : N", "In-app notification feed."),
("User", "owns", "VerificationCode", "VerificationCode.userId -> User.id", "1 : N", "Email verification / password reset codes."),
("User", "requests", "ResumeEnhancement", "ResumeEnhancement.applicantId -> User.id", "1 : N", "AI resume rewrites owned by the applicant."),
("ResumeEnhancement", "targets (soft)", "JobOrder", "ResumeEnhancement.jobOrderId -> JobOrder.id", "0..1 : N", "SOFT reference (no DB constraint): job the resume was tailored for."),
("ApplicationCustomResponse", "references (soft)", "JobCustomField", "ApplicationCustomResponse.fieldId -> JobCustomField.id", "0..1 : N", "SOFT reference (no DB constraint)."),
("ATSStageHistory", "moved by (soft)", "User", "ATSStageHistory.movedBy -> User.id", "0..1 : N", "SOFT reference: user who performed the stage move."),
("CmsOrgChart", "self-parent (soft)", "CmsOrgChart", "CmsOrgChart.parentId -> CmsOrgChart.id", "0..1 : N", "Organization hierarchy (soft self-reference)."),
]

# Matching data flow edges (for the flow diagram block on the Relationship Map sheet)
FLOW_EDGES = [
("ApplicantProfile.resumeText", "->", "Semantic similarity (SBERT)"),
("JobOrder.description", "->", "Semantic similarity (SBERT)"),
("Semantic similarity (SBERT)", "->", "AIAnalysisResult.semanticScore"),
("ApplicantSkill.name", "->", "Skill overlap analysis"),
("JobOrder.requiredSkills", "->", "Skill overlap analysis"),
("Skill overlap analysis", "->", "AIAnalysisResult.matchedSkills / .missingSkills"),
("Skill overlap analysis", "->", "skill_match_ratio"),
("ApplicantProfile.yearsExperience", "->", "Experience factor min(yrs/10, 1)"),
("semanticScore + skill_match_ratio + experience factor", "->", "AIAnalysisResult.matchScore"),
("AIAnalysisResult.matchScore", "->", "Application.matchScore (denormalized)"),
("Application.matchScore", "->", "Ranking (sort DESC) in candidate lists"),
("Ranking", "->", "Application.status lifecycle (screening/shortlisting)"),
("Application.status: pending_fira_review", "->", "Endorsement.status (FIRA -> Employer two-step)"),
("Endorsement.status: employer_accepted", "->", "Hired -> Processing -> Deployed"),
]

# README entity inventory (sheet name, tables, description)
GROUPS = [
("01 User & Org", "User, Agency, AgencyMember, EmployerProfile", "Accounts, roles, organizations. User.role/isActive/isApproved form the matching pool gate."),
("02 Applicant", "ApplicantProfile + Education, Experience, Skill, Language, Certification, Reference, Document, Training", "Supply-side profile data: skills, resume text and experience are the core matching features."),
("03 Job Orders", "JobOrder, JobCustomField", "Demand-side vacancies: requiredSkills and description are the core matching features."),
("04 Applications & ATS", "Application, ApplicationCustomResponse, ATSStage, ATSStageHistory", "Link entity applicant<->job; carries matchScore output and the 19-state workflow; per-job pipeline stages."),
("05 Endorsement", "Endorsement", "Two-step approval (FIRA review -> employer decision) raising candidates to hire."),
("06 AI & Matching", "AIAnalysisResult, ResumeEnhancement", "Persisted algorithm outputs and AI resume tooling."),
("07 System & Support", "Notification, VerificationCode, ContactSubmission, NewsletterSubscription, PartnerInquiry", "Operational support and public-form data."),
("08 CMS", "CmsPage, CmsFaq, CmsTestimonial, CmsSocialMedia, CmsOrgChart, CmsTermsPrivacy, CmsFormField, CmsSettings", "Website content management; not consumed by the matching algorithm."),
]

# README column legend (Column, Definition)
COLUMN_LEGEND = [
("Table", "Prisma model (database table) the field belongs to."),
("Field", "Exact column name as defined in prisma/schema.prisma."),
("Type", "Prisma data type; a trailing ? means nullable (optional)."),
("Required", "Yes = NOT NULL at the database level; No = nullable / optional."),
("Description", "What the field stores and how it is used in the system."),
("Allowed Values / Format", "Code-verified enumerations and formats (defaults marked). 'Free text' = no runtime validation."),
("Populated By", "Actor or process that writes the value (Applicant, Employer, Agency, FIRA Staff, AI Engine, System, Guest)."),
("Related Table (FK)", "Referenced table and constraint; 'soft' = reference by convention, no DB constraint."),
("Algorithm Role", "How the field participates in the matching & ranking algorithm - see legend below."),
]

# README algorithm-role legend (Tag, Definition)
ROLE_LEGEND = [
("Core Input", "Consumed directly by the matching/scoring algorithm (skills, resume text, experience, required skills, job description) or defines the scoring pool (role, isActive, isApproved)."),
("Context Input", "Available to the algorithm for filtering, weighting or future features, but not currently part of the scoring formula."),
("Output", "Stores matching results used for ranking and explainability (matchScore, semanticScore, matched/missing skills, explanation)."),
("Lifecycle", "Drives workflow state machines (application status, endorsement status, job status, ATS stage, verification flags)."),
("Access", "Controls visibility and permissions (roles, approval/active flags, job visibility)."),
("Profile", "Descriptive / reference data not currently consumed by scoring."),
("System", "Infrastructure bookkeeping: IDs, timestamps, audit, CMS infrastructure."),
]

README_ABOUT = [
("System", "FIRA - Philippine overseas employment job-matching platform (applicants -> FIRA staff/agency screening -> international employers)."),
("Source audited", "prisma/schema.prisma (35 models), API routes (src/app/api/*), UI constants (src/components/*), AI service (python-ai/). Enumerations are CODE-VERIFIED, not assumed."),
("Algorithm scope", "Candidate<->Job matching & ranking: SBERT semantic similarity + skill overlap + experience factor -> suitability score 0-100 -> ranked shortlists feeding the application/endorsement pipeline."),
("Workbook layout", "README (this sheet) -> Algorithm Mapping (pipeline, formulas, features, data-quality notes) -> Relationship Map -> 8 dictionary sheets, one per functional group."),
("Row count per sheet", "Each dictionary sheet lists every column of every table in the group, in schema order, with the 9 columns described below."),
("How to align with your algorithm", "Start from 'Algorithm Mapping' (Section C maps every algorithm feature to its source fields), then use the 'Algorithm Role' column to filter the dictionary per feature. Core Input + Output fields are the minimum viable dataset; Context Input fields are the candidate feature space."),
]
