'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, type ViewName } from '@/store/app-store'
import { AppNav } from '@/components/shared/app-nav'
import { AuthModal } from '@/components/auth/auth-modal'
import { LandingPage } from '@/components/landing/landing-page'
import { JobListingPage } from '@/components/landing/job-listing-page'
import { JobDetailPage } from '@/components/landing/job-detail-page'
import { ApplicantDashboard } from '@/components/dashboard/applicant-dashboard'
import { ApplicantJobsPage } from '@/components/dashboard/applicant-jobs-page'
import { ApplicantApplicationsPage } from '@/components/dashboard/applicant-applications-page'
import { ApplicantProfilePage } from '@/components/dashboard/applicant-profile-page'
import { AgencyDashboard } from '@/components/dashboard/agency-dashboard'
import { AgencyApplicantsPage } from '@/components/dashboard/agency-applicants-page'
import { AgencyJobsPage } from '@/components/dashboard/agency-jobs-page'
import { AgencyEndorsementsPage } from '@/components/dashboard/agency-endorsements-page'
import { EmployerDashboard } from '@/components/dashboard/employer-dashboard'
import { EmployerJobsPage } from '@/components/dashboard/employer-jobs-page'
import { EmployerEndorsedPage } from '@/components/dashboard/employer-endorsed-page'
import { FiraDashboard } from '@/components/dashboard/fira-dashboard'
import { FiraAgenciesPage } from '@/components/dashboard/fira-agencies-page'
import { FiraEmployersPage } from '@/components/dashboard/fira-employers-page'
import { FiraApplicantsPage } from '@/components/dashboard/fira-applicants-page'
import { FiraJobsPage } from '@/components/dashboard/fira-jobs-page'
import { AtsPipelinePage } from '@/components/dashboard/ats-pipeline-page'
import { AiMatchingPage } from '@/components/dashboard/ai-matching-page'
import { ResumeEnhancementPage } from '@/components/dashboard/resume-enhancement-page'

function ViewRenderer({ view }: { view: ViewName }) {
  const isLanding = view === 'landing' || view === 'job-listing' || view === 'job-detail'

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingPage />
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
      default: return <LandingPage />
    }
  }

  if (isLanding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={view}>{renderView()}</motion.div>
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
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {renderView()}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const { user, currentView } = useAppStore()

  const layout = (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <ViewRenderer view={currentView} />
      </main>
      <AuthModal />
    </div>
  )

  return layout
}
