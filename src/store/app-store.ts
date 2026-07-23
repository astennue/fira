import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewName =
  // Public
  | 'landing'
  | 'job-listing'
  | 'job-detail'
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

export type UserRole = 'applicant' | 'local_agency' | 'international_agency' | 'employer'

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
  setAuthModalOpen: (open: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

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
      setAuthModalOpen: (open) => set({ authModalOpen: open }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'fira_store',
      partialize: (state) => ({ user: state.user, language: state.language }),
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
  'landing.footer.description': { en: 'FIRA (Fil International Recruitment Agency) is a trusted platform connecting Filipino workers with global employment opportunities.', fil: 'Ang FIRA (Fil International Recruitment Agency) ay isang mapagkakatiwalaang platform na nag-uugnay ng mga manggagawang Pilipino sa mga opportunity sa buong mundo.' },
  'landing.footer.quickLinks': { en: 'Quick Links', fil: 'Mabilis na Link' },
  'landing.footer.contact': { en: 'Contact Us', fil: 'Makipag-ugnay' },
  'landing.footer.rights': { en: 'All rights reserved.', fil: 'Lahat ng karapatan ay nakalaan.' },
  'landing.footer.address': { en: 'Makati City, Metro Manila, Philippines', fil: 'Makati City, Metro Manila, Pilipinas' },
  'landing.footer.email': { en: 'info@fira.com.ph', fil: 'info@fira.com.ph' },
  'landing.footer.phone': { en: '+63 2 8888 1234', fil: '+63 2 8888 1234' },
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
    { label: 'Dashboard', labelFil: 'Dashboard', icon: 'LayoutDashboard', view: `${role}-dashboard` as ViewName },
  ]

  switch (role) {
    case 'applicant':
      return [
        ...common,
        { label: 'Find Jobs', labelFil: 'Maghanap ng Trabaho', icon: 'Search', view: 'applicant-jobs' as ViewName },
        { label: 'My Applications', labelFil: 'Ang Mga Aplikasyon Ko', icon: 'FileText', view: 'applicant-applications' as ViewName },
        { label: 'My Profile', labelFil: 'Ang Profile Ko', icon: 'User', view: 'applicant-profile' as ViewName },
        { label: 'AI Resume Boost', labelFil: 'AI Resume Boost', icon: 'Sparkles', view: 'resume-enhancement' as ViewName },
      ]
    case 'local_agency':
      return [
        ...common,
        { label: 'Jobs', labelFil: 'Mga Trabaho', icon: 'Briefcase', view: 'agency-jobs' as ViewName },
        { label: 'Applicants', labelFil: 'Mga Aplikante', icon: 'Users', view: 'agency-applicants' as ViewName },
        { label: 'Endorsements', labelFil: 'Mga Endorso', icon: 'Send', view: 'agency-endorsements' as ViewName },
        { label: 'ATS Pipeline', labelFil: 'ATS Pipeline', icon: 'Columns', view: 'ats-pipeline' as ViewName },
        { label: 'Members', labelFil: 'Miyembro', icon: 'UserCog', view: 'agency-members' as ViewName },
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
      ]
    case 'employer':
      return [
        ...common,
        { label: 'My Jobs', labelFil: 'Mga Trabaho Ko', icon: 'Briefcase', view: 'employer-jobs' as ViewName },
        { label: 'Endorsed Candidates', labelFil: 'Mga Inindorso', icon: 'UserCheck', view: 'employer-endorsed' as ViewName },
        { label: 'AI Matching', labelFil: 'AI Matching', icon: 'Sparkles', view: 'ai-matching' as ViewName },
      ]
    default:
      return common
  }
}

export const roleDisplayNames: Record<UserRole, { en: string; fil: string }> = {
  applicant: { en: 'Applicant', fil: 'Aplikante' },
  local_agency: { en: 'Local Agency', fil: 'Ahensya (PH)' },
  international_agency: { en: 'FIRA Admin', fil: 'Admin ng FIRA' },
  employer: { en: 'Employer', fil: 'Empleyador' },
}
