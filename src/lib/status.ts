/**
 * Application Status System for FIRA
 * 
 * Defines all valid application statuses with:
 * - Bilingual labels (EN/FIL)
 * - Color coding for badges
 * - Category grouping
 * - Default transitions (which statuses can move to which)
 * - Role permissions (who can set which status)
 */

export interface StatusConfig {
  value: string
  label: { en: string; fil: string }
  color: string            // Tailwind classes for badge
  category: 'active' | 'success' | 'failure' | 'info'
  description: { en: string; fil: string }
  allowedBy: string[]     // Roles that can set this status
  nextStatuses: string[]  // Valid next statuses from this one
  isTerminal: boolean     // Can't be changed from this status
}

/**
 * Default application statuses.
 * Ordered by typical workflow progression.
 */
export const APPLICATION_STATUSES: StatusConfig[] = [
  {
    value: 'applied',
    label: { en: 'Applied', fil: 'Nag-apply' },
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    category: 'info',
    description: { en: 'Application submitted', fil: 'Naisumite ang aplikasyon' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['screening', 'shortlisted', 'under_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'screening',
    label: { en: 'Screening', fil: 'Pagsusuri' },
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    category: 'active',
    description: { en: 'Under initial review', fil: 'Nasa pagsusuri' },
    allowedBy: ['super_admin', 'staff', 'international_agency', 'local_agency'],
    nextStatuses: ['shortlisted', 'interview', 'under_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'shortlisted',
    label: { en: 'Shortlisted', fil: 'Naisala' },
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    category: 'active',
    description: { en: 'Selected for further consideration', fil: 'Napili para sa karagdagang pagsusuri' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['interview', 'assessment', 'under_review', 'pending_fira_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'interview',
    label: { en: 'Interview', fil: 'Panayam' },
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    category: 'active',
    description: { en: 'Scheduled for interview', fil: 'Nakatakdang panayam' },
    allowedBy: ['super_admin', 'staff', 'international_agency', 'local_agency'],
    nextStatuses: ['assessment', 'offered', 'pending_fira_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'assessment',
    label: { en: 'Assessment', fil: 'Pagsusulit' },
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    category: 'active',
    description: { en: 'Taking tests or assessments', fil: 'Kumukuha ng pagsusulit' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['offered', 'pending_fira_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'under_review',
    label: { en: 'Under Review', fil: 'Nasa Pagsusuri' },
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    category: 'active',
    description: { en: 'Being reviewed by FIRA', fil: 'Sinusuri ng FIRA' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['shortlisted', 'interview', 'pending_fira_review', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'pending_fira_review',
    label: { en: 'Pending FIRA Review', fil: 'Naghihintay ng Pagsusuri ng FIRA' },
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    category: 'active',
    description: { en: 'Awaiting FIRA review for endorsement', fil: 'Naghihintay ng pagsusuri ng FIRA para sa endorsement' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['fira_approved', 'fira_rejected', 'rejected', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'fira_approved',
    label: { en: 'FIRA Approved', fil: 'Na-aprubahan ng FIRA' },
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    category: 'success',
    description: { en: 'Approved by FIRA, ready for employer review', fil: 'Na-aprubahan ng FIRA, handa na para sa review ng employer' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['pending_employer_review', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'fira_rejected',
    label: { en: 'FIRA Rejected', fil: 'Hindi Na-aprubahan ng FIRA' },
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    category: 'failure',
    description: { en: 'Rejected by FIRA', fil: 'Hindi na-aprubahan ng FIRA' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['applied', 'screening', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'pending_employer_review',
    label: { en: 'Pending Employer Review', fil: 'Naghihintay ng Review ng Empleyador' },
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    category: 'active',
    description: { en: 'Endorsed to employer, awaiting response', fil: 'Inindorso sa empleyador, naghihintay ng sagot' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['employer_accepted', 'employer_declined', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'employer_accepted',
    label: { en: 'Employer Accepted', fil: 'Tinanggap ng Empleyador' },
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    category: 'success',
    description: { en: 'Employer accepted the candidate', fil: 'Tinanggap ng empleyador ang kandidato' },
    allowedBy: ['employer', 'super_admin', 'staff', 'international_agency'],
    nextStatuses: ['offered', 'processing', 'deployed', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'employer_declined',
    label: { en: 'Employer Declined', fil: 'Hindi Tinanggap ng Empleyador' },
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    category: 'failure',
    description: { en: 'Employer declined the candidate', fil: 'Hindi tinanggap ng empleyador ang kandidato' },
    allowedBy: ['employer', 'super_admin', 'staff', 'international_agency'],
    nextStatuses: ['withdrawn'],
    isTerminal: false,
  },
  {
    value: 'offered',
    label: { en: 'Offered', fil: 'May Offer' },
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    category: 'success',
    description: { en: 'Job offer extended', fil: 'Ipinakita ang job offer' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['hired', 'processing', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'hired',
    label: { en: 'Hired', fil: 'Nagawaran' },
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    category: 'success',
    description: { en: 'Candidate accepted the offer', fil: 'Tinanggap ng kandidato ang offer' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['processing', 'deployed'],
    isTerminal: false,
  },
  {
    value: 'processing',
    label: { en: 'Processing', fil: 'Pinoproseso' },
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    category: 'active',
    description: { en: 'Processing documents and requirements', fil: 'Pinoproseso ang mga dokumento at kinakailangan' },
    allowedBy: ['super_admin', 'staff', 'international_agency', 'local_agency'],
    nextStatuses: ['deployed', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'deployed',
    label: { en: 'Deployed', fil: 'Nadeploy' },
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
    category: 'success',
    description: { en: 'Successfully deployed to work site', fil: 'Matagumpay na nadeploy sa lugar ng trabaho' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['completed'],
    isTerminal: false,
  },
  {
    value: 'completed',
    label: { en: 'Completed', fil: 'Natapos' },
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    category: 'info',
    description: { en: 'Contract completed', fil: 'Natapos ang kontrata' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: [],
    isTerminal: true,
  },
  {
    value: 'rejected',
    label: { en: 'Rejected', fil: 'Hindi Tanggapin' },
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    category: 'failure',
    description: { en: 'Application rejected', fil: 'Hindi tinanggap ang aplikasyon' },
    allowedBy: ['super_admin', 'staff', 'international_agency'],
    nextStatuses: ['applied', 'withdrawn'],
    isTerminal: false,
  },
  {
    value: 'withdrawn',
    label: { en: 'Withdrawn', fil: 'Hinila' },
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    category: 'info',
    description: { en: 'Application withdrawn by applicant', fil: 'Hinila ng aplikante ang aplikasyon' },
    allowedBy: ['applicant', 'super_admin', 'staff', 'international_agency'],
    nextStatuses: [],
    isTerminal: true,
  },
]

/** Lookup map for quick access */
export const STATUS_MAP = Object.fromEntries(
  APPLICATION_STATUSES.map((s) => [s.value, s])
) as Record<string, StatusConfig>

/** Get valid next statuses for a given current status and role */
export function getNextStatuses(currentStatus: string, userRole: string): StatusConfig[] {
  const config = STATUS_MAP[currentStatus]
  if (!config || config.isTerminal) return []
  return APPLICATION_STATUSES.filter(
    (s) =>
      config.nextStatuses.includes(s.value) && s.allowedBy.includes(userRole)
  )
}

/** Check if a user role can set a specific status */
export function canSetStatus(status: string, userRole: string): boolean {
  const config = STATUS_MAP[status]
  return config ? config.allowedBy.includes(userRole) : false
}

/** Get status label (bilingual) */
export function getStatusLabel(status: string, isFil: boolean): string {
  const config = STATUS_MAP[status]
  if (!config) return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return isFil ? config.label.fil : config.label.en
}

/** Get status color classes */
export function getStatusColor(status: string): string {
  return STATUS_MAP[status]?.color || 'bg-muted text-muted-foreground border-border'
}

/** Get statuses grouped by category */
export function getStatusesByCategory() {
  const categories = { active: [], success: [], failure: [], info: [] } as Record<
    string,
    StatusConfig[]
  >
  for (const s of APPLICATION_STATUSES) {
    categories[s.category].push(s)
  }
  return categories
}

/** Default status when a new application is created */
export const DEFAULT_APPLICATION_STATUS = 'applied'
