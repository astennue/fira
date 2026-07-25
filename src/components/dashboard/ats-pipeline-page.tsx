'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Columns, Plus, ChevronDown, GripVertical, Loader2, MessageSquare, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

const stageColors = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#ef4444', '#f97316', '#14b8a6', '#6366f1', '#84cc16',
]

const presetStages = [
  'Passport Processing', 'Visa Application', 'Medical Check',
  'Document Verification', 'Background Check', 'PDOS Training',
  'Ticket Booking', 'Orientation', 'Final Review', 'Ready to Deploy',
]

export function AtsPipelinePage() {
  const { language, user, viewParams } = useAppStore()
  const queryClient = useQueryClient()
  const [selectedJobId, setSelectedJobId] = useState(viewParams?.jobId || '')
  const [showAddStage, setShowAddStage] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newStageColor, setNewStageColor] = useState(stageColors[Math.floor(Math.random() * stageColors.length)])
  const [movingApp, setMovingApp] = useState<{ id: string; name: string } | null>(null)
  const [moveNotes, setMoveNotes] = useState('')

  const { data: jobsData } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: stagesData, isLoading: stagesLoading } = useQuery({
    queryKey: ['ats-stages', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return []
      const res = await fetch(`/api/ats/stages?jobOrderId=${selectedJobId}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!selectedJobId,
  })

  const { data: appData, isLoading: appsLoading } = useQuery({
    queryKey: ['ats-applications', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return { applications: [] }
      const res = await fetch(`/api/applications?jobOrderId=${selectedJobId}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!selectedJobId,
  })

  const addStageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedJobId || !newStageName) throw new Error('Name required')
      const maxOrder = (stagesData || []).length
      const res = await fetch('/api/ats/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobOrderId: selectedJobId, name: newStageName, order: maxOrder, color: newStageColor }),
      })
      if (!res.ok) throw new Error('Failed to add stage')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-stages'] })
      setShowAddStage(false)
      setNewStageName('')
      toast.success('Stage added!')
    },
    onError: () => toast.error('Failed to add stage'),
  })

  const moveStageMutation = useMutation({
    mutationFn: async ({ applicationId, stageId }: { applicationId: string; stageId: string }) => {
      const res = await fetch('/api/ats/move-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, stageId, notes: moveNotes }),
      })
      if (!res.ok) throw new Error('Failed to move')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-applications'] })
      setMovingApp(null)
      setMoveNotes('')
      toast.success('Applicant moved!')
    },
    onError: () => toast.error('Failed to move applicant'),
  })

  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const applications = Array.isArray(appData?.applications) ? appData.applications : []
  const stages = Array.isArray(stagesData) ? stagesData : []

  const isFira = user?.role === 'super_admin' || user?.role === 'staff'

  const stageMap: Record<string, any[]> = {}
  stages.forEach((stage: any) => { stageMap[stage.id] = [] })
  applications.forEach((app: any) => {
    const sid = app.currentStageId
    if (sid && stageMap[sid]) stageMap[sid].push(app)
    else if (stages.length > 0) stageMap[stages[0].id]?.push(app)
  })

  return (
    <div className="view-transition space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Columns className="h-7 w-7 text-blue-600" />
            ATS Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fil' ? 'Subaybayan ang progress ng mga aplikante' : 'Track applicant progress'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-full sm:w-72 h-10">
              <SelectValue placeholder={language === 'fil' ? 'Pumili ng trabaho...' : 'Select a job...'} />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((j: any) => (
                <SelectItem key={j.id} value={j.id}>{j.title} — {j.country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFira && selectedJobId && (
            <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAddStage(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'fil' ? 'Dagdag' : 'Add Stage'}</span>
            </Button>
          )}
        </div>
      </div>

      {!selectedJobId ? (
        <Card className="p-12 text-center">
          <Columns className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{language === 'fil' ? 'Pumili ng trabaho' : 'Select a job'}</h3>
          <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Pumili muna ng job order.' : 'Choose a job order to view the pipeline.'}</p>
        </Card>
      ) : stagesLoading || appsLoading ? (
        <div className="flex gap-4 overflow-x-auto">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-72 rounded-xl shrink-0" />)}</div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 min-h-[60vh] pb-4" style={{ minWidth: `${Math.max(stages.length * 290, 800)}px` }}>
            {stages.map((stage: any, idx: number) => {
              const color = stage.color || stageColors[idx % stageColors.length]
              const apps = stageMap[stage.id] || []
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-72 shrink-0"
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
                    <h3 className="text-sm font-semibold truncate">{stage.name}</h3>
                    <Badge variant="secondary" className="text-xs ml-auto">{apps.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px] bg-muted/30 dark:bg-muted/10 rounded-xl p-2 border border-border/50">
                    {apps.length === 0 ? (
                      <div className="flex items-center justify-center h-20 text-muted-foreground/40">
                        <p className="text-xs">{language === 'fil' ? 'Walang aplikante' : 'No applicants'}</p>
                      </div>
                    ) : (
                      apps.map((app: any) => {
                        const applicant = app.applicant
                        const profile = applicant?.applicantProfile
                        const ai = app.aiAnalysis
                        return (
                          <Card key={app.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: color + '20', color }}>
                                  {applicant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold truncate">{applicant?.name || 'Unknown'}</p>
                                  {profile?.applicantType && (
                                    <p className="text-[10px] text-muted-foreground capitalize">{profile.applicantType?.replace('_', ' ')}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setMovingApp({ id: app.id, name: applicant?.name || 'Applicant' })}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="Move to stage"
                                >
                                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                              </div>
                              {ai?.matchScore && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">Match</span>
                                  <Badge variant="outline" className={`text-[10px] px-1.5 ${ai.matchScore >= 80 ? 'text-emerald-600 border-emerald-300 dark:border-emerald-700' : ai.matchScore >= 50 ? 'text-amber-600 border-amber-300 dark:border-amber-700' : 'text-red-500 border-red-300 dark:border-red-700'}`}>
                                    {Math.round(ai.matchScore)}%
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Add Stage Dialog */}
      <Dialog open={showAddStage} onOpenChange={setShowAddStage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              {language === 'fil' ? 'Dagdag na Stage' : 'Add New Stage'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fil' ? 'Magdagdag ng bagong proseso sa pipeline.' : 'Add a new process to the pipeline.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'fil' ? 'Pangalan ng Stage' : 'Stage Name'}</Label>
              <Input value={newStageName} onChange={(e) => setNewStageName(e.target.value)} placeholder="e.g., Medical Check" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{language === 'fil' ? 'Mabilisang Pagpili (Preset)' : 'Quick Select (Preset)'}</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {presetStages.filter(s => !stages.some((st: any) => st.name === s)).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setNewStageName(preset)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${newStageName === preset ? 'bg-blue-600 text-white border-blue-600' : 'border-border hover:border-blue-400'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'fil' ? 'Kulay' : 'Color'}</Label>
              <div className="flex gap-2 flex-wrap">
                {stageColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewStageColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${newStageColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddStage(false)}>{language === 'fil' ? 'Kanselahin' : 'Cancel'}</Button>
              <Button onClick={() => addStageMutation.mutate()} disabled={addStageMutation.isPending || !newStageName} className="rounded-xl">
                {addStageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'fil' ? 'Dagdagin' : 'Add Stage'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Applicant Dialog */}
      <Dialog open={!!movingApp} onOpenChange={() => setMovingApp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Columns className="h-5 w-5 text-blue-600" />
              Move {movingApp?.name}
            </DialogTitle>
            <DialogDescription>
              {language === 'fil' ? 'Pumili ng bagong stage para sa aplikante.' : 'Select a new stage for this applicant.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'fil' ? 'Ilipat sa' : 'Move to'}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {stages.map((stage: any, idx: number) => {
                  const color = stage.color || stageColors[idx % stageColors.length]
                  const count = (stageMap[stage.id] || []).length
                  return (
                    <button
                      key={stage.id}
                      onClick={() => moveStageMutation.mutate({ applicationId: movingApp!.id, stageId: stage.id })}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{stage.name}</p>
                        <p className="text-[10px] text-muted-foreground">{count} applicant(s)</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'fil' ? 'Notes (Optional)' : 'Notes (Optional)'}</Label>
              <Textarea value={moveNotes} onChange={(e) => setMoveNotes(e.target.value)} placeholder="Add a note..." rows={2} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
