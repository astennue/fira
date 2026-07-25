'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, FileText, Clock, Sparkles, ArrowRight, Users,
  Eye, Heart, Bell, CalendarDays,
  TrendingUp, MessageSquare, Star, Target, ClipboardList, ChevronRight,
  Zap, MapPin, DollarSign, CheckCircle2, AlertCircle
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

/* ─── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: duration * 1000 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    motionVal.set(target)
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    return () => unsubscribe()
  }, [target, motionVal, rounded])

  return <>{display}</>
}

/* ─── Glass Card ────────────────────────────────────────────── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/[0.04] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Status Badge ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  let colorClasses = ''
  if (['hired', 'offered', 'deployed', 'completed'].includes(s)) {
    colorClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  } else if (['rejected', 'withdrawn', 'employer_declined'].includes(s)) {
    colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
  } else if (['pending', 'pending_fira_review', 'pending_employer_review', 'screening', 'under_review'].includes(s)) {
    colorClasses = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  } else if (['shortlisted', 'interview', 'fira_approved'].includes(s)) {
    colorClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  } else {
    colorClasses = 'bg-muted text-muted-foreground border-border'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClasses}`}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  )
}

/* ─── Match Score Badge ─────────────────────────────────────── */
function MatchScoreBadge({ score }: { score: number }) {
  const colorClasses =
    score >= 85
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : score >= 65
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  return (
    <div className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${colorClasses}`}>
      {Math.round(score)}%
    </div>
  )
}

/* ─── SVG Pattern (dots + grid overlay for welcome banner) ─── */
function BannerPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="banner-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" />
        </pattern>
        <pattern id="banner-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#banner-dots)" />
      <rect width="100%" height="100%" fill="url(#banner-grid)" />
    </svg>
  )
}

/* ─── Mock Data ─────────────────────────────────────────────── */
const mockRecommendedJobs = [
  { id: 'rj1', title: 'Domestic Helper', country: 'Hong Kong', company: 'ABC Employment', salary: 'HKD 5,500/mo', matchScore: 92 },
  { id: 'rj2', title: 'Caregiver', country: 'Canada', company: 'CareWell Agency', salary: 'CAD 3,200/mo', matchScore: 87 },
  { id: 'rj3', title: 'Factory Worker', country: 'Taiwan', company: 'TechParts Inc.', salary: 'TWD 24,000/mo', matchScore: 81 },
  { id: 'rj4', title: 'Hotel Staff', country: 'UAE', company: 'Desert Sands Hospitality', salary: 'AED 2,500/mo', matchScore: 78 },
]

const mockNotifications = [
  { id: 'n1', title: 'Application Updated', desc: 'Your application for Domestic Helper (Hong Kong) has been shortlisted.', time: '2h ago', read: false },
  { id: 'n2', title: 'New Job Match', desc: 'A new Caregiver position in Canada matches your profile.', time: '5h ago', read: false },
  { id: 'n3', title: 'Document Reminder', desc: 'Please upload your updated passport copy.', time: '1d ago', read: true },
  { id: 'n4', title: 'Interview Scheduled', desc: 'Your interview with ABC Employment is on March 15.', time: '2d ago', read: true },
]

const mockTasks = [
  { id: 't1', title: 'Upload passport copy', deadline: 'Mar 12', urgent: true },
  { id: 't2', title: 'Complete medical exam', deadline: 'Mar 18', urgent: false },
  { id: 't3', title: 'Submit signed contract', deadline: 'Mar 22', urgent: false },
]

/* ─── Framer Motion Variants ───────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
}

/* ═══════════════════════════════════════════════════════════ */
/*  Main Component                                             */
/* ═══════════════════════════════════════════════════════════ */
export function ApplicantDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

  /* ─── API Queries ──────────────────────────────────────── */
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

  const { data: notifData } = useQuery({
    queryKey: ['my-notifications', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${user?.id}`)
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  /* ─── Derived Data ──────────────────────────────────────── */
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []
  const profile = profileData?.profile
  const notifications = Array.isArray(notifData?.notifications) && notifData.notifications.length > 0
    ? notifData.notifications
    : mockNotifications

  const profileComplete = profile?.isComplete
  const profilePercent = profile?.formStep
    ? Math.min(Math.round((profile.formStep / 7) * 100), 100)
    : 65
  const activeApps = applications.filter(
    (a: any) => !['rejected', 'withdrawn', 'hired', 'deployed', 'completed'].includes(a.status)
  ).length
  const avgMatch =
    applications.length > 0
      ? Math.round(
          applications.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0) /
            applications.length
        )
      : 0

  const firstName = user?.name?.split(' ')[0] || 'User'
  const unreadCount = notifications.filter((n: any) => !n.read).length

  /* ─── Stat Cards Config ────────────────────────────────── */
  const stats = [
    {
      label: isFil ? 'Aktibong Aplikasyon' : 'Active Applications',
      value: activeApps,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: isFil ? 'Profile Views' : 'Profile Views',
      value: 24,
      icon: Eye,
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      label: isFil ? 'Na-save na Trabaho' : 'Saved Jobs',
      value: 8,
      icon: Heart,
      gradient: 'from-rose-500 to-rose-600',
    },
    {
      label: isFil ? 'Average na Match' : 'Avg Match Score',
      value: avgMatch,
      suffix: '%',
      icon: Target,
      gradient: 'from-emerald-500 to-emerald-600',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/*  1. WELCOME BANNER                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#06b6d4]" />
          <BannerPattern />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/[0.06] blur-2xl" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/[0.04] blur-xl" />

          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              {/* Left: Greeting */}
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 border border-white/20 backdrop-blur-sm">
                    <Zap className="h-3 w-3 mr-1" />
                    {isFil ? 'Dashboard' : 'Dashboard'}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {isFil
                    ? `Maligayang pagbabalik, ${firstName}!`
                    : `Welcome back, ${firstName}!`}
                </h1>
                <p className="mt-2 text-blue-100/90 text-sm md:text-base max-w-lg">
                  {isFil
                    ? 'Subaybayan ang iyong mga aplikasyon at hanapin ang tamang trabaho para sa iyo at ang iyong pamilya.'
                    : 'Track your applications and find the right opportunity for you and your family.'}
                </p>
              </div>

              {/* Right: Profile completion + CTA */}
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-blue-100 font-medium">
                      {isFil ? 'Pagkumpleto ng Profile' : 'Profile Completion'}
                    </p>
                    <span className="text-white font-bold text-sm">{profilePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${profilePercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    />
                  </div>
                  {!profileComplete && (
                    <p className="text-[10px] text-blue-200 mt-1.5">
                      {isFil
                        ? 'Kumpletuhin ang iyong profile para mas maraming match'
                        : 'Complete your profile for more job matches'}
                    </p>
                  )}
                </div>

                {!profileComplete && (
                  <Button
                    size="sm"
                    className="bg-white text-[#1e40af] hover:bg-blue-50 shadow-lg shadow-black/10 font-semibold"
                    onClick={() => navigate('applicant-profile')}
                  >
                    {isFil ? 'Kumpletuhin Profile' : 'Complete Profile'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  2. QUICK STATS ROW (4 cards)                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <GlassCard className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-default h-full">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1.5">
                      <AnimatedCounter target={stat.value} duration={1} />
                      {stat.suffix && (
                        <span className="text-base md:text-lg text-muted-foreground font-medium">
                          {stat.suffix}
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className={`p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] md:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    +12% {isFil ? 'sa linggong ito' : 'this week'}
                  </span>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  3. MAIN CONTENT GRID (2/3 + 1/3)                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* ─── LEFT: Recent Applications ───────────────────── */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {isFil ? 'Mga Kamakailang Aplikasyon' : 'Recent Applications'}
                {applications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {applications.length}
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('applicant-applications')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {isFil ? 'Tingnan Lahat' : 'View All'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {appsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {isFil ? 'Wala pang aplikasyon' : 'No applications yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {isFil
                      ? 'Magsimula na mag-apply sa mga trabaho!'
                      : 'Start applying to jobs and track your progress!'}
                  </p>
                  <Button size="sm" onClick={() => navigate('applicant-jobs')}>
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    {isFil ? 'Maghanap ng Trabaho' : 'Find Jobs'}
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {applications.slice(0, 8).map((app: any, idx: number) => {
                    const job = app.jobOrder
                    return (
                      <motion.div
                        key={app.id}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center justify-between p-3 md:p-3.5 rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-200 cursor-pointer group"
                        onClick={() => navigate('applicant-applications')}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job?.title || 'Unknown Job'}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span>{job?.country || '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          {app.matchScore != null && (
                            <MatchScoreBadge score={app.matchScore} />
                          )}
                          <StatusBadge status={app.status} />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ─── RIGHT: Notifications ───────────────────────── */}
        <motion.div variants={itemVariants}>
          <GlassCard className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="relative p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-card" />
                  )}
                </div>
                {isFil ? 'Mga Notipikasyon' : 'Notifications'}
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px]">
                  {unreadCount} {isFil ? 'bago' : 'new'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 flex-1">
                {notifications.slice(0, 5).map((notif: any, idx: number) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      !notif.read
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/60'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                      {notif.read && (
                        <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${!notif.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.desc}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  4. BOTTOM ROW (2/3 + 1/3)                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* ─── LEFT: Recommended Jobs (2x2) ───────────────── */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Inirerekomendang Trabaho' : 'Recommended Jobs'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('applicant-jobs')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {isFil ? 'Tingnan Lahat' : 'Browse All'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRecommendedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.07 }}
                    className="p-4 rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate('job-detail')}
                  >
                    {/* Header: Title + Match Score */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {job.company}
                        </p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ml-2 ${
                        job.matchScore >= 85
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}>
                        {job.matchScore}%
                      </div>
                    </div>

                    {/* Meta: Country + Salary */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salary}
                      </span>
                    </div>

                    {/* Apply Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('job-detail')
                      }}
                    >
                      {isFil ? 'Mag-apply Na' : 'Apply Now'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* ─── RIGHT: Upcoming Tasks & Quick Actions ─────── */}
        <motion.div variants={itemVariants}>
          <GlassCard className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <CalendarDays className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                {isFil ? 'Mga Darating na Gawain' : 'Upcoming Tasks'}
              </CardTitle>
              <Badge variant="secondary" className="text-[11px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                {mockTasks.filter((t) => t.urgent).length} {isFil ? 'mahalaga' : 'urgent'}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              {/* Task List */}
              <div className="space-y-2 flex-1">
                {mockTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.06 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      task.urgent
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/60'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        task.urgent
                          ? 'bg-rose-100 dark:bg-rose-900/50'
                          : 'bg-muted'
                      }`}
                    >
                      {task.urgent ? (
                        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${task.urgent ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                        {task.title}
                      </p>
                      <p className={`text-xs mt-0.5 flex items-center gap-1 ${
                        task.urgent
                          ? 'text-rose-600 dark:text-rose-400 font-medium'
                          : 'text-muted-foreground'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {task.deadline}
                        {task.urgent && (
                          <Badge
                            variant="outline"
                            className="ml-1.5 text-[10px] h-4 px-1.5 border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400"
                          >
                            {isFil ? 'Mahalaga' : 'Urgent'}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                ))}
              </div>

              {/* ─── Quick Actions ──────────────────────────── */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                  {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 text-xs justify-start gap-1.5"
                    onClick={() => navigate('applicant-jobs')}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    {isFil ? 'Maghanap' : 'Find Jobs'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 text-xs justify-start gap-1.5"
                    onClick={() => navigate('applicant-profile')}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {isFil ? 'Profile' : 'Profile'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 text-xs justify-start gap-1.5"
                    onClick={() => navigate('resume-enhancement')}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 text-xs justify-start gap-1.5"
                    onClick={() => navigate('applicant-applications')}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {isFil ? 'Aplikasyon' : 'Applications'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
