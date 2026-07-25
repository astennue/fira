'use client'

import { motion } from 'framer-motion'
import { ScrollText, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/app-store'

const DEFAULT_TERMS = `
<h2 class="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
<p class="mb-3">By accessing and using the Fil International Recruitment Agency (FIRA) platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h2 class="text-xl font-bold mb-3">2. Services Description</h2>
<p class="mb-3">FIRA provides international recruitment and placement services, connecting Filipino workers with employers worldwide. Our services include but are not limited to: recruitment, document processing, skills assessment, medical clearance coordination, pre-departure orientation, and post-deployment support.</p>

<h2 class="text-xl font-bold mb-3">3. User Eligibility</h2>
<p class="mb-3">To use our services, you must be at least 18 years of age and possess the legal capacity to enter into binding agreements. Employers must be registered entities with valid business licenses in their respective jurisdictions.</p>

<h2 class="text-xl font-bold mb-3">4. User Accounts</h2>
<p class="mb-3">Users are responsible for maintaining the confidentiality of their account credentials. You agree to notify FIRA immediately of any unauthorized access to your account. FIRA reserves the right to suspend or terminate accounts that violate these terms.</p>

<h2 class="text-xl font-bold mb-3">5. Data Protection</h2>
<p class="mb-3">FIRA is committed to protecting the personal data of all users in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and applicable international data protection laws. Please refer to our Data Privacy Consent for detailed information.</p>

<h2 class="text-xl font-bold mb-3">6. Limitation of Liability</h2>
<p class="mb-3">FIRA acts as an intermediary between employers and job seekers. While we strive to ensure the accuracy of all information, we do not guarantee the outcome of any job application or employment relationship. Our liability is limited to the fees paid for our services.</p>

<h2 class="text-xl font-bold mb-3">7. Contact</h2>
<p class="mb-3">For questions about these Terms of Service, please contact us at manpower@filinternational.ma or visit our office at 59 Boulevard Zerktouni, Casablanca, Morocco.</p>
`

const DEFAULT_PRIVACY = `
<h2 class="text-xl font-bold mb-3">1. Data Collection</h2>
<p class="mb-3">FIRA collects personal information that you voluntarily provide when registering, applying for positions, or contacting us. This may include: full name, contact information, employment history, educational background, identification documents, and other information relevant to recruitment services.</p>

<h2 class="text-xl font-bold mb-3">2. Purpose of Data Processing</h2>
<p class="mb-3">Your personal data is processed for the following purposes: matching you with suitable employment opportunities, processing your application and required documents, communicating with you about your application status, complying with legal and regulatory requirements, and improving our services.</p>

<h2 class="text-xl font-bold mb-3">3. Data Sharing</h2>
<p class="mb-3">Your personal data may be shared with: prospective employers for recruitment purposes, partner agencies involved in the recruitment process, government agencies as required by law (POEA/DMW, DOLE), and medical clinics for health clearance. We will never sell your personal data to third parties.</p>

<h2 class="text-xl font-bold mb-3">4. Data Security</h2>
<p class="mb-3">FIRA implements appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encryption, access controls, and regular security assessments.</p>

<h2 class="text-xl font-bold mb-3">5. Your Rights</h2>
<p class="mb-3">Under the Data Privacy Act, you have the right to: access your personal data, correct inaccurate data, delete your data (subject to legal retention requirements), withdraw consent, and file a complaint with the National Privacy Commission.</p>

<h2 class="text-xl font-bold mb-3">6. Data Retention</h2>
<p class="mb-3">We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable laws and regulations. After the retention period, your data will be securely disposed of.</p>

<h2 class="text-xl font-bold mb-3">7. Contact the Data Protection Officer</h2>
<p class="mb-3">For any data privacy concerns, please contact our Data Protection Officer at privacy@filinternational.ma or call +212 662 26 14 99.</p>
`

export function TermsPublicPage() {
  const { language, fontSize } = useAppStore()

  const { data: termsData = [], isLoading } = useQuery({
    queryKey: ['cms-terms-public'],
    queryFn: async () => {
      const res = await fetch('/api/cms/terms?public=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const tos = termsData.find((t: any) => t.type === 'terms_of_service')
  const dpc = termsData.find((t: any) => t.type === 'data_privacy_consent')

  const termsContent = tos?.content || DEFAULT_TERMS
  const privacyContent = dpc?.content || DEFAULT_PRIVACY
  const termsVersion = tos?.version || '1.0'
  const privacyVersion = dpc?.version || '1.0'

  return (
    <div className="min-h-screen flex flex-col" data-font-size={fontSize}>
      {/* Header */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">Legal</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil' ? 'Mga Tahunan at Privacy' : 'Terms & Privacy'}
            </h1>
            <p className="text-blue-200 max-w-xl mx-auto">
              {language === 'fil'
                ? 'Basahin ang aming Mga Tahunan ng Serbisyo at Pagsang-ayon sa Data Privacy bago gamitin ang aming plataporma.'
                : 'Please read our Terms of Service and Data Privacy Consent before using our platform.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-64 rounded-xl" />
              <Skeleton className="h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>
          ) : (
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="terms" className="gap-2">
                  <ScrollText className="h-4 w-4" />
                  {language === 'fil' ? 'Mga Tahunan' : 'Terms of Service'}
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {language === 'fil' ? 'Data Privacy' : 'Data Privacy Consent'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="terms">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-blue-100">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          {tos?.title || 'Terms of Service'}
                        </h2>
                        <Badge variant="outline" className="w-fit text-xs border-blue-200 text-blue-700">
                          v{termsVersion}
                        </Badge>
                      </div>
                      <div
                        className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: termsContent }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="privacy">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-blue-100">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          {dpc?.title || 'Data Privacy Consent'}
                        </h2>
                        <Badge variant="outline" className="w-fit text-xs border-blue-200 text-blue-700">
                          v{privacyVersion}
                        </Badge>
                      </div>
                      <div
                        className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: privacyContent }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-fira-gradient text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100 max-w-lg mx-auto">
            {language === 'fil'
              ? 'May tanong tungkol sa aming mga tahunan at patakaran sa privacy? Makipag-ugnay sa amin.'
              : 'Have questions about our terms and privacy policies? Reach out to us.'}
          </p>
        </div>
      </section>
    </div>
  )
}
