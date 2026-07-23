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
  | 'applicant-applications'
  | 'applicant-jobs'
  // Agency
  | 'agency-dashboard'
  | 'agency-applicants'
  | 'agency-jobs'
  | 'agency-endorsements'
  // Employer
  | 'employer-dashboard'
  | 'employer-jobs'
  | 'employer-endorsed'
  // FIRA Admin
  | 'fira-dashboard'
  | 'fira-agencies'
  | 'fira-employers'
  | 'fira-applicants'
  | 'fira-jobs'
  // ATS
  | 'ats-pipeline'
  // AI
  | 'ai-matching'
  | 'resume-enhancement'

export interface FiraUser {
  id: string
  email: string
  name: string
  role: 'applicant' | 'agency_admin' | 'agency_member' | 'fira' | 'employer'
  isActive: boolean
  isApproved: boolean
  phone?: string
  avatar?: string
}

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
    }),
    {
      name: 'fira_user',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Navigation items per role
export const getNavItems = (role: FiraUser['role']) => {
  const common = [
    { label: 'Dashboard', icon: 'LayoutDashboard', view: `${role}-dashboard` as ViewName },
  ]

  switch (role) {
    case 'applicant':
      return [
        ...common,
        { label: 'Find Jobs', icon: 'Search', view: 'applicant-jobs' as ViewName },
        { label: 'My Applications', icon: 'FileText', view: 'applicant-applications' as ViewName },
        { label: 'My Profile', icon: 'User', view: 'applicant-profile' as ViewName },
        { label: 'AI Resume Boost', icon: 'Sparkles', view: 'resume-enhancement' as ViewName },
      ]
    case 'agency_admin':
    case 'agency_member':
      return [
        ...common,
        { label: 'Jobs', icon: 'Briefcase', view: 'agency-jobs' as ViewName },
        { label: 'Applicants', icon: 'Users', view: 'agency-applicants' as ViewName },
        { label: 'Endorsements', icon: 'Send', view: 'agency-endorsements' as ViewName },
        { label: 'ATS Pipeline', icon: 'Columns', view: 'ats-pipeline' as ViewName },
      ]
    case 'employer':
      return [
        ...common,
        { label: 'My Jobs', icon: 'Briefcase', view: 'employer-jobs' as ViewName },
        { label: 'Endorsed Candidates', icon: 'UserCheck', view: 'employer-endorsed' as ViewName },
        { label: 'AI Matching', icon: 'Sparkles', view: 'ai-matching' as ViewName },
      ]
    case 'fira':
      return [
        ...common,
        { label: 'Agencies', icon: 'Building', view: 'fira-agencies' as ViewName },
        { label: 'Employers', icon: 'Building2', view: 'fira-employers' as ViewName },
        { label: 'Applicants', icon: 'Users', view: 'fira-applicants' as ViewName },
        { label: 'All Jobs', icon: 'Briefcase', view: 'fira-jobs' as ViewName },
        { label: 'ATS Pipeline', icon: 'Columns', view: 'ats-pipeline' as ViewName },
        { label: 'AI Matching', icon: 'Sparkles', view: 'ai-matching' as ViewName },
      ]
    default:
      return common
  }
}
