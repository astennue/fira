'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, FileText, Clock, Sparkles, ArrowRight, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function ApplicantDashboard() {
  const { user, navigate } = useAppStore()

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!user?.id,
  })

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  const statusColor = (s: string) => {
    if (s === 'hired' || s === 'offered') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (s === 'rejected' || s === 'withdrawn') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your application overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-blue-600' },
          { label: 'Active', value: applications.filter((a: Record<string, unknown>) => !['rejected', 'withdrawn', 'hired'].includes(a.status as string)).length, icon: Clock, color: 'text-amber-600' },
          { label: 'Avg Match Score', value: applications.length > 0 ? `${Math.round(applications.reduce((sum: number, a: Record<string, unknown>) => sum + (a.matchScore as number || 0), 0) / applications.length)}%` : 'N/A', icon: Sparkles, color: 'text-emerald-600' },
          { label: 'Jobs Available', value: '...', icon: Briefcase, color: 'text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('applicant-applications')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No applications yet. Start applying!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app: Record<string, unknown>) => {
                  const job = app.jobOrder as Record<string, unknown> | undefined
                  return (
                    <div key={app.id as string} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{job?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-muted-foreground">{job?.country || ''} &middot; {(app.aiAnalysis as Record<string, unknown> | undefined)?.matchScore ? `Match: ${(app.aiAnalysis as Record<string, unknown>).matchScore}%` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(app.status as string)}`}>{(app.status as string).replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{formatDistanceToNow(new Date(app.createdAt as string), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('applicant-jobs')}>
              <Briefcase className="mr-2 h-4 w-4" /> Find Jobs
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('applicant-profile')}>
              <Users className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('resume-enhancement')}>
              <Sparkles className="mr-2 h-4 w-4" /> AI Resume Boost
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
