'use client'

import { motion } from 'framer-motion'
import { Target, Eye, Heart, Shield, Globe, Award, Users, MapPin, Phone, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

export function AboutPage() {
  const { navigate, language } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">{language === 'fil' ? 'Tungkol sa FIRA' : 'About FIRA'}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil' ? 'Tungkol sa FIRA' : 'About FIRA'}
            </h1>
            <p className="text-blue-200 max-w-2xl mx-auto">
              {language === 'fil'
                ? 'Kilalanin ang aming misyon, bisyon, at mga halaga na nagtutulak sa aming gawain sa rekrutamento.'
                : 'Learn about our mission, vision, and values that drive our recruitment work.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {language === 'fil' ? 'Ang Fil International Recruitment Agency' : 'Fil International Recruitment Agency'}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground leading-relaxed mb-6">
              {language === 'fil'
                ? 'Ang Fil International Recruitment Agency (FIRA), na nakabase sa 59 Boulevard Zerktouni, Casablanca, Morocco, ay isang full-service recruitment agency na nakatuon sa pagkonekta ng bihasang Pilipinong manggagawa sa mga respetadong empleyador sa buong mundo. Itinatag namin ang FIRA na may isang malinaw na misyon: magbigay ng ligtas, legal, at transparent na recruitment services para sa bawat Filipino worker na nagnanais na magkaroon ng mas magandang buhay sa labas ng bansa.'
                : 'Fil International Recruitment Agency (FIRA), located at 59 Boulevard Zerktouni, Casablanca, Morocco, is a full-service recruitment agency dedicated to connecting skilled Filipino workers with reputable employers worldwide. We founded FIRA with a clear mission: to provide safe, legal, and transparent recruitment services for every Filipino worker seeking a better life abroad.'}
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground leading-relaxed">
              {language === 'fil'
                ? 'Sa pamamagitan ng aming komprehensibong network ng partner agencies sa Pilipinas at mga employers sa Morocco at iba pang bansa, aming sinisiguro na bawat deployment ay etikal, propesyonal, at nakabubuti sa parehong manggagawa at empleyador.'
                : 'Through our comprehensive network of partner agencies in the Philippines and employers in Morocco and other countries, we ensure that every deployment is ethical, professional, and mutually beneficial for both the worker and the employer.'}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-fira-gradient-soft">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Target, title: language === 'fil' ? 'Misyun' : 'Mission', desc: language === 'fil' ? 'Maging tulay ng pagitan ng Pilipinong talento at pandaigdigang oportunidad, sinisiguro na ang bawat deployment ay etikal, transparent, at nakabubuti.' : 'To be the bridge between Filipino talent and global opportunity, ensuring every deployment is ethical, transparent, and mutually beneficial.', color: 'from-blue-600 to-blue-800' },
              { icon: Eye, title: language === 'fil' ? 'Bisyun' : 'Vision', desc: language === 'fil' ? 'Maging ang pinaka-mapagkakatiwalaang recruitment agency sa Morocco at sa buong Africa, na kilala sa ating kahusayan at integridad.' : 'To be the most trusted recruitment agency in Morocco and across Africa, known for excellence and integrity in every placement.', color: 'from-blue-700 to-blue-900' },
              { icon: Heart, title: language === 'fil' ? 'Mga Halaga' : 'Values', desc: language === 'fil' ? 'Integridad, Transparensya, Propesyonalsmo, at Komitmento sa Kaligtasan — ito ang mga halagang nagtutulak sa bawat desisyon namin.' : 'Integrity, Transparency, Professionalism, and Commitment to Safety — these are the values that drive every decision we make.', color: 'from-blue-800 to-blue-950' },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="h-full overflow-hidden">
                  <div className={`bg-gradient-to-br ${item.color} p-6 text-white text-center`}>
                    <item.icon className="h-10 w-10 mx-auto mb-3" />
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose FIRA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {language === 'fil' ? 'Bakit Piliin ang FIRA?' : 'Why Choose FIRA?'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: language === 'fil' ? 'Ligtas at Legal' : 'Safe & Legal', desc: language === 'fil' ? 'Ang bawat trabaho ay verified at sumusunod sa batas.' : 'Every job is verified and follows all legal requirements.' },
              { icon: Globe, title: language === 'fil' ? 'Pandaigdigang Network' : 'Global Network', desc: language === 'fil' ? 'Mga partner sa maraming bansa sa buong mundo.' : 'Partners in multiple countries worldwide.' },
              { icon: Award, title: language === 'fil' ? 'Karanasan' : 'Experience', desc: language === 'fil' ? 'Mahigit 10 taon sa recruitment industry.' : 'Over 10 years in the recruitment industry.' },
              { icon: Users, title: language === 'fil' ? 'Suportado ng Team' : 'Team Supported', desc: language === 'fil' ? 'Dedikadong team mula aplikasyon hanggang deployment.' : 'Dedicated team from application to deployment.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="h-full hover:shadow-lg transition-shadow text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-fira-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {language === 'fil' ? 'Makipag-ugnay sa Amin' : 'Get in Touch'}
          </h2>
          <p className="text-blue-200 max-w-lg mx-auto mb-8">
            {language === 'fil' ? 'Handa kaming tulungan ka sa iyong journey. Makipag-ugnay sa amin ngayon.' : 'We are ready to help you on your journey. Contact us today.'}
          </p>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 rounded-md" onClick={() => navigate('contact')}>
            {language === 'fil' ? 'Makipag-ugnay sa Amin' : 'Contact Us'}
          </Button>
        </div>
      </section>
    </div>
  )
}
