'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Search, ArrowDown, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

export function AiMatchingPage() {
  const { language } = useAppStore()
  const [selectedJobId, setSelectedJobId] = useState('')
  const [results, setResults] = useState<any[] | null>(null)
  const [isMatching, setIsMatching] = useState(false)

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['ai-matching-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  const runMatching = async () => {
    if (!selectedJobId) return
    setIsMatching(true)
    setResults(null)
    try {
      const res = await apiFetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobOrderId: selectedJobId }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setResults(data.candidates || [])
      toast.success(language === 'fil' ? 'Matagumpay ang matching!' : 'Matching complete!')
    } catch {
      toast.error(language === 'fil' ? 'Hindi matagumpay.' : 'Matching failed.')
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI {language === 'fil' ? 'Matching' : 'Matching'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fil'
            ? 'Gamitin ang AI para mahanap ang pinakamapat na kandidato para sa isang trabaho'
            : 'Use AI to find the best matching candidates for a job'}
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          {jobsLoading ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1"><Skeleton className="h-11 w-full rounded-md" /></div>
              <Skeleton className="h-11 w-48 rounded-md shrink-0" />
            </div>
          ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={language === 'fil' ? 'Pumili ng trabaho...' : 'Select a job...'} />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j: any) => (
                    <SelectItem key={j.id} value={j.id}>{j.title} — {j.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" onClick={runMatching} disabled={!selectedJobId || isMatching} className="shrink-0">
              {isMatching ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{language === 'fil' ? 'Nagmamanipula...' : 'Matching...'}</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" />{language === 'fil' ? 'I-run ang AI Matching' : 'Run AI Matching'}</>
              )}
            </Button>
          </div>
          )}
        </CardContent>
      </Card>

      {isMatching && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {language === 'fil' ? `Resulta (${results.length} kandidato)` : `Results (${results.length} candidates)`}
          </h2>
          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{language === 'fil' ? 'Walang nahanap na kandidato.' : 'No candidates found.'}</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
              {results.map((candidate: any, i: number) => (
                <motion.div key={candidate.applicantId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">#{i + 1}</span>
                            <h3 className="font-semibold text-sm">{candidate.applicantName}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{candidate.experienceYears || 0}yr {language === 'fil' ? 'karanasan' : 'experience'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <Progress value={candidate.matchScore} className="w-20 h-2 mb-1" />
                            <p className="text-lg font-bold text-primary">{Math.round(candidate.matchScore)}%</p>
                            <p className="text-[10px] text-muted-foreground">{language === 'fil' ? 'Match Score' : 'Match Score'}</p>
                          </div>
                        </div>
                      </div>
                      {candidate.explanation && (
                        <p className="text-xs text-muted-foreground mb-3 italic">{candidate.explanation}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            {language === 'fil' ? 'Kakayahang mayroon' : 'Matched Skills'} ({(candidate.matchedSkills || []).length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(candidate.matchedSkills || []).map((s: string, j: number) => (
                              <Badge key={j} variant="secondary" className="text-[10px] py-0">{s}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-amber-600 mb-1">
                            <XCircle className="h-3 w-3 inline mr-1" />
                            {language === 'fil' ? 'Kakulangan' : 'Missing Skills'} ({(candidate.missingSkills || []).length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(candidate.missingSkills || []).map((s: string, j: number) => (
                              <Badge key={j} variant="outline" className="text-[10px] py-0">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
