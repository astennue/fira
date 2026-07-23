'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, Building, Building2, Briefcase, FileText, Shield, BarChart3, Sparkles, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function FiraDashboard() {
  const { navigate } = useAppStore()

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      return res.json()
    },
  })

  const { data: jobsData } = useQuery({
    queryKey: ['all-jobs-admin'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=fira')
      return res.json()
    },
  })

  const users = Array.isArray(usersData?.users) ? usersData.users : []
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  const agencies = users.filter((u: Record<string, unknown>) => u.role === 'agency_admin')
  const employers = users.filter((u: Record<string, unknown>) => u.role === 'employer')
  const applicants = users.filter((u: Record<string, unknown>) => u.role === 'applicant')
  const pendingApproval = users.filter((u: Record<string, unknown>) => !u.isApproved && u.role !== 'applicant')

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600' },
    { label: 'Agencies', value: agencies.length, icon: Building, color: 'text-emerald-600' },
    { label: 'Employers', value: employers.length, icon: Building2, color: 'text-amber-600' },
    { label: 'Active Jobs', value: jobs.filter((j: Record<string, unknown>) => j.status === 'open').length, icon: Briefcase, color: 'text-purple-600' },
    { label: 'Applicants', value: applicants.length, icon: FileText, color: 'text-pink-600' },
    { label: 'Pending Approval', value: pendingApproval.length, icon: Shield, color: 'text-red-600' },
  ]

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">FIRA Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide management and analytics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {pendingApproval.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-amber-600" /> Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingApproval.map((u: Record<string, unknown>) => (
                  <div key={u.id as string} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{u.name as string}</p>
                      <p className="text-xs text-muted-foreground">{u.email as string} &middot; <Badge variant="outline" className="text-xs capitalize ml-1">{(u.role as string).replace('_', ' ')}</Badge></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600"><CheckCircle className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600"><XCircle className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('fira-jobs')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs.slice(0, 8).map((job: Record<string, unknown>) => (
                <div key={job.id as string} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{job.title as string}</p>
                    <p className="text-xs text-muted-foreground">{job.country as string} &middot; <Badge variant="secondary" className="text-xs capitalize">{job.visibility as string}</Badge></p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{job.status as string}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('fira-agencies')}><Building className="mr-2 h-5 w-5" /> Manage Agencies</Button>
        <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('fira-employers')}><Building2 className="mr-2 h-5 w-5" /> Manage Employers</Button>
        <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('ats-pipeline')}><BarChart3 className="mr-2 h-5 w-5" /> ATS Pipeline</Button>
        <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('ai-matching')}><Sparkles className="mr-2 h-5 w-5" /> AI Matching</Button>
      </div>
    </div>
  )
}
