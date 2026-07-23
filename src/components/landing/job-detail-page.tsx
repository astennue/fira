'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Briefcase, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function JobDetailPage() {
  const { viewParams, navigate, user } = useAppStore()
  const jobId = viewParams.jobId

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const jobs: Array<Record<string, unknown>> = Array.isArray(data.jobs) ? data.jobs : []
      return jobs.find(j => j.id === jobId) || null
    },
    enabled: !!jobId,
  })

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !jobId) throw new Error('Not authenticated')
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: user.id, jobOrderId: jobId, coverLetter: 'I am interested in this position.' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to apply' }))
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Application submitted!')
      navigate('applicant-applications')
    },
    onError: (err) => toast.error('Application failed', { description: err.message }),
  })

  if (isLoading) {
    return <div className="view-transition container mx-auto px-4 py-8 max-w-4xl"><Skeleton className="h-64 rounded-xl" /><div className="mt-6 space-y-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div></div>
  }

  if (!jobData) {
    return (
      <div className="view-transition container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">This job listing may have been removed.</p>
        <Button onClick={() => navigate('job-listing')}>Browse All Jobs</Button>
      </div>
    )
  }

  const requirements = (() => { try { return JSON.parse(String(jobData.requirements)) } catch { return [String(jobData.requirements)] } })()
  const benefits = (() => { try { return JSON.parse(String(jobData.benefits || '[]')) } catch { return [] } })()
  const skills = (() => { try { return JSON.parse(String(jobData.requiredSkills)) } catch { return [String(jobData.requiredSkills)] } })()

  return (
    <div className="view-transition container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('job-listing')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{String(jobData.category)}</Badge>
                <Badge variant="outline" className="capitalize">{String(jobData.visibility)}</Badge>
                <Badge variant="secondary" className="capitalize">{String(jobData.status)}</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{String(jobData.title)}</CardTitle>
            </div>
            {user?.role === 'applicant' && (
              <Button size="lg" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{jobData.city ? `${jobData.city}, ` : ''}{String(jobData.country)}</span>
            {(jobData.salaryMin || jobData.salaryMax) && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${jobData.salaryMin} - ${jobData.salaryMax} {String(jobData.salaryCurrency)}</span>}
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{String(jobData.duration || ' negotiable')}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{jobData.slots} slot(s)</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Job Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{String(jobData.description)}</p>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2">
                {requirements.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            {benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: string, i: number) => (
                <Badge key={i} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
