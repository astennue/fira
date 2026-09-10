'use client'

import { useState } from 'react'
import { apiFetch } from "@/lib/fetch"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Briefcase, MapPin, Filter, Plus, CheckCircle2, XCircle, Eye, EyeOff, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { convertToPHP, formatPHP, getCurrencySymbol } from '@/lib/currency'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  open: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  closed: 'bg-muted text-foreground',
  filled: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
  cancelled: 'bg-muted text-foreground',
}

interface Job {
  id: string
  title: string
  description: string
  country: string
  city?: string | null
  category: string
  status: string
  visibility: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string
  _count?: { applications?: number }
  employer?: { companyName?: string; user?: { name?: string } } | null
  agency?: { name?: string } | null
}

export function FiraJobsPage() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'
  const qc = useQueryClient()
  const [status, setStatus] = useState('all')

  // approve dialog state
  const [approving, setApproving] = useState<Job | null>(null)
  const [publishNow, setPublishNow] = useState(true)
  const [rejecting, setRejecting] = useState<Job | null>(null)

  const listParams = (st: string) => {
    const qp = new URLSearchParams()
    if (st !== 'all') qp.set('status', st)
    return qp.toString()
  }

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['fira-jobs-list', status],
    queryFn: async () => {
      const res = await apiFetch(`/api/jobs?${listParams(status)}`)
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['fira-jobs-pending'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs?status=pending')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs: Job[] = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const pendingJobs: Job[] = Array.isArray(pendingData?.jobs) ? pendingData.jobs : []

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['fira-jobs-list'] })
    qc.invalidateQueries({ queryKey: ['fira-jobs-pending'] })
  }

  const approveMutation = useMutation({
    mutationFn: async ({ jobId, publish }: { jobId: string; publish: boolean }) => {
      const res = await apiFetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'approve', publish }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to approve job')
      }
      return res.json()
    },
    onSuccess: (_d, vars) => {
      toast.success(isFil
        ? (vars.publish ? 'Naaprubahan ang job at naka-publish na sa publiko.' : 'Naaprubahan ang job. Nakatago pa ito sa publiko.')
        : (vars.publish ? 'Job approved and published to the public board.' : 'Job approved but kept hidden from the public.'))
      setApproving(null)
      setPublishNow(true)
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rejectMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiFetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'reject' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to reject job')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success(isFil ? ' Tinanggihan ang job order.' : 'Job order rejected.')
      setRejecting(null)
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const publishMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: 'publish' | 'unpublish' }) => {
      const res = await apiFetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update visibility')
      }
      return res.json()
    },
    onSuccess: (_d, vars) => {
      toast.success(isFil
        ? (vars.action === 'publish' ? 'Naka-publish na ang job sa publiko.' : 'Itinago ang job sa publiko.')
        : (vars.action === 'publish' ? 'Job published to the public board.' : 'Job hidden from the public.'))
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const renderJobCard = (job: Job, i: number, isPendingQueue = false) => (
    <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2 gap-2">
            <Badge variant="secondary" className="text-xs">{job.category?.replace(/_/g, ' ')}</Badge>
            <div className="flex items-center gap-1.5 shrink-0">
              {job.visibility === 'public' && job.status !== 'pending' && (
                <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                  <Eye className="h-3 w-3 mr-1" />{isFil ? 'Publiko' : 'Public'}
                </Badge>
              )}
              {job.status === 'approved' && job.visibility === 'hidden' && (
                <Badge className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                  <EyeOff className="h-3 w-3 mr-1" />{isFil ? 'Nakatago' : 'Hidden'}
                </Badge>
              )}
              <Badge className={`text-xs capitalize ${statusColors[job.status] || ''}`}>
                {job.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {job.status}
              </Badge>
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
          {(job.employer?.companyName || job.agency?.name || job.employer?.user?.name) && (
            <p className="text-xs text-muted-foreground mb-1">
              {job.employer?.companyName || job.agency?.name || job.employer?.user?.name}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
          </div>
          <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">{job._count?.applications || 0} {isFil ? 'aplikante' : 'applicants'}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">
                {getCurrencySymbol(job.salaryCurrency || 'USD')}{job.salaryMin ?? '?'}-{job.salaryMax ?? '?'}
              </span>
              {job.salaryCurrency && job.salaryCurrency !== 'PHP' && job.salaryMin != null && (
                <span className="text-[10px] text-muted-foreground">
                  ≈ {formatPHP(Number(job.salaryMin) * (convertToPHP(1, job.salaryCurrency) || 1))}
                </span>
              )}
            </div>
          </div>
          {isPendingQueue ? (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => { setApproving(job); setPublishNow(true) }}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />{isFil ? 'Aprubahan' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejecting(job)}
                className="flex-1 rounded-lg gap-1.5 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <XCircle className="h-3.5 w-3.5" />{isFil ? 'Tanggihan' : 'Reject'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => navigate('ats-pipeline', { jobId: job.id })} className="flex-1 rounded-lg">
                {isFil ? 'Tingnan ang Pipeline' : 'Open Pipeline'}
              </Button>
              {(job.status === 'approved' || job.status === 'open') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => publishMutation.mutate({ jobId: job.id, action: job.visibility === 'public' ? 'unpublish' : 'publish' })}
                  className="rounded-lg gap-1.5"
                >
                  {job.visibility === 'public'
                    ? <><EyeOff className="h-3.5 w-3.5" />{isFil ? 'Itago' : 'Unpublish'}</>
                    : <><Eye className="h-3.5 w-3.5" />{isFil ? 'I-publish' : 'Publish'}</>}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const emptyState = (
    <Card className="p-8 text-center">
      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{isFil ? 'Walang trabaho.' : 'No jobs found.'}</p>
    </Card>
  )

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{isFil ? 'Lahat ng Trabaho' : 'All Jobs'}</h1>
          <p className="text-muted-foreground mt-1">
            {isFil ? 'Pamahalaan ang mga job order at approvals' : 'Manage job orders and approvals'}
          </p>
        </div>
        <Button
          onClick={() => navigate('fira-job-create')}
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          {isFil ? 'Gumawa ng Bagong Trabaho' : 'Create New Job'}
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">{isFil ? 'Lahat' : 'All Jobs'}</TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {isFil ? 'Mga Approval' : 'Pending Approvals'}
            {pendingJobs.length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{pendingJobs.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-48 h-10">
              <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isFil ? 'Lahat ng Status' : 'All Status'}</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="open">Open (legacy)</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
            </SelectContent>
          </Select>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
          ) : jobs.length === 0 ? emptyState : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-22rem)] overflow-y-auto custom-scrollbar">
              {jobs.map((job, i) => renderJobCard(job, i))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {pendingLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
          ) : pendingJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="font-medium text-foreground">{isFil ? 'Walang nakapilang job orders.' : 'No pending job orders.'}</p>
              <p className="text-sm text-muted-foreground mt-1">{isFil ? 'Lahat ng endorsements mula sa employers at agencies ay naproseso na.' : 'All endorsements from employers and agencies have been processed.'}</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
              {pendingJobs.map((job, i) => renderJobCard(job, i, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve dialog with per-job publish decision */}
      <Dialog open={!!approving} onOpenChange={(open) => !open && setApproving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isFil ? 'Aprubahan ang Job Order' : 'Approve Job Order'}</DialogTitle>
            <DialogDescription>
              {approving?.title} — {approving?.employer?.companyName || approving?.agency?.name || approving?.employer?.user?.name || ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <Checkbox id="publish-now" checked={publishNow} onCheckedChange={(v) => setPublishNow(v === true)} />
            <div>
              <label htmlFor="publish-now" className="text-sm font-medium cursor-pointer">
                {isFil ? 'I-publish agad sa publiko' : 'Publish immediately to the public board'}
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isFil
                  ? 'Kapag hindi naka-check, maaprubahan ang job pero nakatago muna — pwede mo itong i-publish later.'
                  : 'If unchecked, the job is approved but stays hidden — you can publish it later.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproving(null)} className="rounded-xl">{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button
              onClick={() => approving && approveMutation.mutate({ jobId: approving.id, publish: publishNow })}
              disabled={approveMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {approveMutation.isPending ? (isFil ? 'Inaaprubahan...' : 'Approving...') : (isFil ? 'Aprubahan' : 'Approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirm dialog */}
      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isFil ? 'Tanggihan ang Job Order?' : 'Reject Job Order?'}</DialogTitle>
            <DialogDescription>
              {isFil
                ? `Sigurado ka bang gusto mong tanggihan ang "${rejecting?.title}"? Makikita ng nagsumite na hindi ito naaprubahan.`
                : `Are you sure you want to reject "${rejecting?.title}"? The submitter will see it was not approved.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} className="rounded-xl">{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button
              onClick={() => rejecting && rejectMutation.mutate(rejecting.id)}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
            >
              <XCircle className="h-4 w-4" />
              {rejectMutation.isPending ? (isFil ? 'Tinitanggihan...' : 'Rejecting...') : (isFil ? 'Tanggihan' : 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
