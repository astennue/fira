'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Handshake, MessageSquare, Users, ArrowRight,
  Shield, BadgeCheck, Headphones, Send, CheckCircle,
  Building2, Phone, Mail, Globe
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

const WORKERS_OPTIONS = [
  '1-5',
  '6-10',
  '11-20',
  '21-50',
  '51-100',
  '100+'
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export function EmployerPartnershipPage() {
  const { language, fontSize } = useAppStore()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    message: '',
    workersNeeded: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/cms/partner-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success(language === 'fil'
          ? 'Naipadala na ang iyong inquiry!'
          : 'Your inquiry has been submitted!')
        setFormData({ name: '', company: '', country: '', email: '', phone: '', message: '', workersNeeded: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        toast.error(language === 'fil' ? 'Nagkaproblema sa pagpapadala.' : 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error(language === 'fil' ? 'Nagkaproblema sa koneksyon.' : 'Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    {
      icon: MessageSquare,
      title: language === 'fil' ? 'Makipag-ugnay sa Amin' : 'Contact Us',
      desc: language === 'fil'
        ? 'I-fill out ang form sa ibaba o direktang makipag-ugnay sa amin. Ipaliwanag ang iyong mga pangangailangan sa workforce.'
        : 'Fill out the form below or reach out to us directly. Tell us about your workforce needs and requirements.',
    },
    {
      icon: Users,
      title: language === 'fil' ? 'Naghahanap kami ng mga Manggagawa' : 'We Source Workers',
      desc: language === 'fil'
        ? 'Ang aming koponan sa recruitment ay maghahanap at susuriin ng mga qualified na Pilipinong manggagawa na akma sa iyong mga kinakailangan.'
        : 'Our recruitment team will source, screen, and match qualified Filipino workers that fit your requirements and standards.',
    },
    {
      icon: Handshake,
      title: language === 'fil' ? 'I-deploy sa Iyo' : 'Deploy to You',
      desc: language === 'fil'
        ? 'Matapos ang proseso ng dokumento at medikal, idedeploy namin ang mga manggagawa sa inyo kasama ang buong suporta at oryentasyon.'
        : 'After document processing and medical clearance, we deploy the workers to you with full support and orientation.',
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: language === 'fil' ? 'Lisensyadong Ahensya' : 'Licensed Agency',
      desc: language === 'fil'
        ? 'Buong-ayos na lisensyado at naka-register sa POEA/DMW at may mga kinakailangang permit sa Morocco.'
        : 'Fully licensed and registered with POEA/DMW and all required permits in Morocco.',
    },
    {
      icon: BadgeCheck,
      title: language === 'fil' ? 'Na-verify na mga Manggagawa' : 'Verified Workers',
      desc: language === 'fil'
        ? 'Bawat manggagawa ay sinusuri sa pamamagitan ng background checks, skills assessment, at medikal na clearance.'
        : 'Every worker goes through thorough background checks, skills assessment, and medical clearance.',
    },
    {
      icon: Headphones,
      title: language === 'fil' ? 'Buong Suporta' : 'Full Support',
      desc: language === 'fil'
        ? 'Mula sa recruitment hanggang post-deployment, kasama ka namin sa bawat hakbang. Ang aming koponan ay laging handang tulungan.'
        : 'From recruitment to post-deployment, we support you every step of the way. Our team is always here to help.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" data-font-size={fontSize}>
      {/* Hero */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">For Employers</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil'
                ? 'Maging Partner ng FIRA — Hanapin ang Pinakamahuhusay na Pilipinong Manggagawa'
                : 'Partner with FIRA — Find the Best Filipino Workers'}
            </h1>
            <p className="text-blue-200 max-w-2xl mx-auto">
              {language === 'fil'
                ? 'Kumonekta kami sa mga mapagkakatiwalaang empleyador sa buong mundo sa mga bihasang at verified na Pilipinong manggagawa.'
                : 'We connect trusted employers worldwide with skilled, verified Filipino workers ready for deployment.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-3">Process</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {language === 'fil' ? 'Paano ito Gumagana' : 'How It Works'}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              {language === 'fil'
                ? 'Tatlong simpleng hakbang upang makuha ang iyong kinakailangan sa workforce.'
                : 'Three simple steps to get the workforce you need.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="relative"
              >
                <Card className="h-full text-center border-blue-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 md:p-8 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
                        <step.icon className="h-7 w-7" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    {i < steps.length - 1 && (
                      <ArrowRight className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-300 z-10" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-fira-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-3">Why FIRA</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {language === 'fil' ? 'Benepisyo ng Pagsasama' : 'Benefits of Partnering'}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              {language === 'fil'
                ? 'Bakit pipiliin ang FIRA bilang iyong recruitment partner.'
                : 'Why choose FIRA as your recruitment partner.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="h-full border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 md:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-20 bg-white flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-3">Inquiry</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {language === 'fil' ? 'Magpadala ng Partnership Inquiry' : 'Send a Partnership Inquiry'}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                {language === 'fil'
                  ? 'I-fill out ang form sa ibaba at makikipag-ugnay kami sa iyo sa loob ng 24 oras.'
                  : 'Fill out the form below and we will get back to you within 24 hours.'}
              </p>
            </div>

            <Card className="border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 md:p-8">
                <div className="flex items-center gap-3 text-white">
                  <Building2 className="h-8 w-8" />
                  <div>
                    <h3 className="font-bold text-lg">FIRA Employer Partnership</h3>
                    <p className="text-blue-200 text-sm">Fil International Recruitment Agency</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {language === 'fil' ? 'Matagumpay na Naipadala!' : 'Successfully Submitted!'}
                    </h3>
                    <p className="text-gray-500">
                      {language === 'fil'
                        ? 'Salamat sa iyong interes. Makikipag-ugnay kami sa iyo sa lalong madaling panahon.'
                        : 'Thank you for your interest. We will reach out to you shortly.'}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'fil' ? 'Pangalan' : 'Full Name'} *</Label>
                        <Input
                          placeholder={language === 'fil' ? 'Iyong pangalan' : 'Your full name'}
                          className="h-11"
                          required
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'fil' ? 'Kumpanya' : 'Company Name'} *</Label>
                        <Input
                          placeholder={language === 'fil' ? 'Pangalan ng kumpanya' : 'Your company name'}
                          className="h-11"
                          required
                          value={formData.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'fil' ? 'Bansa' : 'Country'} *</Label>
                        <Input
                          placeholder={language === 'fil' ? 'Bansa mo' : 'Your country'}
                          className="h-11"
                          required
                          value={formData.country}
                          onChange={(e) => handleChange('country', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="your@company.com"
                          className="h-11"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'fil' ? 'Telepono' : 'Phone'}</Label>
                        <Input
                          placeholder="+1 234 567 8900"
                          className="h-11"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'fil' ? 'Bilang ng Kailangan na Manggagawa' : 'Number of Workers Needed'} *</Label>
                        <Select
                          value={formData.workersNeeded}
                          onValueChange={(value) => handleChange('workersNeeded', value)}
                          required
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={language === 'fil' ? 'Pumili ng bilang...' : 'Select number...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKERS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt} {language === 'fil' ? 'manggagawa' : 'workers'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'fil' ? 'Mensahe' : 'Message'} *</Label>
                      <Textarea
                        placeholder={language === 'fil'
                          ? 'I-describe ang iyong mga kinakailangan sa workforce...'
                          : 'Describe your workforce requirements...'}
                        className="min-h-[120px]"
                        required
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          {language === 'fil' ? 'Nagsusumite...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {language === 'fil' ? 'Ipadala ang Inquiry' : 'Submit Inquiry'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Phone, label: 'Call Us', value: '+212 662 26 14 99' },
                { icon: Mail, label: 'Email', value: 'manpower@filinternational.ma' },
                { icon: Globe, label: 'Location', value: 'Casablanca, Morocco' },
              ].map((item) => (
                <Card key={item.label} className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm text-gray-900 font-semibold truncate">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
