'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, FileText, Clock, Sparkles, ArrowRight, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function ApplicantDashboard() {
  const { user, navigate, language } = useAppStore()

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const { data: profileData } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applicant-profile?userId=${user?.id}`)
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!user?.id,
  })

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []
  const profile = profileData?.profile

  const profileComplete = profile?.isComplete
  const profilePercent = profile?.formStep ? Math.min(Math.round((profile.formStep / 7) * 100), 100) : 0

  const statusColor = (s: string) => {
    if (['hired', 'offered', 'deployed'].includes(s)) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (['rejected', 'withdrawn'].includes(s)) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {language === 'fil' ? `Maligayang pagbabalik, ${user?.name?.split(' ')[0]}!` : `Welcome back, ${user?.name?.split(' ')[0]}!`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fil' ? 'Narito ang overview ng iyong mga aplikasyon' : "Here's your application overview"}
        </p>
      </div>

      {/* Profile Completion Warning */}
      {!profileComplete && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {language === 'fil' ? 'Kumpletuhin ang iyong profile' : 'Complete your profile'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {language === 'fil'
                    ? 'Bago ka makapag-apply, kailangan mong kumpletuhin ang iyong profile.'
                    : 'You need to complete your profile before you can apply for jobs.'}
                </p>
                <Progress value={profilePercent} className="h-2 mt-2 max-w-xs" />
                <p className="text-xs text-amber-600 mt-1">{profilePercent}% complete</p>
              </div>
              <Button size="sm" onClick={() => navigate('applicant-profile')} className="shrink-0">
                {language === 'fil' ? 'Kumpletuhin' : 'Complete'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'fil' ? 'Kabuuang Aplikasyon' : 'Total Applications', value: applications.length, icon: FileText, color: 'text-blue-600' },
          { label: language === 'fil' ? 'Aktibong Aplikasyon' : 'Active', value: applications.filter((a: any) => !['rejected', 'withdrawn', 'hired', 'deployed', 'completed'].includes(a.status)).length, icon: Clock, color: 'text-amber-600' },
          { label: language === 'fil' ? 'Average Match' : 'Avg Match Score', value: applications.length > 0 ? `${Math.round(applications.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0) / applications.length)}%` : 'N/A', icon: Sparkles, color: 'text-emerald-600' },
          { label: language === 'fil' ? 'Profile' : 'Profile Status', value: profileComplete ? (language === 'fil' ? 'Kumpleto' : 'Complete') : (language === 'fil' ? 'Hindi Kumpleto' : 'Incomplete'), icon: profileComplete ? CheckCircle : AlertTriangle, color: profileComplete ? 'text-emerald-600' : 'text-amber-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>{language === 'fil' ? 'Mga Bagong Aplikasyon' : 'Recent Applications'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('applicant-applications')}>
              {language === 'fil' ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang aplikasyon. Magsimula na!' : 'No applications yet. Start applying!'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {applications.slice(0, 10).map((app: any) => {
                  const job = app.jobOrder
                  const stage = app.currentStage
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{job?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-muted-foreground">
                          {job?.country || ''} &middot; {stage?.name || app.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {app.matchScore && (
                          <Badge variant="outline" className="text-xs text-primary">
                            {Math.round(app.matchScore)}%
                          </Badge>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(app.status)}`}>
                          {app.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Mabilis na Aksyon' : 'Quick Actions'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('applicant-jobs')}>
              <Briefcase className="mr-2 h-4 w-4" /> {language === 'fil' ? 'Maghanap ng Trabaho' : 'Find Jobs'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('applicant-profile')}>
              <Users className="mr-2 h-4 w-4" /> {language === 'fil' ? 'I-edit ang Profile' : 'Edit Profile'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('applicant-applications')}>
              <FileText className="mr-2 h-4 w-4" /> {language === 'fil' ? 'Mga Aplikasyon Ko' : 'My Applications'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('resume-enhancement')}>
              <Sparkles className="mr-2 h-4 w-4" /> AI {language === 'fil' ? 'Resume Boost' : 'Resume Boost'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
