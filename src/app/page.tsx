'use client'

import { lazy, Suspense, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, type ViewName, getNavItems, getDashboardView } from '@/store/app-store'
import { AppNav } from '@/components/shared/app-nav'
import { AccessibilityToolbar } from '@/components/shared/accessibility-toolbar'
import { AuthModal } from '@/components/auth/auth-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, FileText, HelpCircle, MessageSquareQuote,
  Share2, Network, ScrollText, LayoutList, Settings, Search,
  Briefcase, Send, Columns, UserCog, Sparkles, User, Building, Building2,
  Home as HomeIcon, MessageCircle, UserCheck, ArrowLeft,
} from 'lucide-react'

// Lazy load all view components to reduce initial bundle
const LandingPage = lazy(() => import('@/components/landing/landing-page').then(m => ({ default: m.LandingPage })))
const AboutPage = lazy(() => import('@/components/landing/about-page').then(m => ({ default: m.AboutPage })))
const ServicesPage = lazy(() => import('@/components/landing/services-page').then(m => ({ default: m.ServicesPage })))
const FaqPage = lazy(() => import('@/components/landing/faq-page').then(m => ({ default: m.FaqPage })))
const ContactPage = lazy(() => import('@/components/landing/contact-page').then(m => ({ default: m.ContactPage })))
const TermsPublicPage = lazy(() => import('@/components/landing/terms-public-page').then(m => ({ default: m.TermsPublicPage })))
const EmployerPartnershipPage = lazy(() => import('@/components/landing/employer-partnership-page').then(m => ({ default: m.EmployerPartnershipPage })))
const JobListingPage = lazy(() => import('@/components/landing/job-listing-page').then(m => ({ default: m.JobListingPage })))
const JobDetailPage = lazy(() => import('@/components/landing/job-detail-page').then(m => ({ default: m.JobDetailPage })))
const ApplicantDashboard = lazy(() => import('@/components/dashboard/applicant-dashboard').then(m => ({ default: m.ApplicantDashboard })))
const ApplicantJobsPage = lazy(() => import('@/components/dashboard/applicant-jobs-page').then(m => ({ default: m.ApplicantJobsPage })))
const ApplicantApplicationsPage = lazy(() => import('@/components/dashboard/applicant-applications-page').then(m => ({ default: m.ApplicantApplicationsPage })))
const ApplicantProfilePage = lazy(() => import('@/components/dashboard/applicant-profile-page').then(m => ({ default: m.ApplicantProfilePage })))
const AgencyDashboard = lazy(() => import('@/components/dashboard/agency-dashboard').then(m => ({ default: m.AgencyDashboard })))
const AgencyApplicantsPage = lazy(() => import('@/components/dashboard/agency-applicants-page').then(m => ({ default: m.AgencyApplicantsPage })))
const AgencyJobsPage = lazy(() => import('@/components/dashboard/agency-jobs-page').then(m => ({ default: m.AgencyJobsPage })))
const AgencyEndorsementsPage = lazy(() => import('@/components/dashboard/agency-endorsements-page').then(m => ({ default: m.AgencyEndorsementsPage })))
const EmployerDashboard = lazy(() => import('@/components/dashboard/employer-dashboard').then(m => ({ default: m.EmployerDashboard })))
const EmployerJobsPage = lazy(() => import('@/components/dashboard/employer-jobs-page').then(m => ({ default: m.EmployerJobsPage })))
const EmployerEndorsedPage = lazy(() => import('@/components/dashboard/employer-endorsed-page').then(m => ({ default: m.EmployerEndorsedPage })))
const FiraDashboard = lazy(() => import('@/components/dashboard/fira-dashboard').then(m => ({ default: m.FiraDashboard })))
const FiraAgenciesPage = lazy(() => import('@/components/dashboard/fira-agencies-page').then(m => ({ default: m.FiraAgenciesPage })))
const FiraEmployersPage = lazy(() => import('@/components/dashboard/fira-employers-page').then(m => ({ default: m.FiraEmployersPage })))
const FiraApplicantsPage = lazy(() => import('@/components/dashboard/fira-applicants-page').then(m => ({ default: m.FiraApplicantsPage })))
const FiraJobsPage = lazy(() => import('@/components/dashboard/fira-jobs-page').then(m => ({ default: m.FiraJobsPage })))
const AtsPipelinePage = lazy(() => import('@/components/dashboard/ats-pipeline-page').then(m => ({ default: m.AtsPipelinePage })))
const AiMatchingPage = lazy(() => import('@/components/dashboard/ai-matching-page').then(m => ({ default: m.AiMatchingPage })))
const ResumeEnhancementPage = lazy(() => import('@/components/dashboard/resume-enhancement-page').then(m => ({ default: m.ResumeEnhancementPage })))
const CmsFaqPage = lazy(() => import('@/components/cms/cms-faq-page').then(m => ({ default: m.CmsFaqPage })))
const CmsTestimonialsPage = lazy(() => import('@/components/cms/cms-testimonials-page').then(m => ({ default: m.CmsTestimonialsPage })))
const CmsSocialPage = lazy(() => import('@/components/cms/cms-social-page').then(m => ({ default: m.CmsSocialPage })))
const CmsPagesPage = lazy(() => import('@/components/cms/cms-pages-page').then(m => ({ default: m.CmsPagesPage })))
const CmsTermsPage = lazy(() => import('@/components/cms/cms-terms-page').then(m => ({ default: m.CmsTermsPage })))
const CmsFormBuilderPage = lazy(() => import('@/components/cms/cms-form-builder-page').then(m => ({ default: m.CmsFormBuilderPage })))
const CmsOrgChartPage = lazy(() => import('@/components/cms/cms-org-chart-page').then(m => ({ default: m.CmsOrgChartPage })))
const CmsSettingsPage = lazy(() => import('@/components/cms/cms-settings-page').then(m => ({ default: m.CmsSettingsPage })))
const UserSettingsPage = lazy(() => import('@/components/shared/user-settings-page').then(m => ({ default: m.UserSettingsPage })))
const SuperAdminUsersPage = lazy(() => import('@/components/shared/super-admin-users-page').then(m => ({ default: m.SuperAdminUsersPage })))
const MessagingPage = lazy(() => import('@/components/shared/messaging-page').then(m => ({ default: m.MessagingPage })))

