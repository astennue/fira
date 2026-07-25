'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, FileText, Clock, Sparkles, ArrowRight, Users,
  AlertTriangle, CheckCircle, Eye, Heart, Bell, CalendarDays,
  TrendingUp, MessageSquare, Star, Target, ClipboardList, ChevronRight
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'

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

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/40 shadow-lg shadow-black/5 dark:shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  let classes = ''
  if (['hired', 'offered', 'deployed', 'completed'].includes(s)) {
    classes = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  } else if (['rejected', 'withdrawn', 'employer_declined'].includes(s)) {
    classes = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'
  } else if (['pending', 'pending_fira_review', 'pending_employer_review', 'screening', 'under_review'].includes(s)) {
    classes = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  } else if (['shortlisted', 'interview', 'fira_approved'].includes(s)) {
    classes = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  } else {
    classes = 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes}`}>
      {status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  )
}

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

export function ApplicantDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

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

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []
  const profile = profileData?.profile
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : mockNotifications

  const profileComplete = profile?.isComplete
  const profilePercent = profile?.formStep ? Math.min(Math.round((profile.formStep / 7) * 100), 100) : 65
  const activeApps = applications.filter((a: any) => !['rejected', 'withdrawn', 'hired', 'deployed', 'completed'].includes(a.status)).length
  const avgMatch = applications.length > 0
    ? Math.round(applications.reduce((sum: number, a: any) => sum + (a.matchScore || 0), 0) / applications.length)
    : 0

  const firstName = user?.name?.split(' ')[0] || 'User'

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isFil ? `Maligayang pagbabalik, ${firstName}!` : `Welcome back, ${firstName}!`}
                </h1>
                <p className="mt-1 text-blue-100 text-sm md:text-base">
                  {isFil
                    ? 'Ito ang iyong dashboard. Subaybayan ang iyong mga aplikasyon at hanapin ang tamang trabaho.'
                    : "Here's your dashboard. Track your applications and find the right job."}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
                  <p className="text-xs text-blue-100 font-medium">
                    {isFil ? 'Pagkumpleto ng Profile' : 'Profile Completion'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-700"
                        style={{ width: `${profilePercent}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">{profilePercent}%</span>
                  </div>
                </div>
                {!profileComplete && (
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg shadow-black/10"
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

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
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
            gradient: 'from-violet-500 to-purple-600',
          },
          {
            label: isFil ? 'Saved na Trabaho' : 'Saved Jobs',
            value: 8,
            icon: Heart,
            gradient: 'from-rose-500 to-pink-600',
          },
          {
            label: isFil ? 'Average Match' : 'Avg Match Score',
            value: avgMatch,
            icon: Target,
            suffix: '%',
            gradient: 'from-emerald-500 to-green-600',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
          >
            <GlassCard className="group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">
                      <AnimatedCounter target={stat.value} />
                      {stat.suffix && <span className="text-lg text-muted-foreground">{stat.suffix}</span>}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-blue-500/20`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% {isFil ? 'mingguang ito' : 'this week'}</span>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {isFil ? 'Mga Kamakailang Aplikasyon' : 'Recent Applications'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('applicant-applications')} className="text-blue-600">
                {isFil ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {appsLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{isFil ? 'Wala pang aplikasyon.' : 'No applications yet.'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isFil ? 'Magsimula na mag-apply!' : 'Start applying to jobs!'}</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate('applicant-jobs')}>
                    <Briefcase className="h-4 w-4 mr-1" /> {isFil ? 'Maghanap ng Trabaho' : 'Find Jobs'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {applications.slice(0, 8).map((app: any, idx: number) => {
                    const job = app.jobOrder
                    const stage = app.currentStage
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 cursor-pointer"
                        onClick={() => navigate('applicant-applications')}
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{job?.title || 'Unknown Job'}</p>
                            <p className="text-xs text-muted-foreground">{job?.country || ''} &middot; {stage?.name || app.status?.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          {app.matchScore != null && (
                            <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${app.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : app.matchScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                              {Math.round(app.matchScore)}%
                            </div>
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

        {/* Notifications Panel */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                {isFil ? 'Mga Notipikasyon' : 'Notifications'}
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {notifications.filter((n: any) => !n.read).length} {isFil ? 'bago' : 'new'}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((notif: any, idx: number) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-xl border transition-all duration-200 ${!notif.read ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {notif.time}
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

      {/* Bottom Row: Recommended Jobs + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                {isFil ? 'Inirerekomendang Trabaho' : 'Recommended Jobs'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('applicant-jobs')} className="text-blue-600">
                {isFil ? 'Tingnan Lahat' : 'Browse All'} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockRecommendedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate('job-detail')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{job.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ml-2 ${job.matchScore >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                        {job.matchScore}%
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.country}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {job.salary}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3 text-xs h-8 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                    >
                      {isFil ? 'Mag-apply Na' : 'Apply Now'}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Upcoming Tasks & Deadlines */}
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <CalendarDays className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                {isFil ? 'Mga Darating na Gawain' : 'Upcoming Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {mockTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${task.urgent ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.urgent ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <ClipboardList className={`h-4 w-4 ${task.urgent ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className={`text-xs mt-0.5 flex items-center gap-1 ${task.urgent ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                        <Clock className="h-3 w-3" /> {task.deadline}
                        {task.urgent && (
                          <Badge variant="outline" className="ml-1 text-[10px] h-4 px-1.5 border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400">
                            {isFil ? 'Mahalaga' : 'Urgent'}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                  {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start" onClick={() => navigate('applicant-jobs')}>
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" /> {isFil ? 'Maghanap' : 'Find Jobs'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start" onClick={() => navigate('applicant-profile')}>
                    <Users className="h-3.5 w-3.5 mr-1.5" /> {isFil ? 'Profile' : 'Profile'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start" onClick={() => navigate('resume-enhancement')}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Resume
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2.5 text-xs justify-start" onClick={() => navigate('applicant-applications')}>
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> {isFil ? 'Aplikasyon' : 'Applications'}
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
