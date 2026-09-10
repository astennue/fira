'use client'

import { ArrowLeft, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { JobOrderForm } from '@/components/dashboard/job-order-form'

export function EmployerJobCreatePage() {
  const { navigate, language } = useAppStore()
  const isFil = language === 'fil'

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('employer-jobs')} className="mb-2 -ml-2 gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />{isFil ? 'Bumalik sa mga Job Order' : 'Back to My Jobs'}
        </Button>
        <h1 className="text-4xl font-bold leading-tight tracking-tight flex items-center gap-3">
          <Handshake className="h-8 w-8 text-blue-700 dark:text-blue-400" />
          {isFil ? 'I-endorse ang Job Order' : 'Endorse Job Order'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isFil
            ? 'Magbigay ng job order sa FIRA — sila ang magpo-post at magsasagawa ng recruitment para sa inyo'
            : 'Submit a job order to FIRA — they will post it and run recruitment on your behalf'}
        </p>
      </div>
      <JobOrderForm mode="employer" />
    </div>
  )
}
