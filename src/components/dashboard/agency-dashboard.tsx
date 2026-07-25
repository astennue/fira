'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, Users, FileText, UserCheck, ArrowRight, Send, Columns,
  MessageSquare, Clock, TrendingUp, ChevronRight, UserPlus, BarChart3, Zap,
  Bell,
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

/* ─── Animated Counter ─── */
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

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  let colorClass = ''
  if (['hired', 'employer_accepted', 'fira_approved', 'completed'].includes(s)) {
    colorClass =
      'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
  } else if (['rejected', 'withdrawn', 'employer_declined', 'fira_rejected'].includes(s)) {
    colorClass =
      'bg-red-100/70 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200/60 dark:border-red-800/50'
  } else if (['pending', 'pending_fira_review', 'pending_employer_review'].includes(s)) {
    colorClass =
      'bg-amber-100/70 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50'
  } else {
    colorClass =
      'bg-orange-100/70 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/50'
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${colorClass}`}
    >
      {status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  )
}

/* ─── Glassmorphism Card wrapper ─── */
function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/20 dark:border-white/10
        bg-white/60 dark:bg-[var(--color-card)]/60
        backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20
        ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Glass stat card ─── */
function GlassStatCard({
  label,
  value,
  icon: Icon,
  gradient,
  delay,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <GlassCard className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-extrabold tracking-tight">
                <AnimatedCounter target={value} />
              </p>
            </div>
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Active</span>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   AGENCY DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export function AgencyDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

  /* ── API Queries ── */
  const { data: jobsData } = useQuery({
    queryKey: ['agency-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=local_agency')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: endorseData } = useQuery({
    queryKey: ['agency-endorsements'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const { data: usersData } = useQuery({
    queryKey: ['agency-applicants'],
    queryFn: async () => {
      const res = await fetch('/api/users?role=applicant')
      if (!res.ok) return { users: [], total: 0 }
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['agency-notifications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${user?.id}`)
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  /* ── Derived Data ── */
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const applicantCount = usersData?.total || 0
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []

  const openJobs = jobs.filter((j: Record<string, unknown>) => j.status === 'open').length
  const pendingEndorse = endorsements.filter((e: Record<string, unknown>) => e.status === 'pending_fira_review').length
  const approvedEndorse = endorsements.filter((e: Record<string, unknown>) =>
    ['fira_approved', 'employer_accepted'].includes(e.status as string)
  ).length
  const inReview = endorsements.filter((e: Record<string, unknown>) => e.status === 'pending_employer_review').length
  const unreadNotifs = notifications.filter((n: Record<string, unknown>) => !n.read).length

  /* ── Pipeline Stages ── */
  const pipelineStages = [
    {
      label: isFil ? 'Bagong Aplikasyon' : 'New Applications',
      count: pendingEndorse,
      color: 'bg-amber-500',
    },
    {
      label: isFil ? 'FIRA Approved' : 'FIRA Approved',
      count: endorsements.filter((e: Record<string, unknown>) => e.status === 'fira_approved').length,
      color: 'bg-blue-500',
    },
    {
      label: isFil ? 'Empleyador Review' : 'Employer Review',
      count: inReview,
      color: 'bg-orange-500',
    },
    {
      label: isFil ? 'Na-accept' : 'Accepted',
      count: approvedEndorse,
      color: 'bg-emerald-500',
    },
  ]
  const maxPipeline = Math.max(...pipelineStages.map((s) => s.count), 1)

  /* ── Recent Endorsements ── */
  const recentEndorsements = [...endorsements]
    .sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        new Date((b.createdAt as string) || 0).getTime() - new Date((a.createdAt as string) || 0).getTime()
    )
    .slice(0, 8)

  /* ── User Info ── */
  const firstName = user?.name?.split(' ')[0] || 'Team'
  const agencyName = user?.agencyName

  /* ── Stats ── */
  const stats = [
    { label: isFil ? 'Aktibong Trabaho' : 'Open Jobs', value: openJobs, icon: Briefcase, gradient: 'from-orange-500 to-amber-500' },
    { label: isFil ? 'Aplikante' : 'Applicants', value: applicantCount, icon: Users, gradient: 'from-amber-500 to-yellow-500' },
    { label: isFil ? 'Pending Endorso' : 'Pending Endorsements', value: pendingEndorse, icon: FileText, gradient: 'from-rose-500 to-orange-500' },
    { label: isFil ? 'Naaprubahan' : 'Approved', value: approvedEndorse, icon: UserCheck, gradient: 'from-emerald-500 to-teal-500' },
  ]

  /* ── Quick Actions ── */
  const quickActions = [
    { icon: Briefcase, label: isFil ? 'Mga Trabaho' : 'Manage Jobs', view: 'agency-jobs' as const },
    { icon: Users, label: isFil ? 'Mga Aplikante' : 'Applicants', view: 'agency-applicants' as const },
    { icon: Send, label: isFil ? 'Mga Endorso' : 'Endorsements', view: 'agency-endorsements' as const },
    { icon: Columns, label: 'ATS Pipeline', view: 'ats-pipeline' as const },
    { icon: MessageSquare, label: isFil ? 'Mensahe' : 'Messages', view: 'messages' as const },
  ]

  /* ── Animation Variants ── */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════════════ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
            {isFil ? `Dashboard ng ${agencyName || 'Ahensya'}` : `${agencyName || 'Agency'} Dashboard`}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            {isFil
              ? `Maligayang pagbabalik, ${firstName}! Pamahalaan ang iyong recruitment pipeline.`
              : `Welcome back, ${firstName}! Manage your recruitment pipeline.`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
          onClick={() => navigate('messages')}
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">{isFil ? 'Mensahe' : 'Messages'}</span>
          {unreadNotifs > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
              {unreadNotifs > 99 ? '99+' : unreadNotifs}
            </span>
          )}
        </Button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          STATS (2x2 mobile, 4 across desktop)
         ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <GlassStatCard key={stat.label} {...stat} delay={0.1 + i * 0.08} />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT: 3 columns on desktop
         ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* ──── COLUMN 1: Pipeline Status (1/3) ──── */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/20">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Pipeline Status' : 'Pipeline Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              {pipelineStages.map((stage, idx) => (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                      <span className="text-sm font-medium">{stage.label}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{stage.count}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-muted/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                      transition={{ delay: 0.4 + idx * 0.12, duration: 0.7, ease: 'easeOut' }}
                      className={`h-full rounded-full ${stage.color} shadow-sm`}
                    />
                  </div>
                </div>
              ))}

              {/* Total pipeline count */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground font-medium">{isFil ? 'Kabuuang Pipeline' : 'Total Pipeline'}</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {endorsements.length} {isFil ? 'endorso' : 'endorsements'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between group border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
                  onClick={() => navigate('ats-pipeline')}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Columns className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    {isFil ? 'Buksan ang ATS Pipeline' : 'Open ATS Pipeline'}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 dark:text-amber-400" />
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ──── COLUMN 2: Recent Endorsements (2/3) ──── */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md shadow-amber-500/20">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                  {isFil ? 'Kamakailang Mga Endorso' : 'Recent Endorsements'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => navigate('agency-endorsements')}
                >
                  {isFil ? 'Tingnan Lahat' : 'View All'}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentEndorsements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                    <Send className="h-8 w-8 text-amber-400" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {isFil ? 'Wala pang endorsement.' : 'No endorsements yet.'}
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20"
                    onClick={() => navigate('agency-applicants')}
                  >
                    {isFil ? 'Simulan ang Endorso' : 'Start Endorsing'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {recentEndorsements.map((e: Record<string, unknown>, idx: number) => {
                    const applicant = (e.application as Record<string, unknown>)?.applicant as Record<string, unknown> | undefined
                    const job = (e.application as Record<string, unknown>)?.jobOrder as Record<string, unknown> | undefined
                    const applicantName = (applicant?.name as string) || 'Unknown'
                    const jobTitle = (job?.title as string) || ''
                    const jobCountry = (job?.country as string) || ''
                    const status = (e.status as string) || ''
                    const createdAt = e.createdAt as string | undefined

                    return (
                      <motion.div
                        key={e.id as string}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.04, duration: 0.35 }}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:bg-accent/40 dark:hover:bg-accent/20 transition-colors group"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-orange-500/20">
                            {applicantName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{applicantName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {jobTitle}
                              {jobCountry ? ` · ${jobCountry}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 ml-3 shrink-0">
                          <StatusBadge status={status} />
                          {createdAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM ROW: Your Jobs (2/3) + Quick Actions (1/3)
         ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* ──── LEFT: Your Jobs (2/3) ──── */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-md shadow-orange-500/20">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  {isFil ? 'Iyong Mga Trabaho' : 'Your Jobs'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => navigate('agency-jobs')}
                >
                  {isFil ? 'Tingnan Lahat' : 'View All'}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-3">
                    <Briefcase className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {isFil ? 'Wala pang trabaho.' : 'No jobs posted yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {jobs.slice(0, 6).map((job: Record<string, unknown>) => {
                    const jobStatus = (job.status as string) || ''
                    const isJobOpen = jobStatus === 'open'
                    return (
                      <motion.div
                        key={job.id as string}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:bg-accent/40 dark:hover:bg-accent/20 transition-all cursor-pointer group"
                        onClick={() => navigate('ats-pipeline', { jobId: job.id as string })}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${isJobOpen ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted'}`}>
                            <Briefcase className={`h-4 w-4 ${isJobOpen ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                              {job.title as string}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {job.country as string} · {((job._count as Record<string, unknown>)?.applications as number) || 0}{' '}
                              {isFil ? 'aplikante' : 'applicants'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] capitalize ${isJobOpen ? 'bg-amber-100/70 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50' : ''}`}
                          >
                            {jobStatus}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ──── RIGHT: Quick Actions (1/3) ──── */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-bold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-md shadow-amber-500/20">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action.view}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between h-11 px-4 rounded-xl border border-border/50 text-sm font-medium
                    hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-200 dark:hover:border-amber-800/50
                    transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(action.view)}
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{action.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                </motion.button>
              ))}
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Global scrollbar style ── */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(180, 130, 60, 0.3);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(180, 130, 60, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.25);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </motion.div>
  )
}