const publicViews: ViewName[] = ['landing', 'job-listing', 'job-detail', 'about', 'services', 'faq', 'contact', 'terms-public', 'employer-partnership']

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

const iconMap: Record<string, any> = {
  LayoutDashboard, Users, FileText, HelpCircle, MessageSquareQuote,
  Share2, Network, ScrollText, LayoutList, Settings, Search,
  Briefcase, Send, Columns, UserCog, Sparkles, User, Building, Building2, Home: HomeIcon,
  MessageCircle, UserCheck,
}

function DashboardSidebarWrapper() {
  const { user, currentView, navigate, language, sidebarOpen, setSidebarOpen } = useAppStore()
  const navItems = user ? getNavItems(user.role) : []

  if (!user) return null

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-1 p-3">
            {/* User info */}
            <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-3 dark:from-blue-950/50 dark:to-blue-900/50">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">{user.name}</p>
              <p className="text-xs text-blue-600 dark:text-blue-300 capitalize">
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Nav items */}
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard
              const isActive = currentView === item.view
              return (
                <button
                  key={item.view}
                  onClick={() => navigate(item.view)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:bg-blue-600 dark:text-white'
                      : 'hover:bg-accent text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-muted-foreground')} />
                  <span>{language === 'fil' ? item.labelFil : item.label}</span>
                </button>
              )
            })}

            {/* Settings at bottom */}
            <div className="mt-2 pt-2 border-t">
              <button
                onClick={() => navigate('user-settings')}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left hover:bg-accent text-muted-foreground"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>{language === 'fil' ? 'Mga Setting' : 'Account Settings'}</span>
              </button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}

