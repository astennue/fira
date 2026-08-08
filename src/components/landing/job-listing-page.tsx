'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, MapPin, Filter, ArrowLeft, ArrowRight, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'domestic_helper', label: 'Domestic Helper' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'factory', label: 'Factory Worker' },
  { value: 'hospitality', label: 'Hotel & Hospitality' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'construction', label: 'Construction' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'other', label: 'Other' },
]

const COUNTRIES = [
  { value: 'all', label: 'All Countries' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'United Arab Emirates', label: 'UAE' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Taiwan', label: 'Taiwan' },
  { value: 'Hong Kong', label: 'Hong Kong' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Oman', label: 'Oman' },
]

const categoryColors: Record<string, string> = {
  domestic_helper: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  caregiver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  nurse: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  factory: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  hospitality: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  engineer: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
}

export function JobListingPage() {
  const { navigate, viewParams, language } = useAppStore()
  const [country, setCountry] = useState('all')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState(viewParams?.search || '')

  const queryParams = new URLSearchParams()
  if (country !== 'all') queryParams.set('country', country)
  if (category !== 'all') queryParams.set('category', category)
  if (search) queryParams.set('search', search)

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', country, category, search],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?${queryParams.toString()}`)
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="view-transition min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate('landing')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {language === 'fil' ? 'Bumalik' : 'Back'}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {language === 'fil' ? 'Maghanap ng Trabaho' : 'Find Jobs'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fil' ? 'Mag-browse ng verified na job openings sa buong mundo' : 'Browse verified job openings worldwide'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === 'fil' ? 'Hanapin ayon sa title o keyword...' : 'Search by title or keyword...'}
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? '' : `${jobs.length} ${language === 'fil' ? 'trabaho na natagpuan' : 'jobs found'}`}
          </p>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'fil' ? 'Walang natagpuang trabaho' : 'No jobs found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'fil' ? 'Subukan mong baguhin ang iyong filter o hanapin mamaya.' : 'Try adjusting your filters or check back later.'}
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any, i: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Card
                  className="hover:shadow-md hover:border-primary/30 cursor-pointer transition-all h-full"
                  onClick={() => navigate('job-detail', { jobId: job.id })}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${categoryColors[job.category] || 'bg-gray-100 text-gray-800'}`}>
                        {job.category?.replace(/_/g, ' ') || 'General'}
                      </Badge>
                      {job.slots > 1 && (
                        <span className="text-xs text-muted-foreground">{job.slots} slots</span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{job.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.city ? `${job.city}, ` : ''}{job.country}</span>
                    </div>
                    {job.duration && (
                      <p className="text-xs text-muted-foreground mb-2">{job.duration}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t">
                      <span className="text-sm font-semibold text-primary">
                        {job.salaryMin || job.salaryMax
                          ? `$${job.salaryMin ?? '?'} - $${job.salaryMax ?? '?'}`
                          : language === 'fil' ? 'Competitive' : 'Competitive'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} FIRA - Fil International Recruitment Agency
      </footer>
    </div>
  )
}
