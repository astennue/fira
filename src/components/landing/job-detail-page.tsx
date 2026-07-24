'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Shield,
  CheckCircle, User, Building2, Send, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAppStore, useT } from '@/store/app-store'

export function JobDetailPage() {
  const { navigate, viewParams, user, language } = useAppStore()
  const t = useT()
  const jobId = viewParams?.jobId

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?search=${jobId}`)
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
    enabled: !!jobId,
  })

  const job = Array.isArray(jobsData?.jobs) ? jobsData.jobs.find((j: any) => j.id === jobId) : null

  if (isLoading) {
    return (
      <div className="view-transition min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <Skeleton className="h-64 rounded-xl mb-8" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="view-transition min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">{language === 'fil' ? 'Hindi nahanap ang trabaho' : 'Job not found'}</h2>
          <Button onClick={() => navigate('job-listing')} className="mt-4">
            {language === 'fil' ? 'Bumalik sa Listahan' : 'Back to Listings'}
          </Button>
        </Card>
      </div>
    )
  }

  let requirements: string[] = []
  let benefits: string[] = []
  try { requirements = JSON.parse(job.requirements) } catch { requirements = job.requirements?.split('\n').filter(Boolean) || [] }
  try { benefits = JSON.parse(job.benefits || '[]') } catch { benefits = job.benefits?.split('\n').filter(Boolean) || [] }

  const isApplicant = user?.role === 'applicant'

  return (
    <div className="view-transition min-h-screen flex flex-col">
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <button onClick={() => navigate('job-listing')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {language === 'fil' ? 'Bumalik sa Trabaho' : 'Back to Jobs'}
          </button>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>{job.category?.replace(/_/g, ' ')}</Badge>
              {job.status && <Badge variant="outline" className="capitalize">{job.status}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.city ? `${job.city}, ` : ''}{job.country}</span>
              {job.duration && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{job.duration}</span>}
              <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />${job.salaryMin ?? '?'} - ${job.salaryMax ?? '?'} {job.salaryCurrency || 'USD'}/{job.salaryPeriod || 'month'}</span>
              {job.slots && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{job.slots} slots</span>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="grid gap-6">
          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader><CardTitle>{language === 'fil' ? 'Deskripsyon' : 'Job Description'}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader><CardTitle>{language === 'fil' ? 'Mga Kinakailangan' : 'Requirements'}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader><CardTitle>{language === 'fil' ? 'Mga Benepisyo' : 'Benefits'}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {benefits.map((ben: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Agency Info */}
          {job.agency && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader><CardTitle>{language === 'fil' ? 'Ahensya' : 'Recruiting Agency'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{job.agency.name}</p>
                      {job.agency.country && <p className="text-xs text-muted-foreground">{job.agency.country}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Apply Button */}
          {isApplicant && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sticky bottom-4">
              <Button size="lg" className="w-full h-14 text-base font-semibold shadow-lg">
                <Send className="mr-2 h-5 w-5" />
                {language === 'fil' ? 'Mag-apply sa Trabahong Ito' : 'Apply for This Job'}
              </Button>
            </motion.div>
          )}
          {!isApplicant && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 text-center">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {language === 'fil'
                      ? 'Kailangan ka mag-sign in bilang Aplikante para mag-apply.'
                      : 'Sign in as an Applicant to apply for this job.'}
                  </p>
                  <Button variant="outline" className="mt-3" onClick={() => useAppStore.getState().setAuthModalOpen(true)}>
                    {language === 'fil' ? 'Mag-sign In' : 'Sign In'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t bg-card py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} FIRA - Fil International Recruitment Agency
      </footer>
    </div>
  )
}
