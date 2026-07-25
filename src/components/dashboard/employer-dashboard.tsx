'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Briefcase, UserCheck, CheckCircle, ArrowRight, Eye, MessageSquare,
  Clock, TrendingUp, ChevronRight, XCircle, Star, Zap, Shield, BarChart3,
  Target
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

function MatchScoreRing({ score }: { score: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" className="stroke-muted" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r={radius} fill="none"
          className={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{score || 0}%</span>
      </div>
    </div>
  )
}

export function EmployerDashboard() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'

  const { data: endorseData } = useQuery({
    queryKey: ['employer-endorsements'],
    queryFn: async () => { const res = await fetch('/api/endorsements'); if (!res.ok) return { endorsements: [] }; return res.json() },
  })

  const { data: jobsData } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => { const res = await fetch('/api/jobs'); if (!res.ok) return { jobs: [] }; return res.json() },
  })

  const { data: notifData } = useQuery({
    queryKey: ['employer-notifications', user?.id],
    queryFn: async () => { const res = await fetch(`/api/notifications?userId=${user?.id}`); if (!res.ok) return { notifications: [] }; return res.json() },
    enabled: !!user?.id,
  })

  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const notifications = Array.isArray(notifData?.notifications) ? notifData.notifications : []
  const unreadNotifs = notifications.filter((n: any) => !n.read).length

  const pending = endorsements.filter((e: any) => e.status === 'pending_employer_review').length
  const accepted = endorsements.filter((e: any) => e.status === 'employer_accepted').length
  const declined = endorsements.filter((e: any) => e.status === 'employer_declined').length
  const inReview = endorsements.filter((e: any) => ['pending_employer_review', 'fira_approved'].includes(e.status)).length
  const myJobsCount = jobs.filter((j: any) => j.employerId === user?.id || j.createdById === user?.id).length

  // Sort: pending first, then recent
  const sortedEndorsements = [...endorsements]
    .sort((a: any, b: any) => {
      const aPending = a.status === 'pending_employer_review' ? 0 : 1
      const bPending = b.status === 'pending_employer_review' ? 0 : 1
      if (aPending !== bPending) return aPending - bPending
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

  const stats = [
    { label: isFil ? 'Naghihintay ng Review' : 'Pending Review', value: pending, icon: Eye, gradient: 'from-amber-500 to-yellow-500', shadowColor: 'shadow-amber-500/20' },
    { label: isFil ? 'Na-accept' : 'Accepted', value: accepted, icon: CheckCircle, gradient: 'from-emerald-500 to-green-500', shadowColor: 'shadow-emerald-500/20' },
    { label: isFil ? 'Ibinalewala' : 'Declined', value: declined, icon: XCircle, gradient: 'from-rose-500 to-red-500', shadowColor: 'shadow-rose-500/20' },
    { label: isFil ? 'Kabuuang Endorso' : 'Total Endorsements', value: endorsements.length, icon: BarChart3, gradient: 'from-teal-500 to-emerald-600', shadowColor: 'shadow-teal-500/20' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isFil ? 'Dashboard ng Empleyador' : 'Employer Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFil
              ? 'Pamahalaan ang mga endorsed na kandidato at mga trabaho'
              : 'Manage endorsed candidates and job postings'}
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
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                {stat.label === (isFil ? 'Naghihintay ng Review' : 'Pending Review') && pending > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>{isFil ? 'Kailangan ng aksyon' : 'Needs action'}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endorsed Candidates - NO PHOTOS, LIMITED INFO */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {isFil ? 'Mga Inindorso na Kandidato' : 'Endorsed Candidates'}
                  {pending > 0 && (
                    <Badge className="bg-amber-500 text-white text-[10px] h-5 min-w-5 px-1.5 ml-2">{pending} {isFil ? 'bago' : 'new'}</Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('employer-endorsed')}>
                  {isFil ? 'Lahat' : 'All'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {sortedEndorsements.length === 0 ? (
                <div className="text-center py-10">
                  <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{isFil ? 'Wala pang endorsement.' : 'No endorsements yet.'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isFil ? 'Maghintay ng mga kandidato mula sa FIRA.' : 'Waiting for candidates from FIRA.'}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {sortedEndorsements.slice(0, 10).map((e: any, idx: number) => {
                    const applicant = e.application?.applicant
                    const job = e.application?.jobOrder
                    const isPending = e.status === 'pending_employer_review'
                    // ONLY show: name, position, skills, experience, match score
                    // NO photos, NO address, NO contact
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isPending
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:shadow-md'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => navigate('employer-endorsed')}
                      >
                        <div className="flex items-start gap-4">
                          {/* NO AVATAR - use initials circle instead */}
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(applicant?.name || 'C')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{applicant?.name || 'Candidate'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {job?.title || isFil ? 'Posisyon' : 'Position'}
                                </p>
                              </div>
                              <MatchScoreRing score={e.matchScore || applicant?.matchScore || 0} />
                            </div>
                            {/* Skills summary only */}
                            {applicant?.skills && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {String(applicant.skills).split(',').slice(0, 4).map((skill: string, si: number) => (
                                  <Badge key={si} variant="secondary" className="text-[10px] h-5">{skill.trim()}</Badge>
                                ))}
                                {String(applicant.skills).split(',').length > 4 && (
                                  <Badge variant="outline" className="text-[10px] h-5">
                                    +{String(applicant.skills).split(',').length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {/* Experience level only */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {applicant?.experience && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {applicant.experience}
                                </span>
                              )}
                              {job?.country && (
                                <span>{job.country}</span>
                              )}
                              {e.createdAt && (
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" />{new Date(e.createdAt).toLocaleDateString()}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions + Summary */}
        <motion.div variants={item} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {isFil ? 'Mabilis na Aksyon' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {[
                { icon: UserCheck, label: isFil ? 'Review Kandidato' : 'Review Candidates', view: 'employer-endorsed' as const, badge: pending > 0 ? pending : undefined },
                { icon: Briefcase, label: isFil ? 'Mga Trabaho' : 'My Jobs', view: 'employer-jobs' as const, badge: myJobsCount > 0 ? myJobsCount : undefined },
                { icon: MessageSquare, label: isFil ? 'Mensahe' : 'Messages', view: 'messages' as const, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
                { icon: Target, label: isFil ? 'AI Matching' : 'AI Matching', view: 'ai-matching' as const },
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
                  <div className="flex items-center gap-1.5">
                    {action.badge && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] h-5 min-w-5 px-1.5">
                        {action.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Accept Rate Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                  <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                {isFil ? 'Accept Rate' : 'Accept Rate'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center py-3">
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {endorsements.length > 0 ? Math.round((accepted / endorsements.length) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFil ? 'ng mga endorsement' : 'of endorsements accepted'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pending}</p>
                  <p className="text-[10px] text-muted-foreground">{isFil ? 'Pending' : 'Pending'}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{accepted}</p>
                  <p className="text-[10px] text-muted-foreground">{isFil ? 'Accept' : 'Accept'}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{declined}</p>
                  <p className="text-[10px] text-muted-foreground">{isFil ? 'Decline' : 'Decline'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
