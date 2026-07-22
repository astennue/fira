'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Briefcase, FileText, GitBranch, ChevronRight } from 'lucide-react';

interface Job { id: string; title: string; country: string; status: string; vacancies: number; _count?: { applications: number }; employer?: { companyName: string } }

export function AgencyDashboard({ showApplicants, showMembers, showJobOrders }: { showApplicants?: boolean; showMembers?: boolean; showJobOrders?: boolean } = {}) {
  const { user, navigate, setSelectedJobOrderId } = useAppStore();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/jobs').then(r => r.json()).then(data => {
      setJobs(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openJobs = jobs.filter(j => j.status === 'open');
  const totalApps = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  if (showApplicants) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('agency.applicants.title')}</h2>
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Applicant management coming soon. Use the Pipeline to manage applicants per job order.</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('agency-pipeline')}>
            <GitBranch className="h-4 w-4 mr-2" />{t('nav.pipeline')}
          </Button>
        </Card>
      </div>
    );
  }

  if (showMembers) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t('nav.members')}</h2>
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Team member management. Add team members to your agency.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('agency.dashboard.title')}</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: t('nav.applicants'), value: totalApps, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: t('agency.dashboard.activeJobs'), value: openJobs.length, icon: Briefcase, color: 'bg-emerald-100 text-emerald-700' },
          { label: t('agency.dashboard.pendingEndorsements'), value: 0, icon: FileText, color: 'bg-amber-100 text-amber-700' },
          { label: t('agency.dashboard.pipeline'), value: jobs.length, icon: GitBranch, color: 'bg-purple-100 text-purple-700' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">{t('nav.jobOrders')}</h2>
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : jobs.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground text-sm">No job orders yet</Card>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <Card key={job.id} className="hover:shadow-sm cursor-pointer" onClick={() => { setSelectedJobOrderId(job.id); navigate('agency-pipeline'); }}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.employer?.companyName} · {job.country}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className="text-xs">{job._count?.applications || 0} apps</Badge>
                  <Badge className={job.status === 'open' ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-gray-100 text-gray-700 text-xs'}>{job.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}