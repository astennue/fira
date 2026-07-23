'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, SlidersHorizontal, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

const CATEGORIES = ['All', 'Healthcare', 'Construction', 'Domestic Helper', 'Hospitality', 'Engineering', 'IT', 'Manufacturing', 'Agriculture', 'Education']
const COUNTRIES = ['All', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Singapore', 'Hong Kong', 'Japan', 'Canada', 'Australia', 'United Kingdom', 'Italy']

export function JobListingPage() {
  const { navigate, viewParams, searchQuery, setSearchQuery } = useAppStore()
  const [search, setSearch] = useState(searchQuery || viewParams.search || '')
  const [country, setCountry] = useState('All')
  const [category, setCategory] = useState('All')

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (country !== 'All') params.set('country', country)
  if (category !== 'All') params.set('category', category)
  params.set('public', 'true')

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', search, country, category],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      return res.json()
    },
  })

  const jobList = Array.isArray(jobs) ? jobs : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(search)
    refetch()
  }

  const clearFilters = () => {
    setSearch('')
    setCountry('All')
    setCategory('All')
    setSearchQuery('')
  }

  return (
    <div className="view-transition container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Browse Job Openings</h1>
        <p className="text-muted-foreground">Find your next international opportunity</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title or keyword..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>)}
            </select>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <Button type="submit"><Search className="h-4 w-4 mr-2" />Search</Button>
            {(search || country !== 'All' || category !== 'All') && (
              <Button type="button" variant="ghost" onClick={clearFilters}><X className="h-4 w-4 mr-1" />Clear</Button>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 p-6 text-center border-destructive">
          <p className="text-destructive mb-3">Failed to load jobs</p>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </Card>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : jobList.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
          <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">Showing {jobList.length} job openings</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobList.map((job: Record<string, unknown>) => (
              <Card key={job.id as string} className="hover:shadow-md hover:border-primary/30 cursor-pointer transition-all" onClick={() => navigate('job-detail', { jobId: job.id as string })}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{String(job.category || 'General')}</Badge>
                    {job.slots && <span className="text-xs text-muted-foreground">{job.slots} slots</span>}
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{String(job.title)}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{job.city ? `${job.city}, ` : ''}{String(job.country)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">{job.companyName ? String(job.companyName) : ''}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {(job.salaryMin || job.salaryMax) ? `$${job.salaryMin ?? '?'} - $${job.salaryMax ?? '?'}` : 'Competitive'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
