'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function EmployerJobsPage() {
  const { user } = useAppStore()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=employer')
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Job Listings</h1>
        <p className="text-muted-foreground">Manage your company&apos;s job postings</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No jobs posted yet</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job: Record<string, unknown>) => (
            <Card key={job.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{String(job.title)}</h3>
                  <Badge variant="secondary" className="capitalize">{String(job.status)}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{String(job.country)}
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-primary font-medium">${job.salaryMin} - ${job.salaryMax}</span>
                  <span className="text-muted-foreground">{((job as Record<string, Record<string, number>>)._count?.applications || 0)} applicants</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
