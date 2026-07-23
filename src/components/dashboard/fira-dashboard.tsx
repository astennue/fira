'use client'

import { useQuery } from '@tanstack/react-query'
import { Building, Building2, Users, Briefcase, Send, ArrowRight, UserCheck, Columns, Sparkles, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function FiraDashboard() {
  const { navigate, language } = useAppStore()

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

  const users = Array.isArray(usersData?.users) ? usersData.users : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const agencies = Array.isArray(agenciesData?.agencies) ? agenciesData.agencies : []

  const applicantCount = users.filter((u: any) => u.role === 'applicant').length
  const pendingAgencies = agencies.filter((a: any) => !a.isApproved).length
  const pendingEndorse = endorsements.filter((e: any) => e.status === 'pending_fira_review').length
  const employerCount = users.filter((u: any) => u.role === 'employer').length
  const pendingUsers = users.filter((u: any) => !u.isApproved && u.role !== 'applicant').length

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">FIRA {language === 'fil' ? 'Admin Dashboard' : 'Admin Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fil' ? 'Pangkalahatang pamahalaan ng sistema' : 'System-wide management'}
        </p>
      </div>

      {/* Pending approvals alert */}
      {(pendingAgencies > 0 || pendingUsers > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {language === 'fil' ? 'May mga pending na approval' : 'Pending approvals'}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {pendingAgencies > 0 && `${pendingAgencies} ahensya(ng)`}
                  {pendingAgencies > 0 && pendingUsers > 0 && ' • '}
                  {pendingUsers > 0 && `${pendingUsers} user(s)`}
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('fira-agencies')}>{language === 'fil' ? 'Review' : 'Review'}</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'fil' ? 'Mga Ahensya' : 'Agencies', value: agencies.length, icon: Building, color: 'text-blue-600' },
          { label: language === 'fil' ? 'Empleyador' : 'Employers', value: employerCount, icon: Building2, color: 'text-purple-600' },
          { label: language === 'fil' ? 'Aplikante' : 'Applicants', value: applicantCount, icon: Users, color: 'text-emerald-600' },
          { label: language === 'fil' ? 'Pending Endorso' : 'Pending Endorsements', value: pendingEndorse, icon: Send, color: 'text-amber-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>{language === 'fil' ? 'Mga Trabaho' : 'All Jobs'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('fira-jobs')}>
              {language === 'fil' ? 'Lahat' : 'All'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-6"><Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang trabaho.' : 'No jobs yet.'}</p></div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {jobs.slice(0, 8).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-2 rounded border hover:bg-accent/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.country} &middot; {job.category?.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0 capitalize">{job.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Mabilis na Aksyon' : 'Quick Actions'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('fira-agencies')}><Building className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Ahensya' : 'Agencies'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('fira-employers')}><Building2 className="mr-2 h-4 w-4" />{language === 'fil' ? 'Empleyador' : 'Employers'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('fira-applicants')}><Users className="mr-2 h-4 w-4" />{language === 'fil' ? 'Aplikante' : 'Applicants'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('fira-jobs')}><Briefcase className="mr-2 h-4 w-4" />{language === 'fil' ? 'Lahat ng Trabaho' : 'All Jobs'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('ats-pipeline')}><Columns className="mr-2 h-4 w-4" />ATS Pipeline</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('ai-matching')}><Sparkles className="mr-2 h-4 w-4" />AI Matching</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
