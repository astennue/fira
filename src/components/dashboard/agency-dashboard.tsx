'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, FileText, Clock, Sparkles, ArrowRight, Building2, Users, UserCheck, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function AgencyDashboard() {
  const { user, navigate } = useAppStore()

  const { data: jobsData } = useQuery({
    queryKey: ['agency-jobs'],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?userRole=agency_admin`)
      return res.json()
    },
  })

  const { data: endorsementsData } = useQuery({
    queryKey: ['agency-endorsements'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements')
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorsementsData?.endorsements) ? endorsementsData.endorsements : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Agency Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your recruitment pipeline</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: jobs.filter(j => j.status === 'open').length, icon: Briefcase, color: 'text-blue-600' },
          { label: 'Total Applicants', value: jobs.reduce((sum: number, j: Record<string, unknown>) => sum + ((j as Record<string, Record<string, number>>)._count?.applications || 0), 0), icon: Users, color: 'text-emerald-600' },
          { label: 'Pending Endorsements', value: endorsements.filter(e => e.status === 'agency_endorsed').length, icon: FileText, color: 'text-amber-600' },
          { label: 'FIRA Approved', value: endorsements.filter(e => e.status === 'fira_approved').length, icon: UserCheck, color: 'text-purple-600' },
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('agency-jobs')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No jobs posted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job: Record<string, unknown>) => (
                  <div key={job.id as string} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{job.title as string}</p>
                      <p className="text-xs text-muted-foreground">{job.country as string} &middot; {((job as Record<string, Record<string, number>>)._count?.applications || 0)} applicants</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant="outline" className="text-xs capitalize">{job.visibility as string}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{job.status as string}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-jobs')}><Briefcase className="mr-2 h-4 w-4" /> Manage Jobs</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-applicants')}><Users className="mr-2 h-4 w-4" /> View Applicants</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('agency-endorsements')}><FileText className="mr-2 h-4 w-4" /> Endorsements</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('ats-pipeline')}><BarChart3 className="mr-2 h-4 w-4" /> ATS Pipeline</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
