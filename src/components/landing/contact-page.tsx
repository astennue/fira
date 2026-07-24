'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function ContactPage() {
  const { language, fontSize } = useAppStore()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success(language === 'fil' ? 'Naipadala na ang iyong mensahe!' : 'Your message has been sent!')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col" data-font-size={fontSize}>
      {/* Header */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">Contact Us</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil' ? 'Makipag-ugnay sa Amin' : 'Get in Touch'}
            </h1>
            <p className="text-blue-200 max-w-xl mx-auto">
              {language === 'fil'
                ? 'May tanong ba kayo? Handa kaming tulungan kayo. Makipag-ugnay sa amin sa pamamagitan ng anumang paraan sa ibaba.'
                : 'Have questions? We are here to help. Reach out to us through any of the channels below.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: MapPin, title: language === 'fil' ? 'Lokasyon' : 'Address', info: '59 Boulevard Zerktouni\nCasablanca, Morocco' },
              { icon: Phone, title: language === 'fil' ? 'Telepono' : 'Phone', info: '+212 662 26 14 99\n+212 662 26 08 05\n+212 662 26 03 36' },
              { icon: Mail, title: 'Email', info: 'manpower@filinternational.ma' },
              { icon: Clock, title: language === 'fil' ? 'Oras ng Tanghalian' : 'Office Hours', info: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat: 9:00 AM - 1:00 PM' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow border-blue-100">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{item.info}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Form */}
      <section className="py-16 bg-fira-gradient-soft flex-1">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden h-full">
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 h-64 flex items-center justify-center text-white relative">
                  <div className="absolute inset-0 bg-dots-pattern" />
                  <div className="relative text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Casablanca, Morocco</p>
                    <p className="text-blue-200 text-sm">59 Boulevard Zerktouni</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Find Us</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    FIRA is conveniently located on Boulevard Zerktouni in the heart of Casablanca, Morocco. Visit our office during business hours for face-to-face consultations.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6">
                  {language === 'fil' ? 'Magpadala ng Mensahe' : 'Send Us a Message'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'fil' ? 'Pangalan' : 'Name'}</Label>
                      <Input placeholder="Your name" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="your@email.com" className="h-11" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'fil' ? 'Paksa' : 'Subject'}</Label>
                    <Input placeholder={language === 'fil' ? 'Paksa ng iyong mensahe...' : 'Subject of your message...'} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'fil' ? 'Mensahe' : 'Message'}</Label>
                    <Textarea placeholder={language === 'fil' ? 'I-type ang iyong mensahe dito...' : 'Type your message here...'} className="min-h-[150px]" required />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl" disabled={submitted}>
                    {submitted ? (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Sent!</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> {language === 'fil' ? 'Ipadala' : 'Send Message'}</>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