function ViewRenderer({ view }: { view: ViewName }) {
  const isPublic = publicViews.includes(view)
  const navigate = useAppStore((s) => s.navigate)

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingPage />
      case 'about': return <AboutPage />
      case 'services': return <ServicesPage />
      case 'faq': return <FaqPage />
      case 'contact': return <ContactPage />
      case 'terms-public': return <TermsPublicPage />
      case 'employer-partnership': return <EmployerPartnershipPage />
      case 'job-listing': return <JobListingPage />
      case 'job-detail': return <JobDetailPage />
      case 'applicant-dashboard': return <ApplicantDashboard />
      case 'applicant-jobs': return <ApplicantJobsPage />
      case 'applicant-applications': return <ApplicantApplicationsPage />
      case 'applicant-profile': return <ApplicantProfilePage />
      case 'agency-dashboard': return <AgencyDashboard />
      case 'agency-applicants': return <AgencyApplicantsPage />
      case 'agency-jobs': return <AgencyJobsPage />
      case 'agency-endorsements': return <AgencyEndorsementsPage />
      case 'employer-dashboard': return <EmployerDashboard />
      case 'employer-jobs': return <EmployerJobsPage />
      case 'employer-endorsed': return <EmployerEndorsedPage />
      case 'fira-dashboard': return <FiraDashboard />
      case 'fira-agencies': return <FiraAgenciesPage />
      case 'fira-employers': return <FiraEmployersPage />
      case 'fira-applicants': return <FiraApplicantsPage />
      case 'fira-jobs': return <FiraJobsPage />
      case 'ats-pipeline': return <AtsPipelinePage />
      case 'ai-matching': return <AiMatchingPage />
      case 'resume-enhancement': return <ResumeEnhancementPage />
      case 'cms-pages': return <CmsPagesPage />
      case 'cms-faq': return <CmsFaqPage />
      case 'cms-testimonials': return <CmsTestimonialsPage />
      case 'cms-social': return <CmsSocialPage />
      case 'cms-org-chart': return <CmsOrgChartPage />
      case 'cms-terms': return <CmsTermsPage />
      case 'cms-form-builder': return <CmsFormBuilderPage />
      case 'cms-settings': return <CmsSettingsPage />
      case 'user-settings': return <UserSettingsPage />
      case 'super-admin-users': return <SuperAdminUsersPage />
      case 'messages': return <MessagingPage />
      case 'agency-members':
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-semibold">Agency Members - Coming Soon</h2>
            <Button variant="outline" onClick={() => navigate('agency-dashboard')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        )
      case 'applicant-profile-edit':
        return <ApplicantProfilePage />
      case 'fira-applicant-detail':
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-semibold">Applicant Detail - Coming Soon</h2>
            <Button variant="outline" onClick={() => navigate('fira-applicants')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        )
      case 'fira-job-create':
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-semibold">Create Job - Coming Soon</h2>
            <Button variant="outline" onClick={() => navigate('fira-jobs')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        )
      case 'agency-job-create':
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-semibold">Create Job - Coming Soon</h2>
            <Button variant="outline" onClick={() => navigate('agency-jobs')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        )
      case 'employer-candidate-detail':
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-semibold">Candidate Detail - Coming Soon</h2>
            <Button variant="outline" onClick={() => navigate('employer-endorsed')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        )
      default: return <LandingPage />
    }
  }

  if (isPublic) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={view}>
          <Suspense fallback={<LoadingSpinner />}>
            {renderView()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    )
  }

  const isFullWidth = view === 'messages'

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          className="flex-1 overflow-y-auto lg:ml-64"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {isFullWidth ? (
              <div className="p-4 md:p-6 h-full">
                {renderView()}
              </div>
            ) : (
              <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                {renderView()}
              </div>
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const { currentView, fontSize, user, navigate } = useAppStore()
  const redirected = useRef(false)

  // Auto-redirect logged-in users from public views to their dashboard
  useEffect(() => {
    if (user && !redirected.current && publicViews.includes(currentView)) {
      redirected.current = true
      const dashView = getDashboardView(user.role)
      navigate(dashView)
    }
    if (!user) {
      redirected.current = false
    }
  }, [user, currentView, navigate])

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontSize: `${fontSize}px` }}>
      <AppNav />
      <DashboardSidebarWrapper />
      <main className="flex-1">
        <ViewRenderer view={currentView} />
      </main>
      <AuthModal />
      <AccessibilityToolbar />
    </div>
  )
}
