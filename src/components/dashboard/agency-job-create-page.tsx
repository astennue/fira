'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { JobOrderForm } from '@/components/dashboard/job-order-form'

export function AgencyJobCreatePage() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('agency-jobs')} className="mb-2 -ml-2 gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />{isFil ? 'Bumalik sa mga Trabaho' : 'Back to Jobs'}
        </Button>
        <h1 className="text-4xl font-bold leading-tight tracking-tight">{isFil ? 'Gumawa ng Job Order' : 'Create Job Order'}</h1>
        <p className="text-muted-foreground mt-1">
          {isFil
            ? 'Magpost ng bagong trabaho — ipapadala sa FIRA para sa approval bago maging publiko'
            : 'Post a new job opening — sent to FIRA for approval before going public'}
        </p>
      </div>
      <JobOrderForm mode="agency" />
    </div>
  )
}
