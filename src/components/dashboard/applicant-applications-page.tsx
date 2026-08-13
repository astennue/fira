'use client'

import { apiFetch } from "@/lib/fetch"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, MapPin, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { getStatusLabel, getStatusColor, getNextStatuses } from '@/lib/status'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export function ApplicantApplicationsPage() {
  const { user, navigate, language } = useAppStore()
  const queryClient = useQueryClient()
  const isFil = language === 'fil'

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/applications?applicantId=${user?.id}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const res = await apiFetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'Failed to update status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success(isFil ? 'Na-update na ang status!' : 'Status updated successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{isFil ? 'Mga Aplikasyon Ko' : 'My Applications'}</h1>
        <p className="text-muted-foreground mt-1">{isFil ? 'Subaybayan ang status ng iyong mga aplikasyon' : 'Track the status of your applications'}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{isFil ? 'Wala pang aplikasyon' : 'No applications yet'}</h3>
          <p className="text-sm text-muted-foreground mb-4">{isFil ? 'Magsimula sa paghanap ng trabaho!' : 'Start by finding jobs!'}</p>
          <Button onClick={() => navigate('applicant-jobs')}>{isFil ? 'Maghanap ng Trabaho' : 'Find Jobs'}</Button>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {applications.map((app: any, i: number) => {
            const job = app.jobOrder
            const stage = app.currentStage
            const ai = app.aiAnalysis
            const nextStatuses = user?.role ? getNextStatuses(app.status, user.role) : []
            const isUpdating = updateStatusMutation.isPending

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{job?.title || 'Unknown'}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusColor(app.status)}`}>
                            {getStatusLabel(app.status, isFil)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job?.country || ''}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                          {stage && (
                            <Badge variant="outline" className="text-xs">
                              {stage.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {ai?.matchScore && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{Math.round(ai.matchScore)}%</p>
                            <p className="text-[10px] text-muted-foreground">Match</p>
                          </div>
                        )}
                        {nextStatuses.length > 0 && (
                          <Select
                            disabled={isUpdating}
                            onValueChange={(val) => {
                              updateStatusMutation.mutate({ applicationId: app.id, status: val })
                            }}
                          >
                            <SelectTrigger className="w-[160px] h-8 text-xs">
                              <SelectValue placeholder={isFil ? 'Baguhin status...' : 'Change status...'} />
                            </SelectTrigger>
                            <SelectContent>
                              {nextStatuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {isFil ? s.label.fil : s.label.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button variant="outline" size="sm" onClick={() => navigate('job-detail', { jobId: job?.id })}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
