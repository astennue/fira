'use client'

import { apiFetch } from "@/lib/fetch"
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, FileText, Clock, Sparkles, ArrowRight, Users,
  Bell,
  Target, ClipboardList, ChevronRight,
  Zap, MapPin, DollarSign, CheckCircle2, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { StatusBadge } from '@/components/shared/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

/* ─── Relative Time Formatter ──────────────────────────────── */
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

/* ─── Salary Formatter ─────────────────────────────────────── */
function formatSalary(job: any): string {
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${job.salaryCurrency || ''} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}${job.salaryPeriod ? '/' + job.salaryPeriod : ''}`
  }
  if (job.salaryMin != null) {
    return `${job.salaryCurrency || ''} ${Number(job.salaryMin).toLocaleString()}${job.salaryPeriod ? '/' + job.salaryPeriod : ''}`
  }
  return ''
}

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
      const res = await apiFetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const { data: profileData } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/applicant-profile?userId=${user?.id}`)
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!user?.id,
  })

  const { data: notifData } = useQuery({
    queryKey: ['my-notifications', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/notifications?userId=${user?.id}`)
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const { data: publicJobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs?public=true')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  /* ─── Derived Data ──────────────────────────────────────── */
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []
  const profile = profileData?.profile
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []
  const publicJobs = Array.isArray(publicJobsData?.jobs) ? publicJobsData.jobs : []
  const recommendedJobs = publicJobs.slice(0, 4)

  const profileComplete = profile?.isComplete
  const profilePercent = profile?.isComplete
    ? 100
    : profile?.formStep
      ? Math.min(Math.round((profile.formStep / 7) * 100), 100)
      : 0
  const activeApps = applications.filter(
    (a: any) => !['rejected', 'withdrawn', 'hired', 'deployed', 'completed'].includes(a.status)
  ).length
  const avgMatch =
    applications.length > 0
      ? Math.round(
          applications.reduce((sum: number, a: any) => sum + (a.aiAnalysis?.matchScore || 0), 0) /
            applications.length
        )
      : 0

  const firstName = user?.name?.split(' ')[0] || 'User'
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  /* ─── Stat Cards Config ────────────────────────────────── */
  const stats = [
    {
      label: isFil ? 'Aktibong Aplikasyon' : 'Active Applications',
      value: activeApps,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
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
        <Card className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/[0.04] dark:shadow-black/20 relative overflow-hidden">
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
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  2. QUICK STATS ROW                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-2 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <Card className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/[0.04] dark:shadow-black/20 group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-default h-full">
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1.5">
                      <AnimatedCounter value={stat.value} duration={1000} />
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
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

            {/* ═══════════════════════════════════════════════════════ */}
      {/*  3. NOTIFICATIONS + QUICK ACTIONS ROW                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* ─── Notifications ───────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50 bg-card/70 backdrop-blur-xl shadow-lg shadow-black/[0.04] dark:shadow-black/20 h-full">
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
            <CardContent className="pt-0">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isFil ? 'Wala pang notipikasyon' : 'No notifications yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.slice(0, 5).map((notif: any, idx: number) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        !notif.isRead
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/60'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        )}
                        {notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Next Steps & Quick Actions ──────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/50 bg-card/70 backdrop-blur-xl shadow-lg shadow-black/[0.04] dark:shadow-black/20 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {isFil ? 'Mga Susunod na Hakbang' : 'Next Steps'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    profileComplete
                      ? 'border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      profileComplete
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-blue-100 dark:bg-blue-900/50'
                    }`}
                  >
                    {profileComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${profileComplete ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
                      {isFil ? 'Kumpletuhin ang Profile' : 'Complete Your Profile'}
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      {profileComplete
                        ? (isFil ? 'Ang profile mo ay kumpleto na!' : 'Your profile is complete!')
                        : `${profilePercent}% ${isFil ? 'nakumpleto na' : 'completed'}`
                      }
                    </p>
                  </div>
                  {!profileComplete && (
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground"
                      onClick={() => navigate('applicant-profile')}
                    />
                  )}
                </motion.div>

                {activeApps === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {isFil ? 'Mag-apply sa Trabaho' : 'Apply to a Job'}
                      </p>
                      <p className="text-xs mt-0.5 text-muted-foreground">
                        {isFil
                          ? 'Magsimula sa pag-aaply sa mga trabaho'
                          : 'Browse and apply to open positions'
                        }
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground"
                      onClick={() => navigate('applicant-jobs')}
                    />
                  </motion.div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                  {isFil ? 'Mabilisang Aksyon' : 'Quick Actions'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start gap-1.5" onClick={() => navigate('applicant-jobs')}>
                    <Briefcase className="h-3.5 w-3.5" />
                    {isFil ? 'Maghanap' : 'Find Jobs'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start gap-1.5" onClick={() => navigate('applicant-profile')}>
                    <Users className="h-3.5 w-3.5" />
                    {isFil ? 'Profile' : 'Profile'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start gap-1.5" onClick={() => navigate('resume-enhancement')}>
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Resume
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start gap-1.5" onClick={() => navigate('applicant-applications')}>
                    <FileText className="h-3.5 w-3.5" />
                    {isFil ? 'Aplikasyon' : 'Applications'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  4. TABBED CONTENT: Applications & Recommended Jobs      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="applications">
          <TabsList>
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-1.5" />
              {isFil ? 'Ang Mga Aplikasyon Ko' : 'My Applications'}
              {applications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Sparkles className="h-4 w-4 mr-1.5" />
              {isFil ? 'Inirerekomendang Trabaho' : 'Recommended Jobs'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="border border-border/50 bg-card/70 backdrop-blur-xl shadow-lg shadow-black/[0.04] dark:shadow-black/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  {isFil ? 'Mga Kamakailang Aplikasyon' : 'Recent Applications'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('applicant-applications')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
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
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{isFil ? 'Wala pang aplikasyon' : 'No applications yet'}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">{isFil ? 'Magsimula na mag-apply sa mga trabaho!' : 'Start applying to jobs and track your progress!'}</p>
                    <Button size="sm" onClick={() => navigate('applicant-jobs')}>
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      {isFil ? 'Maghanap ng Trabaho' : 'Find Jobs'}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {applications.slice(0, 5).map((app: any, idx: number) => {
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
                            {app.aiAnalysis?.matchScore != null && app.aiAnalysis.matchScore > 0 && (
                              <MatchScoreBadge score={app.aiAnalysis.matchScore} />
                            )}
                            <StatusBadge status={app.status} />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/[0.04] dark:shadow-black/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  {isFil ? 'Inirerekomendang Trabaho' : 'Recommended Jobs'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('applicant-jobs')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  {isFil ? 'Tingnan Lahat' : 'Browse All'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {jobsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-36 rounded-xl" />
                    ))}
                  </div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang mga trabahong available' : 'No jobs available right now'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedJobs.map((job: any, idx) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.07 }}
                        className="p-4 rounded-xl border border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        onClick={() => navigate('job-detail', { jobId: job.id })}
                      >
                        <div className="mb-2.5">
                          <p className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {job.employer?.companyName || job.agency?.name || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.country}
                          </span>
                          {formatSalary(job) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatSalary(job)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-8 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200"
                          onClick={(e) => { e.stopPropagation(); navigate('job-detail', { jobId: job.id }) }}
                        >
                          {isFil ? 'Tingnan Detalye' : 'View Details'}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}