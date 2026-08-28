// ============ TYPES ============

export type UserRole = 'super_admin' | 'staff' | 'applicant' | 'local_agency' | 'international_agency' | 'employer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isApproved: boolean;
  phone?: string;
  avatar?: string | null;
  agencyId?: string;
  agencyName?: string;
}

export type ViewName =
  | 'landing'
  | 'login'
  | 'register'
  // Applicant
  | 'applicant-dashboard'
  | 'applicant-jobs'
  | 'applicant-apply'
  | 'applicant-applications'
  | 'applicant-profile'
  | 'applicant-documents'
  // Agency
  | 'agency-dashboard'
  | 'agency-applicants'
  | 'agency-pipeline'
  | 'agency-members'
  | 'agency-endorsements'
  | 'agency-job-orders'
  // FIRA
  | 'fira-dashboard'
  | 'fira-agencies'
  | 'fira-employers'
  | 'fira-job-orders'
  | 'fira-matching'
  | 'fira-endorsements'
  // Employer
  | 'employer-dashboard'
  | 'employer-endorsements'
  | 'employer-profile'
  | 'employer-job-orders';

export type Locale = 'en' | 'fil';

// ============ CONSTANTS ============

export const DEFAULT_ATS_STAGES = [
  'Applied', 'Screening', 'Interview', 'Assessment', 'Document Verification',
  'Medical Exam', 'Endorsement', 'Employer Review', 'Accepted', 'Contract Signing',
  'Visa Processing', 'Orientation', 'Deployed', 'On-Probation', 'Regularized',
  'Contract Renewal', 'Repatriation', 'Contract Completed', 'Terminated'
];

// ATS pipeline colors — 5-color brandkit palette (blue, amber, green, red, gray)
export const STAGE_COLORS = [
  '#3b82f6', '#3b82f6', '#2563eb', '#2563eb', '#2563eb',
  '#f59e0b', '#f59e0b', '#f59e0b', '#22c55e', '#22c55e',
  '#22c55e', '#3b82f6', '#3b82f6', '#22c55e', '#22c55e',
  '#22c55e', '#64748b', '#22c55e', '#ef4444'
];

export const HOUSEHOLD_SKILL_CATEGORIES = {
  childcare: {
    label: 'Childcare',
    labelTl: 'Pangangalaga ng Bata',
    skills: ['Infant Care', 'Childcare (2-6 years)', 'Childcare (7-12 years)', 'Childcare (13+ years)', 'Special Needs Care', 'Tutoring', 'Babysitting']
  },
  cooking: {
    label: 'Cooking',
    labelTl: 'Pagluluto',
    skills: ['Filipino Cuisine', 'Chinese Cuisine', 'Western Cuisine', 'Middle Eastern Cuisine', 'Japanese/Korean Cuisine', 'Baking', 'Meal Planning', 'Food Preservation']
  },
  housekeeping: {
    label: 'Housekeeping',
    labelTl: 'Pangangalaga sa Bahay',
    skills: ['General Housekeeping', 'Laundry & Ironing', 'Carpet Cleaning', 'Garden Maintenance', 'Pet Care', 'Organizing & Decluttering']
  },
  elderly_care: {
    label: 'Elderly Care',
    labelTl: 'Pangangalaga sa Matanda',
    skills: ['Companionship', 'Personal Hygiene Assistance', 'Medication Management', 'Mobility Assistance', 'Dementia Care', 'Palliative Care']
  },
  skilled: {
    label: 'Skilled/Professional',
    labelTl: 'Skilled/Propesyonál',
    skills: ['Nursing', 'Engineering', 'IT/Technology', 'Teaching', 'Accounting', 'Construction', 'Welding', 'Electrical Work', 'Plumbing', 'Driving', 'Office Administration', 'Hospitality']
  },
  other: {
    label: 'Other Skills',
    labelTl: 'Ibang Kakayahan',
    skills: ['First Aid', 'Swimming', 'Sewing', 'Gardening', 'Hairdressing', 'Massage Therapy']
  }
};

