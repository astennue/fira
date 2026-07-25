'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building, Building2, Users, Briefcase, Send, ArrowRight, UserCheck,
  Columns, Sparkles, AlertTriangle, MessageSquare, Activity, TrendingUp,
  Clock, Shield, Globe, ChevronRight, Zap, BarChart3, UserPlus
} from 'lucide-react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

export function FiraDashboard() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'

  const { data: usersData } = useQuery({
    queryKey: ['fira-users'],
    queryFn: async () => { const res = await fetch('/api/users'); if (!res.ok) return { users: [], total: 0 }; return res.json() },
  })

  const { data: jobsData } = useQuery({
    queryKey: ['fira-jobs'],
    queryFn: async () => { const res = await fetch('/api/jobs'); if (!res.ok) return { jobs: [] }; return res.json() },
  })

  const { data: endorseData } = useQuery({
    queryKey: ['fira-endorsements'],
    queryFn: async () => { const res = await fetch('/api/endorsements'); if (!res.ok) return { endorsements: [] }; return res.json() },
  })

  const { data: agenciesData } = useQuery({
    queryKey: ['fira-agencies'],
    queryFn: async () => { const res = await fetch('/api/agencies'); if (!res.ok) return { agencies: [] }; return res.json() },
  })

  const { data: notifData } = useQuery({
    queryKey: ['fira-notifications'],
    queryFn: async () => { const res = await fetch('/api/notifications'); if (!res.ok) return { notifications: [] }; return res.json() },
  })

  const users = Array.isArray(usersData?.users) ? usersData.users : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const agencies = Array.isArray(agenciesData?.agencies) ? agenciesData.agencies : []
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []

  const applicantCount = users.filter((u: any) => u.role === 'applicant').length
  const employerCount = users.filter((u: any) => u.role === 'employer').length
  const activeJobs = jobs.filter((j: any) => j.status === 'open').length
  const pendingEndorse = endorsements.filter((e: any) => e.status === 'pending_fira_review').length
  const pendingAgencies = agencies.filter((a: any) => !a.isApproved).length
  const totalEndorsements = endorsements.length
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  // Build activity feed from endorsements and users
  const recentEndorsements = endorsements
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  const recentUsers = users
    .filter((u: any) => u.role === 'applicant')
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const stats = [
    { label: isFil ? 'Kabuuang Ahensya' : 'Total Agencies', value: agencies.length, icon: Building, accent: 'from-blue-500 to-blue-600', shadowColor: 'shadow-blue-500/20' },
    { label: isFil ? 'Empleyador' : 'Employers', value: employerCount, icon: Building2, accent: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/20' },
    { label: isFil ? 'Aplikante' : 'Applicants', value: applicantCount, icon: Users, accent: 'from-emerald-500 to-green-600', shadowColor: 'shadow-emerald-500/20' },
    { label: isFil ? 'Aktibong Trabaho' : 'Active Jobs', value: activeJobs, icon: Briefcase, accent: 'from-amber-500 to-orange-500', shadowColor: 'shadow-amber-500/20' },
    { label: isFil ? 'Pending Endorso' : 'Pending Endorsements', value: pendingEndorse, icon: Send, accent: 'from-rose-500 to-pink-600', shadowColor: 'shadow-rose-500/20' },
    { label: isFil ? 'Kabuuang Endorso' : 'Total Endorsements', value: totalEndorsements, icon: BarChart3, accent: 'from-cyan-500 to-teal-600', shadowColor: 'shadow-cyan-500/20' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isFil ? 'FIRA Command Center' : 'FIRA Command Center'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFil ? 'Pangkalahatang pamahalaan at monitoring ng sistema' : 'System-wide management and monitoring'}
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

      {/* Alert Banner */}
      {(pendingAgencies > 0 || pendingEndorse > 0) && (
        <motion.div variants={item}>
          <Card className="border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/20 border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {isFil ? 'Kinakailangan ng Aksyon' : 'Action Required'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {pendingAgencies > 0 && `${pendingAgencies} ${isFil ? 'ahensya ang naghihintay ng approval' : 'agencies pending approval'}`}
                  {pendingAgencies > 0 && pendingEndorse > 0 && ' · '}
                  {pendingEndorse > 0 && `${pendingEndorse} ${isFil ? 'endorsement ang naghihintay' : 'endorsements pending'}`}
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('fira-agencies')} className="shrink-0">
                {isFil ? 'Review' : 'Review'} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1.5">
                      <AnimatedCounter target={stat.value} />
                    </p>
                  </div>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.accent} shadow-lg ${stat.shadowColor}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{isFil ? 'Aktibo' : 'Active'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content: Activity Feed + Quick Actions + Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {isFil ? 'Kamakailang Aktibidad' : 'Recent Activity'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {recentEndorsements.map((e: any, idx: number) => {
                  const applicant = e.application?.applicant
                  const job = e.application?.jobOrder
                  const isPending = e.status === 'pending_fira_review'
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPending ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'
                      }`}>
                        {isPending ? <Send className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> : <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          <span className="text-foreground">{applicant?.name || 'Applicant'}</span>
                          <span className="text-muted-foreground"> {isFil ? 'ay na-endorse para sa' : 'endorsed for'}</span>
                          <span className="font-semibold text-foreground"> {job?.title || ''}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 px-1.5 ${
                              isPending
                                ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                                : 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {e.status?.replace(/_/g, ' ')}
                          </Badge>
                          {e.createdAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {new Date(e.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {recentEndorsements.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang aktibidad.' : 'No recent activity.'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Applications / Registrations */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {isFil ? 'Bagong Registrasyon' : 'Recent Registrations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {recentUsers.map((u: any, idx: number) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('fira-applicant-detail', { userId: u.id })}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{u.email || ''}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {u.isApproved ? (isFil ? 'Aktibo' : 'Active') : (isFil ? 'Pending' : 'Pending')}
                    </Badge>
                  </motion.div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang bagong aplikante.' : 'No new applicants yet.'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions + Jobs Overview */}
        <motion.div variants={item} className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { icon: Building, label: isFil ? 'Mga Ahensya' : 'Agencies', view: 'fira-agencies' as const, badge: pendingAgencies > 0 ? pendingAgencies : undefined },
                { icon: Building2, label: isFil ? 'Empleyador' : 'Employers', view: 'fira-employers' as const },
                { icon: Users, label: isFil ? 'Aplikante' : 'Applicants', view: 'fira-applicants' as const },
                { icon: Briefcase, label: isFil ? 'Lahat ng Trabaho' : 'All Jobs', view: 'fira-jobs' as const },
                { icon: Columns, label: 'ATS Pipeline', view: 'ats-pipeline' as const },
                { icon: Sparkles, label: 'AI Matching', view: 'ai-matching' as const },
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
                  {action.badge && (
                    <Badge className="bg-rose-500 text-white text-[10px] h-5 min-w-5 px-1.5">{action.badge}</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Mini Jobs List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {isFil ? 'Mga Trabaho' : 'Jobs'}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('fira-jobs')}>
                  {isFil ? 'Lahat' : 'All'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {jobs.length === 0 ? (
                <div className="text-center py-6">
                  <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{isFil ? 'Wala pang trabaho.' : 'No jobs yet.'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {jobs.slice(0, 6).map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate('ats-pipeline', { jobId: job.id })}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          <Globe className="h-3 w-3 inline mr-0.5" />{job.country}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 ml-2 capitalize">{job.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
