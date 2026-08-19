'use client'

import { MessageCircle, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

export function MessagingPage() {
  const { language, navigate, user } = useAppStore()

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          {language === 'fil' ? 'Mensahe' : 'Messages'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {language === 'fil'
            ? 'Real-time na pagmamanman ng mensahe ay ginagawa pa'
            : 'Real-time messaging is under development'}
        </p>
      </div>
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {language === 'fil' ? 'Malapit Na!' : 'Coming Soon!'}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {language === 'fil'
            ? 'Ang real-time na pagmamanman ng mensahe ay kasalukuyang ginagawa. Maaari kang makipag-ugnayan sa pamamagitan ng mga update sa status ng aplikasyon at mga nota sa endorso.'
            : 'Real-time messaging is currently under development. You can communicate through the application status updates and endorsement notes.'}
        </p>
        <Button
          variant="outline"
          onClick={() => user ? navigate('landing') : navigate('landing')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'fil' ? 'Bumalik sa Dashboard' : 'Back to Dashboard'}
        </Button>
      </Card>
    </div>
  )
}
