'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Building, CheckCircle, XCircle, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function FiraAgenciesPage() {
  const { language } = useAppStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['fira-agencies', search, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter !== 'all') params.set('agencyType', typeFilter)
      const res = await fetch(`/api/agencies?${params}`)
      if (!res.ok) return { agencies: [] }
      return res.json()
    },
  })

  const agencies = Array.isArray(data?.agencies) ? data.agencies : []

  const approveMutation = useMutation({
    mutationFn: async ({ agencyId, action }: { agencyId: string; action: string }) => {
      const res = await fetch('/api/agencies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, action }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fira-agencies'] })
      toast.success(language === 'fil' ? 'Na-update!' : 'Updated!')
    },
  })

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Ahensya' : 'Agencies'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Pamahalaan at i-approve ang mga ahensya' : 'Manage and approve agencies'}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === 'fil' ? 'Maghanap...' : 'Search...'} className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'fil' ? 'Lahat ng Uri' : 'All Types'}</SelectItem>
            <SelectItem value="local">{language === 'fil' ? 'Lokal (PH)' : 'Local (PH)'}</SelectItem>
            <SelectItem value="international">International</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : agencies.length === 0 ? (
        <Card className="p-8 text-center"><Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Walang ahensya.' : 'No agencies found.'}</p></Card>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
          {agencies.map((agency: any, i: number) => (
            <motion.div key={agency.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {agency.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{agency.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs capitalize">{agency.agencyType}</Badge>
                        {agency.city && <span>{agency.city}{agency.country ? `, ${agency.country}` : ''}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!agency.isApproved ? (
                      <>
                        <Badge variant="secondary" className="text-xs text-amber-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                        <Button size="sm" onClick={() => approveMutation.mutate({ agencyId: agency.id, action: 'approve' })}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />{language === 'fil' ? 'Aprubahan' : 'Approve'}
                        </Button>
                      </>
                    ) : (
                      <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Shield className="h-3 w-3 mr-1" />Approved
                      </Badge>
                    )}
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