export const JOB_CATEGORIES = [
  { value: 'domestic_helper', label: 'Domestic Helper', labelTl: 'Katulong/Pambahay' },
  { value: 'caregiver', label: 'Caregiver', labelTl: 'Tagapangalaga' },
  { value: 'nurse', label: 'Nurse', labelTl: 'Nars' },
  { value: 'teacher', label: 'Teacher', labelTl: 'Guro' },
  { value: 'engineer', label: 'Engineer', labelTl: 'Inhenyero' },
  { value: 'it_professional', label: 'IT Professional', labelTl: 'IT Propesyonál' },
  { value: 'accountant', label: 'Accountant', labelTl: 'Akawtant' },
  { value: 'construction_worker', label: 'Construction Worker', labelTl: 'Manggagawa sa Konstruksyon' },
  { value: 'welder', label: 'Welder', labelTl: 'Welder' },
  { value: 'electrician', label: 'Electrician', labelTl: 'Elektrisyan' },
  { value: 'driver', label: 'Driver', labelTl: 'Drayber' },
  { value: 'chef_cook', label: 'Chef/Cook', labelTl: 'Kusinero' },
  { value: 'hotel_staff', label: 'Hotel Staff', labelTl: 'Kawani ng Hotel' },
  { value: 'factory_worker', label: 'Factory Worker', labelTl: 'Manggagawa sa Pabrika' },
  { value: 'sales_representative', label: 'Sales Representative', labelTl: 'Sales Representative' },
  { value: 'office_staff', label: 'Office Staff', labelTl: 'Kawani sa Opisina' },
  { value: 'agricultural_worker', label: 'Agricultural Worker', labelTl: 'Manggagawa sa Agrikultura' },
  { value: 'beauty_parlor', label: 'Beauty Parlor', labelTl: 'Parlor/Panggagawa ng Ganda' },
  { value: 'plumber', label: 'Plumber', labelTl: 'Plumbero' },
  { value: 'other', label: 'Other', labelTl: 'Iba pa' },
];

export const JOB_VISIBILITY = [
  { value: 'public', label: 'Public', labelTl: 'Pampubliko', desc: 'Visible to everyone on the landing page', descTl: 'Makikita ng lahat sa landing page' },
  { value: 'agency_only', label: 'Agency Only', labelTl: 'Agency Lamang', desc: 'Visible only to your agency members', descTl: 'Makikita lamang ng miyembro ng agency' },
  { value: 'private', label: 'Private', labelTl: 'Pribado', desc: 'Hidden from public and applicants', descTl: 'Nakatago sa publiko at mga aplikante' },
] as const;

export const COUNTRIES = [
  'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Singapore', 'Hong Kong', 'Taiwan', 'Japan', 'South Korea', 'Malaysia',
  'Italy', 'Spain', 'United Kingdom', 'Canada', 'United States', 'Australia',
  'New Zealand', 'Brunei', 'Israel', 'Cyprus', 'Malta'
];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  staff: 'FIRA Staff',
  applicant: 'Applicant',
  local_agency: 'Agency Admin',
  international_agency: 'International Agency',
  employer: 'Employer',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  staff: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  applicant: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  local_agency: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  international_agency: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  employer: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
};

// Application form step definitions
export const FORM_STEPS = [
  { id: 'personal', label: 'Personal Info', labelTl: 'Impormasyon sa Pansarili', icon: 'User' },
  { id: 'family', label: 'Family Background', labelTl: 'Background ng Pamilya', icon: 'Users' },
  { id: 'education', label: 'Education', labelTl: 'Edukasyon', icon: 'GraduationCap' },
  { id: 'experience', label: 'Work Experience', labelTl: 'Karanasan sa Trabaho', icon: 'Briefcase' },
  { id: 'skills', label: 'Skills', labelTl: 'Kakayahan', icon: 'Star' },
  { id: 'languages', label: 'Languages', labelTl: 'Mga Wika', icon: 'Globe' },
  { id: 'certifications', label: 'Certifications', labelTl: 'Sertipikasyon', icon: 'Award' },
  { id: 'documents', label: 'Documents', labelTl: 'Mga Dokumento', icon: 'FileText' },
  { id: 'references', label: 'References', labelTl: 'Mga Sanggunian', icon: 'BookOpen' },
  { id: 'preferences', label: 'Preferences', labelTl: 'Kagustuhan', icon: 'Heart' },
  { id: 'review', label: 'Review & Submit', labelTl: 'Surin at Isumite', icon: 'CheckCircle' },
];