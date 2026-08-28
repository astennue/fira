'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Search, Brain, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Job { id: string; title: string; country: string; jobCategory: string }
interface MatchResult { profileId: string; applicantId: string; name: string; score: number; matchDetails: { countryMatch: boolean; categoryMatch: boolean; skillCount: number } }

export function FiraMatching() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(data => {
      setJobs(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleMatch = async () => {
    if (!selectedJob) { toast.error('Select a job order first'); return; }
    setMatching(true);
    setResults([]);
    try {
      const res = await fetch('/api/matching', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobOrderId: selectedJob }) });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
        toast.success(`Found ${data.length} matches`);
      } else {
        toast.error('Matching failed');
      }
    } catch { toast.error('Connection error'); }
    finally { setMatching(false); }
  };

  const getScoreColor = (score: number) => score > 80 ? 'text-green-600' : score > 60 ? 'text-amber-600' : 'text-red-600';
  const getProgressColor = (score: number) => score > 80 ? '[&>div]:bg-green-500' : score > 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
          <Brain className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{t('nav.matching')}</h1>
          <p className="text-sm text-muted-foreground">AI-powered applicant matching (SBERT placeholder)</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger><SelectValue placeholder="Select a job order..." /></SelectTrigger>
                <SelectContent>
                  {jobs.filter(j => j.status === 'open').map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.title} - {j.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleMatch} disabled={matching || !selectedJob}>
              {matching ? <><Loader2 className="h-4 w-4 animate-spin " />Matching...</> : <><Star className="h-4 w-4 " />Find Matches</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {matching && <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>}

      {!matching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} applicants found, sorted by match score</p>
          {results.map((r, idx) => (
            <Card key={r.profileId} className={idx === 0 ? 'ring-2 ring-green-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{r.matchDetails.countryMatch ? 'Country Match' : 'Country Mismatch'}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.matchDetails.categoryMatch ? 'Category Match' : 'Category Mismatch'}</Badge>
                          <Badge variant="outline" className="text-[10px]">{r.matchDetails.skillCount} skills</Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-2xl font-bold ${getScoreColor(r.score)}`}>{r.score}%</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={r.score} className={`h-2 ${getProgressColor(r.score)}`} />
                    </div>
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