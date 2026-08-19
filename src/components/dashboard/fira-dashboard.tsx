'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building,
  Building2,
  Users,
  Briefcase,
  Send,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Activity,
  Clock,
  Shield,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  CircleDot,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { StatusBadge } from '@/components/shared/status-badge'
import { GlassCard } from '@/components/shared/glass-card'
import { getInitials } from '@/components/shared/get-initials'

// ─── FIRA Dashboard Skeleton ──────────────────────────────────────────────
function FiraDashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export function FiraDashboard() {
  const { navigate, language, user } = useAppStore()
  const isFil = language === 'fil'
  const [activeTab, setActiveTab] = useState<'activity' | 'registrations'>('activity')

  // ── Data queries ────────────────────────────────────────────────────────────
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['fira-users'],
    queryFn: async () => {
      const res = await apiFetch('/api/users')
      if (!res.ok) return { users: [], total: 0 }
      return res.json()
    },
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['fira-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: endorseData, isLoading: endorseLoading } = useQuery({
    queryKey: ['fira-endorsements'],
    queryFn: async () => {
      const res = await apiFetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const { data: agenciesData, isLoading: agenciesLoading } = useQuery({
    queryKey: ['fira-agencies'],
    queryFn: async () => {
      const res = await apiFetch('/api/agencies')
      if (!res.ok) return { agencies: [] }
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['fira-notifications'],
    queryFn: async () => {
      const res = await apiFetch('/api/notifications')
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
  })

  const isLoading = usersLoading || jobsLoading || endorseLoading || agenciesLoading

  // ── Data extraction ───────────────────────────────────────────────────────
  const users = Array.isArray(usersData?.users) ? usersData.users : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const agencies = Array.isArray(agenciesData?.agencies) ? agenciesData.agencies : []
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []

  // ── Derived data ───────────────────────────────────────────────────────────
  const applicantCount = users.filter((u: any) => u.role === 'applicant').length
  const employerCount = users.filter((u: any) => u.role === 'employer').length
  const activeJobs = jobs.filter((j: any) => j.status === 'open').length
  const pendingEndorse = endorsements.filter((e: any) => e.status === 'pending_fira_review').length
  const partnerAgencies = agencies.filter((a: any) => a.isApproved === true).length
  const pendingAgencies = agencies.filter((a: any) => !a.isApproved).length
  const totalEndorsements = endorsements.length
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  // ── Sorted recent data (limited to 5) ───────────────────────────────────
  const recentEndorsements = useMemo(() => {
    return [...endorsements]
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
  }, [endorsements])

  const recentUsers = useMemo(() => {
    return [...users]
      .filter((u: any) => u.role === 'applicant')
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
  }, [users])

  // ── Animation variants ────────────────────────────────────────────────────
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  }

  // ── Stats configuration ───────────────────────────────────────────────────
  const stats = [
    {
      label: isFil ? 'Mga Ahensyang Partner' : 'Partner Agencies',
      value: partnerAgencies,
      icon: Building,
      gradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/25',
      ringColor: 'ring-blue-500/20',
    },
    {
      label: isFil ? 'Empleyador' : 'Employers',
      value: employerCount,
      icon: Building2,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
      ringColor: 'ring-violet-500/20',
    },
    {
      label: isFil ? 'Aplikante' : 'Applicants',
      value: applicantCount,
      icon: Users,
      gradient: 'from-emerald-500 to-green-600',
      shadowColor: 'shadow-emerald-500/25',
      ringColor: 'ring-emerald-500/20',
    },
    {
      label: isFil ? 'Aktibong Trabaho' : 'Active Jobs',
      value: activeJobs,
      icon: Briefcase,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      ringColor: 'ring-amber-500/20',
    },
    {
      label: isFil ? 'Pending Endorso' : 'Pending Endorsements',
      value: pendingEndorse,
      icon: Send,
      gradient: 'from-rose-500 to-pink-600',
      shadowColor: 'shadow-rose-500/25',
      ringColor: 'ring-rose-500/20',
    },
    {
      label: isFil ? 'Kabuuang Endorso' : 'Total Endorsements',
      value: totalEndorsements,
      icon: BarChart3,
      gradient: 'from-cyan-500 to-teal-600',
      shadowColor: 'shadow-cyan-500/25',
      ringColor: 'ring-cyan-500/20',
    },
  ]

  // ──────────────────────────────────────────────────────────────────────────
  if (isLoading) return <FiraDashboardSkeleton />

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="view-transition space-y-6 pb-8">
      {/* ═════════════════ HEADER ═══════════════ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                FIRA Command Center
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isFil
                  ? 'Pangkalahatang pamahalaan at monitoring ng sistema'
                  : 'System-wide management and monitoring'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate('messages')}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{isFil ? 'Mensahe' : 'Messages'}</span>
            {unreadNotifs > 0 && (
              <span className="relative flex h-4 min-w-4 items-center justify-center bg-rose-500 px-1">
                <span className="text-[10px] font-bold text-white leading-none">{unreadNotifs}</span>
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* ═════════════════ ALERT BANNER ═══════════════ */}
      {(pendingAgencies > 0 || pendingEndorse > 0) && (
        <motion.div variants={item}>
          <div className="border border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/20 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {isFil ? 'Kinakailangan ng Aksyon' : 'Action Required'}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingAgencies > 0 && (
                  isFil
                    ? `${pendingAgencies} ahensya ang naghihintay ng approval`
                    : `${pendingAgencies} agenc${pendingAgencies === 1 ? 'y' : 'ies'} pending approval`
                )}
                {pendingAgencies > 0 && pendingEndorse > 0 && ' · '}
                {pendingEndorse > 0 && (
                  isFil
                    ? `${pendingEndorse} endorsement ang naghihintay`
                    : `${pendingEndorse} endorsement${pendingEndorse === 1 ? '' : 's'} pending review`
                )}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('fira-agencies')}
              className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25"
            >
              {isFil ? 'Review' : 'Review'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ═════════════════ STATS GRID ═══════════════ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard hover className="relative overflow-hidden group p-0">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">
                      <AnimatedCounter value={stat.value} />
                    </p>
                  </div>
                  <div
                    className={`p-2.5 bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} ring-4 ${stat.ringColor} ring-inset`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ═════════════════ TABBED CONTENT AREA ═══════════════ */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'activity' | 'registrations')}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-1.5" />
              {isFil ? 'Kamakailang Aktibidad' : 'Recent Activity'}
            </TabsTrigger>
            <TabsTrigger value="registrations">
              <UserPlus className="h-4 w-4 mr-1.5" />
              {isFil ? 'Bagong Registrasyon' : 'Recent Registrations'}
            </TabsTrigger>
          </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50">
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {isFil ? 'Kamakailang Aktibidad' : 'Recent Activity'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isFil ? 'Mga kamakailang endorsement' : 'Latest endorsements and reviews'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {recentEndorsements.map((e: any, idx: number) => {
                  const applicant = e.application?.applicant
                  const job = e.application?.jobOrder
                  const isPending = e.status === 'pending_fira_review'

                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex items-start gap-3 p-3 border transition-all duration-200 hover:shadow-md ${
                        isPending
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40'
                          : 'bg-card border-border hover:border-emerald-300 dark:hover:border-emerald-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 flex items-center justify-center shrink-0 ${
                          isPending ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'
                        }`}
                      >
                        {isPending ? (
                          <CircleDot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {applicant?.name || (isFil ? 'Aplikante' : 'Applicant')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {isFil ? 'para sa' : 'for'} {job?.title || (isFil ? 'Trabaho' : 'Job')}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <StatusBadge status={e.status} />
                          {e.createdAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(e.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {recentEndorsements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-muted mb-3">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isFil ? 'Wala pang aktibidad.' : 'No recent activity.'}
                    </p>
                  </div>
                )}
              </div>
              {endorsements.length > 5 && (
                <Button variant="ghost" size="sm" className="mt-4 w-full text-muted-foreground" onClick={() => navigate('fira-applicants')}>
                  {isFil ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {isFil ? 'Bagong Registrasyon' : 'Recent Registrations'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isFil ? 'Bagong mga aplikante' : 'Newly registered applicants'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {recentUsers.map((u: any, idx: number) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 p-3 border border-border hover:bg-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate('fira-applicant-detail', { userId: u.id })}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-blue-500/20">
                      {getInitials(u.name || '')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {u.name || (isFil ? 'Hindi kilala' : 'Unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || ''}</p>
                    </div>
                    <StatusBadge status={u.isApproved ? 'active' : 'pending'} />
                  </motion.div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-muted mb-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isFil ? 'Wala pang bagong aplikante.' : 'No new applicants yet.'}
                    </p>
                  </div>
                )}
              </div>
              {users.length > 5 && (
                <Button variant="ghost" size="sm" className="mt-4 w-full text-muted-foreground" onClick={() => navigate('fira-applicants')}>
                  {isFil ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
