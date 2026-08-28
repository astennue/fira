'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Globe, Briefcase, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Agency { id: string; name: string; licenseNo?: string; isApproved: boolean; owner?: { name: string }; _count?: { applicants: number; jobOrders: number } }
interface Employer { id: string; companyName: string; country?: string; isApproved: boolean; user?: { name: string; email: string }; _count?: { jobOrders: number; endorsements: number } }
interface Job { id: string; title: string; country: string; status: string; employer?: { companyName: string } }

export function FiraDashboard({ showJobOrders, showEndorsements }: { showJobOrders?: boolean; showEndorsements?: boolean } = {}) {
  const { navigate } = useAppStore();
  const { t } = useI18n();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/agencies').then(r => r.json()),
      fetch('/api/employers').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
    ]).then(([a, e, j]) => {
      setAgencies(Array.isArray(a) ? a : []);
      setEmployers(Array.isArray(e) ? e : []);
      setJobs(Array.isArray(j) ? j : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pendingAgencies = agencies.filter(a => !a.isApproved);
  const pendingEmployers = employers.filter(e => !e.isApproved);

  const handleApproveAgency = async (id: string) => {
    const res = await fetch('/api/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isApproved: true }) });
    if (res.ok) { setAgencies(prev => prev.map(a => a.id === id ? { ...a, isApproved: true } : a)); toast.success('Agency approved'); }
  };

  const handleRejectAgency = async (id: string) => {
    const res = await fetch('/api/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isApproved: false }) });
    if (res.ok) { toast.info('Agency rejected'); }
  };

  const handleApproveEmployer = async (id: string) => {
    const res = await fetch('/api/employers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isApproved: true }) });
    if (res.ok) { setEmployers(prev => prev.map(e => e.id === id ? { ...e, isApproved: true } : e)); toast.success('Employer approved'); }
  };

  if (showJobOrders) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.jobOrders')}</h1>
        {jobs.length === 0 ? <Card className="p-8 text-center text-muted-foreground">No job orders</Card> : (
          <div className="space-y-2">
            {jobs.map(j => (
              <Card key={j.id}><CardContent className="p-3 flex justify-between items-center">
                <div><p className="font-medium text-sm">{j.title}</p><p className="text-xs text-muted-foreground">{j.country} · {j.employer?.companyName}</p></div>
                <Badge className={j.status === 'open' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-gray-700 text-xs'}>{j.status}</Badge>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (showEndorsements) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.endorsements')}</h1>
        <Card className="p-8 text-center text-muted-foreground"><p>Endorsement management for FIRA admin.</p></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('fira.dashboard.title')}</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: t('fira.dashboard.pendingApprovals'), value: pendingAgencies.length + pendingEmployers.length, icon: Clock, color: 'bg-amber-100 text-amber-700' },
          { label: t('fira.dashboard.totalAgencies'), value: agencies.length, icon: Building2, color: 'bg-blue-100 text-blue-700' },
          { label: t('fira.dashboard.totalEmployers'), value: employers.length, icon: Globe, color: 'bg-blue-100 text-blue-700' },
          { label: t('fira.dashboard.totalJobOrders'), value: jobs.length, icon: Briefcase, color: 'bg-green-100 text-green-700' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Agencies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" />Pending Agency Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <Skeleton className="h-12 w-full" /> : pendingAgencies.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">All agencies approved</p>
            ) : pendingAgencies.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.licenseNo || 'No license'} · {a.owner?.name}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleApproveAgency(a.id)}><CheckCircle className="h-3 w-3 " />Approve</Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('fira-agencies')}>
              View All Agencies <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Pending Employers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Pending Employer Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <Skeleton className="h-12 w-full" /> : pendingEmployers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">All employers approved</p>
            ) : pendingEmployers.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.companyName}</p>
                  <p className="text-[10px] text-muted-foreground">{e.country || 'Unknown'} · {e.user?.email}</p>
                </div>
                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleApproveEmployer(e.id)}>
                  <CheckCircle className="h-3 w-3 " />Approve
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('fira-employers')}>
              View All Employers <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}