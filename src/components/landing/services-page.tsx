'use client'

import { motion } from 'framer-motion'
import {
  Briefcase, FileText, ClipboardCheck, Stethoscope, GraduationCap,
  Headphones, ArrowRight, Shield, Users, Globe,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export function ServicesPage() {
  const { navigate, language } = useAppStore()

  const services = [
    {
      icon: Briefcase,
      title: language === 'fil' ? 'Rekrutamento at Placement' : 'Recruitment & Placement',
      desc: language === 'fil'
        ? 'Aming pangunahing serbisyo — kumonekta ng bihasang Pilipinong manggagawa sa mga legitimong empleyador sa Morocco at iba pang bansa. Sinusuri namin ang bawat job order para siguradong safe at legal.'
        : 'Our core service — connecting skilled Filipino workers with legitimate employers in Morocco and other countries. We verify every job order to ensure safety and legality.',
      details: [
        'Household Workers (Domestic Helpers, Nannies, Caregivers)',
        'Healthcare Professionals (Nurses, Caregivers)',
        'Factory Workers (Manufacturing, Assembly)',
        'Hospitality Staff (Hotels, Restaurants, Tourism)',
        'Skilled Professionals (IT, Engineering, Office Staff)',
      ],
    },
    {
      icon: FileText,
      title: language === 'fil' ? 'Pagsasalaysay ng Dokumento' : 'Document Processing',
      desc: language === 'fil'
        ? 'End-to-end na pagproseso ng lahat ng kinakailangang dokumento para sa deployment — passport verification, visa processing, work permits, at iba pa.'
        : 'End-to-end processing of all documents required for deployment — passport verification, visa processing, work permits, and more.',
      details: [
        'Passport verification and renewal assistance',
        'Visa application and processing',
        'Work permit acquisition',
        'POEA/DMW clearance and documentation',
        'Employment contract review and legalization',
      ],
    },
    {
      icon: ClipboardCheck,
      title: language === 'fil' ? 'Pagsusuri ng Kakayahan' : 'Skills Assessment',
      desc: language === 'fil'
        ? 'Thorough evaluation ng mga kandidato — kasanayan, karanasan, kwalipikasyon — para siguradong angkop sa posisyong inaaplayan.'
        : 'Thorough evaluation of candidates — skills, experience, qualifications — to ensure the right fit for the position applied.',
      details: [
        'Skills testing and evaluation',
        'Experience verification',
        'Language proficiency assessment',
        'Background checks and reference verification',
        'Psychological testing (when required)',
      ],
    },
    {
      icon: Stethoscope,
      title: language === 'fil' ? 'Pagsusuri Medikal' : 'Medical Clearance',
      desc: language === 'fil'
        ? 'Coordination sa mga accredited medical facilities para sa kumpletong health screening bago ang deployment.'
        : 'Coordination with accredited medical facilities for complete health screening before deployment.',
      details: [
        'Accredited medical clinic referrals',
        'Complete health examination',
        'Vaccination requirements',
        'Medical certificate processing',
        'Follow-up medical support',
      ],
    },
    {
      icon: GraduationCap,
      title: language === 'fil' ? 'Pre-Departure Orientation Seminar (PDOS)' : 'Pre-Departure Orientation Seminar (PDOS)',
      desc: language === 'fil'
        ? 'Kumprehensibong PDOS na sumasaklaw sa kultura, karapatan,_expectations ng empleyador, at mga pagsunod sa seguridad.'
        : 'Comprehensive PDOS covering culture, rights, employer expectations, and safety protocols.',
      details: [
        'Country-specific cultural orientation',
        'Workers\' rights and obligations awareness',
        'Employer expectations and work standards',
        'Financial literacy and remittance guidance',
        'Emergency protocols and support contacts',
      ],
    },
    {
      icon: Headphones,
      title: language === 'fil' ? 'Post-Deployment Support' : 'Post-Deployment Support',
      desc: language === 'fil'
        ? 'Continuous monitoring at support para sa mga deployed workers — regular check-ins, grievance handling, at welfare monitoring.'
        : 'Continuous monitoring and support for deployed workers — regular check-ins, grievance handling, and welfare monitoring.',
      details: [
        'Regular welfare check-ins',
        'Grievance and complaint handling',
        'Contract renewal assistance',
        'Repatriation support when needed',
        'Family communication support',
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">Our Services</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil' ? 'Mga Serbisyo Namin' : 'Our Services'}
            </h1>
            <p className="text-blue-200 max-w-2xl mx-auto">
              {language === 'fil'
                ? 'End-to-end na recruitment services mula aplikasyon hanggang post-deployment support.'
                : 'End-to-end recruitment services from application to post-deployment support.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="overflow-hidden border-border dark:border-blue-900/30 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gradient-to-br from-blue-700 to-blue-900 p-6 flex items-center justify-center text-white">
                      <div className="text-center">
                        <service.icon className="h-12 w-12 mx-auto mb-3" />
                        <h3 className="text-lg font-bold">{service.title}</h3>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <CardContent className="p-6">
                        <p className="text-muted-foreground leading-relaxed mb-4">{service.desc}</p>
                        <ul className="space-y-2">
                          {service.details.map((detail, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-fira-gradient-soft">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {language === 'fil' ? 'Handa ka na bang Magsimula?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            {language === 'fil'
              ? 'Mag-browse ng aming mga available na trabaho o magparehistro para magsimula ang iyong application.'
              : 'Browse our available jobs or register to start your application.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-xl" onClick={() => navigate('job-listing')}>
              <Briefcase className="mr-2 h-5 w-5" />
              {language === 'fil' ? 'Mag-browse ng Trabaho' : 'Browse Jobs'}
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl" onClick={() => navigate('contact')}>
              {language === 'fil' ? 'Makipag-ugnay sa Amin' : 'Contact Us'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
