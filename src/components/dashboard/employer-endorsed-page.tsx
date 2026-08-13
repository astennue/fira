'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, UserCheck, ArrowRight, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

export function EmployerEndorsedPage() {
  const { language } = useAppStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employer-endorsements-list'],
    queryFn: async () => {
      const res = await apiFetch('/api/endorsements')
      if (!res.ok) return { endorsements: [] }
      return res.json()
    },
  })

  const endorsements = Array.isArray(data?.endorsements) ? data.endorsements : []

  const updateMutation = useMutation({
    mutationFn: async ({ endorsementId, action }: { endorsementId: string; action: string }) => {
      const res = await apiFetch('/api/endorsements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endorsementId, action }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-endorsements-list'] })
      toast.success(language === 'fil' ? 'Matagumpay na na-update!' : 'Updated successfully!')
    },
    onError: () => {
      toast.error(language === 'fil' ? 'Hindi matagumpay.' : 'Failed to update.')
    },
  })

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Inindorso na Kandidato' : 'Endorsed Candidates'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Review at magdesisyon sa mga kandidato' : 'Review and decide on candidates'}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : endorsements.length === 0 ? (
        <Card className="p-8 text-center"><UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Wala pang endorsed na kandidato.' : 'No endorsed candidates yet.'}</p></Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {endorsements.map((e: any, i: number) => {
            const applicant = e.application?.applicant
            const job = e.application?.jobOrder
            const profile = applicant?.applicantProfile
            const isPending = e.status === 'pending_employer_review'

            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{applicant?.name || 'Unknown'}</h3>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{job?.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {profile?.preferredCountry && <span>{profile.preferredCountry}</span>}
                            {profile?.yearsExperience && <span>{profile.yearsExperience}yr {language === 'fil' ? 'karanasan' : 'experience'}</span>}
                          </div>
                          {e.coverNote && <p className="text-xs text-muted-foreground mt-1 italic">&quot;{e.coverNote}&quot;</p>}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize shrink-0">{e.status?.replace(/_/g, ' ')}</Badge>
                      </div>
                      {/* Profile Summary (limited info) */}
                      {profile && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {profile.applicantType && <div className="p-2 rounded bg-muted"><span className="text-muted-foreground">{language === 'fil' ? 'Uri' : 'Type'}</span><br /><span className="font-medium">{profile.applicantType?.replace('_', ' ')}</span></div>}
                          {profile.highestEducation && <div className="p-2 rounded bg-muted"><span className="text-muted-foreground">{language === 'fil' ? 'Edukasyon' : 'Education'}</span><br /><span className="font-medium capitalize">{profile.highestEducation}</span></div>}
                          {profile.passportStatus && <div className="p-2 rounded bg-muted"><span className="text-muted-foreground">Passport</span><br /><span className="font-medium capitalize">{profile.passportStatus}</span></div>}
                          {profile.medicalStatus && profile.medicalStatus !== 'none' && <div className="p-2 rounded bg-muted"><span className="text-muted-foreground">Medical</span><br /><span className="font-medium capitalize">{profile.medicalStatus}</span></div>}
                        </div>
                      )}
                      {isPending && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" className="flex-1" onClick={() => updateMutation.mutate({ endorsementId: e.id, action: 'employer_accept' })} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}{language === 'fil' ? 'Accept' : 'Accept'}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => updateMutation.mutate({ endorsementId: e.id, action: 'employer_decline' })} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}{language === 'fil' ? 'Decline' : 'Decline'}
                          </Button>
                        </div>
                      )}
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
