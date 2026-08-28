'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase,
  UserCheck,
  CheckCircle,
  ArrowRight,
  Eye,
  MessageSquare,
  Clock,
  TrendingUp,
  ChevronRight,
  XCircle,
  Star,
  Zap,
  Shield,
  BarChart3,
  Target,
  Globe,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, type ViewName } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/fetch'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { getInitials } from '@/components/shared/get-initials'

/* ------------------------------------------------------------------ */
/*  Match Score Ring  (SVG circle animation)                           */
/* ------------------------------------------------------------------ */
function MatchScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score || 0))
  const offset = circumference - (clamped / 100) * circumference

  const color =
    clamped >= 80
      ? 'text-green-500 dark:text-green-400'
      : clamped >= 60
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-rose-500 dark:text-rose-400'

  const trackColor =
    clamped >= 80
      ? 'stroke-green-100 dark:stroke-green-900/60'
      : clamped >= 60
        ? 'stroke-amber-200 dark:stroke-amber-900/60'
        : 'stroke-rose-200 dark:stroke-rose-900/60'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={trackColor}
          strokeWidth="3.5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-xs font-bold', color)}>{score || 0}%</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Initials Circle (NO PHOTOS — privacy safe)                        */
/* ------------------------------------------------------------------ */
function InitialsCircle({
  name,
  size = 'md',
  isPending = false,
}: {
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  isPending?: boolean
}) {
  const initials = getInitials(name || '')

  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0 bg-gradient-to-br',
        isPending
          ? 'from-green-400 to-teal-500 text-white shadow-lg shadow-green-500/25'
          : 'from-teal-400 to-green-600 text-white shadow-lg shadow-teal-500/20',
        sizeMap[size]
      )}
    >
      {initials}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton for the entire dashboard                          */
