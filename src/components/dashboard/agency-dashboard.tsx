'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, Users, FileText, UserCheck, ArrowRight, Building, Send, Columns } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function AgencyDashboard() {
  const { user, navigate, language } = useAppStore()

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
    queryKey: ['applicants-list'],
    queryFn: async () => {
      const res = await fetch('/api/users?role=applicant')
      if (!res.ok) return { users: [], total: 0 }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const applicantCount = usersData?.total || 0

  const openJobs = jobs.filter((j: any) => j.status === 'open').length
  const pendingEndorse = endorsements.filter((e: any) => e.status === 'pending_fira_review').length
  const approvedEndorse = endorsements.filter((e: any) => ['fira_approved', 'employer_accepted'].includes(e.status)).length

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Dashboard ng Ahensya' : 'Agency Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.agencyName
            ? (language === 'fil' ? `Welcome, ${user.agencyName}` : `Welcome, ${user.agencyName}`)
            : (language === 'fil' ? 'Pamahalaan ang iyong recruitment pipeline' : 'Manage your recruitment pipeline')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'fil' ? 'Aktibong Trabaho' : 'Open Jobs', value: openJobs, icon: Briefcase, color: 'text-blue-600' },
          { label: language === 'fil' ? 'Aplikante' : 'Applicants', value: applicantCount, icon: Users, color: 'text-emerald-600' },
          { label: language === 'fil' ? 'Pending Endorso' : 'Pending Endorsements', value: pendingEndorse, icon: FileText, color: 'text-amber-600' },
          { label: language === 'fil' ? 'Naaprubahan' : 'Approved', value: approvedEndorse, icon: UserCheck, color: 'text-purple-600' },
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
            <CardTitle>{language === 'fil' ? 'Mga Trabaho' : 'Your Jobs'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('agency-jobs')}>
              {language === 'fil' ? 'Lahat' : 'All'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang trabaho.' : 'No jobs posted yet.'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {jobs.slice(0, 8).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate('ats-pipeline', { jobId: job.id })}>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.country} &middot; {job._count?.applications || 0} {language === 'fil' ? 'aplikante' : 'applicants'}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge variant="secondary" className="text-xs capitalize">{job.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Mabilis na Aksyon' : 'Quick Actions'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-jobs')}><Briefcase className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Trabaho' : 'Manage Jobs'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-applicants')}><Users className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Aplikante' : 'Applicants'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-endorsements')}><Send className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Endorso' : 'Endorsements'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('ats-pipeline')}><Columns className="mr-2 h-4 w-4" />ATS Pipeline</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
