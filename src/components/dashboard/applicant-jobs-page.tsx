'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, MapPin, Briefcase, ArrowRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function ApplicantJobsPage() {
  const { user, navigate } = useAppStore()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['applicant-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?public=true&userRole=applicant')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error('Not authenticated')
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: user.id, jobOrderId: jobId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => toast.success('Application submitted!'),
    onError: (err) => toast.error(err.message),
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Find Jobs</h1>
          <p className="text-muted-foreground">Browse available positions</p>
        </div>
        <Button variant="outline" onClick={() => navigate('job-listing')}>
          <Search className="h-4 w-4 mr-2" /> Advanced Search
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job: Record<string, unknown>) => (
            <Card key={job.id as string} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary">{String(job.category)}</Badge>
                  <span className="text-xs text-muted-foreground">{job.slots} slots</span>
                </div>
                <h3 className="font-semibold mb-2">{String(job.title)}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{String(job.country)}
                </div>
                <div className="text-sm font-semibold text-primary mb-4">
                  ${(job.salaryMin ?? '?')} - ${(job.salaryMax ?? '?')} {String(job.salaryCurrency)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => navigate('job-detail', { jobId: job.id as string })}>
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => applyMutation.mutate(job.id as string)} disabled={applyMutation.isPending}>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
