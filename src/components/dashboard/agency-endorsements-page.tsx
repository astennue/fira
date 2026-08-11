'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, CheckCircle, XCircle, Clock, User, Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

export function AgencyEndorsementsPage() {
  const { language } = useAppStore()
  const queryClient = useQueryClient()

  const { data: data, isLoading } = useQuery({
    queryKey: ['agency-endorsements'],
    queryFn: async () => {
      const res = await apiFetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const endorsements = Array.isArray(data?.endorsements) ? data.endorsements : []

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending_fira_review: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending FIRA Review' },
    fira_approved: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'FIRA Approved' },
    fira_rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'FIRA Rejected' },
    pending_employer_review: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock, label: 'Pending Employer' },
    employer_accepted: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'Accepted by Employer' },
    employer_declined: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Declined by Employer' },
  }

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Endorso' : 'Endorsements'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Subaybayan ang mga endorsement' : 'Track endorsement progress'}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : endorsements.length === 0 ? (
        <Card className="p-8 text-center"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Wala pang endorsement.' : 'No endorsements yet.'}</p></Card>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {endorsements.map((e: any, i: number) => {
            const cfg = statusConfig[e.status] || statusConfig.pending_fira_review
            const StatusIcon = cfg.icon
            const applicant = e.application?.applicant
            const job = e.application?.jobOrder
            const employer = e.employer
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm">{applicant?.name || 'Unknown'}</p>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{job?.title || 'Unknown Job'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />{employer?.companyName || 'Unknown Employer'}
                        </div>
                        {e.coverNote && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">&quot;{e.coverNote}&quot;</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />{cfg.label}
                        </Badge>
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
