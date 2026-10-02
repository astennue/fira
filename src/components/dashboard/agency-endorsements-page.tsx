'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Send, CheckCircle, XCircle, Clock, Building2, ArrowRight,
  ShieldCheck, UserCheck, FileText, Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'
import { toast } from 'sonner'

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending_fira_review: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending FIRA Review' },
  fira_approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: ShieldCheck, label: 'FIRA Approved' },
  fira_rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'FIRA Rejected' },
  pending_employer_review: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock, label: 'Pending Employer' },
  employer_accepted: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Accepted by Employer' },
  employer_declined: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Declined by Employer' },
}

/** 2-step flow position: 0 = at FIRA, 1 = at employer, 2 = done/negative */
function flowStep(status: string): number {
  if (status === 'pending_fira_review') return 0
  if (status === 'fira_approved' || status === 'pending_employer_review') return 1
  if (status === 'employer_accepted') return 2
  return -1
}

export function AgencyEndorsementsPage() {
  const { language, user } = useAppStore()
  const queryClient = useQueryClient()
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({})
  const isFil = language === 'fil'

  const { data, isLoading } = useQuery({
    queryKey: ['agency-endorsements', user?.id],
    queryFn: async () => {
      const res = await apiFetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
    enabled: !!user?.id,
  })

  const patchMutation = useMutation({
    mutationFn: async (p: { endorsementId: string; action: string; notes?: string }) => {
      const res = await apiFetch('/api/endorsements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Action failed')
      return json
    },
    onSuccess: (_d, p) => {
      const done = p.action.includes('approve') || p.action.includes('accept')
      toast.success(done ? 'Approved successfully' : 'Decision recorded')
      queryClient.invalidateQueries({ queryKey: ['agency-endorsements'] })
    },
    onError: (err: any) => toast.error(err.message || 'Action failed'),
  })

  const endorsements = Array.isArray(data?.endorsements) ? [...data.endorsements].sort((a: any, b: any) => {
    // pending FIRA review first, then pending employer, then the rest
    const rank = (s: string) => (s === 'pending_fira_review' ? 0 : s === 'pending_employer_review' ? 1 : 2)
    return rank(a.status) - rank(b.status)
  }) : []

  const isFira = user?.role === 'staff' || user?.role === 'super_admin' || user?.role === 'international_agency'
  const isEmployer = user?.role === 'employer'

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
          {isFil ? 'Mga Endorso' : 'Endorsements'}
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          {isFil ? 'Subaybayan ang mga endorsement' : 'Two-step endorsement flow: Agency → FIRA → Employer'}
          <span className="mw-mono text-[10px] uppercase tracking-widest hidden sm:inline">step 1 · step 2</span>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : endorsements.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Send className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{isFil ? 'Wala pang endorsement.' : 'No endorsements yet.'}</p>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar pr-1">
          {endorsements.map((e: any, i: number) => {
            const cfg = statusConfig[e.status] || statusConfig.pending_fira_review
            const StatusIcon = cfg.icon
            const applicant = e.application?.applicant
            const job = e.application?.jobOrder
            const employer = e.employer
            const step = flowStep(e.status)
            const match = Math.round(e.application?.matchScore || 0)
            const canFiraAct = isFira && e.status === 'pending_fira_review'
            const canEmployerAct = isEmployer && e.status === 'pending_employer_review'

            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="mw-card-hover overflow-hidden">
                  {/* brand strip */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#1f3fa6] via-[#3d6be0] to-[#f6c615]" />
                  <CardContent className="p-5 md:p-6 space-y-4">
                    {/* header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-display font-semibold">{applicant?.name || 'Unknown'}</p>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground truncate">{job?.title || 'Unknown Job'}</p>
                          {match > 0 && (
                            <Badge className="mw-gold-chip border-0 text-[10px] gap-1">
                              <Sparkles className="h-3 w-3" />{match}% match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />{employer?.companyName || 'Unknown Employer'}
                        </div>
                      </div>
                      <Badge className={`text-xs ${cfg.color} shrink-0`}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </Badge>
                    </div>

                    {/* 2-step flow tracker */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border bg-muted/40 p-3">
                      {/* step 1 */}
                      <div className={`flex items-center gap-2 ${step < 0 ? 'opacity-60' : ''}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'
                        }`}>1</div>
                        <div className="min-w-0">
                          <p className="text-[10px] mw-section-label !normal-case !tracking-normal font-semibold">Agency → FIRA</p>
                          <p className="text-[10px] text-muted-foreground">
                            {e.status === 'pending_fira_review' ? 'Awaiting verification' : step >= 1 ? 'Verified by FIRA' : '—'}
                          </p>
                        </div>
                      </div>
                      <div className={`h-0.5 w-8 rounded ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
                      {/* step 2 */}
                      <div className="flex items-center gap-2 justify-end text-right">
                        <div className="min-w-0">
                          <p className="text-[10px] mw-section-label !normal-case !tracking-normal font-semibold">FIRA → Employer</p>
                          <p className="text-[10px] text-muted-foreground">
                            {e.status === 'pending_employer_review' ? 'Awaiting decision' : e.status === 'employer_accepted' ? 'Accepted' : e.status === 'employer_declined' ? 'Declined' : '—'}
                          </p>
                        </div>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          step >= 2 ? 'bg-emerald-500 text-white' : step === 1 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>2</div>
                      </div>
                    </div>

                    {/* audit trail */}
                    {(e.agencyNote || e.firaNote || e.employerNote || e.coverNote) && (
                      <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                        <p className="mw-section-label flex items-center gap-1.5">
                          <FileText className="h-3 w-3" /> Audit trail
                        </p>
                        {e.coverNote && (
                          <div className="flex gap-2 text-xs">
                            <Send className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                            <p className="text-muted-foreground italic">Cover note: &ldquo;{e.coverNote}&rdquo;</p>
                          </div>
                        )}
                        {e.agencyNote && (
                          <div className="flex gap-2 text-xs">
                            <span className="h-4 w-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">A</span>
                            <p className="text-muted-foreground"><span className="font-semibold text-foreground">Agency:</span> {e.agencyNote}</p>
                          </div>
                        )}
                        {e.firaNote && (
                          <div className="flex gap-2 text-xs">
                            <span className="h-4 w-4 rounded-full bg-[#f6c615]/25 text-[#8a6d00] dark:text-[#f6c615] text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">F</span>
                            <p className="text-muted-foreground"><span className="font-semibold text-foreground">FIRA:</span> {e.firaNote}</p>
                          </div>
                        )}
                        {e.employerNote && (
                          <div className="flex gap-2 text-xs">
                            <span className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">E</span>
                            <p className="text-muted-foreground"><span className="font-semibold text-foreground">Employer:</span> {e.employerNote}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* actions */}
                    {(canFiraAct || canEmployerAct) && (
                      <div className="rounded-xl border border-dashed p-3 space-y-2">
                        <p className="mw-section-label flex items-center gap-1.5">
                          <UserCheck className="h-3 w-3" />
                          {canFiraAct ? 'FIRA review — step 1 decision' : 'Employer review — step 2 decision'}
                        </p>
                        <Textarea
                          placeholder={canFiraAct ? 'Verification notes (optional)…' : 'Decision notes (optional)…'}
                          className="min-h-[60px] text-xs"
                          value={noteDraft[e.id] || ''}
                          onChange={(ev) => setNoteDraft((d) => ({ ...d, [e.id]: ev.target.value }))}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm" variant="outline"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            disabled={patchMutation.isPending}
                            onClick={() => patchMutation.mutate({
                              endorsementId: e.id,
                              action: canFiraAct ? 'fira_reject' : 'employer_decline',
                              notes: noteDraft[e.id] || undefined,
                            })}
                          >
                            <XCircle className="h-4 w-4" />{canFiraAct ? 'Reject' : 'Decline'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={patchMutation.isPending}
                            onClick={() => patchMutation.mutate({
                              endorsementId: e.id,
                              action: canFiraAct ? 'fira_approve' : 'employer_accept',
                              notes: noteDraft[e.id] || undefined,
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />{canFiraAct ? 'Approve & forward' : 'Accept candidate'}
                          </Button>
                        </div>
                      </div>
                    )}
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
