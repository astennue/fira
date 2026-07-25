import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewName =
  // Public
  | 'landing'
  | 'job-listing'
  | 'job-detail'
  | 'about'
  | 'services'
  | 'faq'
  | 'contact'
  | 'terms-public'
  | 'employer-partnership'
  // Auth
  | 'login'
  | 'register'
  // Applicant
  | 'applicant-dashboard'
  | 'applicant-profile'
  | 'applicant-profile-edit'
  | 'applicant-applications'
  | 'applicant-jobs'
  // Local Agency (PH)
  | 'agency-dashboard'
  | 'agency-applicants'
  | 'agency-applicant-detail'
  | 'agency-jobs'
  | 'agency-job-create'
  | 'agency-endorsements'
  | 'agency-members'
  // International Agency / FIRA
  | 'fira-dashboard'
  | 'fira-agencies'
  | 'fira-employers'
  | 'fira-applicants'
  | 'fira-applicant-detail'
  | 'fira-jobs'
  | 'fira-job-create'
  // Employer
  | 'employer-dashboard'
  | 'employer-jobs'
  | 'employer-endorsed'
  | 'employer-candidate-detail'
  // ATS
  | 'ats-pipeline'
  // AI
  | 'ai-matching'
  | 'resume-enhancement'
  // CMS Admin
  | 'cms-pages'
  | 'cms-faq'
  | 'cms-testimonials'
  | 'cms-social'
  | 'cms-org-chart'
  | 'cms-terms'
  | 'cms-form-builder'
  | 'cms-settings'
  // User
  | 'user-settings'
  // Super Admin
  | 'super-admin-users'

export type UserRole = 'super_admin' | 'applicant' | 'local_agency' | 'international_agency' | 'employer'

export type FontSize = 'small' | 'medium' | 'large'

export interface FiraUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  isApproved: boolean
  phone?: string
  avatar?: string
  agencyId?: string
  agencyName?: string
}

export type Language = 'en' | 'fil'

interface AppState {
  // Auth
  user: FiraUser | null
  setUser: (user: FiraUser | null) => void
  logout: () => void

  // Navigation
  currentView: ViewName
  viewParams: Record<string, string>
  navigate: (view: ViewName, params?: Record<string, string>) => void

  // UI State
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean, defaultTab?: 'login' | 'register') => void
  authModalDefaultTab: 'login' | 'register'
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Font Size
  fontSize: FontSize
  setFontSize: (size: FontSize) => void

  // Language
  language: Language
  setLanguage: (lang: Language) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, currentView: 'landing', viewParams: {} }),

      // Navigation
      currentView: 'landing',
      viewParams: {},
      navigate: (view, params = {}) =>
        set({ currentView: view, viewParams: params, sidebarOpen: false }),

      // UI State
      authModalOpen: false,
      authModalDefaultTab: 'login' as const,
      setAuthModalOpen: (open, defaultTab) => set({ authModalOpen: open, authModalDefaultTab: defaultTab || 'login' }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Font Size
      fontSize: 'medium',
      setFontSize: (fontSize) => set({ fontSize }),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'fira_store',
      partialize: (state) => ({ user: state.user, language: state.language, fontSize: state.fontSize }),
    }
  )
)

