'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Columns, User, ArrowLeft, MapPin, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'

const stageColors = [
  'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
  'bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500',
  'bg-green-500', 'bg-teal-500',
]

export function AtsPipelinePage() {
  const { language, viewParams } = useAppStore()
  const [selectedJobId, setSelectedJobId] = useState(viewParams?.jobId || '')

  const { data: jobsData } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: appData, isLoading: appsLoading } = useQuery({
    queryKey: ['ats-applications', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return { applications: [] }
      const res = await fetch(`/api/applications?jobOrderId=${selectedJobId}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!selectedJobId,
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const applications = Array.isArray(appData?.applications) ? appData.applications : []

  const selectedJob = jobs.find((j: any) => j.id === selectedJobId)
  const stages = selectedJob?.atsStages || []

  // Group applications by stage
  const stageMap: Record<string, any[]> = {}
  stages.forEach((stage: any) => { stageMap[stage.id] = [] })
  applications.forEach((app: any) => {
    const stageId = app.currentStageId
    if (stageId && stageMap[stageId]) stageMap[stageId].push(app)
    else if (stages.length > 0) stageMap[stages[0].id].push(app)
  })

  return (
    <div className="view-transition space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Columns className="h-7 w-7 text-primary" />
            ATS Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fil' ? 'Subaybayan ang progress ng mga aplikante' : 'Track applicant progress'}
          </p>
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-72 h-10">
            <SelectValue placeholder={language === 'fil' ? 'Pumili ng trabaho...' : 'Select a job...'} />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j: any) => (
              <SelectItem key={j.id} value={j.id}>{j.title} — {j.country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedJobId ? (
        <Card className="p-12 text-center">
          <Columns className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{language === 'fil' ? 'Pumili ng trabaho' : 'Select a job'}</h3>
          <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Pumili muna ng job order para makita ang pipeline.' : 'Choose a job order to view the pipeline.'}</p>
        </Card>
      ) : appsLoading ? (
        <div className="flex gap-4 overflow-x-auto">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-72 rounded-xl shrink-0" />)}</div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 min-h-[60vh] pb-4" style={{ minWidth: `${Math.max(stages.length * 280, 800)}px` }}>
            {stages.map((stage: any, idx: number) => {
              const colorClass = stageColors[idx % stageColors.length]
              const apps = stageMap[stage.id] || []
              return (
                <div key={stage.id} className="w-72 shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`h-3 w-3 rounded-full ${colorClass}`} />
                    <h3 className="text-sm font-semibold truncate">{stage.name}</h3>
                    <Badge variant="secondary" className="text-xs ml-auto">{apps.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                    {apps.length === 0 ? (
                      <div className="flex items-center justify-center h-20 text-muted-foreground/40">
                        <p className="text-xs">{language === 'fil' ? 'Walang aplikante' : 'No applicants'}</p>
                      </div>
                    ) : (
                      apps.map((app: any) => {
                        const applicant = app.applicant
                        const profile = applicant?.applicantProfile
                        const ai = app.aiAnalysis
                        return (
                          <Card key={app.id} className="shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                  {applicant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">{applicant?.name || 'Unknown'}</p>
                                  {profile?.applicantType && (
                                    <p className="text-[10px] text-muted-foreground">{profile.applicantType?.replace('_', ' ')}</p>
                                  )}
                                </div>
                              </div>
                              {ai?.matchScore && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">{language === 'fil' ? 'Match' : 'Match'}</span>
                                  <Badge variant="outline" className={`text-xs ${ai.matchScore >= 80 ? 'text-emerald-600 border-emerald-300' : ai.matchScore >= 50 ? 'text-amber-600 border-amber-300' : 'text-red-500 border-red-300'}`}>
                                    {Math.round(ai.matchScore)}%
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
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
