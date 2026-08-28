'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search, Briefcase, Globe, CheckCircle, Users, MapPin,
  ArrowRight, Shield, HeartHandshake, Plane, Mail, Phone,
  Star, ChevronRight, ChevronLeft, FileText, ClipboardCheck, Stethoscope,
  GraduationCap, Headphones, Facebook,
  Instagram, Linkedin, Twitter, Building2, Handshake,
  ArrowUpRight, Zap, Target, Route, TrendingUp,
  Globe2, Compass, BadgeCheck, Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'

/* ============================================================
   ANIMATION VARIANTS
   ============================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

/* ============================================================
   CATEGORY COLORS
   ============================================================ */

const categoryColors: Record<string, string> = {
  domestic_helper: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  caregiver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  nurse: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  factory: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  hospitality: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

/* ============================================================
   ANIMATED COUNTER
   ============================================================ */

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */

function TestimonialsCarousel({ testimonials }: { testimonials: any[] }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const paginate = (dir: number) => {
    setDirection(dir)
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => paginate(1), 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  if (testimonials.length === 0) return null

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 200 : -200, opacity: 0 }),
  }

  const t = testimonials[current]

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-2xl p-8 md:p-10 max-w-2xl mx-auto text-center"
          >
            <Quote className="h-8 w-8 text-blue-400/60 mx-auto mb-4" />
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-foreground/90 text-base md:text-lg italic leading-relaxed mb-6">
              &ldquo;{t.feedback}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              {t.avatar ? (
                <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover border-2 border-blue-400/40" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-blue-500/20 flex items-center justify-center text-foreground font-bold text-sm">
                  {t.name?.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-foreground font-semibold text-sm">{t.name}</p>
                {t.position && <p className="text-muted-foreground text-xs">{t.position}{t.company ? ` at ${t.company}` : ''}</p>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={() => paginate(-1)} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-blue-500/20 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-blue-500' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
            />
          ))}
        </div>
        <button onClick={() => paginate(1)} className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-blue-500/20 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   FLOATING ORB DECORATION
   ============================================================ */

function FloatingOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}>
      <div className="w-full h-full rounded-full bg-blue-500/15 animate-pulse" />
    </div>
  )
}

/* ============================================================
   MAIN LANDING PAGE COMPONENT
   ============================================================ */

