'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import { Columns, Plus, ChevronRight, Loader2, Trash2, User, Eye, ArrowRight, GripVertical, Inbox } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

// ─── Constants ─────────────────────────────────────────────────────────────
const stageColorPalette = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#ef4444', '#f97316', '#14b8a6', '#6366f1', '#84cc16',
]

const presetStages = [
  'Passport Processing', 'Visa Application', 'Medical Check',
  'Document Verification', 'Background Check', 'PDOS Training',
  'Ticket Booking', 'Orientation', 'Final Review', 'Ready to Deploy',
]

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
}

const measuring = {
  droppable: { strategy: MeasuringStrategy.Always },
}

// ─── Sortable Applicant Card ────────────────────────────────────────────────
function SortableApplicantCard({
  app,
  stageColor,
  stageIdx,
  stagesLength,
  isLastStage,
  isFil,
  onMoveToNext,
  onCardClick,
}: {
  app: any
  stageColor: string
  stageIdx: number
  stagesLength: number
  isLastStage: boolean
  isFil: boolean
  onMoveToNext: (app: any) => void
  onCardClick: (app: any) => void
}) {
  const applicant = app.applicant
  const profile = applicant?.applicantProfile
  const ai = app.aiAnalysis
  const initials = (applicant?.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { type: 'applicant', app } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const scoreColor = ai?.matchScore != null
    ? ai.matchScore >= 80
      ? 'text-emerald-600 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
      : ai.matchScore >= 50
        ? 'text-amber-600 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30'
        : 'text-red-500 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
    : ''

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity touch-none"
              aria-label="Drag handle"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: stageColor + '20', color: stageColor }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1" onClick={() => onCardClick(app)}>
              <p className="text-xs font-semibold truncate">{applicant?.name || 'Unknown'}</p>
              {profile?.applicantType && (
                <p className="text-[10px] text-muted-foreground capitalize">{profile.applicantType?.replace('_', ' ')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mb-2 pl-7">
            {ai?.matchScore != null && (
              <Badge variant="outline" className={`text-[10px] px-1.5 ${scoreColor}`}>
                {Math.round(ai.matchScore)}%
              </Badge>
            )}
            {app.createdAt && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                {new Date(app.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 pl-7">
            {!isLastStage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground rounded-lg flex-1"
                onClick={() => onMoveToNext(app)}
              >
                <ChevronRight className="h-3 w-3" />
                {isFil ? 'Susunod' : 'Next'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground rounded-lg flex-1"
              onClick={() => onCardClick(app)}
            >
              <Eye className="h-3 w-3" />
              {isFil ? 'Tingnan' : 'View'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Droppable Column ──────────────────────────────────────────────────────
function DroppableColumn({
  stage,
  color,
  apps,
  isFira,
  isFil,
  stageIdx,
  stagesLength,
  onDeleteStage,
  onMoveToNext,
  onCardClick,
}: {
  stage: any
  color: string
  apps: any[]
  isFira: boolean
  isFil: boolean
  stageIdx: number
  stagesLength: number
  onDeleteStage: (stage: any) => void
  onMoveToNext: (app: any) => void
  onCardClick: (app: any) => void
}) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({ id: stage.id, data: { type: 'column', stage } })

  const isLastStage = stageIdx === stagesLength - 1
  const stageAppIds = apps.map(a => a.id)

  return (
    <div className="w-72 shrink-0">
      {/* Column Header */}
      <div
        className="flex items-center gap-2 mb-1 px-1"
      >
        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
        <h3 className="text-sm font-semibold truncate flex-1">{stage.name}</h3>
        <Badge
          variant="secondary"
          className="text-xs ml-auto"
          style={{ backgroundColor: color + '18', color, border: `1px solid ${color}30` }}
        >
          {apps.length}
        </Badge>
        {isFira && !stage.isDefault && stagesLength > 2 && (
          <button
            onClick={() => onDeleteStage(stage)}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            aria-label="Delete stage"
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[220px] bg-muted/30 dark:bg-muted/10 rounded-xl p-2 border transition-colors ${
          isOver ? 'ring-2 ring-primary/50 border-primary/50 bg-primary/5' : 'border-border/50'
        }`}
        style={{ borderLeftColor: color + '60', borderLeftWidth: '3px' }}
      >
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40 gap-2">
            <Inbox className="h-8 w-8" />
            <p className="text-xs">{isFil ? 'Walang aplikante' : 'No applicants'}</p>
          </div>
        ) : (
          <SortableContext items={stageAppIds} strategy={verticalListSortingStrategy}>
            {apps.map((app: any) => (
              <SortableApplicantCard
                key={app.id}
                app={app}
                stageColor={color}
                stageIdx={stageIdx}
                stagesLength={stagesLength}
                isLastStage={isLastStage}
                isFil={isFil}
                onMoveToNext={onMoveToNext}
                onCardClick={onCardClick}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}

// ─── Main Pipeline Component ───────────────────────────────────────────────
export function AtsPipelinePage() {
  const { language, user, viewParams, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const isFil = language === 'fil'

  const [selectedJobId, setSelectedJobId] = useState(viewParams?.jobId || '')
  const [showAddStage, setShowAddStage] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newStageColor, setNewStageColor] = useState(stageColorPalette[0])
  const [moveNotes, setMoveNotes] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showAppDetail, setShowAppDetail] = useState(false)
  const [deleteConfirmStage, setDeleteConfirmStage] = useState<any>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: jobsData } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: async () => {
      const res = await apiFetch('/api/jobs')
      if (!res.ok) return { jobs: [] }
      return res.json()
    },
  })

  const { data: stagesData, isLoading: stagesLoading } = useQuery({
    queryKey: ['ats-stages', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return []
      const res = await apiFetch(`/api/ats/stages?jobOrderId=${selectedJobId}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: !!selectedJobId,
  })

  const { data: appData, isLoading: appsLoading } = useQuery({
    queryKey: ['ats-applications', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return { applications: [] }
      const res = await apiFetch(`/api/applications?jobOrderId=${selectedJobId}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!selectedJobId,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addStageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedJobId || !newStageName) throw new Error('Name required')
      const maxOrder = (stagesData || []).length
      const res = await apiFetch('/api/ats/stages', {
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
      toast.success(isFil ? 'Na-dagdag na ang stage!' : 'Stage added!')
    },
    onError: () => toast.error(isFil ? 'Hindi na-dagdag ang stage' : 'Failed to add stage'),
  })

  const moveStageMutation = useMutation({
    mutationFn: async ({ applicationId, stageId }: { applicationId: string; stageId: string }) => {
      const res = await apiFetch('/api/ats/move-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, stageId, notes: moveNotes }),
      })
      if (!res.ok) throw new Error('Failed to move')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-applications'] })
      setShowAppDetail(false)
      setSelectedApp(null)
      setMoveNotes('')
      toast.success(isFil ? 'Na-ilipat na!' : 'Applicant moved!')
    },
    onError: () => toast.error(isFil ? 'Hindi na-ilipat' : 'Failed to move applicant'),
  })

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const res = await apiFetch(`/api/ats/stages?stageId=${stageId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete stage')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-stages'] })
      queryClient.invalidateQueries({ queryKey: ['ats-applications'] })
      setDeleteConfirmStage(null)
      toast.success(isFil ? 'Na-delete na ang stage!' : 'Stage deleted!')
    },
    onError: () => toast.error(isFil ? 'Hindi na-delete ang stage' : 'Failed to delete stage'),
  })

  // ── Data extraction ────────────────────────────────────────────────────────
  const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : []
  const applications = Array.isArray(appData?.applications) ? appData.applications : []
  const stages = Array.isArray(stagesData) ? stagesData : []

  const isFira = user?.role === 'super_admin' || user?.role === 'staff' || user?.role === 'international_agency'

  // Group applications by stage
  const stageMap: Record<string, any[]> = {}
  stages.forEach((stage: any) => { stageMap[stage.id] = [] })
  applications.forEach((app: any) => {
    const sid = app.currentStageId
    if (sid && stageMap[sid]) stageMap[sid].push(app)
    else if (stages.length > 0) stageMap[stages[0].id]?.push(app)
  })

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalApplicants = applications.length
  const avgMatchScore = useMemo(() => {
    if (applications.length === 0) return 0
    const scores = applications.filter((a: any) => a.aiAnalysis?.matchScore != null).map((a: any) => a.aiAnalysis.matchScore)
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
  }, [applications])

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  // ── DnD handlers ───────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const activeApp = applications.find((a: any) => a.id === active.id)
    if (!activeApp) return

    // Find which column the card was dropped into
    const targetStage = stages.find((s: any) => s.id === over.id)
    if (targetStage && targetStage.id !== activeApp.currentStageId) {
      moveStageMutation.mutate({ applicationId: activeApp.id, stageId: targetStage.id })
    }
  }, [applications, stages, moveStageMutation])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual feedback is handled via isOver in useSortable
  }, [])

  // ── Quick actions ──────────────────────────────────────────────────────────
  const handleMoveToNext = (app: any) => {
    const currentIdx = stages.findIndex((s: any) => s.id === app.currentStageId)
    if (currentIdx >= 0 && currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1]
      if (nextStage) {
        moveStageMutation.mutate({ applicationId: app.id, stageId: nextStage.id })
      }
    }
  }

  const handleCardClick = (app: any) => {
    setSelectedApp(app)
    setShowAppDetail(true)
  }

  const handleDeleteStage = (stage: any) => {
    setDeleteConfirmStage(stage)
  }

  const handleViewProfile = () => {
    if (selectedApp?.applicant?.id) {
      navigate('fira-applicant-detail', { userId: selectedApp.applicant.id })
      setShowAppDetail(false)
    }
  }

  const handleSendToNext = () => {
    if (selectedApp) {
      handleMoveToNext(selectedApp)
    }
  }

  // ── Active dragging card overlay ──────────────────────────────────────────
  const activeApp = activeId ? applications.find((a: any) => a.id === activeId) : null

  return (
    <div className="view-transition space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Columns className="h-7 w-7 text-blue-600" />
            ATS Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFil
              ? 'Subaybayan ang end-to-end recruitment at deployment pipeline para sa job order na ito'
              : 'Track the end-to-end recruitment and deployment pipeline for this job order'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFira && selectedJobId && (
            <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAddStage(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{isFil ? 'Dagdag' : 'Add Stage'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Job Selector ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{isFil ? 'Pumili ng Job Order' : 'Select Job Order'}</Label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-80 h-11">
            <SelectValue placeholder={isFil ? 'Pumili ng job order...' : 'Select a job order...'} />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j: any) => (
              <SelectItem key={j.id} value={j.id}>{j.title} — {j.country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Empty State: No Job Selected ────────────────────────────────── */}
      {!selectedJobId ? (
        <Card className="p-12 text-center">
          <Columns className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{isFil ? 'Pumili ng Job Order' : 'Select a Job Order'}</h3>
          <p className="text-sm text-muted-foreground">{isFil ? 'Pumili muna ng job order para makita ang pipeline.' : 'Choose a job order to view the pipeline.'}</p>
        </Card>
      ) : stagesLoading || appsLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-72 rounded-xl shrink-0" />)}
        </div>
      ) : stages.length === 0 ? (
        <Card className="p-12 text-center">
          <Columns className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">{isFil ? 'Walang Stages' : 'No Stages Yet'}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isFil ? 'Mag-dagdag ng stages para simulan ang pipeline.' : 'Add stages to start building your pipeline.'}
          </p>
          {isFira && (
            <Button onClick={() => setShowAddStage(true)} className="rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              {isFil ? 'Dagdag ng Unang Stage' : 'Add First Stage'}
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* ── Pipeline Summary Bar ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {/* Total Applicants */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isFil ? 'Kabuuang Aplikante' : 'Total Applicants'}</p>
                  <p className="text-xl font-bold tabular-nums">{totalApplicants}</p>
                </div>
              </div>
            </Card>
            {/* Funnel Progress */}
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1.5">{isFil ? 'Funnel Progress' : 'Funnel Progress'}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {stages.map((stage: any, idx: number) => {
                  const count = (stageMap[stage.id] || []).length
                  const color = stage.color || stageColorPalette[idx % stageColorPalette.length]
                  return (
                    <span key={stage.id} className="flex items-center gap-1 text-xs">
                      <span className="font-semibold" style={{ color }}>
                        {count}
                      </span>
                      <span className="text-muted-foreground hidden sm:inline">{stage.name}</span>
                      {idx < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </span>
                  )
                })}
              </div>
            </Card>
            {/* Average Match Score */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isFil ? 'Average na Score' : 'Avg. Match Score'}</p>
                  <p className="text-xl font-bold tabular-nums">{avgMatchScore}%</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Kanban Board with DnD ──────────────────────────────────────── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={measuring}
          >
            <ScrollArea className="w-full">
              <div
                className="flex gap-4 min-h-[60vh] pb-4"
                style={{ minWidth: `${Math.max(stages.length * 290, 800)}px` }}
              >
                <AnimatePresence>
                  {stages.map((stage: any, idx: number) => {
                    const color = stage.color || stageColorPalette[idx % stageColorPalette.length]
                    const apps = stageMap[stage.id] || []
                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group"
                      >
                        <DroppableColumn
                          stage={stage}
                          color={color}
                          apps={apps}
                          isFira={isFira}
                          isFil={isFil}
                          stageIdx={idx}
                          stagesLength={stages.length}
                          onDeleteStage={handleDeleteStage}
                          onMoveToNext={handleMoveToNext}
                          onCardClick={handleCardClick}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={dropAnimation}>
              {activeApp ? (
                <Card className="w-64 shadow-xl opacity-90">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                        {(activeApp.applicant?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold truncate">{activeApp.applicant?.name || 'Unknown'}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

      {/* ── Applicant Detail Sheet ──────────────────────────────────────── */}
      <Sheet open={showAppDetail} onOpenChange={(open) => { setShowAppDetail(open); if (!open) setSelectedApp(null) }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {selectedApp.applicant?.name || 'Unknown Applicant'}
                </SheetTitle>
                <SheetDescription>
                  {isFil ? 'Detalye ng aplikante at mabilisang aksyon' : 'Applicant details and quick actions'}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Profile Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {(selectedApp.applicant?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedApp.applicant?.name || 'Unknown'}</p>
                      {selectedApp.applicant?.email && (
                        <p className="text-sm text-muted-foreground">{selectedApp.applicant.email}</p>
                      )}
                    </div>
                  </div>
                  {selectedApp.applicant?.applicantProfile?.applicantType && (
                    <Badge variant="secondary" className="capitalize">
                      {selectedApp.applicant.applicantProfile.applicantType.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">{isFil ? 'Match Score' : 'Match Score'}</p>
                    <p className="text-2xl font-bold mt-1">
                      {selectedApp.aiAnalysis?.matchScore != null ? `${Math.round(selectedApp.aiAnalysis.matchScore)}%` : 'N/A'}
                    </p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">{isFil ? 'Petsa ng Pag-apply' : 'Applied Date'}</p>
                    <p className="text-sm font-semibold mt-1">
                      {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </Card>
                </div>

                {/* Current Stage */}
                {stages.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{isFil ? 'Kasalukuyang Stage' : 'Current Stage'}</Label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const currentIdx = stages.findIndex((s: any) => s.id === selectedApp.currentStageId)
                        const stage = stages[currentIdx] || stages[0]
                        const color = stage?.color || stageColorPalette[0]
                        return (
                          <>
                            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
                            <span className="text-sm font-medium">{stage?.name || 'Unknown'}</span>
                            {currentIdx < stages.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                            {currentIdx < stages.length - 1 && (
                              <span className="text-xs text-muted-foreground">
                                {stages[currentIdx + 1]?.name}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2 pt-2">
                  <Button className="w-full gap-2" onClick={handleViewProfile}>
                    <Eye className="h-4 w-4" />
                    {isFil ? 'Tingnan ang Buong Profile' : 'View Full Profile'}
                  </Button>
                  {(() => {
                    const currentIdx = stages.findIndex((s: any) => s.id === selectedApp.currentStageId)
                    const isLastStage = currentIdx >= stages.length - 1
                    return (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        disabled={isLastStage || moveStageMutation.isPending}
                        onClick={handleSendToNext}
                      >
                        {moveStageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {isFil
                          ? isLastStage ? 'Huling Stage Na' : 'Ipadala sa Susunod na Stage'
                          : isLastStage ? 'Final Stage' : 'Send to Next Stage'}
                      </Button>
                    )
                  })()}
                </div>

                {/* Notes for move */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {isFil ? 'Notes (Opsyonal - kapag nagmo-move)' : 'Notes (Optional — when moving)'}
                  </Label>
                  <Textarea
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Add Stage Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showAddStage} onOpenChange={setShowAddStage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              {isFil ? 'Dagdag na Stage' : 'Add New Stage'}
            </DialogTitle>
            <DialogDescription>
              {isFil ? 'Magdagdag ng bagong proseso sa pipeline.' : 'Add a new process to the pipeline.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isFil ? 'Pangalan ng Stage' : 'Stage Name'}</Label>
              <Input value={newStageName} onChange={(e) => setNewStageName(e.target.value)} placeholder="e.g., Medical Check" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isFil ? 'Mabilisang Pagpili (Preset)' : 'Quick Select (Preset)'}</Label>
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
              <Label>{isFil ? 'Kulay' : 'Color'}</Label>
              <div className="flex gap-2 flex-wrap">
                {stageColorPalette.map((c) => (
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
              <Button variant="outline" onClick={() => setShowAddStage(false)}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
              <Button onClick={() => addStageMutation.mutate()} disabled={addStageMutation.isPending || !newStageName} className="rounded-xl">
                {addStageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFil ? 'Dagdagin' : 'Add Stage'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Stage Confirmation Dialog ──────────────────────────────── */}
      <Dialog open={!!deleteConfirmStage} onOpenChange={() => setDeleteConfirmStage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {isFil ? 'I-delete ang Stage' : 'Delete Stage'}
            </DialogTitle>
            <DialogDescription>
              {isFil
                ? `Sigurado ka bang gusto mong i-delete ang "${deleteConfirmStage?.name || ''}" stage? Hindi na ito ma-undo.`
                : `Are you sure you want to delete the "${deleteConfirmStage?.name || ''}" stage? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmStage(null)}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmStage && deleteStageMutation.mutate(deleteConfirmStage.id)}
              disabled={deleteStageMutation.isPending}
            >
              {deleteStageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isFil ? 'I-delete' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
