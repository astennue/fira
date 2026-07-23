'use client'

import { useQuery } from '@tanstack/react-query'
import { Building, Search, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

export function FiraAgenciesPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['fira-agencies', search],
    queryFn: async () => {
      const params = new URLSearchParams({ role: 'agency_admin' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/users?${params}`)
      return res.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const res = await fetch(`/api/users/${id}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: approve }) })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: (_, v) => { toast.success(v.approve ? 'Agency approved' : 'Agency rejected') },
    onError: () => toast.error('Action failed'),
  })

  const users = Array.isArray(data?.users) ? data.users : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Agencies</h1>
          <p className="text-muted-foreground">Manage recruitment agencies</p>
        </div>
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 text-xs font-medium text-muted-foreground">Agency</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Location</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th></tr></thead>
                <tbody>
                  {users.map((u: Record<string, unknown>) => {
                    const agency = (u.agencyMembers as Record<string, unknown>[] || [])[0]?.agency as Record<string, unknown> | undefined
                    return (
                      <tr key={u.id as string} className="border-b hover:bg-accent/50">
                        <td className="p-3"><div className="flex items-center gap-2"><Building className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">{agency?.name || u.name}</p></div></div></td>
                        <td className="p-3 text-sm hidden sm:table-cell">{u.email}</td>
                        <td className="p-3 text-sm hidden md:table-cell">{agency?.city ? `${agency.city}, ${agency.country}` : '-'}</td>
                        <td className="p-3">{u.isApproved ? <Badge className="bg-emerald-100 text-emerald-800">Active</Badge> : <Badge variant="secondary">Pending</Badge>}</td>
                        <td className="p-3">
                          {!u.isApproved && (
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => approveMutation.mutate({ id: u.id as string, approve: true })}><CheckCircle className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => approveMutation.mutate({ id: u.id as string, approve: false })}><XCircle className="h-4 w-4" /></Button>
                            </div>
                          )}
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