/* ------------------------------------------------------------------ */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-muted"
          >
            <div className="p-4 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        ))}
      </div>
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] rounded-2xl border border-border bg-muted" />
        <div className="space-y-4">
          <div className="h-64 rounded-2xl border border-border bg-muted" />
          <div className="h-56 rounded-2xl border border-border bg-muted" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card with gradient accent                                      */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  shadowColor,
  warning,
  delay = 0,
}: {
  label: string
  value: number
  icon: any
  gradient: string
  shadowColor: string
  warning?: { text: string }
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + delay * 0.07, duration: 0.4 }}
    >
      <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1.5">
                <AnimatedCounter value={value} />
              </p>
            </div>
            <div
              className={cn(
                'p-2.5 rounded-xl bg-gradient-to-br shadow-lg',
                gradient,
                shadowColor
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          {warning && value > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span>{warning.text}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Employer Dashboard — Main Component                                */
/* ------------------------------------------------------------------ */
export function EmployerDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

  /* ---- API queries ---- */
  const { data: endorseData, isLoading: endorseLoading } = useQuery({
    queryKey: ['employer-endorsements'],
    queryFn: async () => {
      const res = await apiFetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const { data: jobsData } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/notifications?userId=${user?.id}`)
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  /* ---- Derived data ---- */
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  const pending = endorsements.filter((e: any) => e.status === 'pending_employer_review').length
  const accepted = endorsements.filter((e: any) => e.status === 'employer_accepted').length
  const declined = endorsements.filter((e: any) => e.status === 'employer_declined').length
  const myJobsCount = jobs.filter((j: any) => j.employerId === user?.id || j.createdById === user?.id).length
  const acceptRate = endorsements.length > 0 ? Math.round((accepted / endorsements.length) * 100) : 0

  /* ---- Sort endorsements: pending first, then newest ---- */
  const sortedEndorsements = [...endorsements].sort((a: any, b: any) => {
    const aPending = a.status === 'pending_employer_review' ? 0 : 1
    const bPending = b.status === 'pending_employer_review' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })

  /* ---- Animation variants ---- */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  /* ---- Stat definitions ---- */
  const stats = [
    {
      label: isFil ? 'Naghihintay ng Review' : 'Pending Review',
      value: pending,
      icon: Eye,
      gradient: 'from-amber-500 to-amber-500',
      shadowColor: 'shadow-amber-500/20',
      warning: pending > 0
        ? { text: isFil ? 'Kailangan ng aksyon' : 'Needs action' }
        : undefined,
    },
    {
      label: isFil ? 'Na-accept' : 'Accepted',
      value: accepted,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-500',
      shadowColor: 'shadow-green-500/20',
    },
    {
      label: isFil ? 'Ibinalewala' : 'Declined',
      value: declined,
      icon: XCircle,
      gradient: 'from-rose-500 to-red-500',
      shadowColor: 'shadow-rose-500/20',
    },
    {
      label: isFil ? 'Kabuuang Endorso' : 'Total Endorsements',
      value: endorsements.length,
      icon: BarChart3,
      gradient: 'from-teal-500 to-green-600',
      shadowColor: 'shadow-teal-500/20',
    },
  ]

  /* ---- Quick action buttons ---- */
  const quickActions: {
    icon: any
    label: string
    view: ViewName
    badge?: number
  }[] = [
    {
      icon: UserCheck,
      label: isFil ? 'Review Kandidato' : 'Review Candidates',
      view: 'employer-endorsed',
      badge: pending > 0 ? pending : undefined,
    },
    {
      icon: Briefcase,
      label: isFil ? 'Mga Trabaho Ko' : 'My Jobs',
      view: 'employer-jobs',
      badge: myJobsCount > 0 ? myJobsCount : undefined,
    },
    {
      icon: MessageSquare,
      label: isFil ? 'Mensahe' : 'Messages',
      view: 'messages',
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    {
      icon: Target,
      label: 'AI Matching',
      view: 'ai-matching',
    },
  ]

  /* ---- Gradient color map for initials (deterministic based on name) ---- */
  const gradientMap = [
    'from-green-400 to-teal-500',
    'from-teal-400 to-cyan-500',
    'from-green-500 to-green-600',
    'from-green-400 to-green-600',
    'from-teal-500 to-green-400',
    'from-cyan-400 to-teal-600',
  ]
  function getGradient(name: string, idx: number) {
    const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return gradientMap[(code + idx) % gradientMap.length]
  }

  /* ---- Loading state ---- */
  if (endorseLoading) return <DashboardSkeleton />

  /* ---- Render ---- */
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="view-transition space-y-6 pb-8">
      {/* ================================================================ */}
      {/*  HEADER                                                          */}
      {/* ================================================================ */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-green-700 via-teal-600 to-green-600 dark:from-green-400 dark:via-teal-300 dark:to-green-400 bg-clip-text text-transparent">
            {isFil ? 'Dashboard ng Empleyador' : 'Employer Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFil
              ? 'Pamahalaan ang mga endorsed na kandidato at mga job postings'
              : 'Manage endorsed candidates and job postings'}
          </p>
        </div>

        {/* Messages button with unread badge */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-green-100 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
          onClick={() => navigate('messages')}
        >
          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
          {isFil ? 'Mensahe' : 'Messages'}
          {unreadNotifs > 0 && (
            <Badge className="bg-rose-500 text-white text-[10px] h-4 min-w-4 px-1.5 rounded-full">
              {unreadNotifs}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* ================================================================ */}
      {/*  STATS — 4 cards, 2x2 mobile, 4 across desktop                  */}
      {/* ================================================================ */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            shadowColor={stat.shadowColor}
            warning={stat.warning}
            delay={i}
          />
        ))}
      </motion.div>

      {/* ================================================================ */}
      {/*  MAIN CONTENT — 2/3 + 1/3 on desktop                            */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ------------------------------------------------------------ */}
        {/*  LEFT (2/3): Endorsed Candidates — THE MAIN FEATURE           */}
        {/* ------------------------------------------------------------ */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="rounded-2xl border border-border bg-card shadow-sm h-full">
            <div className="p-4 md:p-5 pb-0 md:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20">
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-base font-semibold">
                  {isFil ? 'Mga Inindorso na Kandidato' : 'Endorsed Candidates'}
                </h2>
                {pending > 0 && (
                  <Badge className="bg-green-500 text-white text-[10px] h-5 min-w-5 px-1.5 rounded-full font-semibold">
                    {pending} {isFil ? 'bago' : 'new'}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                onClick={() => navigate('employer-endorsed')}
              >
                {isFil ? 'Lahat' : 'All'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            <div className="p-4 pt-3 md:p-5 md:pt-3">
              {sortedEndorsements.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground">
                    {isFil ? 'Wala pang endorsement.' : 'No endorsements yet.'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isFil
                      ? 'Maghintay ng mga kandidato mula sa FIRA.'
                      : 'Waiting for candidates from FIRA.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                  {sortedEndorsements.slice(0, 10).map((e: any, idx: number) => {
                    const applicant = e.application?.applicant
                    const job = e.application?.jobOrder
                    const isPending = e.status === 'pending_employer_review'
                    const matchScore = e.matchScore || applicant?.matchScore || 0
                    const name = applicant?.name || 'Candidate'

                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.35 }}
                        className={cn(
                          'p-4 rounded-xl border transition-all duration-200 cursor-pointer group',
                          isPending
                            ? 'bg-green-50/80 dark:bg-green-950/20 border-green-100/70 dark:border-green-700/60 hover:shadow-md hover:shadow-green-500/10'
                            : 'bg-white/40 dark:bg-white/[0.02] border-white/40 dark:border-white/[0.06] hover:bg-white/60 dark:hover:bg-white/[0.04] hover:shadow-md'
                        )}
                        onClick={() => navigate('employer-endorsed')}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Initials circle — NO PHOTO */}
                          <div
                            className={cn(
                              'rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 w-11 h-11 bg-gradient-to-br shadow-lg',
                              getGradient(name, idx),
                              isPending
                                ? 'shadow-green-500/25 ring-2 ring-green-400/30 dark:ring-green-600/30'
                                : 'shadow-teal-500/15'
                            )}
                          >
                            {getInitials(name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Name + Match Score */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                                  {name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {job?.title || (isFil ? 'Posisyon' : 'Position')}
                                </p>
                              </div>
                              <MatchScoreRing score={matchScore} size={48} />
                            </div>

                            {/* Skills badges — max 4, +N more */}
                            {applicant?.skills && (
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {String(applicant.skills)
                                  .split(',')
                                  .filter((s: string) => s.trim())
                                  .slice(0, 4)
                                  .map((skill: string, si: number) => (
                                    <Badge
                                      key={si}
                                      variant="secondary"
                                      className="text-[10px] h-5 px-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0"
                                    >
                                      {skill.trim()}
                                    </Badge>
                                  ))}
                                {String(applicant.skills).split(',').filter((s: string) => s.trim()).length > 4 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-5 px-1.5 border-green-100 dark:border-green-700 text-green-600 dark:text-green-400"
                                  >
                                    +{String(applicant.skills).split(',').filter((s: string) => s.trim()).length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Experience, Country, Date */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                              {applicant?.experience && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <Star className="h-3 w-3 fill-green-500 dark:fill-green-400 text-green-500 dark:text-green-400" />
                                  {applicant.experience}
                                </span>
                              )}
                              {job?.country && (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {job.country}
                                </span>
                              )}
                              {e.createdAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(e.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------ */}
        {/*  RIGHT (1/3): Quick Actions + Accept Rate                     */}
        {/* ------------------------------------------------------------ */}
        <motion.div variants={item} className="space-y-4">
          {/* Quick Actions */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="p-4 md:p-5 pb-0 md:pb-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-base font-semibold">
                  {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
                </h2>
              </div>
            </div>

            <div className="p-4 pt-3 md:p-5 md:pt-3 space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.view}
                  variant="outline"
                  className={cn(
                    'w-full justify-between h-10 group',
                    'border-white/40 dark:border-white/[0.06]',
                    'hover:bg-green-50/80 dark:hover:bg-green-950/20',
                    'hover:border-green-100 dark:hover:border-green-700',
                    'transition-all duration-200'
                  )}
                  onClick={() => navigate(action.view)}
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    <span>{action.label}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {action.badge != null && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[10px] h-5 min-w-5 px-1.5 border-0">
                        {action.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              ))}
            </div>
          </Card>

          {/* Accept Rate */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="p-4 md:p-5 pb-0 md:pb-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/10 to-green-500/10 dark:from-teal-500/20 dark:to-green-500/20">
                  <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-base font-semibold">
                  {isFil ? 'Accept Rate' : 'Accept Rate'}
                </h2>
              </div>
            </div>

            <div className="p-4 pt-3 md:p-5 md:pt-3">
              {/* Large percentage display */}
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-green-600 to-teal-500 dark:from-green-400 dark:to-teal-300 bg-clip-text text-transparent">
                    <AnimatedCounter value={acceptRate} />
                    <span className="text-3xl">%</span>
                  </p>
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isFil ? 'ng mga endorsement ang na-accept' : 'of endorsements accepted'}
                </p>
              </div>

              {/* 3-column breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-green-100 dark:border-green-900/40">
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    <AnimatedCounter value={pending} />
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {isFil ? 'Pending' : 'Pending'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    <AnimatedCounter value={accepted} />
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {isFil ? 'Accept' : 'Accept'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    <AnimatedCounter value={declined} />
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {isFil ? 'I-decline' : 'Decline'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  )
}
