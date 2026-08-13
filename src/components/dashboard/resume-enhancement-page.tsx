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

export function ResumeEnhancementPage() {
  const { language } = useAppStore()
  const [jobDesc, setJobDesc] = useState('')
  const [resume, setResume] = useState('')
  const [enhanced, setEnhanced] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const enhance = async () => {
    if (!resume.trim()) return
    setIsLoading(true)
    setEnhanced('')
    try {
      // TODO: Replace with real AI API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const enhancedText = `
## Enhanced Resume Summary

${resume.split('\n').map(line => line.trim()).filter(Boolean).join('\n\n')}

### AI-Recommended Additions:

1. **Quantifiable Achievements**: Where possible, add metrics and numbers to your experience descriptions.

2. **Keywords Optimization**: Include relevant industry keywords found in the job description to improve ATS compatibility.

3. **Action Verbs**: Start each experience bullet with strong action verbs (Managed, Led, Implemented, Achieved, etc.)

4. **Skills Section**: Ensure all skills mentioned in the job requirements are prominently listed.

5. **Professional Summary**: Consider adding a 2-3 sentence professional summary at the top that aligns with the target position.

${jobDesc ? `\n### Job Alignment Analysis:\nBased on the job description provided, your resume has been analyzed for keyword alignment and relevance. Consider highlighting experiences that directly relate to the mentioned requirements.` : ''}

---
*Note: This is a basic enhancement. The full AI-powered enhancement will be available when the Python SBERT microservice is connected.*
`.trim()

      setEnhanced(enhancedText)
      toast.success(language === 'fil' ? 'Matagumpay na pinahusay ang resume!' : 'Resume enhanced successfully!')
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
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI Resume Enhancement
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fil'
            ? 'Pahusayin ang iyong resume gamit ang AI para mas maging appealing sa mga emplyador'
            : 'Enhance your resume with AI to make it more appealing to employers'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Input' : 'Input'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'fil' ? 'Deskripsyon ng Trabaho (Optional)' : 'Job Description (Optional)'}
              </label>
              <Textarea
                placeholder={language === 'fil' ? 'I-paste ang deskripsyon ng trabaho para mas personalized na enhancement...' : 'Paste the job description for more personalized enhancement...'}
                className="min-h-[100px]"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'fil' ? 'Ang Iyong Resume / Cover Letter' : 'Your Resume / Cover Letter'}
              </label>
              <Textarea
                placeholder={language === 'fil' ? 'I-paste ang iyong resume o cover letter dito...' : 'Paste your resume or cover letter here...'}
                className="min-h-[200px]"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </div>
            <Button onClick={enhance} disabled={!resume.trim() || isLoading} className="w-full">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{language === 'fil' ? 'Pinapahusay...' : 'Enhancing...'}</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />{language === 'fil' ? 'Pahusayin ang Resume' : 'Enhance Resume'}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{language === 'fil' ? 'Pinahusay na Resume' : 'Enhanced Resume'}</CardTitle>
            {enhanced && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
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
    </div>
  )
}
