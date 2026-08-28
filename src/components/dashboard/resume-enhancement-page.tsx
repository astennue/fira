'use client'

import { useState } from 'react'
import { Sparkles, Wand2, Copy, Check, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/fetch'

export function ResumeEnhancementPage() {
  const { language, user } = useAppStore()
  const [enhanced, setEnhanced] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const enhance = async () => {
    if (!user) return
    setIsLoading(true)
    setEnhanced('')
    try {
      const res = await apiFetch('/api/resume/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || (language === 'fil' ? 'Hindi pinahusay ang resume.' : 'Failed to enhance resume.'))
        return
      }
      if (data.enhancedText) {
        setEnhanced(data.enhancedText)
        toast.success(language === 'fil' ? 'Matagumpay na pinahusay ang resume!' : 'Resume enhanced successfully!')
      }
    } catch {
      toast.error(language === 'fil' ? 'Hindi pinahusay ang resume.' : 'Failed to enhance resume.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhanced)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI Resume Enhancement
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fil'
            ? 'Pahusayin ang iyong resume gamit ang AI para mas maging appealing sa mga emplyador'
            : 'Enhance your resume with AI to make it more appealing to employers'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fil' ? 'Pinahusay na AI' : 'AI Enhancement'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {language === 'fil'
              ? 'I-click ang button sa ibaba para pahusayin ang iyong nai-upload na resume gamit ang AI. Siguraduhing may nai-upload kang resume sa iyong profile.'
              : 'Click the button below to enhance your uploaded resume with AI. Make sure you have uploaded a resume in your profile first.'}
          </p>
          <Button onClick={enhance} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{language === 'fil' ? 'Pinapahusay...' : 'Enhancing...'}</>
            ) : (
              <><Sparkles className="h-4 w-4" />{language === 'fil' ? 'Pahusayin ang Resume' : 'Enhance Resume'}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === 'fil' ? 'Pinahusay na Resume' : 'Enhanced Resume'}</CardTitle>
          {enhanced && (
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="h-3.5 w-3.5 " /> : <Copy className="h-3.5 w-3.5 " />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" style={{ maxWidth: `${80 - i * 5}%` }} />)}
            </div>
          ) : enhanced ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-line">{enhanced}</div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{language === 'fil' ? 'Ang pinahusay na resume ay lalabas dito.' : 'Enhanced resume will appear here.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
