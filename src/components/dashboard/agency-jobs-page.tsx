'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Plus, MapPin, Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'

export function AgencyJobsPage() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['agency-jobs-list'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const pendingCount = jobs.filter((j: any) => j.status === 'pending').length

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
    open: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    closed: 'bg-muted text-foreground',
    filled: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{isFil ? 'Mga Trabaho' : 'Jobs'}</h1>
          <p className="text-muted-foreground mt-1">
            {isFil ? 'Pamahalaan ang mga job order ng ahensya' : 'Manage your agency job orders'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('ats-pipeline')}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Columns className="h-4 w-4" />{isFil ? 'Pipeline' : 'Pipeline'}
          </Button>
          <Button
            onClick={() => navigate('agency-job-create')}
            className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />{isFil ? 'Gumawa ng Trabaho' : 'Create Job'}
          </Button>
        </div>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {isFil
                ? `${pendingCount} job order ang naghihintay ng approval mula sa FIRA.`
                : `${pendingCount} job order${pendingCount > 1 ? 's' : ''} awaiting FIRA approval.`}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{isFil ? 'Wala pang trabaho.' : 'No jobs yet.'}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{isFil ? 'Gumawa ng job order at ipasa sa FIRA para sa approval.' : 'Create a job order and submit it to FIRA for approval.'}</p>
          <Button onClick={() => navigate('agency-job-create')} className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" />{isFil ? 'Gumawa ng Unang Trabaho' : 'Create Your First Job'}
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {jobs.map((job: any, i: number) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate('ats-pipeline', { jobId: job.id })}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-sm">{job.title}</h3>
                    <Badge className={`text-xs capitalize shrink-0 ${statusColors[job.status] || ''}`}>{job.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{job._count?.applications || 0} {isFil ? 'aplikante' : 'applicants'}</span>
                    <span className="text-sm font-semibold text-primary">
                      {job.salaryCurrency === 'USD' ? '$' : ''}{job.salaryMin ?? '?'}-{job.salaryMax ?? '?'}
                      {job.salaryCurrency !== 'USD' ? ` ${job.salaryCurrency}` : ''}
                    </span>
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
