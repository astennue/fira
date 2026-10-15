'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { DEFAULT_ATS_STAGES, STAGE_COLORS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Briefcase, Users } from 'lucide-react';

interface App { id: string; applicant: { id: string; name: string; email: string }; jobOrderId: string; status: string; matchScore?: number; atsHistory: { stage: { name: string; color?: string } }[] }

interface Job { id: string; title: string; country: string; status: string }

export function AgencyPipeline() {
  const { user, selectedJobOrderId, setSelectedJobOrderId, navigate } = useAppStore();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(data => {
      setJobs(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedJobOrderId) return;
    let cancelled = false;
    fetch(`/api/applications?jobOrderId=${selectedJobOrderId}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setApplications(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [selectedJobOrderId]);

  const currentJob = jobs.find(j => j.id === selectedJobOrderId) || null;

  // Place applications into stage buckets
  const stageBuckets: Record<string, App[]> = {};
  DEFAULT_ATS_STAGES.forEach(stage => { stageBuckets[stage] = []; });
  applications.forEach(app => {
    const stageName = app.atsHistory?.[0]?.stage?.name || 'Applied';
    if (!stageBuckets[stageName]) stageBuckets[stageName] = [];
    stageBuckets[stageName].push(app);
  });

  if (!selectedJobOrderId) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('agency.pipeline.title')}</h1>
        {loading ? (
          <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
        ) : (
          <div className="space-y-2">
            {jobs.filter(j => j.status === 'open').map(job => (
              <Card key={job.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedJobOrderId(job.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.country}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{job.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => { setSelectedJobOrderId(null); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{currentJob?.title || 'Pipeline'}</h1>
          <p className="text-sm text-muted-foreground">{currentJob?.country} · {applications.length} applications</p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4" style={{ minWidth: `${Math.max(DEFAULT_ATS_STAGES.length * 280, 800)}px` }}>
            {DEFAULT_ATS_STAGES.map((stage, idx) => {
              const apps = stageBuckets[stage] || [];
              return (
                <div key={stage} className="min-w-[260px] w-[260px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[idx] }} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">{stage}</h3>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{apps.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[100px] bg-muted/30 rounded-lg p-2">
                    {apps.map(app => (
                      <Card key={app.id} className="shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Users className="h-3.5 w-3.5 text-green-700" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{app.applicant?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{app.applicant?.email}</p>
                            </div>
                          </div>
                          {app.matchScore && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] mb-0.5">
                                <span className="text-muted-foreground">Match</span>
                                <span className="font-semibold">{Math.round(app.matchScore)}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${app.matchScore}%`, backgroundColor: app.matchScore > 80 ? '#22c55e' : app.matchScore > 60 ? '#eab308' : '#ef4444' }} />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {apps.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">No applications</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}