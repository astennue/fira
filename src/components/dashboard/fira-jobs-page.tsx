'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, Search, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function FiraJobsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['fira-jobs', search],
    queryFn: async () => {
      const params = new URLSearchParams({ userRole: 'fira' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/jobs?${params}`)
      return res.json()
    },
  })

  const jobs = Array.isArray(data?.jobs) ? data.jobs : []

  const visColor: Record<string, string> = { public: 'bg-emerald-100 text-emerald-800', agency_only: 'bg-blue-100 text-blue-800', private: 'bg-purple-100 text-purple-800' }

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Jobs</h1>
          <p className="text-muted-foreground">{jobs.length} total job listings</p>
        </div>
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search jobs..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 text-xs font-medium text-muted-foreground">Job Title</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Country</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Category</th><th className="text-left p-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Applicants</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Visibility</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th></tr></thead>
                <tbody>
                  {jobs.map((job: Record<string, unknown>) => (
                    <tr key={job.id as string} className="border-b hover:bg-accent/50">
                      <td className="p-3"><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary flex-shrink-0" /><p className="text-sm font-medium truncate max-w-[200px]">{job.title as string}</p></div></td>
                      <td className="p-3 text-sm hidden sm:table-cell">{job.country as string}</td>
                      <td className="p-3 text-sm hidden md:table-cell capitalize">{job.category as string}</td>
                      <td className="p-3 text-sm hidden lg:table-cell">{((job as Record<string, Record<string, number>>)._count?.applications || 0)}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visColor[job.visibility as string] || 'bg-gray-100'}`}>{String(job.visibility).replace('_', ' ')}</span></td>
                      <td className="p-3"><Badge variant="secondary" className="capitalize text-xs">{String(job.status)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
