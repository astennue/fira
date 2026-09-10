'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Plus, MapPin, Clock, CheckCircle2, XCircle, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'

export function EmployerJobsPage() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const pendingCount = jobs.filter((j: any) => j.status === 'pending').length

  const statusConfig: Record<string, { color: string; icon: any; label: string; labelFil: string }> = {
    pending: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300', icon: Clock, label: 'Pending FIRA Approval', labelFil: 'Naghihintay ng Approval ng FIRA' },
    approved: { color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300', icon: CheckCircle2, label: 'Approved', labelFil: 'Aprubado' },
    open: { color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300', icon: CheckCircle2, label: 'Approved', labelFil: 'Aprubado' },
    rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300', icon: XCircle, label: 'Rejected', labelFil: 'Hindi Aprubado' },
    closed: { color: 'bg-muted text-foreground', icon: XCircle, label: 'Closed', labelFil: 'Sarado' },
    filled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400', icon: CheckCircle2, label: 'Filled', labelFil: 'Nakumpleto' },
    cancelled: { color: 'bg-muted text-foreground', icon: XCircle, label: 'Cancelled', labelFil: 'Kanselado' },
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{isFil ? 'Mga Job Order Ko' : 'My Job Orders'}</h1>
          <p className="text-muted-foreground mt-1">
            {isFil ? 'Mga job order na naipasa sa FIRA' : 'Job orders endorsed to FIRA'}
          </p>
        </div>
        <Button
          onClick={() => navigate('employer-job-create')}
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />{isFil ? 'I-endorse ang Job Order' : 'Endorse Job Order'}
        </Button>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {isFil
                ? `${pendingCount} job order ang naghihintay ng approval mula sa FIRA. Iabot ka ng abiso kapag naaprubahan.`
                : `${pendingCount} job order${pendingCount > 1 ? 's' : ''} awaiting FIRA approval. You will be notified once reviewed.`}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Handshake className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{isFil ? 'Wala pang job order.' : 'No job orders yet.'}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {isFil
              ? 'I-endorse ang iyong unang job order sa FIRA para simulan ang recruitment.'
              : 'Endorse your first job order to FIRA to start recruitment.'}
          </p>
          <Button onClick={() => navigate('employer-job-create')} className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" />{isFil ? 'I-endorse ang Unang Job Order' : 'Endorse Your First Job Order'}
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {jobs.map((job: any, i: number) => {
            const cfg = statusConfig[job.status] || statusConfig.pending
            const StatusIcon = cfg.icon
            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-sm">{job.title}</h3>
                      <Badge className={`text-xs shrink-0 ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {isFil ? cfg.labelFil : cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {job.visibility === 'public'
                          ? (isFil ? 'Publiko na' : 'Live on public board')
                          : (isFil ? 'Hindi pa publiko' : 'Not public yet')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {job._count?.applications || 0} {isFil ? 'aplikante' : 'applicants'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
