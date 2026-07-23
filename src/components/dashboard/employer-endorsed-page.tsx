'use client'

import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { UserCheck, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function EmployerEndorsedPage() {
  const { user } = useAppStore()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employer-endorsed'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements?status=fira_approved,employer_accepted')
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await fetch('/api/endorsements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endorsementId: id, action }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: (_, variables) => {
      toast.success(variables.action === 'employer_accept' ? 'Candidate accepted!' : 'Candidate declined')
      refetch()
    },
    onError: () => toast.error('Action failed'),
  })

  const endorsements = Array.isArray(data?.endorsements) ? data.endorsements : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Endorsed Candidates</h1>
        <p className="text-muted-foreground">Review and accept/decline endorsed candidates</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : endorsements.length === 0 ? (
        <Card className="p-12 text-center"><UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No endorsed candidates yet</p></Card>
      ) : (
        <div className="space-y-4">
          {endorsements.map((e: Record<string, unknown>) => {
            const app = e.application as Record<string, unknown> | undefined
            const applicant = app?.applicant as Record<string, unknown> | undefined
            const job = app?.jobOrder as Record<string, unknown> | undefined
            const profile = applicant?.applicantProfile as Record<string, unknown> | undefined
            return (
              <Card key={e.id as string}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{applicant?.name || 'Unknown'}</h3>
                        <Badge variant="outline" className="capitalize">{String(e.status).replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{job?.title || ''} &middot; {profile?.preferredCountry || ''}</p>
                    </div>
                    {e.status === 'fira_approved' && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => updateMutation.mutate({ id: e.id as string, action: 'employer_accept' })} disabled={updateMutation.isPending}>
                          <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-600" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: e.id as string, action: 'employer_decline' })} disabled={updateMutation.isPending}>
                          <XCircle className="h-4 w-4 mr-1.5 text-red-600" /> Decline
                        </Button>
                      </div>
                    )}
                    {e.status === 'employer_accepted' && <Badge className="bg-emerald-100 text-emerald-800">Accepted</Badge>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
