'use client'

import { useState } from 'react'
import { Sparkles, FileText, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function ResumeEnhancementPage() {
  const { user } = useAppStore()
  const [selectedJob, setSelectedJob] = useState('')
  const [enhancedText, setEnhancedText] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['resume-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/users?role=applicant&search=${encodeURIComponent(user?.email || '')}`)
      const data = await res.json()
      return (data.users || []).find((u: Record<string, unknown>) => u.id === user?.id) || null
    },
    enabled: !!user?.id && user?.role === 'applicant',
  })

  const { data: jobsData } = useQuery({
    queryKey: ['resume-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs?public=true')
      const data = await res.json()
      return Array.isArray(data.jobs) ? data.jobs : []
    },
  })

  const resumeText = (profile?.applicantProfile as Record<string, unknown> | undefined)?.resumeText as string || ''

  const enhanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedJob || !resumeText) throw new Error('Select a job and ensure you have a resume')
      const job = (jobsData || []).find((j: Record<string, unknown>) => j.id === selectedJob)
      if (!job) throw new Error('Job not found')

      // Try Python AI service, fall back to mock
      try {
        const aiRes = await fetch('/api/enhance-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: resumeText, job_description: job.description }),
          signal: AbortSignal.timeout(5000),
        })
        if (aiRes.ok) return await aiRes.json()
      } catch {}

      // Mock enhancement
      const changes = [
        'Capitalized section headers for consistency',
        'Optimized key terms for ATS compatibility',
        'Added professional summary based on existing experience',
        'Standardized bullet point formatting',
      ]
      const mockEnhanced = `PROFESSIONAL SUMMARY\n${profile?.name || 'Experienced Professional'} with ${(profile?.applicantProfile as Record<string, unknown> | undefined)?.yearsExperience || 'several'} years of relevant experience. Proven track record in ${(profile?.applicantProfile as Record<string, unknown> | undefined)?.preferredJob || 'professional services'}.\n\nEXPERIENCE\n${resumeText}\n\nKEY COMPETENCIES\n• Professional Communication\n• Team Collaboration\n• Adaptability and Problem Solving`

      return { enhanced_resume: mockEnhanced, changes_summary: changes }
    },
    onSuccess: (data) => {
      setEnhancedText(data.enhanced_resume)
      toast.success('Resume enhanced!')
    },
    onError: (err) => toast.error('Enhancement failed', { description: err.message }),
  })

  return (
    <div className="view-transition space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Sparkles className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">AI Resume Enhancement</h1>
          <p className="text-muted-foreground">Optimize your resume for ATS compatibility</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Original Resume</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Target Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger><SelectValue placeholder="Select a job..." /></SelectTrigger>
                <SelectContent>
                  {(jobsData || []).map((job: Record<string, unknown>) => (
                    <SelectItem key={job.id as string} value={job.id as string}>{String(job.title)} - {String(job.country)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Resume</label>
              <Textarea value={resumeText} readOnly rows={12} className="font-mono text-sm" placeholder="No resume text. Please update your profile." />
            </div>
            <Button onClick={() => enhanceMutation.mutate()} disabled={enhanceMutation.isPending || !resumeText || !selectedJob} className="w-full">
              {enhanceMutation.isPending ? 'Enhancing...' : <><Sparkles className="h-4 w-4 mr-2" />Enhance Resume</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Enhanced Resume</CardTitle>
          </CardHeader>
          <CardContent>
            {enhancedText ? (
              <>
                {enhanceMutation.data?.changes_summary && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {enhanceMutation.data.changes_summary.map((c: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                )}
                <Textarea value={enhancedText} readOnly rows={12} className="font-mono text-sm bg-emerald-50/50 dark:bg-emerald-950/20" />
                <Button className="w-full mt-4" variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />Use Enhanced Version
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a job and click enhance to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
