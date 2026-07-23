'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function ApplicantApplicationsPage() {
  const { user, navigate } = useAppStore()

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!user?.id,
  })

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      screening: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      interview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      offered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      hired: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[s] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No applications yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Start applying for jobs to see them here</p>
          <Button onClick={() => navigate('applicant-jobs')}>Browse Jobs</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: Record<string, unknown>) => {
            const job = app.jobOrder as Record<string, unknown> | undefined
            const analysis = app.aiAnalysis as Record<string, unknown> | undefined
            return (
              <Card key={app.id as string} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{job?.title || 'Unknown Job'}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(app.status as string)}`}>
                          {(app.status as string).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job?.country || ''}</span>
                        {analysis?.matchScore && <span className="text-primary font-medium">Match: {analysis.matchScore}%</span>}
                        <span>{formatDistanceToNow(new Date(app.createdAt as string), { addSuffix: true })}</span>
                      </div>
                      {app.currentStage && (
                        <p className="text-xs text-muted-foreground mt-1">Current Stage: {(app.currentStage as Record<string, unknown>).name}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('job-detail', { jobId: job?.id as string })}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
