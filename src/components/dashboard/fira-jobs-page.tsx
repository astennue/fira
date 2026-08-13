'use client'

import { apiFetch } from "@/lib/fetch"
import { useQuery } from '@tanstack/react-query'
import { Briefcase, MapPin, Filter, Plus } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { convertToPHP, formatPHP, getCurrencySymbol } from '@/lib/currency'

export function FiraJobsPage() {
  const { navigate, language } = useAppStore()
  const [status, setStatus] = useState('all')

  const queryParams = new URLSearchParams()
  if (status !== 'all') queryParams.set('status', status)

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['fira-jobs-list', status],
    queryFn: async () => {
      const res = await apiFetch(`/api/jobs?${queryParams}`)
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Lahat ng Trabaho' : 'All Jobs'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Pamahalaan ang lahat ng job order' : 'Manage all job orders'}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          onClick={() => navigate('fira-job-create')}
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          {language === 'fil' ? 'Gumawa ng Bagong Trabaho' : 'Create New Job'}
        </Button>
        <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-48 h-10">
          <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'fil' ? 'Lahat ng Status' : 'All Status'}</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Walang trabaho.' : 'No jobs found.'}</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {jobs.map((job: any, i: number) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate('ats-pipeline', { jobId: job.id })}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{job.category?.replace(/_/g, ' ')}</Badge>
                    <Badge className="text-xs capitalize">{job.status}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{job._count?.applications || 0} applicants</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-primary">
                        {getCurrencySymbol(job.salaryCurrency || 'USD')}{job.salaryMin ?? '?'}-{job.salaryMax ?? '?'}
                      </span>
                      {job.salaryCurrency && job.salaryCurrency !== 'PHP' && job.salaryMin != null && (
                        <p className="text-[10px] text-muted-foreground">
                          ≈ {formatPHP(Number(job.salaryMin) * (convertToPHP(1, job.salaryCurrency) || 1))}
                        </p>
                      )}
                    </div>
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
