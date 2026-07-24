'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, UserCheck, CheckCircle, ArrowRight, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function EmployerDashboard() {
  const { user, navigate, language } = useAppStore()

  const { data: endorseData } = useQuery({
    queryKey: ['employer-endorsements'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const endorsements = Array.isArray(endorseData?.endorsements) ? endorseData.endorsements : []
  const pending = endorsements.filter((e: any) => ['pending_employer_review'].includes(e.status)).length
  const accepted = endorsements.filter((e: any) => ['employer_accepted'].includes(e.status)).length

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Dashboard ng Empleyador' : 'Employer Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Pamahalaan ang mga endorsed na kandidato' : 'Manage endorsed candidates'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: language === 'fil' ? 'Pending' : 'Pending Review', value: pending, icon: Eye, color: 'text-amber-600' },
          { label: language === 'fil' ? 'Na-accept' : 'Accepted', value: accepted, icon: CheckCircle, color: 'text-emerald-600' },
          { label: language === 'fil' ? 'Kabuuang Endorso' : 'Total Endorsements', value: endorsements.length, icon: UserCheck, color: 'text-blue-600' },
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
            <CardTitle>{language === 'fil' ? 'Mga Inindorso na Kandidato' : 'Endorsed Candidates'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('employer-endorsed')}>
              {language === 'fil' ? 'Lahat' : 'All'} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {endorsements.length === 0 ? (
              <div className="text-center py-8"><UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang endorsement.' : 'No endorsements yet.'}</p></div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {endorsements.slice(0, 8).map((e: any) => {
                  const applicant = e.application?.applicant
                  const job = e.application?.jobOrder
                  return (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{applicant?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{job?.title || ''} &middot; {job?.country || ''}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0 ml-2">{e.status?.replace(/_/g, ' ')}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Mabilis na Aksyon' : 'Quick Actions'}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('employer-endorsed')}><UserCheck className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Inindorso' : 'Endorsed Candidates'}</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('employer-jobs')}><Briefcase className="mr-2 h-4 w-4" />{language === 'fil' ? 'Mga Trabaho' : 'My Jobs'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
