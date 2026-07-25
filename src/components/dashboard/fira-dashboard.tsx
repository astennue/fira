'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building,
  Building2,
  Users,
  Briefcase,
  Send,
  ArrowRight,
  UserCheck,
  Columns3,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Globe,
  ChevronRight,
  Zap,
  BarChart3,
  UserPlus,
  Eye,
  BrainCircuit,
  Bell,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  MapPin,
  LayoutDashboard,
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    motionVal.set(target)
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return () => unsub()
  }, [target, motionVal, rounded])

  return <>{display}</>
}

// ─── Glass Card wrapper ──────────────────────────────────────────────────────
function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <Card
      className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/40 ${
        hover ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </Card>
  )
}

// ─── Country flag emoji helper ────────────────────────────────────────────────
function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Saudi Arabia': '🇸🇦',
    'UAE': '🇦🇪',
    'Qatar': '🇶🇦',
    'Kuwait': '🇰🇼',
    'Bahrain': '🇧🇭',
    'Oman': '🇴🇲',
    'Singapore': '🇸🇬',
    'Hong Kong': '🇭🇰',
    'Taiwan': '🇹🇼',
    'Malaysia': '🇲🇾',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Morocco': '🇲🇦',
    'Philippines': '🇵🇭',
  }
  return flags[country] || '🌍'
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export function FiraDashboard() {
  const { navigate, language, user } = useAppStore()
  const isFil = language === 'fil'

  // ── Data queries ────────────────────────────────────────────────────────────
  const { data: usersData } = useQuery({
    queryKey: ['fira-users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) return { users: [], total: 0 }
      return res.json()
    },
  })

  const { data: jobsData } = useQuery({
    queryKey: ['fira-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: endorseData } = useQuery({
    queryKey: ['fira-endorsements'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const { data: agenciesData } = useQuery({
    queryKey: ['fira-agencies'],
    queryFn: async () => {
      const res = await fetch('/api/agencies')
      if (!res.ok) return { agencies: [] }
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['fira-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
  })

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
  const pendingAgencies = agencies.filter((a: any) => !a.isApproved).length
  const totalEndorsements = endorsements.length
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  // ── Sorted recent data ───────────────────────────────────────────────────
  const recentEndorsements = useMemo(() => {
    return [...endorsements]
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8)
  }, [endorsements])

  const recentUsers = useMemo(() => {
    return [...users]
      .filter((u: any) => u.role === 'applicant')
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
  }, [users])

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6)
  }, [jobs])

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
      label: isFil ? 'Kabuuang Ahensya' : 'Total Agencies',
      value: agencies.length,
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

  // ── Quick actions ──────────────────────────────────────────────────────────
  const quickActions = [
    {
      icon: Building,
      label: isFil ? 'Mga Ahensya' : 'Agencies',
      view: 'fira-agencies' as const,
      badge: pendingAgencies > 0 ? pendingAgencies : undefined,
    },
    {
      icon: Building2,
      label: isFil ? 'Empleyador' : 'Employers',
      view: 'fira-employers' as const,
      badge: undefined,
    },
    {
      icon: Users,
      label: isFil ? 'Aplikante' : 'Applicants',
      view: 'fira-applicants' as const,
      badge: undefined,
    },
    {
      icon: Briefcase,
      label: isFil ? 'Lahat ng Trabaho' : 'All Jobs',
      view: 'fira-jobs' as const,
      badge: activeJobs > 0 ? activeJobs : undefined,
    },
    {
      icon: Columns3,
      label: 'ATS Pipeline',
      view: 'ats-pipeline' as const,
      badge: undefined,
    },
    {
      icon: BrainCircuit,
      label: 'AI Matching',
      view: 'ai-matching' as const,
      badge: undefined,
    },
    {
      icon: MessageSquare,
      label: isFil ? 'Mensahe' : 'Messages',
      view: 'messages' as const,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
  ]

  // ── Status color helper ───────────────────────────────────────────────────
  function getStatusColor(status: string) {
    if (status === 'pending_fira_review') return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' }
    if (status === 'fira_approved') return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' }
    if (status === 'fira_rejected') return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-700' }
    if (status === 'pending_employer_review') return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' }
    if (status === 'employer_accepted') return { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', border: 'border-green-300 dark:border-green-700' }
    if (status === 'employer_declined') return { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-300 dark:border-red-700' }
    return { bg: 'bg-gray-100 dark:bg-gray-800/40', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' }
  }

  function getJobStatusBadge(status: string) {
    if (status === 'open') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
    if (status === 'closed') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700'
    if (status === 'filled') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400 border-gray-300 dark:border-gray-700'
  }

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* ═══════════════ HEADER ═══════════════ */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25">
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
            className="gap-1.5 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/40"
            onClick={() => navigate('messages')}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{isFil ? 'Mensahe' : 'Messages'}</span>
            {unreadNotifs > 0 && (
              <span className="relative flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1">
                <span className="text-[10px] font-bold text-white leading-none">{unreadNotifs}</span>
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* ═══════════════ ALERT BANNER ═══════════════ */}
      {(pendingAgencies > 0 || pendingEndorse > 0) && (
        <motion.div variants={item}>
          <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/20 backdrop-blur-xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 shrink-0">
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

      {/* ═══════════════ STATS GRID ═══════════════ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard hover className="relative overflow-hidden group">
              {/* Subtle gradient accent bar at top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">
                      <AnimatedCounter target={stat.value} />
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} ring-4 ${stat.ringColor} ring-inset`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>{isFil ? 'Aktibo' : 'Active'}</span>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════════ MAIN CONTENT: 3-Column ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─────── COLUMN 1: Recent Activity ─────── */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Kamakailang Aktibidad' : 'Recent Activity'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isFil ? 'Mga kamakailang endorsement' : 'Latest endorsements and reviews'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {recentEndorsements.map((e: any, idx: number) => {
                  const applicant = e.application?.applicant
                  const job = e.application?.jobOrder
                  const isPending = e.status === 'pending_fira_review'
                  const sc = getStatusColor(e.status)

                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        isPending
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/40'
                          : 'bg-white/50 dark:bg-gray-800/30 border-border hover:border-emerald-300 dark:hover:border-emerald-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
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
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 px-1.5 font-medium ${sc.bg} ${sc.text} ${sc.border} border`}
                          >
                            {e.status?.replace(/_/g, ' ')}
                          </Badge>
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
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-3">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isFil ? 'Wala pang aktibidad.' : 'No recent activity.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ─────── COLUMN 2: Recent Registrations ─────── */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Bagong Registrasyon' : 'Recent Registrations'}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isFil ? 'Bagong mga aplikante' : 'Newly registered applicants'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {recentUsers.map((u: any, idx: number) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate('fira-applicant-detail', { userId: u.id })}
                  >
                    {/* Avatar circle with initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-blue-500/20 ring-2 ring-white/50 dark:ring-gray-700/50">
                      {(u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {u.name || (isFil ? 'Hindi kilala' : 'Unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || ''}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 h-5 px-1.5 font-medium ${
                        u.isApproved
                          ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                          : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {u.isApproved ? (isFil ? 'Aktibo' : 'Active') : 'Pending'}
                    </Badge>
                  </motion.div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isFil ? 'Wala pang bagong aplikante.' : 'No new applicants yet.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ─────── COLUMN 3: Quick Actions + Mini Jobs ─────── */}
        <motion.div variants={item} className="space-y-6">
          {/* Quick Actions */}
          <GlassCard>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, idx) => (
                  <motion.div
                    key={action.view}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.04 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 group bg-white/50 dark:bg-gray-800/30 border-border hover:bg-accent/70 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200"
                      onClick={() => navigate(action.view)}
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                          <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {action.badge !== undefined && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5">
                            <span className="text-[10px] font-bold text-white leading-none">
                              {action.badge}
                            </span>
                          </span>
                        )}
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </GlassCard>

          {/* Mini Jobs List */}
          <GlassCard>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/20">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <span>{isFil ? 'Mga Trabaho' : 'Jobs'}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('fira-jobs')}
                >
                  {isFil ? 'Lahat' : 'All'}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-3">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isFil ? 'Wala pang trabaho.' : 'No jobs yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {recentJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate('ats-pipeline', { jobId: job.id })}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none" role="img" aria-label={job.country}>
                            {getCountryFlag(job.country)}
                          </span>
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 ml-7">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-[11px] text-muted-foreground truncate">{job.country}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ml-2 capitalize font-medium ${getJobStatusBadge(job.status)}`}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
