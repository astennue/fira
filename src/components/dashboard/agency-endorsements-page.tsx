'use client'

import { useQuery } from '@tanstack/react-query'
import { Send, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

const statusLabel: Record<string, string> = {
  pending_agency: 'Pending Agency',
  agency_endorsed: 'Agency Endorsed',
  fira_approved: 'FIRA Approved',
  fira_rejected: 'FIRA Rejected',
  employer_accepted: 'Employer Accepted',
  employer_declined: 'Employer Declined',
}

const statusColor: Record<string, string> = {
  pending_agency: 'bg-gray-100 text-gray-800',
  agency_endorsed: 'bg-blue-100 text-blue-800',
  fira_approved: 'bg-emerald-100 text-emerald-800',
  fira_rejected: 'bg-red-100 text-red-800',
  employer_accepted: 'bg-green-100 text-green-800',
  employer_declined: 'bg-amber-100 text-amber-800',
}

export function AgencyEndorsementsPage() {
  const navigate = useAppStore(s => s.navigate)

  const { data: data, isLoading } = useQuery({
    queryKey: ['agency-endorsements'],
    queryFn: async () => {
      const res = await fetch('/api/endorsements')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  const endorsements = Array.isArray(data?.endorsements) ? data.endorsements : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Endorsements</h1>
          <p className="text-muted-foreground">Track candidate endorsements</p>
        </div>
        <Button><Send className="h-4 w-4 mr-2" /> New Endorsement</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : endorsements.length === 0 ? (
        <Card className="p-12 text-center"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No endorsements yet</p></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Job</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Employer</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {endorsements.map((e: Record<string, unknown>) => {
                    const app = e.application as Record<string, unknown> | undefined
                    const applicant = app?.applicant as Record<string, unknown> | undefined
                    const job = app?.jobOrder as Record<string, unknown> | undefined
                    const employer = e.employer as Record<string, unknown> | undefined
                    return (
                      <tr key={e.id as string} className="border-b hover:bg-accent/50">
                        <td className="p-3 text-sm font-medium">{applicant?.name || '-'}</td>
                        <td className="p-3 text-sm">{job?.title || '-'}</td>
                        <td className="p-3 text-sm">{employer?.companyName || '-'}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[e.status as string] || 'bg-gray-100'}`}>
                            {statusLabel[e.status as string] || (e.status as string)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
