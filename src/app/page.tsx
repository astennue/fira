'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { AuthModal } from '@/components/shared/auth-modal';
import { AppNav } from '@/components/shared/app-nav';
import { LandingPage } from '@/components/landing/landing-page';
import { ApplicantDashboard } from '@/components/applicant/applicant-dashboard';
import { ApplicantJobs } from '@/components/applicant/applicant-jobs';
import { ApplicantProfile } from '@/components/applicant/applicant-profile';
import { AgencyDashboard } from '@/components/agency/agency-dashboard';
import { AgencyPipeline } from '@/components/agency/agency-pipeline';
import { AgencyEndorsements } from '@/components/agency/agency-endorsements';
import { FiraDashboard } from '@/components/fira/fira-dashboard';
import { FiraAgencies } from '@/components/fira/fira-agencies';
import { FiraEmployers } from '@/components/fira/fira-employers';
import { FiraMatching } from '@/components/fira/fira-matching';
import { EmployerDashboard } from '@/components/employer/employer-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

function ViewRouter() {
  const { currentView, isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  switch (currentView) {
    // Applicant
    case 'applicant-dashboard': return <ApplicantDashboard />;
    case 'applicant-jobs': return <ApplicantJobs />;
    case 'applicant-applications': return <ApplicantDashboard showApplications />;
    case 'applicant-profile': return <ApplicantProfile />;
    // Agency
    case 'agency-dashboard': return <AgencyDashboard />;
    case 'agency-pipeline': return <AgencyPipeline />;
    case 'agency-applicants': return <AgencyDashboard showApplicants />;
    case 'agency-endorsements': return <AgencyEndorsements />;
    case 'agency-members': return <AgencyDashboard showMembers />;
    // FIRA
    case 'fira-dashboard': return <FiraDashboard />;
    case 'fira-agencies': return <FiraAgencies />;
    case 'fira-employers': return <FiraEmployers />;
    case 'fira-job-orders': return <FiraDashboard showJobOrders />;
    case 'fira-matching': return <FiraMatching />;
    case 'fira-endorsements': return <FiraDashboard showEndorsements />;
    // Employer
    case 'employer-dashboard': return <EmployerDashboard />;
    case 'employer-endorsements': return <EmployerDashboard showEndorsements />;
    case 'employer-profile': return <EmployerDashboard showProfile />;
    default: return <LandingPage />;
  }
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto animate-pulse">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoading } = useAppStore();

  // Check if user was previously logged in (session check)
  useEffect(() => {
    const savedUser = localStorage.getItem('fira_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        useAppStore.getState().setUser(user);
      } catch {
        localStorage.removeItem('fira_user');
      }
    } else {
      useAppStore.getState().setLoading(false);
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    const { user, isAuthenticated } = useAppStore.getState();
    if (isAuthenticated && user) {
      localStorage.setItem('fira_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fira_user');
    }
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <AppNav />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <ViewRouter />
      </main>
      <AuthModal />
    </>
  );
}