// Bilingual labels
const labels: Record<string, Record<Language, string>> = {
  'Dashboard': { en: 'Dashboard', fil: 'Dashboard' },
  'Find Jobs': { en: 'Find Jobs', fil: 'Maghanap ng Trabaho' },
  'My Applications': { en: 'My Applications', fil: 'Ang Mga Aplikasyon Ko' },
  'My Profile': { en: 'My Profile', fil: 'Ang Profile Ko' },
  'Complete Profile': { en: 'Complete Profile', fil: 'Kumpletuhin ang Profile' },
  'AI Resume Boost': { en: 'AI Resume Boost', fil: 'AI Resume Boost' },
  'Jobs': { en: 'Jobs', fil: 'Mga Trabaho' },
  'Create Job': { en: 'Create Job', fil: 'Gumawa ng Trabaho' },
  'Applicants': { en: 'Applicants', fil: 'Mga Aplikante' },
  'Endorsements': { en: 'Endorsements', fil: 'Mga Endorso' },
  'ATS Pipeline': { en: 'ATS Pipeline', fil: 'ATS Pipeline' },
  'Members': { en: 'Members', fil: 'Miyembro' },
  'Agencies': { en: 'Agencies', fil: 'Mga Ahensya' },
  'Employers': { en: 'Employers', fil: 'Mga Empleyador' },
  'All Jobs': { en: 'All Jobs', fil: 'Lahat ng Trabaho' },
  'Endorsed Candidates': { en: 'Endorsed Candidates', fil: 'Mga Inindorso' },
  'AI Matching': { en: 'AI Matching', fil: 'AI Matching' },
  'Sign Out': { en: 'Sign Out', fil: 'Mag-logout' },
  'Profile': { en: 'Profile', fil: 'Profile' },
  // CMS labels
  'Manage Users': { en: 'Manage Users', fil: 'Pamahalaan ang Users' },
  'CMS Pages': { en: 'CMS Pages', fil: 'Mga Pahina' },
  'FAQ Management': { en: 'FAQ Management', fil: 'Pamahalaan ng FAQ' },
  'Testimonials': { en: 'Testimonials', fil: 'Mga Testimonial' },
  'Social Media': { en: 'Social Media', fil: 'Social Media' },
  'Org Chart': { en: 'Org Chart', fil: 'Org Chart' },
  'Terms & Privacy': { en: 'Terms & Privacy', fil: 'Mga Tahunan at Privacy' },
  'Form Builder': { en: 'Form Builder', fil: 'Form Builder' },
  'Site Settings': { en: 'Site Settings', fil: 'Settings ng Site' },
  'Settings': { en: 'Settings', fil: 'Settings' },
  // Landing page
  'landing.hero.title': { en: 'Your Gateway to', fil: 'Ang Iyong Daan Patungo sa' },
  'landing.hero.titleHighlight': { en: 'Opportunities Abroad', fil: 'Opportunitya sa Labas ng Bansa' },
  'landing.hero.subtitle': { en: 'FIRA connects Filipino workers with trusted employers worldwide. Find your dream job and start a better life for your family.', fil: 'Ang FIRA ay nag-uugnay ng mga manggagawang Pilipino sa mga mapagkakatiwalaang empleyador sa buong mundo. Hanapin ang iyong pangarap na trabaho at simulan ang mas magandang buhay para sa iyong pamilya.' },
  'landing.hero.searchPlaceholder': { en: 'Search by job title, country, or keyword...', fil: 'Maghanap ayon sa posisyon, bansa, o keyword...' },
  'landing.hero.searchBtn': { en: 'Search', fil: 'Hanapin' },
  'landing.hero.cta1': { en: 'Browse All Jobs', fil: 'Tingnan Lahat ng Trabaho' },
  'landing.hero.cta2': { en: 'Sign In to Apply', fil: 'Mag-sign In para Mag-apply' },
  'landing.howItWorks.title': { en: 'How It Works', fil: 'Paano ito Gumagana' },
  'landing.howItWorks.subtitle': { en: 'Three simple steps to start your journey abroad', fil: 'Tatlong simpleng hakbang upang simulan ang iyong paglalakbay' },
  'landing.howItWorks.step1Title': { en: 'Create Your Profile', fil: 'Gumawa ng Profile' },
  'landing.howItWorks.step1Desc': { en: 'Sign up and complete your profile with your skills, experience, and documents.', fil: 'Magparehistro at kumpletuhin ang iyong profile kasama ang iyong mga kasanayan, karanasan, at mga dokumento.' },
  'landing.howItWorks.step2Title': { en: 'Find & Apply', fil: 'Hanapin at Mag-apply' },
  'landing.howItWorks.step2Desc': { en: 'Browse verified job openings from trusted employers around the world.', fil: 'Mag-browse sa mga na-verify na trabaho mula sa mga mapagkakatiwalaang empleyador sa buong mundo.' },
  'landing.howItWorks.step3Title': { en: 'Get Hired', fil: 'Maging Hired' },
  'landing.howItWorks.step3Desc': { en: 'Our AI matches you with the best opportunities. Complete the process and get deployed.', fil: 'Ang aming AI ay nag-match sa iyo sa mga pinakamahusay na opportunity. Kumpletuhin ang proseso at maging deployed.' },
  'landing.stats.title': { en: 'Trusted by Thousands', fil: 'Pinagkakatiwalaan ng Libo-libo' },
  'landing.stats.subtitle': { en: 'Numbers that speak for themselves', fil: 'Mga numero na nagsasalita para sa sarili nila' },
  'landing.stats.deployed': { en: 'OFWs Deployed', fil: 'Mga Na-deploy na OFW' },
  'landing.stats.employers': { en: 'Partner Employers', fil: 'Mga Partner na Empleyador' },
  'landing.stats.countries': { en: 'Countries', fil: 'Mga Bansa' },
  'landing.stats.satisfaction': { en: 'Satisfaction Rate', fil: 'Rate ng Kasiyahan' },
  'landing.featured.title': { en: 'Featured Job Openings', fil: 'Mga Itinatampok na Trabaho' },
  'landing.featured.subtitle': { en: 'Latest verified positions from our partner employers', fil: 'Mga pinakabagong na-verify na posisyon mula sa aming mga partner' },
  'landing.featured.viewAll': { en: 'View All Jobs', fil: 'Tingnan Lahat ng Trabaho' },
  'landing.featured.noJobs': { en: 'No featured jobs available right now. Check back soon!', fil: 'Wala pang itinatampok na trabaho. Balikan muli sa lalong madaling panahon!' },
  'landing.footer.description': { en: 'Fil International Recruitment Agency (FIRA) — Based in Casablanca, Morocco. We recruit, deploy, monitor, and deliver results for Filipino workers seeking opportunities abroad.', fil: 'Ang Fil International Recruitment Agency (FIRA) — Nakabase sa Casablanca, Morocco. Nagnanakaw kami, nag-deploy, nag-monitor, at nagbibigay ng resulta para sa mga manggagawang Pilipino.' },
  'landing.footer.quickLinks': { en: 'Quick Links', fil: 'Mabilis na Link' },
  'landing.footer.contact': { en: 'Contact Us', fil: 'Makipag-ugnay' },
  'landing.footer.rights': { en: 'All rights reserved.', fil: 'Lahat ng karapatan ay nakalaan.' },
  'landing.footer.address': { en: '59 Boulevard Zerktouni, Casablanca, Morocco', fil: '59 Boulevard Zerktouni, Casablanca, Morocco' },
  'landing.footer.email': { en: 'manpower@filinternational.ma', fil: 'manpower@filinternational.ma' },
  // Job listing
  'jobs.searchPlaceholder': { en: 'Search jobs...', fil: 'Maghanap ng trabaho...' },
  'jobs.searchBtn': { en: 'Search', fil: 'Hanapin' },
  'jobs.allCountries': { en: 'All Countries', fil: 'Lahat ng Bansa' },
  'jobs.allCategories': { en: 'All Categories', fil: 'Lahat ng Kategorya' },
  'jobs.allTypes': { en: 'All Types', fil: 'Lahat ng Uri' },
  'jobs.results': { en: 'jobs found', fil: 'natagpuang trabaho' },
  'jobs.noResults': { en: 'No jobs found matching your criteria. Try adjusting your filters.', fil: 'Walang natagpuang trabaho. Subukan mong baguhin ang iyong mga filter.' },
  'jobs.slots': { en: 'slots', fil: 'slot' },
  'jobs.slot': { en: 'slot', fil: 'slot' },
  'jobs.applicants': { en: 'applicants', fil: 'aplikante' },
  'jobs.posted': { en: 'Posted', fil: 'Nai-post' },
  'jobs.salary': { en: 'Salary', fil: 'Sahod' },
  'jobs.perMonth': { en: '/month', fil: '/buwan' },
  'jobs.fullTime': { en: 'Full Time', fil: 'Full Time' },
  'jobs.partTime': { en: 'Part Time', fil: 'Part Time' },
  'jobs.contract': { en: 'Contract', fil: 'Kontrata' },
  // Job detail
  'job.back': { en: 'Back to Jobs', fil: 'Bumalik sa Trabaho' },
  'job.apply': { en: 'Apply Now', fil: 'Mag-apply Na' },
  'job.signInToApply': { en: 'Sign in to apply for this job', fil: 'Mag-sign in para mag-apply sa trabahong ito' },
  'job.signInBtn': { en: 'Sign In', fil: 'Mag-sign In' },
  'job.requirements': { en: 'Requirements', fil: 'Mga Kinakailangan' },
  'job.benefits': { en: 'Benefits', fil: 'Mga Benepisyo' },
  'job.skills': { en: 'Required Skills', fil: 'Mga Kinakailangang Kasanayan' },
  'job.customFields': { en: 'Additional Information', fil: 'Karagdagang Impormasyon' },
  'job.overview': { en: 'Job Overview', fil: 'Pangkalahatang-ideya ng Trabaho' },
  'job.location': { en: 'Location', fil: 'Lokasyon' },
  'job.category': { en: 'Category', fil: 'Kategorya' },
  'job.contractType': { en: 'Contract Type', fil: 'Uri ng Kontrata' },
  'job.duration': { en: 'Duration', fil: 'Tagal' },
  'job.deadline': { en: 'Application Deadline', fil: 'Huling Araw ng Pag-apply' },
  'job.employer': { en: 'Employer', fil: 'Empleyador' },
  'job.slotsAvailable': { en: 'Slots Available', fil: 'Mga Available na Slot' },
  'job.noRequirements': { en: 'No specific requirements listed.', fil: 'Walang nakalist na mga kinakailangan.' },
  'job.noBenefits': { en: 'No benefits listed.', fil: 'Walang nakalist na benepisyo.' },
  'job.noSkills': { en: 'No skills listed.', fil: 'Walang nakalist na kasanayan.' },
  'job.open': { en: 'Open', fil: 'Bukas' },
  'job.closed': { en: 'Closed', fil: 'Sarado' },
  'job.filled': { en: 'Filled', fil: 'Napunan Na' },
  // Dashboard common
  'dash.activeJobs': { en: 'Active Jobs', fil: 'Mga Aktibong Trabaho' },
  'dash.totalApplicants': { en: 'Total Applicants', fil: 'Kabuuang Aplikante' },
  'dash.pendingEndorsements': { en: 'Pending Endorsements', fil: 'Pending na Endorso' },
  'dash.firaApproved': { en: 'FIRA Approved', fil: 'Na-aprubahan ng FIRA' },
  'dash.endorsedCandidates': { en: 'Endorsed Candidates', fil: 'Mga Inindorsong Kandidato' },
  'dash.accepted': { en: 'Accepted', fil: 'Tinanggap' },
  'dash.recentJobs': { en: 'Recent Jobs', fil: 'Mga Kamakailang Trabaho' },
  'dash.recentApplications': { en: 'Recent Applications', fil: 'Mga Kamakailang Aplikasyon' },
  'dash.recentEndorsed': { en: 'Recent Endorsed', fil: 'Mga Kamakailang Inindorso' },
  'dash.quickActions': { en: 'Quick Actions', fil: 'Mabilis na Aksyon' },
  'dash.manageJobs': { en: 'Manage Jobs', fil: 'Pamahalaan ang Trabaho' },
  'dash.viewApplicants': { en: 'View Applicants', fil: 'Tingnan ang Mga Aplikante' },
  'dash.noJobsYet': { en: 'No jobs posted yet.', fil: 'Wala pang na-post na trabaho.' },
  'dash.noApplicants': { en: 'No applicants yet.', fil: 'Wala pang aplikante.' },
  'dash.noEndorsements': { en: 'No endorsements yet.', fil: 'Wala pang endorso.' },
  'dash.noData': { en: 'No data available.', fil: 'Walang available na datos.' },
  'dash.viewAll': { en: 'View All', fil: 'Tingnan Lahat' },
  'dash.searchApplicants': { en: 'Search applicants...', fil: 'Maghanap ng aplikante...' },
  'dash.searchJobs': { en: 'Search jobs...', fil: 'Maghanap ng trabaho...' },
  'dash.searchAgencies': { en: 'Search agencies...', fil: 'Maghanap ng ahensya...' },
  'dash.searchEmployers': { en: 'Search employers...', fil: 'Maghanap ng empleyador...' },
  'dash.createJob': { en: 'Create New Job', fil: 'Gumawa ng Bagong Trabaho' },
  'dash.applicantType': { en: 'Applicant Type', fil: 'Uri ng Aplikante' },
  'dash.domesticHelper': { en: 'Domestic Helper', fil: 'Domestic Helper' },
  'dash.skillsProfessional': { en: 'Skills Professional', fil: 'Skills Professional' },
  'dash.preferredCountry': { en: 'Preferred Country', fil: 'Preferensyang Bansa' },
  'dash.profileCompletion': { en: 'Profile Completion', fil: 'Pagkumpleto ng Profile' },
  'dash.allTypes': { en: 'All Types', fil: 'Lahat ng Uri' },
  'dash.coverNote': { en: 'Cover Note', fil: 'Cover Note' },
  'dash.agencyNote': { en: 'Agency Note', fil: 'Nota ng Ahensya' },
  'dash.firaNote': { en: 'FIRA Note', fil: 'Nota ng FIRA' },
  'dash.employerNote': { en: 'Employer Note', fil: 'Nota ng Empleyador' },
  'dash.endorse': { en: 'Endorse', fil: 'I-endorso' },
  'dash.accept': { en: 'Accept', fil: 'Tanggapin' },
  'dash.decline': { en: 'Decline', fil: 'Tanggihan' },
  'dash.approve': { en: 'Approve', fil: 'Aprubahan' },
  'dash.reject': { en: 'Reject', fil: 'Huwag Aprubahan' },
  // Endorsement statuses
  'status.pending_fira_review': { en: 'Pending FIRA Review', fil: 'Pending Review ng FIRA' },
  'status.fira_approved': { en: 'FIRA Approved', fil: 'Na-aprubahan ng FIRA' },
  'status.fira_rejected': { en: 'FIRA Rejected', fil: 'Hinagisan ng FIRA' },
  'status.pending_employer_review': { en: 'Pending Employer Review', fil: 'Pending Review ng Empleyador' },
  'status.employer_accepted': { en: 'Employer Accepted', fil: 'Tinanggap ng Empleyador' },
  'status.employer_declined': { en: 'Employer Declined', fil: 'Tinanggihan ng Empleyador' },
  // FIRA Dashboard
  'dash.totalAgencies': { en: 'Total Agencies', fil: 'Kabuuang Ahensya' },
  'dash.totalEmployers': { en: 'Total Employers', fil: 'Kabuuang Empleyador' },
  'dash.totalApplicantsAll': { en: 'Total Applicants', fil: 'Kabuuang Aplikante' },
  'dash.totalJobs': { en: 'Total Jobs', fil: 'Kabuuang Trabaho' },
  'dash.pendingApprovals': { en: 'Pending Approvals', fil: 'Pending na Aprubado' },
  'dash.companyName': { en: 'Company Name', fil: 'Pangalan ng Kumpanya' },
  'dash.country': { en: 'Country', fil: 'Bansa' },
  'dash.industry': { en: 'Industry', fil: 'Industriya' },
  'dash.licenseNo': { en: 'License No.', fil: 'No. ng Lisensya' },
  'dash.localAgency': { en: 'Local Agency', fil: 'Lokal na Ahensya' },
  'dash.internationalAgency': { en: 'International Agency', fil: 'Internasyonal na Ahensya' },
  'dash.allAgencies': { en: 'All Agencies', fil: 'Lahat ng Ahensya' },
  'dash.approved': { en: 'Approved', fil: 'Na-aprubahan' },
  'dash.pending': { en: 'Pending', fil: 'Pending' },
  'dash.rejected': { en: 'Rejected', fil: 'Hinagisan' },
  'dash.allStatuses': { en: 'All Statuses', fil: 'Lahat ng Status' },
  // ATS
  'ats.selectJob': { en: 'Select a Job Order', fil: 'Pumili ng Job Order' },
  'ats.noJobSelected': { en: 'Select a job order to view its pipeline', fil: 'Pumili ng job order para makita ang pipeline' },
  'ats.noApplications': { en: 'No applications in this stage', fil: 'Walang aplikasyon sa stage na ito' },
  'ats.matchScore': { en: 'Match Score', fil: 'Match Score' },
  'ats.dateApplied': { en: 'Applied', fil: 'Na-apply' },
  // AI Matching
  'ai.selectJob': { en: 'Select Job Order', fil: 'Pumili ng Job Order' },
  'ai.runMatching': { en: 'Run AI Matching', fil: 'I-run ang AI Matching' },
  'ai.running': { en: 'Running AI Match...', fil: 'Tinatakbo ang AI Match...' },
  'ai.noResults': { en: 'No matching results yet. Run AI Matching to see ranked candidates.', fil: 'Wala pang resulta. I-run ang AI Matching para makita ang mga na-rank na kandidato.' },
  'ai.matchedSkills': { en: 'Matched Skills', fil: 'Mga Na-match na Kasanayan' },
  'ai.missingSkills': { en: 'Missing Skills', fil: 'Mga Kulang na Kasanayan' },
  'ai.explanation': { en: 'Explanation', fil: 'Paliwanag' },
  'ai.score': { en: 'Score', fil: 'Score' },
  'ai.rankedCandidates': { en: 'Ranked Candidates', fil: 'Mga Na-rank na Kandidato' },
  // Resume Enhancement
  'resume.jobDesc': { en: 'Job Description', fil: 'Deskripsyon ng Trabaho' },
  'resume.jobDescPlaceholder': { en: 'Paste the job description here...', fil: 'I-paste ang deskripsyon ng trabaho dito...' },
  'resume.currentResume': { en: 'Current Resume', fil: 'Kasalukuyang Resume' },
  'resume.currentResumePlaceholder': { en: 'Paste your current resume text here...', fil: 'I-paste ang kasalukuyang resume dito...' },
  'resume.enhance': { en: 'Enhance Resume', fil: 'Pahusayin ang Resume' },
  'resume.enhancing': { en: 'Enhancing your resume...', fil: 'Pinapahusay ang iyong resume...' },
  'resume.enhanced': { en: 'Enhanced Resume', fil: 'Pinahusay na Resume' },
  'resume.changesSummary': { en: 'Changes Summary', fil: 'Buod ng Mga Pagbabago' },
  'resume.noResult': { en: 'Your enhanced resume will appear here.', fil: 'Ang iyong pinahusay na resume ay lalabas dito.' },
}

