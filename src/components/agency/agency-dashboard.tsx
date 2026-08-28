'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JOB_CATEGORIES, COUNTRIES, JOB_VISIBILITY } from '@/lib/types';
import { Users, Briefcase, FileText, GitBranch, ChevronRight, Plus, Eye, EyeOff, Lock, Building2, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  country: string;
  status: string;
  vacancies: number;
  isUrgent: boolean;
  visibility: string;
  _count?: { applications: number };
  employer?: { companyName: string };
  agency?: { name: string };
}

export function AgencyDashboard({ showApplicants, showMembers, showJobOrders }: { showApplicants?: boolean; showMembers?: boolean; showJobOrders?: boolean } = {}) {
  const { user, navigate, setSelectedJobOrderId } = useAppStore();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Create job form
  const [newTitle, setNewTitle] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSalaryMin, setNewSalaryMin] = useState('');
  const [newSalaryMax, setNewSalaryMax] = useState('');
  const [newVacancies, setNewVacancies] = useState('1');
  const [newDescription, setNewDescription] = useState('');
  const [newVisibility, setNewVisibility] = useState('public');
  const [newContractDuration, setNewContractDuration] = useState('2 years');

  const fetchData = useCallback(() => {
    return fetch('/api/jobs')
      .then(r => r.json())
      .then(data => { setJobs(Array.isArray(data) ? data : []); setLoading(false); return data; })
      .catch(() => { setLoading(false); return []; });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openJobs = jobs.filter(j => j.status === 'open');
  const totalApps = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  const handleVisibilityChange = async (jobId: string, visibility: string) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch('/api/jobs/' + jobId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, visibility }),
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, visibility } : j));
        toast.success('Visibility updated');
      }
    } catch {
      toast.error('Failed to update visibility');
    }
    setUpdatingId(null);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCountry || !newCategory) return;
    setCreating(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          country: newCountry,
          jobCategory: newCategory,
          salaryMin: parseFloat(newSalaryMin) || null,
          salaryMax: parseFloat(newSalaryMax) || null,
          vacancies: parseInt(newVacancies) || 1,
          contractDuration: newContractDuration,
          description: newDescription,
          visibility: newVisibility,
          createdById: user?.id,
          employerId: '', // Will be set by agency
        }),
      });
      if (res.ok) {
        toast.success('Job order created!');
        setCreateOpen(false);
        setNewTitle(''); setNewCountry(''); setNewCategory('');
        setNewSalaryMin(''); setNewSalaryMax('');
        setNewVacancies('1'); setNewDescription('');
        setNewVisibility('public'); setNewContractDuration('2 years');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create job');
      }
    } catch {
      toast.error('Connection error');
    }
    setCreating(false);
  };

  const visibilityIcon = (v: string) => {
    switch (v) {
      case 'public': return <Globe className="h-3.5 w-3.5" />;
      case 'agency_only': return <Building2 className="h-3.5 w-3.5" />;
      case 'private': return <Lock className="h-3.5 w-3.5" />;
      default: return <Eye className="h-3.5 w-3.5" />;
    }
  };

  const visibilityColor = (v: string) => {
    switch (v) {
      case 'public': return 'bg-green-100 text-green-700';
      case 'agency_only': return 'bg-amber-100 text-amber-700';
      case 'private': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showApplicants) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold leading-tight mb-6">{t('agency.applicants.title')}</h2>
        <Card className="py-12 px-4 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">Applicant management coming soon</p>
          <p className="text-sm text-muted-foreground mt-1">Use the Pipeline to manage applicants per job order.</p>
          <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => navigate('agency-pipeline')}>
            <GitBranch className="h-4 w-4 " />{t('nav.pipeline')}
          </Button>
        </Card>
      </div>
    );
  }

  if (showMembers) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold leading-tight mb-6">{t('nav.members')}</h2>
        <Card className="py-12 px-4 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">Team member management</p>
          <p className="text-sm text-muted-foreground mt-1">Add team members to your agency.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">{t('agency.dashboard.title')}</h1>
        <Button className=" bg-green-600 hover:bg-green-700" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 " />New Job Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: t('nav.applicants'), value: totalApps, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: t('agency.dashboard.activeJobs'), value: openJobs.length, icon: Briefcase, color: 'bg-green-100 text-green-700' },
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

      {/* Job Orders with Visibility Controls */}
      <h2 className="text-lg font-semibold mb-3">{t('nav.jobOrders')}</h2>
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : jobs.length === 0 ? (
        <Card className="py-12 px-4 text-center"><Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-lg font-medium text-foreground">No job orders yet</p></Card>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <Card key={job.id} className="hover:shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => { setSelectedJobOrderId(job.id); navigate('agency-pipeline'); }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      {job.isUrgent && <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{job.employer?.companyName} · {job.country}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {/* Visibility Selector */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      {updatingId === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Select
                          value={job.visibility}
                          onValueChange={(v) => handleVisibilityChange(job.id, v)}
                        >
                          <SelectTrigger className={`h-7 w-auto min-w-[90px] text-[10px] border-0 ${visibilityColor(job.visibility)} cursor-pointer px-2 gap-1`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_VISIBILITY.map(v => (
                              <SelectItem key={v.value} value={v.value} className="text-xs">
                                <span className="flex items-center gap-1.5">
                                  {v.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">{job._count?.applications || 0} apps</Badge>
                    <Badge className={job.status === 'open' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-gray-700 text-xs'}>{job.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => { setSelectedJobOrderId(job.id); navigate('agency-pipeline'); }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Job Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-700">Create New Job Order</DialogTitle>
            <DialogDescription>Fill in the details for the new job posting.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input placeholder="e.g. Domestic Helper - Riyadh" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={newCountry} onValueChange={setNewCountry} required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={newCategory} onValueChange={setNewCategory} required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {JOB_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Salary Min ($)</Label>
                <Input type="number" placeholder="600" value={newSalaryMin} onChange={e => setNewSalaryMin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Salary Max ($)</Label>
                <Input type="number" placeholder="800" value={newSalaryMax} onChange={e => setNewSalaryMax(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Vacancies</Label>
                <Input type="number" value={newVacancies} onChange={e => setNewVacancies(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contract Duration</Label>
              <Input placeholder="2 years" value={newContractDuration} onChange={e => setNewContractDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Job description..." value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t('jobs.visibility')} *</Label>
              <Select value={newVisibility} onValueChange={setNewVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_VISIBILITY.map(v => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{v.label}</span>
                        <span className="text-[10px] text-muted-foreground">{v.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin " />}
                {t('common.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}