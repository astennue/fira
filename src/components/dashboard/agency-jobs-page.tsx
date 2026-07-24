'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Plus, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function AgencyJobsPage() {
  const { navigate, language } = useAppStore()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['agency-jobs-list'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=local_agency')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    filled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="view-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Trabaho' : 'Jobs'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Pamahalaan ang mga job order' : 'Manage job orders'}</p>
        </div>
        <Button onClick={() => navigate('ats-pipeline')}>
          <Plus className="mr-2 h-4 w-4" />{language === 'fil' ? 'View Pipeline' : 'View Pipeline'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Wala pang trabaho.' : 'No jobs yet.'}</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {jobs.map((job: any, i: number) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate('ats-pipeline', { jobId: job.id })}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{job.title}</h3>
                    <Badge className={`text-xs ${statusColors[job.status] || ''}`}>{job.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{job._count?.applications || 0} {language === 'fil' ? 'aplikante' : 'applicants'}</span>
                    <span className="text-sm font-semibold text-primary">${job.salaryMin ?? '?'}-${job.salaryMax ?? '?'}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