export function LandingPage() {
  const { navigate, setSearchQuery, setAuthModalOpen, user, language } = useAppStore()
  const [heroSearch, setHeroSearch] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  // ── API Data Fetching ───────────────────────────────────────
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs?public=true')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: testimonialsData } = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/testimonials?public=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: faqsData } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/faqs?public=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const publicJobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs.slice(0, 6) : []
  const testimonials = Array.isArray(testimonialsData) ? testimonialsData.filter((tt: any) => tt.isActive) : []
  const faqs = Array.isArray(faqsData) ? faqsData.filter((f: any) => f.isActive).slice(0, 6) : []

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(heroSearch)
    navigate('job-listing', { search: heroSearch })
  }

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    try {
      const res = await apiFetch('/api/cms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      if (res.ok || res.status === 409) {
        setNewsletterSubmitted(true)
        setNewsletterEmail('')
        setTimeout(() => setNewsletterSubmitted(false), 3000)
      }
    } catch {
      // Silently fail - newsletter is non-critical
      setNewsletterSubmitted(true)
      setTimeout(() => setNewsletterSubmitted(false), 3000)
    }
  }

  // ── Bilingual Labels ──────────────────────────────────────
  const L = (fil: string, en: string) => language === 'fil' ? fil : en

  // ── Hero Bento Cards ───────────────────────────────────────
  const heroBentoCards = [
    { icon: Globe2, label: L('30+ Bansa', '30+ Countries'), size: 'large' as const, accent: 'from-blue-500/20 to-blue-600/10' },
    { icon: Users, label: L('10K+ Na-deploy', '10K+ Deployed'), size: 'small' as const, accent: 'from-amber-500/20 to-amber-600/10' },
    { icon: Shield, label: L('Ligtas & Legal', 'Safe & Legal'), size: 'small' as const, accent: 'from-green-500/20 to-green-600/10' },
    { icon: BadgeCheck, label: L('DOLE License', 'DOLE Licensed'), size: 'small' as const, accent: 'from-sky-500/20 to-sky-600/10' },
    { icon: HeartHandshake, label: L('Buong Suporta', 'Full Support'), size: 'large' as const, accent: 'from-rose-500/20 to-rose-600/10' },
  ]

  // ── How It Works Steps ────────────────────────────────────
  const steps = [
    {
      icon: Users,
      title: L('Magparehistro', 'Create Account'),
      desc: L(
        'Gumawa ng account at kumpletuhin ang iyong profile kasama ang iyong kasanayan at karanasan.',
        'Create your account and complete your profile with your skills and experience.'
      ),
      accent: 'bg-blue-500',
      visual: '01',
    },
    {
      icon: Compass,
      title: L('Mag-apply', 'Find & Apply'),
      desc: L(
        'Mag-browse ng verified na job openings at mag-apply sa mga trabaho na nakapares sa iyong kasanayan.',
        'Browse verified job openings and apply to positions matching your skills and qualifications.'
      ),
      accent: 'bg-amber-500',
      visual: '02',
    },
    {
      icon: Plane,
      title: L('Maging Deployed', 'Get Deployed'),
      desc: L(
        'Ma-match ka sa empleyador, kumpletuhin ang proseso, at maging deployed sa ibang bansa.',
        'Get matched with employers, complete the process, and get deployed abroad.'
      ),
      accent: 'bg-green-500',
      visual: '03',
    },
  ]

  // ── Services ───────────────────────────────────────────────
  const services = [
    { icon: Briefcase, title: L('Rekrutamento', 'Recruitment'), desc: L('Kumprehensibong serbisyo sa rekrutamento na nagkonekta ng mga Pilipinong manggagawa sa mga internasyonal na empleyador.', 'Comprehensive overseas recruitment services connecting Filipino workers with international employers.') },
    { icon: FileText, title: L('Pagsasalaysay ng Dokumento', 'Document Processing'), desc: L('Kumpleto ng paghahanda, pag-verify, at pagproseso ng dokumento para sa lahat ng kinakailangan.', 'End-to-end document preparation, verification, and processing for all deployment requirements.') },
    { icon: ClipboardCheck, title: L('Pagsusuri ng Kakayahan', 'Skills Assessment'), desc: L('Masusing pagsusuri ng kasanayan, karanasan, at kwalipikasyon ng kandidato.', 'Thorough evaluation of candidate skills, experience, and qualifications to ensure job fit.') },
    { icon: Stethoscope, title: L('Pagsusuri Medikal', 'Medical Clearance'), desc: L('Koordinasyon sa akreditadong medikal na pasilidad para sa kumpletong pagsusuri ng kalusugan.', 'Coordination with accredited medical facilities for complete health screening.') },
    { icon: GraduationCap, title: L('Oryentasyon bago Pumalad', 'Pre-Departure Orientation'), desc: L('Kumpletong PDOS na sumasaklaw sa kultura, karapatan, inaasahan ng empleyador, at kaligtasan.', 'Comprehensive PDOS covering culture, rights, employer expectations, and safety.') },
    { icon: Headphones, title: L('Suporta pagkatapos Pumalad', 'Post-Deployment Support'), desc: L('Patuloy na pagsubaybay at suporta para sa mga deployed workers sa buong kanilang trabaho.', 'Continuous monitoring and support for deployed workers throughout their employment.') },
  ]

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="view-transition min-h-screen flex flex-col bg-background">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Split Layout with Bento Grid
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-fira-hero min-h-[90vh]">
        {/* Background Orbs */}
        <FloatingOrb className="top-20 -left-20 w-[500px] h-[500px]" />
        <FloatingOrb className="bottom-10 right-0 w-[400px] h-[400px]" />
        <FloatingOrb className="top-1/2 left-1/3 w-[300px] h-[300px]" />
        <div className="absolute inset-0 bg-grid-pattern" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
            {/* LEFT: Content */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-6">
              {/* Trust Badge */}
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="bg-white/15 text-white/90 border-white/25 text-sm px-4 py-1.5 backdrop-blur-sm">
                  <Shield className="h-3.5 w-3.5" />
                  {L('Pinagkakatiwalaan ng 500+ ahensya sa buong mundo', 'Trusted by 500+ agencies worldwide')}
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                {L(
                  <><span className="block">Ang Iyong</span><span className="block mt-1">Karera sa</span></>,
                  <><span className="block">Your Career</span><span className="block mt-1">Starts</span></>
                )}
                <span className="block mt-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 bg-clip-text text-transparent">
                  {L('Dito.', 'Here.')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} custom={2} className="text-blue-100/80 text-lg md:text-xl max-w-lg leading-relaxed">
                {L(
                  'Ang FIRA ay nagkonekta ng bihasang manggagawang Pilipino sa mga pinakamahusay na oportunidad sa buong mundo.',
                  'FIRA connects skilled Filipino workers with the best opportunities worldwide.'
                )}
              </motion.p>

              {/* Search Bar */}
              <motion.form variants={fadeUp} custom={3} onSubmit={handleSearch} className="max-w-lg">
                <div className="glass-card rounded-2xl p-1.5 flex items-center gap-2">
                  <Search className="h-5 w-5 text-white/50 ml-4 shrink-0" />
                  <Input
                    type="search"
                    placeholder={L('Maghanap ng trabaho...', 'Search jobs by title, country, or keyword...')}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-12 text-white placeholder:text-white/40 text-base"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                  />
                  <Button type="submit" className="rounded-md h-10 px-5 shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30">
                    {L('Hanapin', 'Search')}
                  </Button>
                </div>
              </motion.form>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="rounded-md bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-xl shadow-white/10" onClick={() => navigate('job-listing')}>
                  <Briefcase className="h-5 w-5" />
                  {L('Maghanap ng Trabaho', 'Browse Jobs')}
                </Button>
                <Button size="lg" variant="outline" className="rounded-md border-white/30 text-white hover:bg-white/10 bg-transparent" onClick={() => {
                  if (user) navigate('applicant-dashboard')
                  else setAuthModalOpen(true, 'register')
                }}>
                  {L('Magparehistro Na', 'Register Now')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* RIGHT: Bento Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="hidden lg:grid grid-cols-3 grid-rows-3 gap-3 h-[420px]"
            >
              {heroBentoCards.map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className={`${card.size === 'large' ? 'col-span-2' : 'col-span-1'} row-span-1 rounded-2xl bg-gradient-to-br ${card.accent} backdrop-blur-md border border-white/15 p-5 flex flex-col justify-between group hover:border-white/30 transition-all duration-500 cursor-pointer`}
                  onClick={() => navigate('about')}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 group-hover:bg-white/25 transition-colors`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium tracking-wide uppercase">{L('Tampok', 'Feature')}</p>
                    <p className="text-white font-semibold text-lg mt-0.5">{card.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-16 md:h-20" preserveAspectRatio="none">
            <path d="M0,60 C360,20 720,80 1080,40 C1260,20 1380,50 1440,40 L1440,80 L0,80 Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — Creative Horizontal Steps
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 mb-4">
                {L('Paano Gumagana', 'How It Works')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              {L(
                'Tatlong Hakbang Papunta sa iyong Pangarap',
                'Three Steps to Your Dream Career'
              )}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4 text-lg">
              {L(
                'Simple at direktang proseso — mula rehistrasyon hanggang sa pag-deploy.',
                'A simple and direct process — from registration to deployment.'
              )}
            </motion.p>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[18%] right-[18%] h-[2px] bg-gradient-to-r from-blue-300 via-amber-300 to-green-300 dark:from-blue-700 dark:via-amber-700 dark:to-green-700" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step Number Circle */}
                  <div className={`relative z-10 h-16 w-16 rounded-2xl ${step.accent} flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6 rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    {step.visual}
                  </div>
                  {/* Step Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 w-full hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 group">
                    <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <step.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED JOBS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <motion.div variants={fadeUp} custom={0}>
                <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 mb-4">
                  <Briefcase className="mr-1.5 h-3 w-3" />
                  {L('Pinakabagong Trabaho', 'Latest Openings')}
                </Badge>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {L('Mga Pinakabagong Oportunidad', 'Latest Opportunities')}
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-2">
                {L('Tingnan ang pinakabagong trabaho mula sa aming mga partner.', 'Explore the latest opportunities from our partners.')}
              </motion.p>
            </div>
            <motion.div variants={fadeUp} custom={3}>
              <Button variant="outline" onClick={() => navigate('job-listing')} className="rounded-xl border-border">
                {L('Tingnan Lahat', 'View All')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : publicJobs.length === 0 ? (
            <div className="glass-card-light rounded-2xl py-12 px-4 text-center max-w-md mx-auto">
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">{L('Wala pang trabaho ngayon.', 'No jobs available yet.')}</p>
              <p className="text-sm text-muted-foreground mt-1">{L('Bumalik ka na lang mamaya.', 'Check back soon!')}</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {publicJobs.map((job: any, i: number) => (
                <motion.div key={job.id} variants={fadeUp} custom={i}>
                  <Card
                    className="h-full hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer transition-all duration-500 border-border hover:border-blue-400 dark:hover:border-blue-600 group bg-card"
                    onClick={() => navigate('job-detail', { jobId: job.id })}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`text-xs ${categoryColors[job.category] || 'bg-muted text-muted-foreground'}`}>
                          {job.category?.replace('_', ' ') || 'General'}
                        </Badge>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.city ? `${job.city}, ` : ''}{job.country}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {job.salaryMin || job.salaryMax
                            ? `$${job.salaryMin ?? '?'} - $${job.salaryMax ?? '?'}`
                            : L('Kompetitibo', 'Competitive')}
                        </span>
                        {job.slots > 1 && (
                          <Badge variant="secondary" className="text-xs">{job.slots} {L('posisyon', 'slots')}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS / TRUST BAR
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-24 bg-fira-hero overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern" />
        <FloatingOrb className="-top-20 -left-20 w-[400px] h-[400px]" />
        <FloatingOrb className="-bottom-20 -right-20 w-[350px] h-[350px]" />

        <div className="relative container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {L('Mga Numero na Nagsasalita', 'Numbers That Speak')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-blue-200/70 mt-3 text-lg">
              {L('Pinagkakatiwalaan ng libo-libo sa buong mundo', 'Trusted by thousands worldwide')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
          >
            {[
              { target: 10000, suffix: '+', label: L('Na-deploy na OFW', 'Workers Deployed'), icon: Users },
              { target: 500, suffix: '+', label: L('Partner na Ahensya', 'Partner Agencies'), icon: Globe },
              { target: 30, suffix: '+', label: L('Mga Bansa', 'Countries'), icon: MapPin },
              { target: 98, suffix: '%', label: L('Rate ng Kasiyahan', 'Satisfaction Rate'), icon: TrendingUp },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-2xl p-6 text-center group hover:border-white/30 transition-all duration-500">
                  <s.icon className="h-5 w-5 text-amber-400 mx-auto mb-3" />
                  <div className="text-3xl md:text-5xl font-bold text-white mb-1">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-blue-200/80 text-sm">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Top Wave Divider */}
        <div className="absolute top-0 left-0 right-0 rotate-180">
          <svg viewBox="0 0 1440 60" className="w-full h-12 md:h-16" preserveAspectRatio="none">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOR EMPLOYERS — CTA Section
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950" />
            <div className="absolute inset-0 bg-dots-pattern" />
            <FloatingOrb className="-top-10 -right-10 w-[300px] h-[300px]" />
            <FloatingOrb className="-bottom-10 -left-10 w-[250px] h-[250px]" />

            <div className="relative p-8 md:p-14 lg:p-16">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-amber-300" />
                    </div>
                    <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30 text-xs">
                      {L('Para sa Empleyador', 'For Employers')}
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                    {L(
                      'Hanapin ang Pinakamahusay na Manggagawang Pilipino',
                      'Find the Best Filipino Workers'
                    )}
                  </h2>
                  <p className="text-blue-100/80 leading-relaxed mb-8">
                    {L(
                      'Ang FIRA ay nagkonekta sa mga empleyador sa buong mundo sa mga beripikadong at bihasang manggagawang Pilipino. Makipag-ugnayan sa amin upang mahanap ang perpektong kandidato.',
                      'FIRA connects employers worldwide with verified and skilled Filipino workers. Partner with us to find the perfect candidates for your business needs.'
                    )}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xl shadow-amber-500/30"
                      onClick={() => navigate('employer-partnership')}
                    >
                      <Handshake className="h-5 w-5" />
                      {L('Maging Partner', 'Partner with FIRA')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-md border-white/30 text-white hover:bg-white/10 bg-transparent"
                      onClick={() => navigate('contact')}
                    >
                      {L('Makipag-ugnay', 'Contact Us')}
                    </Button>
                  </div>
                </div>

                {/* Right: Benefits */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, label: L('Na-verify na Manggagawa', 'Verified Workers') },
                    { icon: Zap, label: L('Mabilis na Proseso', 'Fast Processing') },
                    { icon: Target, label: L('Tama ang Pagtutugma', 'Right Match') },
                    { icon: HeartHandshake, label: L('Buong Suporta', 'Full Support') },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      className="glass-card rounded-xl p-4 flex flex-col items-center text-center group hover:border-white/30 transition-all"
                    >
                      <item.icon className="h-5 w-5 text-amber-400 mb-2" />
                      <p className="text-white/90 text-sm font-medium">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 mb-4">
                <Star className="mr-1.5 h-3 w-3" />
                {L('Mga Testimonial', 'Testimonials')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {L('Mga Sinabi ng aming Deployed Workers', 'What Our Deployed Workers Say')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3">
              {L('Mga totoong kwento mula sa aming mga matagumpay na deployed workers', 'Real stories from our successfully deployed workers')}
            </motion.p>
          </motion.div>

          {testimonials.length > 0 ? (
            <TestimonialsCarousel testimonials={testimonials} />
          ) : (
            <div className="glass-card-light rounded-2xl p-10 max-w-2xl mx-auto text-center">
              <p className="text-muted-foreground">{L('Walang testimonial pa ngayon.', 'No testimonials yet. Check back soon!')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ ACCORDION
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 mb-4">
                {L('FAQ', 'FAQ')}
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {L('Mga Madalas Itanong', 'Frequently Asked Questions')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3">
              {L('Mga sagot sa mga karaniwang tanong tungkol sa aming serbisyo', 'Answers to common questions about our services')}
            </motion.p>
          </motion.div>

          {faqs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq: any, i: number) => (
                  <AccordionItem
                    key={faq.id}
                    value={`faq-${i}`}
                    className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-blue-300 dark:data-[state=open]:border-blue-700 data-[state=open]:shadow-lg data-[state=open]:shadow-blue-500/5 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline text-foreground py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-md border-border" onClick={() => navigate('faq')}>
                  {L('Tingnan Lahat ng FAQ', 'View All FAQs')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card-light rounded-2xl p-10 max-w-md mx-auto text-center">
              <p className="text-muted-foreground">{L('Walang FAQ pa ngayon.', 'No FAQs available yet.')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          NEWSLETTER
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {L('Huwag Palampasin ang Mga Bagong Trabaho', 'Never Miss a Job Opportunity')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {L(
                'Mag-subscribe sa aming newsletter para makatanggap ng mga bagong job openings at update.',
                'Subscribe to our newsletter for the latest job openings and updates.'
              )}
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-12 rounded-xl bg-card border-border"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <Button type="submit" className="h-10 rounded-md px-6 shrink-0 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25">
                {newsletterSubmitted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  L('Mag-subscribe', 'Subscribe')
                )}
              </Button>
            </form>
            {newsletterSubmitted && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-3">{L('Salamat sa pag-subscribe!', 'Thank you for subscribing!')}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25">
                  F
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">FIRA</span>
                  <span className="text-[10px] leading-tight text-muted-foreground tracking-wider uppercase">Recruitment</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {L(
                  'Nakabase sa Casablanca, Morocco. Kami ay nagrekrut, nag-deploy, at nagbibigay ng resulta para sa mga manggagawang Pilipino.',
                  'Based in Casablanca, Morocco. We recruit, deploy, monitor, and deliver results for Filipino workers seeking opportunities abroad.'
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{L('Mabilis na Link', 'Quick Links')}</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: L('Home', 'Home'), view: 'landing' },
                  { label: L('Tungkol', 'About'), view: 'about' },
                  { label: L('Serbisyo', 'Services'), view: 'services' },
                  { label: L('Trabaho', 'Jobs'), view: 'job-listing' },
                  { label: L('Para sa Empleyador', 'For Employers'), view: 'employer-partnership' },
                  { label: L('FAQ', 'FAQ'), view: 'faq' },
                  { label: L('Makipag-ugnay', 'Contact'), view: 'contact' },
                ].map((link) => (
                  <li key={link.view}>
                    <button onClick={() => navigate(link.view as any)} className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{L('Makipag-ugnay', 'Contact Us')}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                  <span>59 Boulevard Zerktouni, Casablanca, Morocco</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>+212 662 26 14 99</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>+212 662 26 08 05</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>manpower@filinternational.ma</span>
                </li>
              </ul>
            </div>

            {/* Social & Language */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{L('Sundan kami', 'Follow Us')}</h4>
              <div className="flex gap-2 mb-6">
                {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                  <button key={i} className="h-10 w-10 rounded-xl bg-muted/80 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <h4 className="font-semibold mb-2 text-foreground">{L('Wika', 'Language')}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => useAppStore.getState().setLanguage('fil')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${language === 'fil' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  🇵🇭 Filipino
                </button>
                <button
                  onClick={() => useAppStore.getState().setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Fil International Recruitment Agency (FIRA). All rights reserved.</p>
            <p>59 Boulevard Zerktouni, Casablanca, Morocco</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
