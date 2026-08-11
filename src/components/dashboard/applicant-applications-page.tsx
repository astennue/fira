'use client'

import { apiFetch } from "@/lib/fetch"
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, MapPin, Clock, Sparkles, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function ApplicantApplicationsPage() {
  const { user, navigate, language } = useAppStore()

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  const statusColor = (s: string) => {
    if (['hired', 'offered', 'deployed', 'completed'].includes(s)) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (['rejected', 'withdrawn'].includes(s)) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Aplikasyon Ko' : 'My Applications'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Subaybayan ang status ng iyong mga aplikasyon' : 'Track the status of your applications'}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{language === 'fil' ? 'Wala pang aplikasyon' : 'No applications yet'}</h3>
          <p className="text-sm text-muted-foreground mb-4">{language === 'fil' ? 'Magsimula sa paghanap ng trabaho!' : 'Start by finding jobs!'}</p>
          <Button onClick={() => navigate('applicant-jobs')}>{language === 'fil' ? 'Maghanap ng Trabaho' : 'Find Jobs'}</Button>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {applications.map((app: any, i: number) => {
            const job = app.jobOrder
            const stage = app.currentStage
            const ai = app.aiAnalysis
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{job?.title || 'Unknown'}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(app.status)}`}>
                            {app.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job?.country || ''}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                          {stage && (
                            <Badge variant="outline" className="text-xs">
                              {stage.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {ai?.matchScore && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{Math.round(ai.matchScore)}%</p>
                            <p className="text-[10px] text-muted-foreground">{language === 'fil' ? 'Match' : 'Match'}</p>
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => navigate('job-detail', { jobId: job?.id })}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