export function t(key: string, lang?: Language): string {
  const state = useAppStore.getState()
  const language = lang || state.language
  return labels[key]?.[language] || key
}

export function useT() {
  const language = useAppStore((s) => s.language)
  return (key: string) => t(key, language)
}

// Navigation items per role
interface NavItem {
  label: string
  labelFil: string
  icon: string
  view: ViewName
}

export const getNavItems = (role: UserRole): NavItem[] => {
  const common = [
    { label: 'Dashboard', labelFil: 'Dashboard', icon: 'LayoutDashboard', view: `${role === 'super_admin' ? 'fira' : role}-dashboard` as ViewName },
  ]

  switch (role) {
    case 'super_admin':
      return [
        ...common,
        { label: 'Manage Users', labelFil: 'Pamahalaan ang Users', icon: 'Users', view: 'super-admin-users' as ViewName },
        { label: 'CMS Pages', labelFil: 'Mga Pahina', icon: 'FileText', view: 'cms-pages' as ViewName },
        { label: 'FAQ Management', labelFil: 'Pamahalaan ng FAQ', icon: 'HelpCircle', view: 'cms-faq' as ViewName },
        { label: 'Testimonials', labelFil: 'Mga Testimonial', icon: 'MessageSquareQuote', view: 'cms-testimonials' as ViewName },
        { label: 'Social Media', labelFil: 'Social Media', icon: 'Share2', view: 'cms-social' as ViewName },
        { label: 'Org Chart', labelFil: 'Org Chart', icon: 'Network', view: 'cms-org-chart' as ViewName },
        { label: 'Terms & Privacy', labelFil: 'Mga Tahunan at Privacy', icon: 'ScrollText', view: 'cms-terms' as ViewName },
        { label: 'Form Builder', labelFil: 'Form Builder', icon: 'LayoutList', view: 'cms-form-builder' as ViewName },
        { label: 'Site Settings', labelFil: 'Settings ng Site', icon: 'Settings', view: 'cms-settings' as ViewName },
      ]
    case 'applicant':
      return [
        ...common,
        { label: 'Find Jobs', labelFil: 'Maghanap ng Trabaho', icon: 'Search', view: 'applicant-jobs' as ViewName },
        { label: 'My Applications', labelFil: 'Ang Mga Aplikasyon Ko', icon: 'FileText', view: 'applicant-applications' as ViewName },
        { label: 'My Profile', labelFil: 'Ang Profile Ko', icon: 'User', view: 'applicant-profile' as ViewName },
        { label: 'AI Resume Boost', labelFil: 'AI Resume Boost', icon: 'Sparkles', view: 'resume-enhancement' as ViewName },
        { label: 'Settings', labelFil: 'Settings', icon: 'Settings', view: 'user-settings' as ViewName },
      ]
    case 'local_agency':
      return [
        ...common,
        { label: 'Jobs', labelFil: 'Mga Trabaho', icon: 'Briefcase', view: 'agency-jobs' as ViewName },
        { label: 'Applicants', labelFil: 'Mga Aplikante', icon: 'Users', view: 'agency-applicants' as ViewName },
        { label: 'Endorsements', labelFil: 'Mga Endorso', icon: 'Send', view: 'agency-endorsements' as ViewName },
        { label: 'ATS Pipeline', labelFil: 'ATS Pipeline', icon: 'Columns', view: 'ats-pipeline' as ViewName },
        { label: 'Members', labelFil: 'Miyembro', icon: 'UserCog', view: 'agency-members' as ViewName },
        { label: 'Settings', labelFil: 'Settings', icon: 'Settings', view: 'user-settings' as ViewName },
      ]
    case 'international_agency':
      return [
        ...common,
        { label: 'Agencies', labelFil: 'Mga Ahensya', icon: 'Building', view: 'fira-agencies' as ViewName },
        { label: 'Employers', labelFil: 'Mga Empleyador', icon: 'Building2', view: 'fira-employers' as ViewName },
        { label: 'Applicants', labelFil: 'Mga Aplikante', icon: 'Users', view: 'fira-applicants' as ViewName },
        { label: 'All Jobs', labelFil: 'Lahat ng Trabaho', icon: 'Briefcase', view: 'fira-jobs' as ViewName },
        { label: 'ATS Pipeline', labelFil: 'ATS Pipeline', icon: 'Columns', view: 'ats-pipeline' as ViewName },
        { label: 'AI Matching', labelFil: 'AI Matching', icon: 'Sparkles', view: 'ai-matching' as ViewName },
        { label: 'Settings', labelFil: 'Settings', icon: 'Settings', view: 'user-settings' as ViewName },
      ]
    case 'employer':
      return [
        ...common,
        { label: 'My Jobs', labelFil: 'Mga Trabaho Ko', icon: 'Briefcase', view: 'employer-jobs' as ViewName },
        { label: 'Endorsed Candidates', labelFil: 'Mga Inindorso', icon: 'UserCheck', view: 'employer-endorsed' as ViewName },
        { label: 'AI Matching', labelFil: 'AI Matching', icon: 'Sparkles', view: 'ai-matching' as ViewName },
        { label: 'Settings', labelFil: 'Settings', icon: 'Settings', view: 'user-settings' as ViewName },
      ]
    default:
      return common
  }
}

export const roleDisplayNames: Record<UserRole, { en: string; fil: string }> = {
  super_admin: { en: 'Super Admin', fil: 'Super Admin' },
  applicant: { en: 'Applicant', fil: 'Aplikante' },
  local_agency: { en: 'Local Agency', fil: 'Ahensya (PH)' },
  international_agency: { en: 'FIRA Admin', fil: 'Admin ng FIRA' },
  employer: { en: 'Employer', fil: 'Empleyador' },
}
