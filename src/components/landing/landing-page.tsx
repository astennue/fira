'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import {
  Search, Briefcase, Globe, CheckCircle, Users, MapPin,
  ArrowRight, Shield, HeartHandshake, Plane, Mail, Phone,
  Star, ChevronRight, FileText, ClipboardCheck, Stethoscope,
  GraduationCap, UsersRound, Headphones, Menu, X, Facebook,
  Instagram, Linkedin, Twitter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { useAppStore, useT } from '@/store/app-store'
import { formatDistanceToNow } from 'date-fns'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const categoryColors: Record<string, string> = {
  domestic_helper: 'bg-pink-100 text-pink-800',
  caregiver: 'bg-purple-100 text-purple-800',
  nurse: 'bg-teal-100 text-teal-800',
  factory: 'bg-orange-100 text-orange-800',
  hospitality: 'bg-amber-100 text-amber-800',
}

const taglineParts = ['WE RECRUIT.', 'WE DEPLOY.', 'WE MONITOR.', 'WE DELIVER RESULTS']

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

function TestimonialsCarousel({ testimonials }: { testimonials: any[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length)
        setIsTransitioning(false)
      }, 400)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  if (testimonials.length === 0) return null
  const t = testimonials[current]

  return (
    <div className="relative min-h-[220px]">
      <motion.div
        key={t.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isTransitioning ? 0 : 1, x: isTransitioning ? -20 : 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto text-center"
      >
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: t.rating || 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-white/90 text-base md:text-lg italic leading-relaxed mb-6">
          &ldquo;{t.feedback}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          {t.avatar ? (
            <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover border-2 border-white/30" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {t.name?.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="text-white font-semibold text-sm">{t.name}</p>
            {t.position && <p className="text-white/60 text-xs">{t.position}{t.company ? ` at ${t.company}` : ''}</p>}
          </div>
        </div>
      </motion.div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setIsTransitioning(false) }}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function LandingPage() {
  const { navigate, setSearchQuery, setAuthModalOpen, user, language, fontSize } = useAppStore()
  const t = useT()
  const [heroSearch, setHeroSearch] = useState('')
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglineParts.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?public=true')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: testimonialsData } = useQuery({
    queryKey: ['public-testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/cms/testimonials?public=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: faqsData } = useQuery({
    queryKey: ['public-faqs'],
    queryFn: async () => {
      const res = await fetch('/api/cms/faqs?public=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const publicJobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs.slice(0, 6) : []
  const testimonials = Array.isArray(testimonialsData) ? testimonialsData.filter((t: any) => t.isActive) : []
  const faqs = Array.isArray(faqsData) ? faqsData.filter((f: any) => f.isActive).slice(0, 6) : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(heroSearch)
    navigate('job-listing', { search: heroSearch })
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterSubmitted(true)
    setTimeout(() => setNewsletterSubmitted(false), 3000)
  }

  const services = [
    { icon: Briefcase, title: language === 'fil' ? 'Rekrutamento' : 'Recruitment', desc: language === 'fil' ? 'Comprehensive overseas recruitment services connecting Filipino workers with international employers.' : 'Comprehensive overseas recruitment services connecting Filipino workers with international employers.' },
    { icon: FileText, title: language === 'fil' ? 'Pagsasalaysay ng Dokumento' : 'Document Processing', desc: language === 'fil' ? 'End-to-end document preparation, verification, and processing for all deployment requirements.' : 'End-to-end document preparation, verification, and processing for all deployment requirements.' },
    { icon: ClipboardCheck, title: language === 'fil' ? 'Pagsusuri ng Kakayahan' : 'Skills Assessment', desc: language === 'fil' ? 'Thorough evaluation of candidate skills, experience, and qualifications to ensure job fit.' : 'Thorough evaluation of candidate skills, experience, and qualifications to ensure job fit.' },
    { icon: Stethoscope, title: language === 'fil' ? 'Pagsusuri Medikal' : 'Medical Clearance', desc: language === 'fil' ? 'Coordination with accredited medical facilities for complete health screening.' : 'Coordination with accredited medical facilities for complete health screening.' },
    { icon: GraduationCap, title: language === 'fil' ? 'Oryentasyon bago Pumalad' : 'Pre-Departure Orientation', desc: language === 'fil' ? 'Comprehensive PDOS covering culture, rights, employer expectations, and safety.' : 'Comprehensive PDOS covering culture, rights, employer expectations, and safety.' },
    { icon: Headphones, title: language === 'fil' ? 'Suporta pagkatapos Pumalad' : 'Post-Deployment Support', desc: language === 'fil' ? 'Continuous monitoring and support for deployed workers throughout their employment.' : 'Continuous monitoring and support for deployed workers throughout their employment.' },
  ]

  return (
    <div className="view-transition min-h-screen flex flex-col" data-font-size={fontSize}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-fira-hero text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        {/* Mobile Nav */}
        <div className="absolute top-4 left-4 right-4 z-20 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/20 font-bold text-sm">F</div>
              <span className="font-bold text-lg">FIRA</span>
            </div>
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="glass p-2 rounded-lg">
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {mobileNavOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 glass-card rounded-xl p-4 flex flex-col gap-2"
            >
              {['Home', 'About', 'Services', 'Jobs', 'FAQ', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === 'Home') navigate('landing')
                    else if (item === 'Jobs') navigate('job-listing')
                    else navigate(item.toLowerCase() as any)
                    setMobileNavOpen(false)
                  }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  {item}
                </button>
              ))}
            </motion.nav>
          )}
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-6 text-sm px-4 py-1.5 backdrop-blur-sm">
              <Shield className="mr-2 h-3.5 w-3.5" />
              {language === 'fil' ? 'Pinagkakatiwalaan ng 500+ ahensya sa buong mundo' : 'Trusted by 500+ agencies worldwide'}
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              {language === 'fil' ? (
                <>
                  Fil International<br />
                  <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
                    Recruitment Agency
                  </span>
                </>
              ) : (
                <>
                  Fil International<br />
                  <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
                    Recruitment Agency
                  </span>
                </>
              )}
            </h1>

            {/* Animated Tagline */}
            <div className="h-10 mb-8 flex items-center justify-center overflow-hidden">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-blue-200 text-sm md:text-base font-medium tracking-widest uppercase"
              >
                {taglineParts[taglineIndex]}
              </motion.p>
            </div>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
              <div className="glass-card rounded-2xl p-2 flex items-center">
                <Search className="h-5 w-5 text-white/60 ml-4 shrink-0" />
                <Input
                  type="search"
                  placeholder={language === 'fil' ? 'Maghanap ng trabaho...' : 'Search jobs by title, country, or keyword...'}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-12 text-white placeholder:text-white/50 text-base"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
                <Button type="submit" className="rounded-xl h-10 px-6 shrink-0 bg-white text-blue-900 hover:bg-blue-50 font-semibold">
                  {language === 'fil' ? 'Hanapin' : 'Search'}
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 rounded-xl px-6" onClick={() => navigate('job-listing')}>
                <Briefcase className="mr-2 h-5 w-5" />
                {language === 'fil' ? 'Maghanap ng Trabaho' : 'Browse Jobs'}
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl px-6" onClick={() => {
                if (user) navigate('applicant-dashboard')
                else setAuthModalOpen(true)
              }}>
                {language === 'fil' ? 'Magparehistro Ngayon' : 'Register Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="bg-blue-100 text-blue-800 mb-4">About FIRA</Badge>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                {language === 'fil'
                  ? 'Ang Pinakamalaking Recruitment Agency ng Pilipino sa Morocco'
                  : 'The Premier Filipino Recruitment Agency in Morocco'}
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-gray-600 leading-relaxed mb-6">
                {language === 'fil'
                  ? 'Ang Fil International Recruitment Agency (FIRA), nakabase sa Casablanca, Morocco, ay isang full-service recruitment agency na nakatuon sa pagkonekta ng bihasang Pilipinong manggagawa sa mga respetadong empleyador sa buong mundo. Sa mahigit 10 taon ng karanasan, aming misyon ay magbigay ng ligtas, legal, at propesyonal na serbisyo ng rekrutamento.'
                  : 'Fil International Recruitment Agency (FIRA), based in Casablanca, Morocco, is a full-service recruitment agency dedicated to connecting skilled Filipino workers with reputable employers worldwide. With over 10 years of experience, we are committed to providing safe, legal, and professional recruitment services.'}
              </motion.p>
              <motion.div variants={fadeUp} custom={3}>
                <Button className="rounded-xl" onClick={() => navigate('about')}>
                  {language === 'fil' ? 'Alamin ang Higit Pa' : 'Learn More About Us'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-fira-gradient rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-dots-pattern" />
                <div className="relative">
                  <h3 className="text-xl font-bold mb-6">Our Mission</h3>
                  <p className="text-blue-100 leading-relaxed mb-4">
                    To be the bridge between Filipino talent and global opportunity, ensuring every deployment is ethical, transparent, and mutually beneficial.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold">10+</p>
                      <p className="text-blue-200 text-sm">{language === 'fil' ? 'Taon ng Serbisyo' : 'Years of Service'}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold">Morocco</p>
                      <p className="text-blue-200 text-sm">{language === 'fil' ? 'Punong Tanggapan' : 'Headquarters'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-20 bg-fira-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 mb-3">Our Services</Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              {language === 'fil' ? 'Mga Serbisyo Namin' : 'What We Offer'}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {language === 'fil'
                ? 'End-to-end na serbisyo ng rekrutamento mula aplikasyon hanggang post-deployment support.'
                : 'End-to-end recruitment services from application to post-deployment support.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, i) => (
              <motion.div key={service.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="h-full hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 border-blue-100 group cursor-pointer" onClick={() => navigate('services')}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" className="rounded-xl" onClick={() => navigate('services')}>
              {language === 'fil' ? 'Tingnan Lahat ng Serbisyo' : 'View All Services'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-800 mb-3">How It Works</Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              {language === 'fil' ? 'Paano Gumagana' : 'Simple 3-Step Process'}
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              {language === 'fil'
                ? 'Tatlong simpleng hakbang upang simulan ang iyong karera sa labas ng bansa'
                : 'Three simple steps to start your international career journey'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: language === 'fil' ? 'Magparehistro' : 'Register', desc: language === 'fil' ? 'Gumawa ng account at kumpletuhin ang iyong profile kasama ang iyong kasanayan at karanasan.' : 'Create your account and complete your profile with your skills and experience.', icon: Users, color: 'from-blue-600 to-blue-800' },
              { step: '2', title: language === 'fil' ? 'Mag-apply' : 'Apply for Jobs', desc: language === 'fil' ? 'Mag-browse ng verified na job openings at mag-apply sa mga trabaho na nakapares sa iyong kasanayan.' : 'Browse verified job openings and apply to positions matching your skills.', icon: Briefcase, color: 'from-blue-700 to-blue-900' },
              { step: '3', title: language === 'fil' ? 'Maging Hired' : 'Get Hired & Deployed', desc: language === 'fil' ? 'Ma-match ka sa emplyador, kumpletuhin ang proseso, at maging deployed sa ibang bansa.' : 'Get matched with employers, complete the process, and get deployed abroad.', icon: CheckCircle, color: 'from-blue-800 to-blue-950' },
            ].map((item, i) => (
              <motion.div key={item.step} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <div className="relative">
                  <div className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white text-center relative overflow-hidden h-full`}>
                    <div className="absolute inset-0 bg-dots-pattern" />
                    <div className="relative">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <item.icon className="h-7 w-7" />
                      </div>
                      <div className="text-xs font-bold tracking-widest text-blue-200 mb-2">
                        STEP {item.step}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-sm text-blue-100 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="h-8 w-8 text-blue-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-fira-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {language === 'fil' ? 'Pinagkakatiwalaan ng Libo-libo' : 'Trusted by Thousands'}
            </h2>
            <p className="text-blue-200">
              {language === 'fil' ? 'Mga numero na nagsasalita para sa sarili nila' : 'Numbers that speak for themselves'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { target: 10000, suffix: '+', label: language === 'fil' ? 'Na-deploy na OFW' : 'Workers Deployed' },
              { target: 500, suffix: '+', label: language === 'fil' ? 'Partner na Ahensya' : 'Partner Agencies' },
              { target: 30, suffix: '+', label: language === 'fil' ? 'Mga Bansa' : 'Countries' },
              { target: 98, suffix: '%', label: language === 'fil' ? 'Rate ng Kasiyahan' : 'Satisfaction Rate' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="glass rounded-2xl p-6">
                  <div className="text-3xl md:text-5xl font-bold mb-1">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-blue-200 text-sm">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 md:py-20 bg-fira-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-3">Featured Jobs</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {language === 'fil' ? 'Mga Pinakabagong Trabaho' : 'Latest Job Openings'}
              </h2>
              <p className="text-gray-600 mt-1">
                {language === 'fil' ? 'Tingnan ang pinakabagong oportunidad mula sa aming mga partner'
                  : 'Explore the latest opportunities from our partners'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('job-listing')} className="hidden sm:flex rounded-xl">
              {language === 'fil' ? 'Tingnan Lahat' : 'View All'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
            </div>
          ) : publicJobs.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{language === 'fil' ? 'Wala pang trabaho ngayon.' : 'No jobs available yet. Check back soon!'}</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicJobs.map((job: any, i: number) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="hover:shadow-xl hover:shadow-blue-100/50 cursor-pointer transition-all duration-300 h-full border-blue-100" onClick={() => navigate('job-detail', { jobId: job.id })}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`text-xs ${categoryColors[job.category] || 'bg-gray-100 text-gray-800'}`}>
                          {job.category?.replace('_', ' ') || 'General'}
                        </Badge>
                        {job.slots > 1 && <span className="text-xs text-gray-500">{job.slots} slots</span>}
                      </div>
                      <h3 className="font-semibold mb-2 text-gray-900 line-clamp-2">{job.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.city ? `${job.city}, ` : ''}{job.country}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm font-bold text-blue-700">
                          {job.salaryMin || job.salaryMax
                            ? `$${job.salaryMin ?? '?'} - $${job.salaryMax ?? '?'}`
                            : 'Competitive'}
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('job-listing')} className="rounded-xl">
              {language === 'fil' ? 'Tingnan Lahat ng Trabaho' : 'View All Jobs'}
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-fira-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-white/15 text-white/90 border-white/20 mb-3">Testimonials</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {language === 'fil' ? 'Mga Sinabi ng aming Mga Deployed Workers' : 'What Our Workers Say'}
            </h2>
            <p className="text-blue-200">
              {language === 'fil' ? 'Mga totoong kwento mula sa aming mga matagumpay na deployed workers'
                : 'Real stories from our successfully deployed workers'}
            </p>
          </div>
          {testimonials.length > 0 ? (
            <TestimonialsCarousel testimonials={testimonials} />
          ) : (
            <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <p className="text-white/70">{language === 'fil' ? 'Walang testimonial pa ngayon.' : 'No testimonials yet. Check back soon!'}</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-blue-100 text-blue-800 mb-3">FAQ</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {language === 'fil' ? 'Mga Madalas Itanong' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-600">
              {language === 'fil' ? 'Mga sagot sa mga karaniwang tanong tungkol sa aming serbisyo'
                : 'Answers to common questions about our services'}
            </p>
          </div>
          {faqs.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq: any, i: number) => (
                  <AccordionItem key={faq.id} value={`faq-${i}`} className="bg-fira-gradient-card rounded-xl px-6 border border-blue-100 data-[state=open]:bg-blue-50 transition-colors">
                    <AccordionTrigger className="text-left text-gray-900 font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="text-center mt-6">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate('faq')}>
                  {language === 'fil' ? 'Tingnan Lahat ng FAQ' : 'View All FAQs'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center max-w-md mx-auto rounded-2xl">
              <p className="text-gray-500">{language === 'fil' ? 'Walang FAQ pa ngayon.' : 'No FAQs available yet.'}</p>
            </Card>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-fira-gradient-soft">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Badge className="bg-blue-100 text-blue-800 mb-3">Newsletter</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {language === 'fil' ? 'Huwag palampasin ang Mga Bagong Trabaho' : 'Never Miss a Job Opportunity'}
            </h2>
            <p className="text-gray-600 mb-8">
              {language === 'fil'
                ? 'Mag-subscribe sa aming newsletter para makatanggap ng mga bagong job openings at update.'
                : 'Subscribe to our newsletter for the latest job openings and updates.'}
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-12 rounded-xl"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <Button type="submit" className="h-12 rounded-xl px-6 shrink-0">
                {newsletterSubmitted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  language === 'fil' ? 'Mag-subscribe' : 'Subscribe'
                )}
              </Button>
            </form>
            {newsletterSubmitted && (
              <p className="text-sm text-green-600 mt-2">{language === 'fil' ? 'Salamat sa pag-subscribe!' : 'Thank you for subscribing!'}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm">F</div>
                <div>
                  <span className="text-lg font-bold">FIRA</span>
                  <p className="text-xs text-gray-400">Fil International Recruitment Agency</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {language === 'fil'
                  ? 'Nakabase sa Casablanca, Morocco. Nagnanakaw kami, nag-deploy, nag-monitor, at nagbibigay ng resulta para sa mga manggagawang Pilipino.'
                  : 'Based in Casablanca, Morocco. We recruit, deploy, monitor, and deliver results for Filipino workers seeking opportunities abroad.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">
                {language === 'fil' ? 'Mabilis na Link' : 'Quick Links'}
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {[
                  { label: 'Home', view: 'landing' },
                  { label: 'About', view: 'about' },
                  { label: 'Services', view: 'services' },
                  { label: 'Jobs', view: 'job-listing' },
                  { label: 'FAQ', view: 'faq' },
                  { label: 'Contact', view: 'contact' },
                ].map((link) => (
                  <li key={link.view}>
                    <button onClick={() => navigate(link.view as any)} className="hover:text-blue-400 transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">
                {language === 'fil' ? 'Makipag-ugnay' : 'Contact Us'}
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                  <span>59 Boulevard Zerktouni, Casablanca, Morocco</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>+212 662 26 14 99</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>+212 662 26 08 05</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>manpower@filinternational.ma</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">
                {language === 'fil' ? 'Sundan kami' : 'Follow Us'}
              </h4>
              <div className="flex gap-3 mb-6">
                {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                  <button key={i} className="h-10 w-10 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <h4 className="font-semibold mb-2 text-white">
                {language === 'fil' ? 'Wika' : 'Language'}
              </h4>
              <div className="flex gap-2">
                <Button variant={language === 'fil' ? 'default' : 'outline'} size="sm" className="rounded-lg" onClick={() => useAppStore.getState().setLanguage('fil')}>
                  🇵🇭 Filipino
                </Button>
                <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" className="rounded-lg" onClick={() => useAppStore.getState().setLanguage('en')}>
                  🇬🇧 English
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Fil International Recruitment Agency (FIRA). All rights reserved. | 59 Boulevard Zerktouni, Casablanca, Morocco
          </div>
        </div>
      </footer>
    </div>
  )
}
