'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { useState } from 'react'

export function AgencyApplicantsPage() {
  const { navigate } = useAppStore()
  const [search, setSearch] = useState('')

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['agency-applicants', search],
    queryFn: async () => {
      const params = new URLSearchParams({ role: 'applicant' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/users?${params}`)
      return res.json()
    },
  })

  const users = Array.isArray(usersData?.users) ? usersData.users : []

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          <p className="text-muted-foreground">View all registered applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applicants..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Preferred Country</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Experience</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: Record<string, unknown>) => {
                    const prof = u.applicantProfile as Record<string, unknown> | undefined
                    return (
                      <tr key={u.id as string} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                              {String(u.name).split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{u.name as string}</p>
                              {prof?.preferredJob && <p className="text-xs text-muted-foreground">{prof.preferredJob as string}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm hidden sm:table-cell">{u.email as string}</td>
                        <td className="p-3 text-sm hidden md:table-cell">{prof?.preferredCountry || '-'}</td>
                        <td className="p-3 text-sm hidden lg:table-cell">{prof?.yearsExperience ? `${prof.yearsExperience} yrs` : '-'}</td>
                        <td className="p-3">
                          {u.isApproved ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
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
