'use client'

import { apiFetch } from "@/lib/fetch"
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Eye, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'

export function AgencyApplicantsPage() {
  const { language } = useAppStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const queryParams = new URLSearchParams()
  queryParams.set('role', 'applicant')
  if (search) queryParams.set('search', search)

  const { data, isLoading } = useQuery({
    queryKey: ['agency-applicants', search, filter],
    queryFn: async () => {
      const res = await apiFetch(`/api/users?${queryParams}`)
      if (!res.ok) return { users: [], total: 0 }
      return res.json()
    },
  })

  const users = Array.isArray(data?.users) ? data.users : []

  const filteredUsers = filter === 'all' ? users : users.filter((u: any) => u.applicantProfile?.applicantType === filter)

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Aplikante' : 'Applicants'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Tingnan at pamahalaan ang mga aplikante' : 'View and manage applicants'}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === 'fil' ? 'Maghanap ng aplikante...' : 'Search applicants...'} className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'fil' ? 'Lahat' : 'All Types'}</SelectItem>
            <SelectItem value="domestic_helper">Domestic Helper</SelectItem>
            <SelectItem value="skills_professional">Skills / Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 text-center"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Walang nahanap na aplikante.' : 'No applicants found.'}</p></Card>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {filteredUsers.map((u: any, i: number) => {
            const p = u.applicantProfile
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.2) }}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {u.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {p?.applicantType && <Badge variant="outline" className="text-xs">{p.applicantType?.replace('_', ' ')}</Badge>}
                          {p?.preferredCountry && <span>{p.preferredCountry}</span>}
                          {p?.yearsExperience && <span>{p.yearsExperience}yr exp</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!p?.isComplete && (
                        <Badge variant="secondary" className="text-xs text-amber-600">
                          <Clock className="h-3 w-3 mr-1" />Incomplete
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => useAppStore.getState().navigate('fira-applicant-detail', { userId: u.id })}>
                        <Eye className="h-3.5 w-3.5 mr-1" />{language === 'fil' ? 'Tingnan' : 'View'}
                      </Button>
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
