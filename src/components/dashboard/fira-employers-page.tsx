'use client'

import { apiFetch } from "@/lib/fetch"
import { useQuery } from '@tanstack/react-query'
import { Building2, Globe, Search, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function FiraEmployersPage() {
  const { language } = useAppStore()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['fira-employers', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('role', 'employer')
      if (search) params.set('search', search)
      const res = await apiFetch(`/api/users?${params}`)
      if (!res.ok) return { users: [] }
      return res.json()
    },
  })

  const users = Array.isArray(data?.users) ? data.users : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Empleyador' : 'Employers'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Listahan ng mga foreign employer' : 'List of foreign employers'}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={language === 'fil' ? 'Maghanap ng empleyador...' : 'Search employers...'} className="pl-9 h-10 max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center"><Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Walang empleyador.' : 'No employers found.'}</p></Card>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar">
          {users.map((u: any, i: number) => {
            const ep = u.employerProfile
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {ep?.companyName?.charAt(0) || u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{ep?.companyName || u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />{ep?.country || 'N/A'}
                          {ep?.industry && <span>&middot; {ep.industry}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">
                      {u.isApproved
                        ? (language === 'fil' ? 'Approved' : 'Approved')
                        : <span className="text-amber-600"><Clock className="h-3 w-3 inline mr-1" />Pending</span>
                      }
                    </Badge>
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
