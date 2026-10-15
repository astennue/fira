'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, FileText, User, Search, FileQuestion, ChevronRight } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  jobOrder: { title: string; employer?: { companyName: string; country: string } };
  atsHistory: { stage: { name: string; color?: string } }[];
  matchScore?: number;
}

export function ApplicantDashboard({ showApplications = false }: { showApplications?: boolean }) {
  const { user, navigate } = useAppStore();
  const { t } = useI18n();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch(`/api/applications?applicantId=${user.id}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setApplications(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || 'Applicant';
  const activeApps = applications.filter(a => a.status !== 'rejected' && a.status !== 'withdrawn');

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', hired: 'bg-green-100 text-green-700', withdrawn: 'bg-gray-100 text-gray-800' };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (showApplications) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold leading-tight mb-6">{t('applicant.applications.title')}</h2>
        {loading ? (
          <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
        ) : applications.length === 0 ? (
          <Card className="p-8 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('applicant.applications.empty')}</p>
            <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => navigate('applicant-jobs')}>
              <Search className="h-4 w-4 " /> {t('applicant.dashboard.browseJobs')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <Card key={app.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{app.jobOrder?.title || 'Unknown Job'}</h3>
                      <p className="text-sm text-muted-foreground">{app.jobOrder?.employer?.companyName} · {app.jobOrder?.employer?.country}</p>
                      {app.atsHistory?.[0] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Stage: <Badge variant="outline" className="text-xs ml-1" style={{ borderColor: app.atsHistory[0].stage.color, color: app.atsHistory[0].stage.color }}>{app.atsHistory[0].stage.name}</Badge>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.matchScore && <Badge variant="outline" className="text-green-700">{Math.round(app.matchScore)}%</Badge>}
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-1">{t('applicant.dashboard.title')}, {firstName}!</h1>
      <p className="text-muted-foreground mb-6">{t('common.appSubtitle')}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : activeApps.length}</p>
                <p className="text-xs text-muted-foreground">{t('applicant.dashboard.activeApps')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">75%</p>
                <p className="text-xs text-muted-foreground">{t('applicant.dashboard.profileComplete')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Button className="h-14 bg-green-600 hover:bg-green-700 text-base" onClick={() => navigate('applicant-jobs')}>
          <Search className="h-5 w-5 " /> {t('applicant.dashboard.browseJobs')}
        </Button>
        <Button variant="outline" className="h-14 text-base" onClick={() => navigate('applicant-profile')}>
          <User className="h-5 w-5 " /> {t('applicant.dashboard.completeProfile')}
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-3">{t('applicant.applications.title')}</h2>
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : applications.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{t('applicant.applications.empty')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {applications.slice(0, 5).map(app => (
            <Card key={app.id} className="hover:shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{app.jobOrder?.title}</p>
                  <p className="text-xs text-muted-foreground">{app.jobOrder?.employer?.companyName}</p>
                </div>
                <Badge className={`ml-2 ${getStatusColor(app.status)}`}>{app.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}