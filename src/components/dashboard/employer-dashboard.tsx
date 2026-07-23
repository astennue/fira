'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, Users, UserCheck, FileText, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

export function EmployerDashboard() {
  const { navigate } = useAppStore()

  const { data: jobsData } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?userRole=employer`)
      return res.json()
    },
  })

  const { data: endorsedData } = useQuery({
    queryKey: ['employer-endorsed'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements?status=employer_accepted,fira_approved')
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const endorsements = Array.isArray(endorsedData?.endorsements) ? endorsedData.endorsements : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Employer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your job listings and endorsed candidates</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: jobs.filter((j: Record<string, unknown>) => j.status === 'open').length, icon: Briefcase, color: 'text-blue-600' },
          { label: 'Total Applicants', value: jobs.reduce((sum: number, j: Record<string, unknown>) => sum + ((j as Record<string, Record<string, number>>)._count?.applications || 0), 0), icon: Users, color: 'text-emerald-600' },
          { label: 'Endorsed Candidates', value: endorsements.length, icon: UserCheck, color: 'text-amber-600' },
          { label: 'Pending Review', value: endorsements.filter((e: Record<string, unknown>) => e.status === 'fira_approved').length, icon: FileText, color: 'text-purple-600' },
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
            <CardTitle>Endorsed Candidates</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('employer-endorsed')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            {endorsements.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No endorsed candidates yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {endorsements.slice(0, 5).map((e: Record<string, unknown>) => {
                  const app = e.application as Record<string, unknown> | undefined
                  const applicant = app?.applicant as Record<string, unknown> | undefined
                  const job = app?.jobOrder as Record<string, unknown> | undefined
                  return (
                    <div key={e.id as string} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{applicant?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{job?.title as string}</p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">{(e.status as string).replace(/_/g, ' ')}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('employer-jobs')}><Briefcase className="mr-2 h-4 w-4" /> My Jobs</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('employer-endorsed')}><UserCheck className="mr-2 h-4 w-4" /> Endorsed</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('ai-matching')}><Sparkles className="mr-2 h-4 w-4" /> AI Matching</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
