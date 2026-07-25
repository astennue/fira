'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, Users, FileText, UserCheck, ArrowRight, Send, Columns,
  MessageSquare, Clock, TrendingUp, ChevronRight, UserPlus, BarChart3, Zap
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    motionVal.set(target)
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return () => unsub()
  }, [target, motionVal, rounded])

  return <>{display}</>
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  let colorClass = ''
  if (['hired', 'employer_accepted', 'fira_approved', 'completed'].includes(s)) {
    colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  } else if (['rejected', 'withdrawn', 'employer_declined'].includes(s)) {
    colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
  } else if (['pending', 'pending_fira_review', 'pending_employer_review'].includes(s)) {
    colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  } else {
    colorClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800'
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  )
}

export function AgencyDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

  const { data: jobsData } = useQuery({
    queryKey: ['agency-jobs'],
    queryFn: async () => { const res = await fetch('/api/jobs?userRole=local_agency'); if (!res.ok) return { jobs: [] }; return res.json() },
  })

  const { data: endorseData } = useQuery({
    queryKey: ['agency-endorsements'],
    queryFn: async () => { const res = await fetch('/api/endorsements'); if (!res.ok) return { endorsements: [] }; return res.json() },
  })

  const { data: usersData } = useQuery({
    queryKey: ['agency-applicants'],
    queryFn: async () => { const res = await fetch('/api/users?role=applicant'); if (!res.ok) return { users: [], total: 0 }; return res.json() },
  })

  const { data: notifData } = useQuery({
    queryKey: ['agency-notifications', user?.id],
    queryFn: async () => { const res = await fetch(`/api/notifications?userId=${user?.id}`); if (!res.ok) return { notifications: [] }; return res.json() },
    enabled: !!user?.id,
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const applicantCount = usersData?.total || 0
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []

  const openJobs = jobs.filter((j: any) => j.status === 'open').length
  const closedJobs = jobs.filter((j: any) => j.status === 'closed').length
  const pendingEndorse = endorsements.filter((e: any) => e.status === 'pending_fira_review').length
  const approvedEndorse = endorsements.filter((e: any) => ['fira_approved', 'employer_accepted'].includes(e.status)).length
  const inReview = endorsements.filter((e: any) => e.status === 'pending_employer_review').length
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  // Pipeline breakdown
  const pipelineStages = [
    { label: isFil ? 'Bagong Aplikasyon' : 'New Applications', count: endorsements.filter((e: any) => e.status === 'pending_fira_review').length, color: 'bg-amber-500' },
    { label: isFil ? 'FIRA Approved' : 'FIRA Approved', count: endorsements.filter((e: any) => e.status === 'fira_approved').length, color: 'bg-blue-500' },
    { label: isFil ? 'Empleyador Review' : 'Employer Review', count: inReview, color: 'bg-orange-500' },
    { label: isFil ? 'Na-accept' : 'Accepted', count: approvedEndorse, color: 'bg-emerald-500' },
  ]
  const maxPipeline = Math.max(...pipelineStages.map(s => s.count), 1)

  // Recent endorsements sorted
  const recentEndorsements = endorsements
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6)

  const firstName = user?.name?.split(' ')[0] || 'Team'
  const agencyName = user?.agencyName

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

  const stats = [
    { label: isFil ? 'Aktibong Trabaho' : 'Open Jobs', value: openJobs, icon: Briefcase, gradient: 'from-orange-500 to-amber-500' },
    { label: isFil ? 'Aplikante' : 'Applicants', value: applicantCount, icon: Users, gradient: 'from-amber-500 to-yellow-500' },
    { label: isFil ? 'Pending Endorso' : 'Pending', value: pendingEndorse, icon: FileText, gradient: 'from-rose-500 to-pink-500' },
    { label: isFil ? 'Naaprubahan' : 'Approved', value: approvedEndorse, icon: UserCheck, gradient: 'from-emerald-500 to-green-500' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isFil ? `Dashboard ng ${agencyName || 'Ahensya'}` : `${agencyName || 'Agency'} Dashboard`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFil
              ? `Maligayang pagbabalik, ${firstName}! Pamahalaan ang iyong recruitment pipeline.`
              : `Welcome back, ${firstName}! Manage your recruitment pipeline.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('messages')}>
            <MessageSquare className="h-4 w-4" />
            {isFil ? 'Mensahe' : 'Messages'}
            {unreadNotifs > 0 && (
              <Badge className="bg-rose-500 text-white text-[10px] h-4 min-w-4 px-1">{unreadNotifs}</Badge>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
          >
            <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1.5"><AnimatedCounter target={stat.value} /></p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-orange-500/20`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{isFil ? ' aktibo' : ' active'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Visualization */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                  <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                {isFil ? 'Pipeline Status' : 'Pipeline Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {pipelineStages.map((stage, idx) => (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{stage.label}</span>
                    <span className="text-sm font-bold">{stage.count}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                      transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                      className={`h-full rounded-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-between group"
                  onClick={() => navigate('ats-pipeline')}
                >
                  <span className="flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    {isFil ? 'Buksan ang ATS Pipeline' : 'Open ATS Pipeline'}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Submissions */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {isFil ? 'Kamakailang Mga Endorso' : 'Recent Endorsements'}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('agency-endorsements')}>
                  {isFil ? 'Lahat' : 'All'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentEndorsements.length === 0 ? (
                <div className="text-center py-10">
                  <Send className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang endorsement.' : 'No endorsements yet.'}</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate('agency-applicants')}>
                    {isFil ? 'Simulan ang Endorso' : 'Start Endorsing'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {recentEndorsements.map((e: any, idx: number) => {
                    const applicant = e.application?.applicant
                    const job = e.application?.jobOrder
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(applicant?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{applicant?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{job?.title || ''} · {job?.country || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <StatusBadge status={e.status} />
                          {e.createdAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />{new Date(e.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom: Your Jobs + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                    <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  {isFil ? 'Iyong Mga Trabaho' : 'Your Jobs'}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('agency-jobs')}>
                  {isFil ? 'Lahat' : 'All'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang trabaho.' : 'No jobs posted yet.'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {jobs.slice(0, 6).map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate('ats-pipeline', { jobId: job.id })}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.country} · {job._count?.applications || 0} {isFil ? 'aplikante' : 'applicants'}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 ml-2 capitalize">{job.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { icon: Briefcase, label: isFil ? 'Mga Trabaho' : 'Manage Jobs', view: 'agency-jobs' as const },
                { icon: Users, label: isFil ? 'Mga Aplikante' : 'Applicants', view: 'agency-applicants' as const },
                { icon: Send, label: isFil ? 'Mga Endorso' : 'Endorsements', view: 'agency-endorsements' as const },
                { icon: Columns, label: 'ATS Pipeline', view: 'ats-pipeline' as const },
                { icon: MessageSquare, label: isFil ? 'Mensahe' : 'Messages', view: 'messages' as const },
              ].map((action) => (
                <Button
                  key={action.view}
                  variant="outline"
                  className="w-full justify-between h-10 group"
                  onClick={() => navigate(action.view)}
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>{action.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
