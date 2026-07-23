'use client'

import { useQuery } from '@tanstack/react-query'
import { Briefcase, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function EmployerJobsPage() {
  const { navigate, language } = useAppStore()

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{language === 'fil' ? 'Mga Trabaho' : 'My Jobs'}</h1>
        <p className="text-muted-foreground mt-1">{language === 'fil' ? 'Mga job order na nauugnay sa iyo' : 'Job orders linked to you'}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{language === 'fil' ? 'Wala pang trabaho.' : 'No jobs yet.'}</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {jobs.map((job: any, i: number) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />{job.city ? `${job.city}, ` : ''}{job.country}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{job._count?.applications || 0} applicants</span>
                    <Badge variant="secondary" className="text-xs capitalize">{job.status}</Badge>
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
