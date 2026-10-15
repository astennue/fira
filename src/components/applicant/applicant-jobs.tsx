'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { JOB_CATEGORIES } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, DollarSign, Building2, Users, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description?: string;
  country: string;
  jobCategory: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  vacancies: number;
  status: string;
  isUrgent: boolean;
  employer?: { companyName: string; country: string };
  agency?: { name: string };
  _count?: { applications: number };
}

export function ApplicantJobs() {
  const { user, navigate } = useAppStore();
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    let url = '/api/jobs?status=open&role=applicant';
    if (category !== 'all') url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => { setJobs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Check existing applications
  useEffect(() => {
    if (!user) return;
    fetch(`/api/applications?applicantId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAppliedIds(new Set(data.map((a: { jobOrderId: string }) => a.jobOrderId)));
        }
      });
  }, [user]);

  const filtered = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async (jobId: string) => {
    if (!user) return;
    setApplying(jobId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: user.id, jobOrderId: jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedIds(prev => new Set([...prev, jobId]));
        toast.success('Application submitted!');
      } else {
        toast.error(data.error || 'Failed to apply');
      }
    } catch { toast.error('Connection error'); }
    finally { setApplying(null); }
  };

  const categoryLabel = (cat: string) => {
    const found = JOB_CATEGORIES.find(c => c.value === cat);
    return found ? (t('locale') === 'tl' ? found.labelTl : found.label) : cat;
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">{t('applicant.jobs.title')}</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {JOB_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 px-4 text-center text-foreground">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium">{t('common.noResults')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => {
            const isApplied = appliedIds.has(job.id);
            const isApplying = applying === job.id;
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{categoryLabel(job.jobCategory)}</Badge>
                    {job.isUrgent && <Badge className="bg-red-100 text-red-700 text-xs">Urgent</Badge>}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{job.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{job.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.country}</div>
                    <div className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />${job.salaryMin || 0} - ${job.salaryMax || 0} {job.currency}</div>
                    <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{job.employer?.companyName}</div>
                    <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{job.vacancies} vacancy · {job._count?.applications || 0} applied</div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    disabled={isApplied || isApplying}
                    onClick={() => handleApply(job.id)}
                  >
                    {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : isApplied ? <><Check className="h-4 w-4 " />{t('applicant.jobs.applied')}</> : t('applicant.jobs.apply')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}