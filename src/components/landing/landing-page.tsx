'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search, Briefcase, Globe, CheckCircle, Users, MapPin,
  ArrowRight, Shield, HeartHandshake, Plane, Mail, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, useT } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

const categoryColors: Record<string, string> = {
  domestic_helper: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  caregiver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  nurse: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  factory: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  hospitality: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

function AnimatedCounter({ target, label }: { target: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary">{target}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

export function LandingPage() {
  const { navigate, setSearchQuery, setAuthModalOpen, user, language } = useAppStore()
  const t = useT()
  const [heroSearch, setHeroSearch] = useState('')

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?public=true')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const publicJobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs.slice(0, 6) : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(heroSearch)
    navigate('job-listing', { search: heroSearch })
  }

  return (
    <div className="view-transition min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative container mx-auto px-4 py-16 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-3 py-1">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              {language === 'fil' ? 'Pinagkakatiwalaan ng 500+ ahensya sa buong mundo' : 'Trusted by 500+ agencies worldwide'}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
              {language === 'fil' ? (
                <>
                  Ang Iyong{' '}
                  <span className="bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent">
                    Pinto
                  </span>{' '}
                  sa{' '}
                  <span className="bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent">
                    Tagumpay
                  </span>{' '}
                  sa Labas ng Pilipinas
                </>
              ) : (
                <>
                  Your Gateway to{' '}
                  <span className="bg-gradient-to-r from-emerald-200 to-white bg-clip-text text-transparent">
                    International
                  </span>{' '}
                  Opportunities
                </>
              )}
            </h1>
            <p className="text-base md:text-lg text-emerald-100 max-w-2xl mx-auto mb-8">
              {language === 'fil'
                ? 'Nag-uugnay ng mga bihasang Pilipino sa mga reputadong emplyador sa buong mundo. AI-powered matching, transparent na proseso.'
                : 'Connecting skilled Filipino workers with reputable global employers. AI-powered matching, end-to-end recruitment pipeline.'}
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="flex items-center bg-white rounded-xl shadow-2xl p-1.5">
                <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
                <Input
                  type="search"
                  placeholder={language === 'fil' ? 'Maghanap ng trabaho...' : 'Search jobs by title, country, or keyword...'}
                  className="flex-1 border-0 focus-visible:ring-0 h-11 text-foreground"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
                <Button type="submit" className="rounded-lg h-10 px-5 shrink-0">
                  {language === 'fil' ? 'Hanapin' : 'Search'}
                </Button>
              </div>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => navigate('job-listing')}>
                <Briefcase className="mr-2 h-5 w-5" />
                {language === 'fil' ? 'Maghanap ng Trabaho' : 'Find Jobs'}
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={() => {
                if (user) navigate('applicant-dashboard')
                else setAuthModalOpen(true)
              }}>
                {language === 'fil' ? 'Magparehistro bilang Aplikante' : 'Register as Applicant'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {language === 'fil' ? 'Paano Gumagana' : 'How It Works'}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {language === 'fil'
              ? 'Tatlong simpleng hakbang para magsimula ang iyong karera sa labas ng bansa'
              : 'Three simple steps to start your international career journey'}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { step: '1', title: language === 'fil' ? 'Gumawa ng Account' : 'Create Account', desc: language === 'fil' ? 'Mag-sign up ng libre at kumpletuhin ang iyong profile — kasanayan, karanasan, at mga dokumento.' : 'Sign up for free and complete your professional profile with skills and experience.', icon: Users },
            { step: '2', title: language === 'fil' ? 'Mag-apply sa Trabaho' : 'Apply for Jobs', desc: language === 'fil' ? 'Mag-browse ng libo-libong verified na job openings at mag-apply gamit ang AI-enhanced resume mo.' : 'Browse thousands of verified job openings and apply with AI-enhanced resumes.', icon: Briefcase },
            { step: '3', title: language === 'fil' ? 'Makuha ang Trabaho' : 'Get Hired', desc: language === 'fil' ? 'Ma-match ka sa emplyador, lumipat sa endorsement, at simulan ang bagong mo karera sa labas ng bansa.' : 'Get matched with employers, go through endorsements, and start your new career abroad.', icon: CheckCircle },
          ].map((item, i) => (
            <motion.div key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
              <Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all h-full">
                <CardContent className="p-6 text-center">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400" />
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">
                    {language === 'fil' ? 'HAKBANG' : 'STEP'} {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { target: '10,000+', label: language === 'fil' ? 'Mga Bukas na Trabaho' : 'Job Openings' },
              { target: '5,000+', label: language === 'fil' ? 'Matagumpay na Na-deploy' : 'Successful Deployments' },
              { target: '500+', label: language === 'fil' ? 'Partner na Ahensya' : 'Partner Agencies' },
              { target: '30+', label: language === 'fil' ? 'Mga Bansa' : 'Countries' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <AnimatedCounter {...s} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {language === 'fil' ? 'Mga Pinakabagong Trabaho' : 'Featured Job Openings'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {language === 'fil' ? 'Tingnan ang pinakabagong oportunidad mula sa aming partner na ahensya'
                : 'Explore the latest opportunities from our partner agencies'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('job-listing')} className="hidden sm:flex">
            {language === 'fil' ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : publicJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{language === 'fil' ? 'Wala pang trabaho ngayon. Balikan mamaya!' : 'No jobs available yet. Check back soon!'}</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicJobs.map((job: any, i: number) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md hover:border-primary/30 cursor-pointer transition-all h-full" onClick={() => navigate('job-detail', { jobId: job.id })}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${categoryColors[job.category] || 'bg-gray-100 text-gray-800'}`}>
                        {job.category?.replace('_', ' ') || 'General'}
                      </Badge>
                      {job.slots > 1 && <span className="text-xs text-muted-foreground">{job.slots} slots</span>}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{job.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.city ? `${job.city}, ` : ''}{job.country}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
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
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('job-listing')}>
            {language === 'fil' ? 'Tingnan Lahat ng Trabaho' : 'View All Jobs'}
          </Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-primary/5 py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {language === 'fil' ? 'Bakit Piliin ang FIRA?' : 'Why Choose FIRA?'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: language === 'fil' ? 'Ligtas at Legal' : 'Safe & Legal', desc: language === 'fil' ? 'License ng POEA/DMW. Ang bawat trabaho ay verified at legit.' : 'POEA/DMW licensed. Every job listing is verified and legitimate.' },
              { icon: HeartHandshake, title: language === 'fil' ? 'AI-Powered Matching' : 'AI-Powered Matching', desc: language === 'fil' ? 'Ang aming AI algorithm ay nagmamatch sa iyo sa tamang trabaho batay sa iyong kasanayan.' : 'Our AI algorithm matches you with the right job based on your skills and experience.' },
              { icon: Plane, title: language === 'fil' ? 'End-to-End Support' : 'End-to-End Support', desc: language === 'fil' ? 'Mula aplikasyon hanggang deployment, kasama ka namin sa bawat hakbang.' : 'From application to deployment, we guide you through every step.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">F</div>
                <span className="text-lg font-bold text-primary">FIRA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'fil'
                  ? 'Fil International Recruitment Agency. Nag-uugnay ng Pilipinong talento sa mga pandaigdigang oportunidad.'
                  : 'Fil International Recruitment Agency. Connecting Filipino talent with global opportunities.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{language === 'fil' ? 'Mabilis na Link' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('landing')} className="hover:text-primary transition-colors">{language === 'fil' ? 'Home' : 'Home'}</button></li>
                <li><button onClick={() => navigate('job-listing')} className="hover:text-primary transition-colors">{language === 'fil' ? 'Maghanap ng Trabaho' : 'Browse Jobs'}</button></li>
                <li><button onClick={() => setAuthModalOpen(true)} className="hover:text-primary transition-colors">{language === 'fil' ? 'Magparehistro' : 'Register'}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{language === 'fil' ? 'Impormasyon' : 'Contact Info'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> info@fira.ph</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +63 2 8888 1234</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {language === 'fil' ? 'Makati City, Pilipinas' : 'Makati City, Philippines'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{language === 'fil' ? 'Wika' : 'Language'}</h4>
              <div className="flex gap-2">
                <Button variant={language === 'fil' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setLanguage('fil')}>
                  🇵🇭 Filipino
                </Button>
                <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setLanguage('en')}>
                  🇬🇧 English
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FIRA - Fil International Recruitment Agency. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
