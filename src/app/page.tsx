'use client'

import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, type ViewName } from '@/store/app-store'
import { AppNav } from '@/components/shared/app-nav'
import { AuthModal } from '@/components/auth/auth-modal'

// Lazy load all view components to reduce initial bundle
const LandingPage = lazy(() => import('@/components/landing/landing-page').then(m => ({ default: m.LandingPage })))
const AboutPage = lazy(() => import('@/components/landing/about-page').then(m => ({ default: m.AboutPage })))
const ServicesPage = lazy(() => import('@/components/landing/services-page').then(m => ({ default: m.ServicesPage })))
const FaqPage = lazy(() => import('@/components/landing/faq-page').then(m => ({ default: m.FaqPage })))
const ContactPage = lazy(() => import('@/components/landing/contact-page').then(m => ({ default: m.ContactPage })))
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

const publicViews: ViewName[] = ['landing', 'job-listing', 'job-detail', 'about', 'services', 'faq', 'contact']

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

function ViewRenderer({ view }: { view: ViewName }) {
  const isLanding = publicViews.includes(view)

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingPage />
      case 'about': return <AboutPage />
      case 'services': return <ServicesPage />
      case 'faq': return <FaqPage />
      case 'contact': return <ContactPage />
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
      default: return <LandingPage />
    }
  }

  if (isLanding) {
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
              {renderView()}
            </div>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const { currentView, fontSize } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-background" data-font-size={fontSize}>
      <AppNav />
      <main className="flex-1">
        <ViewRenderer view={currentView} />
      </main>
      <AuthModal />
    </div>
  )
}
