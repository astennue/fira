'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import {
  Columns3, Plus, ChevronRight, Loader2, Trash2, User, Eye, ArrowRight,
  GripVertical, Inbox, MapPin, Briefcase, Calendar, Star, FileText,
  CheckCircle2, Clock, AlertCircle, Phone, Mail, GraduationCap, CircleDot,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
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
import { getInitials } from '@/components/shared/get-initials'

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

// ─── Helpers ───────────────────────────────────────────────────────────────
function getScoreStyle(score: number | null | undefined) {
  if (score == null) return ''
  if (score >= 80) return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-700'
  if (score >= 50) return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700'
  return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-700'
}

function getScoreDot(score: number | null | undefined) {
  if (score == null) return 'bg-gray-400'
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function parseJsonSkills(str: string | null | undefined): string[] {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

function formatDate(dateStr: string | null | undefined, isFil: boolean) {
  if (!dateStr) return isFil ? 'N/A' : 'N/A'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return isFil ? 'Ngayon' : 'Today'
  if (diffDays === 1) return isFil ? 'Kahapon' : 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString()
}


// ─── Loading Skeleton ──────────────────────────────────────────────────────
function PipelineSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {/* Job selector skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-11 w-80" />
      </div>
      {/* Summary bar skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Kanban columns skeleton */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4" style={{ minWidth: '1200px' }}>
          {[0, 1, 2, 3].map((col) => (
            <div key={col} className="w-[280px] shrink-0 space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-24 flex-1" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
              <div className="min-h-[280px] rounded-xl border border-border/50 bg-muted/30 dark:bg-muted/10 p-2 space-y-2">
                {[0, 1, 2].map((card) => (
                  <Skeleton key={card} className="h-[104px] w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// ─── Sortable Applicant Card ────────────────────────────────────────────────
function SortableApplicantCard({
  app,
  stageColor,
  stageIdx,
  stagesLength,
  isFil,
  onMoveToNext,
  onCardClick,
}: {
  app: any
  stageColor: string
  stageIdx: number
  stagesLength: number
  isFil: boolean
  onMoveToNext: (app: any) => void
  onCardClick: (app: any) => void
}) {
  const applicant = app.applicant
  const profile = applicant?.applicantProfile
  const ai = app.aiAnalysis
  const initials = getInitials(applicant?.name)
  const isLastStage = stageIdx === stagesLength - 1

  const matchedSkills = parseJsonSkills(ai?.matchedSkills)
  const displaySkills = matchedSkills.slice(0, 3)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { type: 'applicant', app } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  zIndex: isDragging ? 50 : undefined,
  position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="shadow-sm hover:shadow-md border-border/60 dark:border-border/40 hover:border-border transition-all cursor-pointer group">
        <CardContent className="p-3 space-y-2.5">
          {/* Top row: drag handle + avatar + name */}
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1.5 p-0.5 rounded-md opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all hover:bg-muted touch-none"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
              style={{ background: stageColor + '18', color: stageColor }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1 pt-0.5" onClick={() => onCardClick(app)}>
              <p className="text-sm font-semibold truncate leading-tight">{applicant?.name || 'Unknown'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {profile?.applicantType && (
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {profile.applicantType.replace(/_/g, ' ')}
                  </span>
                )}
                {profile?.phone && (
                  <span className="text-[10px] text-muted-foreground">• {profile.phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Score + Date row */}
          <div className="flex items-center gap-2 pl-7">
            {ai?.matchScore != null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-1.5 py-0 font-semibold tabular-nums ${getScoreStyle(ai.matchScore)}`}
                  >
                    <span className={`mr-1 h-1.5 w-1.5 rounded-full ${getScoreDot(ai.matchScore)}`} />
                    {Math.round(ai.matchScore)}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {isFil ? 'AI Match Score' : 'AI Match Score'}: {Math.round(ai.matchScore)}%
                </TooltipContent>
              </Tooltip>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(app.createdAt, isFil)}
            </span>
          </div>

          {/* Skills pills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pl-7" onClick={() => onCardClick(app)}>
              {displaySkills.map((skill: string) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pl-7 pt-0.5">
            {!isLastStage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg flex-1"
                onClick={(e) => { e.stopPropagation(); onMoveToNext(app) }}
              >
                <ChevronRight className="h-3 w-3" />
                {isFil ? 'Susunod' : 'Next'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg flex-1"
              onClick={(e) => { e.stopPropagation(); onCardClick(app) }}
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
    <div className="w-[280px] shrink-0 group">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div
          className="h-3 w-3 rounded-sm shrink-0 ring-2 ring-offset-1 ring-offset-background"
          style={{ background: color, ringColor: color + '60', boxShadow: `0 0 0 2px ${color}30` }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate leading-tight">{stage.name}</h3>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {isFil ? 'Yugto' : 'Stage'} {stageIdx + 1}/{stagesLength}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] font-bold tabular-nums h-6 min-w-[24px] justify-center px-1.5 rounded-md"
          style={{
            backgroundColor: color + '14',
            color,
            borderColor: color + '30',
          }}
        >
          {apps.length}
        </Badge>
        {isFira && !stage.isDefault && stagesLength > 2 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDeleteStage(stage)}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                aria-label={isFil ? 'I-delete ang stage' : 'Delete stage'}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{isFil ? 'I-delete ang stage' : 'Delete stage'}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[280px] rounded-xl p-2 border-2 transition-all duration-200 ${
          isOver
            ? 'border-primary/60 bg-primary/[0.03] shadow-lg shadow-primary/10'
            : 'border-border/40 bg-muted/20 dark:bg-muted/5 hover:border-border/60'
        }`}
        style={{ borderLeftColor: color + '70', borderLeftWidth: '3px' }}
      >
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/30 gap-3 select-none">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ background: color + '10' }}
            >
              {isLastStage ? (
                <CheckCircle2 className="h-6 w-6" style={{ color: color + '40' }} />
              ) : (
                <Inbox className="h-6 w-6" style={{ color: color + '40' }} />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground/50">
                {isFil
                  ? isLastStage ? 'Wala pang na-deploy' : 'Walang aplikante'
                  : isLastStage ? 'No one deployed yet' : 'No applicants'}
              </p>
              <p className="text-[10px] text-muted-foreground/30 mt-0.5">
                {isFil
                  ? isLastStage ? 'I-drag ang mga aplikante dito' : 'I-drag ang mga aplikante dito'
                  : 'Drag applicants here'}
              </p>
            </div>
          </div>
        ) : (
          <SortableContext items={stageAppIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {apps.map((app: any) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <SortableApplicantCard
                    app={app}
                    stageColor={color}
                    stageIdx={stageIdx}
                    stagesLength={stagesLength}
                    isLastStage={isLastStage}
                    isFil={isFil}
                    onMoveToNext={onMoveToNext}
                    onCardClick={onCardClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
      if (!selectedJobId) return { stages: [] }
      const res = await apiFetch(`/api/ats/stages?jobOrderId=${selectedJobId}`)
      if (!res.ok) return { stages: [] }
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
      const maxOrder = stages.length
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
        body: JSON.stringify({ applicationId, newStageId: stageId, notes: moveNotes }),
      })
      if (!res.ok) throw new Error('Failed to move')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-applications'] })
      queryClient.invalidateQueries({ queryKey: ['ats-stages'] })
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
  const stages = Array.isArray(stagesData?.stages) ? stagesData.stages : []

  const isFira = user?.role === 'super_admin' || user?.role === 'staff' || user?.role === 'international_agency'
  const selectedJob = jobs.find((j: any) => j.id === selectedJobId)

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

  // Pipeline conversion rate
  const conversionRate = useMemo(() => {
    if (stages.length === 0 || applications.length === 0) return 0
    const firstStageApps = (stageMap[stages[0]?.id] || []).length
    const lastStageApps = (stageMap[stages[stages.length - 1]?.id] || []).length
    if (firstStageApps === 0) return 0
    return Math.round((lastStageApps / firstStageApps) * 100)
  }, [stages, stageMap, applications])

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

    const targetStage = stages.find((s: any) => s.id === over.id)
    if (targetStage && targetStage.id !== activeApp.currentStageId) {
      moveStageMutation.mutate({ applicationId: activeApp.id, stageId: targetStage.id })
    }
  }, [applications, stages, moveStageMutation])

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled via isOver in useSortable
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
  const activeAppStage = activeApp ? stages.find((s: any) => s.id === activeApp.currentStageId) : null
  const activeColor = activeAppStage
    ? (activeAppStage.color || stageColorPalette[stages.indexOf(activeAppStage) % stageColorPalette.length])
    : '#3b82f6'

  // ── Loading check ──────────────────────────────────────────────────────────
  const isLoading = selectedJobId && (stagesLoading || appsLoading)

  return (
    <div className="view-transition space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <Columns3 className="h-5 w-5 text-white" />
            </div>
            {isFil ? 'ATS Pipeline' : 'ATS Pipeline'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {isFil
              ? 'Subaybayan ang end-to-end recruitment at deployment pipeline'
              : 'Track the end-to-end recruitment and deployment pipeline'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFira && selectedJobId && (
            <Button size="sm" className="rounded-md gap-1.5 shadow-sm" onClick={() => setShowAddStage(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{isFil ? 'Dagdag Stage' : 'Add Stage'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Job Selector ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          {isFil ? 'Pumili ng Job Order' : 'Select Job Order'}
        </Label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-96 h-11 rounded-md">
            <SelectValue placeholder={isFil ? 'Pumili ng job order...' : 'Select a job order...'} />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j: any) => (
              <SelectItem key={j.id} value={j.id}>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {j.title} — {j.country}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedJob && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedJob.country}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{totalApplicants} {isFil ? 'aplikante' : 'applicants'}</span>
            {selectedJob.slots && (
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{selectedJob.slots - selectedJob.filledSlots} {isFil ? 'slot' : 'slots'}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Empty State: No Job Selected ────────────────────────────────── */}
      {!selectedJobId ? (
        <Card className="py-12 px-4 text-center border-dashed">
          <Columns3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">{isFil ? 'Pumili ng Job Order' : 'Select a Job Order'}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {isFil
              ? 'Pumili muna ng job order sa itaas para makita ang recruitment pipeline.'
              : 'Choose a job order above to view the recruitment pipeline and manage candidates.'}
          </p>
        </Card>
      ) : isLoading ? (
        <PipelineSkeleton />
      ) : stages.length === 0 ? (
        <Card className="py-12 px-4 text-center border-dashed">
          <CircleDot className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">{isFil ? 'Walang Stages' : 'No Stages Yet'}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {isFil
              ? 'Mag-dagdag ng stages para simulan ang pipeline at subaybayan ang mga aplikante.'
              : 'Add stages to start building your pipeline and tracking candidates.'}
          </p>
          {isFira && (
            <Button onClick={() => setShowAddStage(true)} className="rounded-xl gap-2 shadow-sm">
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
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            {/* Total Applicants */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isFil ? 'Kabuuang Aplikante' : 'Total Applicants'}</p>
                  <p className="text-xl font-bold tabular-nums">{totalApplicants}</p>
                </div>
              </div>
            </Card>
            {/* Avg Match Score */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isFil ? 'Average na Score' : 'Avg. Match Score'}</p>
                  <p className="text-xl font-bold tabular-nums">{avgMatchScore}%</p>
                </div>
              </div>
            </Card>
            {/* Conversion Rate */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isFil ? 'Conversion Rate' : 'Conversion Rate'}</p>
                  <p className="text-xl font-bold tabular-nums">{conversionRate}%</p>
                </div>
              </div>
            </Card>
            {/* Pipeline Stages */}
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-2">{isFil ? 'Funnel Overview' : 'Funnel Overview'}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {stages.map((stage: any, idx: number) => {
                  const count = (stageMap[stage.id] || []).length
                  const clr = stage.color || stageColorPalette[idx % stageColorPalette.length]
                  return (
                    <span key={stage.id} className="flex items-center gap-1 text-[11px]">
                      <span className="h-2 w-2 rounded-sm" style={{ background: clr }} />
                      <span className="font-bold tabular-nums" style={{ color: clr }}>{count}</span>
                      {idx < stages.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40" />}
                    </span>
                  )
                })}
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
                style={{ minWidth: `${Math.max(stages.length * 300, 800)}px` }}
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
                <Card className="w-72 shadow-2xl opacity-90 rotate-2">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                        style={{ background: activeColor + '20', color: activeColor }}
                      >
                        {getInitials(activeApp.applicant?.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{activeApp.applicant?.name || 'Unknown'}</p>
                        {activeApp.aiAnalysis?.matchScore != null && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 mt-0.5 ${getScoreStyle(activeApp.aiAnalysis.matchScore)}`}>
                            {Math.round(activeApp.aiAnalysis.matchScore)}%
                          </Badge>
                        )}
                      </div>
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
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {isFil ? 'Detalye ng Aplikante' : 'Applicant Details'}
                </SheetTitle>
                <SheetDescription>
                  {isFil ? 'Impormasyon at mabilisang aksyon' : 'Information and quick actions'}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
                    {getInitials(selectedApp.applicant?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg leading-tight">{selectedApp.applicant?.name || 'Unknown'}</p>
                    {selectedApp.applicant?.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />{selectedApp.applicant.email}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {selectedApp.applicant?.applicantProfile?.applicantType && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {selectedApp.applicant.applicantProfile.applicantType.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 " />
                        {formatDate(selectedApp.createdAt, isFil)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Match Score & Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{isFil ? 'AI Match Score' : 'AI Match Score'}</span>
                    {selectedApp.aiAnalysis?.matchScore != null && (
                      <span className={`text-sm font-bold tabular-nums ${
                        selectedApp.aiAnalysis.matchScore >= 80 ? 'text-green-600 dark:text-green-400'
                          : selectedApp.aiAnalysis.matchScore >= 50 ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(selectedApp.aiAnalysis.matchScore)}%
                      </span>
                    )}
                  </div>
                  {selectedApp.aiAnalysis?.matchScore != null && (
                    <Progress value={selectedApp.aiAnalysis.matchScore} className="h-2" />
                  )}
                  {selectedApp.aiAnalysis?.explanation && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedApp.aiAnalysis.explanation}
                    </p>
                  )}
                </div>

                {/* Matched / Missing Skills */}
                {(parseJsonSkills(selectedApp.aiAnalysis?.matchedSkills).length > 0 || parseJsonSkills(selectedApp.aiAnalysis?.missingSkills).length > 0) && (
                  <div className="space-y-2.5">
                    {parseJsonSkills(selectedApp.aiAnalysis?.matchedSkills).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {isFil ? 'Kinukumpirmang Kakayahan' : 'Matched Skills'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {parseJsonSkills(selectedApp.aiAnalysis?.matchedSkills).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[10px] border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {parseJsonSkills(selectedApp.aiAnalysis?.missingSkills).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {isFil ? 'Kakulangan sa Kakayahan' : 'Missing Skills'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {parseJsonSkills(selectedApp.aiAnalysis?.missingSkills).map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[10px] border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Profile Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3 w-3" />{isFil ? 'Telepono' : 'Phone'}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {selectedApp.applicant?.applicantProfile?.phone || 'N/A'}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{isFil ? 'Lokasyon' : 'Location'}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {selectedApp.applicant?.applicantProfile?.city || 'N/A'}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />{isFil ? 'Edukasyon' : 'Education'}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {selectedApp.applicant?.applicantProfile?.highestEducation || 'N/A'}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />{isFil ? 'Karanasan' : 'Experience'}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {selectedApp.applicant?.applicantProfile?.yearsExperience != null
                        ? `${selectedApp.applicant.applicantProfile.yearsExperience} ${isFil ? 'taon' : 'years'}`
                        : 'N/A'}
                    </p>
                  </Card>
                </div>

                {/* Passport Info */}
                {selectedApp.applicant?.applicantProfile?.passportNo && (
                  <Card className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <FileText className="h-3 w-3" />{isFil ? 'Pasaporte' : 'Passport'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-medium">{selectedApp.applicant.applicantProfile.passportNo}</span>
                      {selectedApp.applicant.applicantProfile.passportExpiry && (
                        <Badge variant="outline" className="text-[10px]">
                          {isFil ? 'Eksperyado' : 'Exp'}: {new Date(selectedApp.applicant.applicantProfile.passportExpiry).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    {selectedApp.applicant.applicantProfile.passportStatus && (
                      <Badge variant="secondary" className="text-[10px] mt-1.5 capitalize">
                        {selectedApp.applicant.applicantProfile.passportStatus.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </Card>
                )}

                <Separator />

                {/* Current Stage & Pipeline Progress */}
                {stages.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      {isFil ? 'Pipeline Progress' : 'Pipeline Progress'}
                    </Label>
                    {/* Stage progress bar */}
                    <div className="flex items-center gap-1">
                      {stages.map((stage: any, idx: number) => {
                        const currentIdx = stages.findIndex((s: any) => s.id === selectedApp.currentStageId)
                        const isActive = idx === currentIdx
                        const isPast = idx < currentIdx
                        const clr = stage.color || stageColorPalette[idx % stageColorPalette.length]
                        return (
                          <Tooltip key={stage.id}>
                            <TooltipTrigger asChild>
                              <div className="flex-1 flex items-center gap-0.5">
                                <div
                                  className={`h-2 flex-1 rounded-full transition-all ${
                                    isPast ? 'opacity-100' : isActive ? 'opacity-100 scale-y-125' : 'opacity-30'
                                  }`}
                                  style={{ background: isPast || isActive ? clr : undefined, backgroundColor: !(isPast || isActive) ? 'hsl(var(--muted))' : undefined }}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <span className="font-medium">{stage.name}</span>
                              {isActive && <span className="text-primary ml-1">({isFil ? 'Kasalukuyan' : 'Current'})</span>}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                    {/* Current & next stage labels */}
                    <div className="flex items-center gap-2 text-sm">
                      {(() => {
                        const currentIdx = stages.findIndex((s: any) => s.id === selectedApp.currentStageId)
                        const stage = stages[currentIdx >= 0 ? currentIdx : 0]
                        const color = stage?.color || stageColorPalette[0]
                        return (
                          <>
                            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
                            <span className="font-medium">{stage?.name || isFil ? 'Hindi alam' : 'Unknown'}</span>
                            {currentIdx >= 0 && currentIdx < stages.length - 1 && (
                              <>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{stages[currentIdx + 1]?.name}</span>
                              </>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Notes for move */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {isFil ? 'Notes (Opsyonal)' : 'Notes (Optional)'}
                  </Label>
                  <Textarea
                    value={moveNotes}
                    onChange={(e) => setMoveNotes(e.target.value)}
                    placeholder={isFil ? 'Magdagdag ng note...' : 'Add a note...'}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-1">
                  <Button className="w-full gap-2 rounded-md" onClick={handleViewProfile}>
                    <Eye className="h-4 w-4" />
                    {isFil ? 'Tingnan ang Buong Profile' : 'View Full Profile'}
                  </Button>
                  {(() => {
                    const currentIdx = stages.findIndex((s: any) => s.id === selectedApp.currentStageId)
                    const isLast = currentIdx >= stages.length - 1
                    return (
                      <Button
                        variant="outline"
                        className="w-full gap-2 rounded-md"
                        disabled={isLast || moveStageMutation.isPending}
                        onClick={handleSendToNext}
                      >
                        {moveStageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {isFil
                          ? isLast ? 'Huling Stage Na' : 'Ipadala sa Susunod na Stage'
                          : isLast ? 'Final Stage' : 'Send to Next Stage'}
                      </Button>
                    )
                  })()}
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
              <Plus className="h-5 w-5 text-primary" />
              {isFil ? 'Dagdag na Stage' : 'Add New Stage'}
            </DialogTitle>
            <DialogDescription>
              {isFil ? 'Magdagdag ng bagong proseso sa pipeline.' : 'Add a new process to the pipeline.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isFil ? 'Pangalan ng Stage' : 'Stage Name'}</Label>
              <Input
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="e.g., Medical Check"
                className="rounded-xl"
                onKeyDown={(e) => { if (e.key === 'Enter' && newStageName) addStageMutation.mutate() }}
              />
            </div>

            {/* Preset quick-pick */}
            <div>
              <Label className="text-xs text-muted-foreground">{isFil ? 'Mabilisang Pagpili (Preset)' : 'Quick Select (Preset)'}</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {presetStages.filter(s => !stages.some((st: any) => st.name === s)).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setNewStageName(preset)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      newStageName === preset
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>{isFil ? 'Kulay' : 'Color'}</Label>
              <div className="flex gap-2 flex-wrap">
                {stageColorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewStageColor(c)}
                    className={`h-8 w-8 rounded-lg border-2 transition-all hover:scale-110 ${
                      newStageColor === c
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              {/* Color preview */}
              <div className="flex items-center gap-2 mt-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: newStageColor }} />
                <span className="text-xs text-muted-foreground">
                  {newStageName || (isFil ? 'Pangalan ng stage' : 'Stage name')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddStage(false)} className="rounded-xl">
                {isFil ? 'Kanselahin' : 'Cancel'}
              </Button>
              <Button
                onClick={() => addStageMutation.mutate()}
                disabled={addStageMutation.isPending || !newStageName}
                className="rounded-xl"
              >
                {addStageMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
            <Button variant="outline" onClick={() => setDeleteConfirmStage(null)} className="rounded-xl">
              {isFil ? 'Kanselahin' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmStage && deleteStageMutation.mutate(deleteConfirmStage.id)}
              disabled={deleteStageMutation.isPending}
              className="rounded-xl"
            >
              {deleteStageMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFil ? 'I-delete' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}