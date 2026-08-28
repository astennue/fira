'use client'

import { apiFetch } from "@/lib/fetch"
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Filter, Briefcase, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

const COUNTRIES = [
  { value: 'all', label: 'All Countries' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Taiwan', label: 'Taiwan' },
  { value: 'UAE', label: 'UAE' },
  { value: 'Qatar', label: 'Qatar' },
]

export function ApplicantJobsPage() {
  const { navigate, language } = useAppStore()
  const [country, setCountry] = useState('all')
  const [search, setSearch] = useState('')
  const [savedJobs, setSavedJobs] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fira-saved-jobs')
        return saved ? new Set(JSON.parse(saved)) : new Set()
      } catch { return new Set() }
    }
    return new Set()
  })

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
        toast.success(language === 'fil' ? 'Na-remove sa nai-save' : 'Removed from saved jobs')
      } else {
        next.add(jobId)
        toast.success(language === 'fil' ? 'Na-save na!' : 'Job saved!')
      }
      localStorage.setItem('fira-saved-jobs', JSON.stringify([...next]))
      return next
    })
  }

  const queryParams = new URLSearchParams()
  queryParams.set('public', 'true')
  if (country !== 'all') queryParams.set('country', country)
  if (search) queryParams.set('search', search)

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['applicant-jobs', country, search],
    queryFn: async () => {
      const res = await apiFetch(`/api/jobs?${queryParams}`)
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  const categoryColors: Record<string, string> = {
    domestic_helper: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    caregiver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    nurse: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    factory: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    hospitality: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight">{language === 'fil' ? 'Maghanap ng Trabaho' : 'Find Jobs'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Mag-browse at mag-apply sa mga trabaho' : 'Browse and apply for job openings'}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === 'fil' ? 'Maghanap...' : 'Search...'} className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Walang trabaho ngayon.' : 'No jobs available right now.'}</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job: any, i: number) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2) }}>
              <Card className="hover:shadow-md hover:border-primary/30 transition-all h-full" onClick={() => navigate('job-detail', { jobId: job.id })}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`text-xs ${categoryColors[job.category] || 'bg-muted text-foreground'}`}>{job.category?.replace(/_/g, ' ')}</Badge>
                    <Heart className={`h-4 w-4 ${savedJobs.has(job.id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'} cursor-pointer transition-colors`} onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id) }} />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />{job.city ? `${job.city}, ` : ''}{job.country}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-semibold text-primary">${job.salaryMin ?? '?'} - ${job.salaryMax ?? '?'}</span>
                    <Button size="sm" variant="outline">{language === 'fil' ? 'Tingnan' : 'View'}</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
