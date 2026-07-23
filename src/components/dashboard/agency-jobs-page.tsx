'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

export function AgencyJobsPage() {
  const { navigate } = useAppStore()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['agency-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?userRole=agency_admin')
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">Manage your agency job postings</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Post New Job</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No jobs posted yet</h3>
          <Button className="mt-4"><Plus className="h-4 w-4 mr-2" /> Create First Job</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job: Record<string, unknown>) => (
            <Card key={job.id as string} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="capitalize">{String(job.category)}</Badge>
                  <Badge variant="outline" className="capitalize">{String(job.visibility)}</Badge>
                </div>
                <h3 className="font-semibold mb-2">{String(job.title)}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{String(job.country)}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="capitalize">{String(job.status)}</Badge>
                    <span className="text-muted-foreground">{((job as Record<string, Record<string, number>>)._count?.applications || 0)} applicants</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(job.postedDate as string), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
