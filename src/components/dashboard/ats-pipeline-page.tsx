'use client'

import { useQuery } from '@tanstack/react-query'
import { Columns, GripVertical, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'

export function AtsPipelinePage() {
  const { navigate } = useAppStore()

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=fira')
      return res.json()
    },
  })

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['ats-applications'],
    queryFn: async () => {
      const res = await fetch('/api/applications')
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  const job = jobs[0] as Record<string, unknown> | undefined

  // Group applications by currentStageId
  const stageMap = new Map<string, Record<string, unknown>[]>()
  applications.forEach((app: Record<string, unknown>) => {
    const stageId = app.currentStageId as string | undefined
    if (stageId) {
      if (!stageMap.has(stageId)) stageMap.set(stageId, [])
      stageMap.get(stageId)!.push(app)
    }
  })

  // Get unique stages from the job with order
  const stages = job ? (job.atsStages as Record<string, unknown>[]) || [] : []
  const isLoading = jobsLoading || appsLoading

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">ATS Pipeline</h1>
          <p className="text-muted-foreground">Track applications through the recruitment pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{applications.length} applications</Badge>
          <Badge variant="outline">{stages.length} stages</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="min-w-[280px] h-96 rounded-xl" />)}</div>
      ) : stages.length === 0 ? (
        <Card className="p-12 text-center">
          <Columns className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No pipeline data</h3>
          <p className="text-muted-foreground text-sm">Create jobs with applications to see the pipeline</p>
        </Card>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4" style={{ minWidth: stages.length * 290 }}>
            {stages.map((stage: Record<string, unknown>, i: number) => {
              const apps = stageMap.get(stage.id as string) || []
              const stageName = stage.name as string
              const stageColor = stage.color as string || '#10b981'
              const isTerminal = stageName.toLowerCase().includes('deploy') || stageName.toLowerCase().includes('complet')

              return (
                <div key={stage.id as string} className="min-w-[280px] flex flex-col">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stageColor }} />
                    <h3 className="text-sm font-semibold truncate">{stageName}</h3>
                    {apps.length > 0 && (
                      <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded-full font-medium">{apps.length}</span>
                    )}
                  </div>

                  <div className={cn(
                    'flex-1 rounded-xl border p-3 space-y-3 min-h-[200px]',
                    isTerminal && 'bg-emerald-50/50 dark:bg-emerald-950/20'
                  )}>
                    {apps.length === 0 ? (
                      <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">No applications</div>
                    ) : (
                      apps.map((app: Record<string, unknown>) => {
                        const applicant = app.applicant as Record<string, unknown> | undefined
                        const analysis = app.aiAnalysis as Record<string, unknown> | undefined
                        const score = analysis?.matchScore as number | undefined
                        return (
                          <Card key={app.id as string} className="cursor-pointer hover:shadow-sm transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium truncate">{applicant?.name || 'Unknown'}</p>
                                {score && (
                                  <span className={cn(
                                    'text-xs font-bold px-1.5 py-0.5 rounded',
                                    score >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    score >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  )}>
                                    {score}%
                                  </span>
                                )}
                              </div>
                              {applicant?.applicantProfile && (
                                <p className="text-xs text-muted-foreground">{(applicant.applicantProfile as Record<string, unknown>).preferredCountry || ''}</p>
                              )}
                              <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${score || 0}%`,
                                    backgroundColor: score && score >= 70 ? '#10b981' : score && score >= 40 ? '#f59e0b' : '#ef4444',
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>

                  {i < stages.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  )
}
