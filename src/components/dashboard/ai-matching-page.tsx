'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Sparkles, Brain, CheckCircle, XCircle, Loader2, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function AiMatchingPage() {
  const { user } = useAppStore()
  const [selectedJob, setSelectedJob] = useState('')

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['matching-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs')
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data.jobs) ? data.jobs : []
    },
  })

  const matchMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobOrderId: jobId }),
      })
      if (!res.ok) throw new Error('Matching failed')
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(`AI matching complete! ${data.candidates?.length || 0} candidates analyzed`)
    },
    onError: (err) => toast.error('Matching failed', { description: err.message }),
  })

  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['match-results', selectedJob],
    queryFn: async () => {
      if (!selectedJob) return null
      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobOrderId: selectedJob }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!selectedJob && matchMutation.isSuccess === false,
  })

  const candidates = Array.isArray(matchData?.candidates) ? matchData.candidates : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Sparkles className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">AI-Powered Matching</h1>
          <p className="text-muted-foreground">SBERT + Random Forest semantic matching with XAI</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select a Job to Analyze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {jobsLoading ? (
              <Skeleton className="h-10 w-64" />
            ) : (
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Choose a job..." />
                </SelectTrigger>
                <SelectContent>
                  {(jobsData || []).map((job: Record<string, unknown>) => (
                    <SelectItem key={job.id as string} value={job.id as string}>
                      {String(job.title)} - {String(job.country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={() => selectedJob && matchMutation.mutate(selectedJob)}
              disabled={!selectedJob || matchMutation.isPending || matchLoading}
            >
              {matchMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Brain className="h-4 w-4 mr-2" /> Run AI Matching</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {matchLoading && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!matchLoading && candidates.length > 0 && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Match Results ({candidates.length} candidates)</h2>
            </div>
            <div className="space-y-3">
              {candidates.map((c: Record<string, unknown>, i: number) => {
                const score = c.matchScore as number
                return (
                  <motion.div
                    key={c.applicantId as string}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={i === 0 ? 'border-primary/50 shadow-sm' : ''}>
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                              {String(c.applicantName).split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold">{c.applicantName as string}</p>
                              <p className="text-xs text-muted-foreground">{c.experienceYears} yrs experience</p>
                            </div>
                          </div>

                          <div className="flex-1" />

                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                {score}%
                              </span>
                              <span className="text-xs text-muted-foreground">match</span>
                            </div>
                            <Progress value={score} className="w-32 h-1.5" />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(c.matchedSkills as string[] || []).map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs"><CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />{s}</Badge>
                          ))}
                          {(c.missingSkills as string[] || []).slice(0, 3).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-xs"><XCircle className="h-3 w-3 mr-1 text-red-500" />{s}</Badge>
                          ))}
                        </div>

                        {c.explanation && (
                          <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{String(c.explanation)}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
