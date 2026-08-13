'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/fetch'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import {
  Upload, FileText, Loader2, Plus, Trash2, ChevronLeft, ChevronRight,
  Save, User, GraduationCap, Briefcase, Globe, Award, Languages,
  Shield, Stamp, Stethoscope, FolderOpen, Users as UsersIcon, BookOpen,
  CheckCircle2, Circle, X, ArrowLeft,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ======================== TYPES ========================

interface FormData {
  // Personal
  firstName: string; middleName: string; lastName: string; suffixName: string
  gender: string; birthDate: string; birthPlace: string; nationality: string
  civilStatus: string; religion: string; height: string; weight: string
  // Address
  address: string; city: string; province: string; region: string; zipCode: string
  // Contact
  phone: string; altPhone: string; email: string
  // Emergency
  emergencyName: string; emergencyRelation: string; emergencyPhone: string
  // Type
  applicantType: string; householdTasks: string[]
  // Travel
  passportNo: string; passportExpiry: string; passportStatus: string
  hasVisa: boolean; visaCountry: string; visaType: string; visaStatus: string; visaExpiry: string
  // Medical
  medicalStatus: string; medicalExpiry: string
  // Preferences
  highestEducation: string; preferredCountry: string; preferredJob: string
  salaryExpectation: string; availabilityDate: string
  // Nested arrays
  education: EducationEntry[]; experience: ExperienceEntry[]; skills: SkillEntry[]
  languages: LanguageEntry[]; certifications: CertificationEntry[]
  references: ReferenceEntry[]; trainings: TrainingEntry[]
}

interface EducationEntry {
  id?: string; institution: string; degree: string; fieldOfStudy: string
  startYear: string; endYear: string; honors: string
}

interface ExperienceEntry {
  id?: string; company: string; position: string; country: string
  startDate: string; endDate: string; isCurrent: boolean
  description: string; monthlySalary: string; employerContact: string
}

interface SkillEntry {
  id?: string; name: string; level: string; yearsExperience: string
}

interface LanguageEntry {
  id?: string; language: string; proficiency: string
  speaking: string; reading: string; writing: string
}

interface CertificationEntry {
  id?: string; name: string; issuingBody: string
  issuedDate: string; expiryDate: string; credentialId: string
}

interface ReferenceEntry {
  id?: string; name: string; company: string; position: string
  phone: string; email: string; relationship: string; yearsKnown: string
}

interface TrainingEntry {
  id?: string; trainingName: string; institution: string
  startDate: string; endDate: string; hours: string
}

// ======================== CONSTANTS ========================

const HOUSEHOLD_TASKS = ['cooking', 'cleaning', 'laundry', 'childcare', 'elderly_care', 'gardening', 'pet_care']
const HOUSEHOLD_TASK_LABELS: Record<string, { en: string; fil: string }> = {
  cooking: { en: 'Cooking', fil: 'Pagluluto' },
  cleaning: { en: 'Cleaning', fil: 'Paglilinis' },
  laundry: { en: 'Laundry', fil: 'Paglalaba' },
  childcare: { en: 'Childcare', fil: 'Pag-aalaga ng Bata' },
  elderly_care: { en: 'Elderly Care', fil: 'Pag-aalaga ng Matanda' },
  gardening: { en: 'Gardening', fil: 'Pag-aalaga ng Halaman' },
  pet_care: { en: 'Pet Care', fil: 'Pag-aalaga ng Hayop' },
}

const GENDER_OPTIONS = ['male', 'female']
const CIVIL_STATUS_OPTIONS = ['single', 'married', 'widowed', 'separated']
const APPLICANT_TYPE_OPTIONS = ['domestic_helper', 'skills_professional']
const SKILL_LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced', 'expert']
const PROFICIENCY_OPTIONS = ['basic', 'conversational', 'intermediate', 'advanced', 'fluent', 'native']
const PASSPORT_STATUS_OPTIONS = ['valid', 'expired', 'processing', 'none']
const MEDICAL_STATUS_OPTIONS = ['passed', 'failed', 'scheduled', 'none']

const emptyFormData = (): FormData => ({
  firstName: '', middleName: '', lastName: '', suffixName: '',
  gender: '', birthDate: '', birthPlace: '', nationality: 'Filipino',
  civilStatus: '', religion: '', height: '', weight: '',
  address: '', city: '', province: '', region: '', zipCode: '',
  phone: '', altPhone: '', email: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  applicantType: 'domestic_helper', householdTasks: [],
  passportNo: '', passportExpiry: '', passportStatus: 'none',
  hasVisa: false, visaCountry: '', visaType: '', visaStatus: 'none', visaExpiry: '',
  medicalStatus: 'none', medicalExpiry: '',
  highestEducation: '', preferredCountry: '', preferredJob: '',
  salaryExpectation: '', availabilityDate: '',
  education: [], experience: [], skills: [], languages: [],
  certifications: [], references: [], trainings: [],
})

const emptyEducation = (): EducationEntry => ({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', honors: '' })
const emptyExperience = (): ExperienceEntry => ({ company: '', position: '', country: '', startDate: '', endDate: '', isCurrent: false, description: '', monthlySalary: '', employerContact: '' })
const emptySkill = (): SkillEntry => ({ name: '', level: 'intermediate', yearsExperience: '' })
const emptyLanguage = (): LanguageEntry => ({ language: '', proficiency: 'conversational', speaking: '', reading: '', writing: '' })
const emptyCertification = (): CertificationEntry => ({ name: '', issuingBody: '', issuedDate: '', expiryDate: '', credentialId: '' })
const emptyReference = (): ReferenceEntry => ({ name: '', company: '', position: '', phone: '', email: '', relationship: '', yearsKnown: '' })
const emptyTraining = (): TrainingEntry => ({ trainingName: '', institution: '', startDate: '', endDate: '', hours: '' })

// ======================== HELPERS ========================

function formatDateString(d?: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// ======================== SUB-COMPONENTS ========================

function DatePickerField({ label, value, onChange, isFil }: {
  label: string; value: string; onChange: (v: string) => void; isFil: boolean
}) {
  const [open, setOpen] = useState(false)
  const dateVal = value ? new Date(value) : undefined

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
            {dateVal ? dateVal.toLocaleDateString() : <span className="text-muted-foreground">{isFil ? 'Pumili ng petsa' : 'Pick a date'}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateVal}
            onSelect={(d) => { onChange(d ? d.toISOString().split('T')[0] : ''); setOpen(false) }}
          />
          {dateVal && (
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { onChange(''); setOpen(false) }}>
                {isFil ? 'Tanggalin' : 'Clear'}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder, required, className }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder, isFil, required }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder?: string; isFil: boolean; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-9">
          <SelectValue placeholder={placeholder || (isFil ? 'Pumili...' : 'Select...')} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, description }: {
  title: string; icon?: any; children: React.ReactNode; description?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EntryList<T extends { id?: string }>({
  entries, renderItem, onAdd, addLabel, isFil,
}: {
  entries: T[]; renderItem: (entry: T, index: number) => React.ReactNode
  onAdd: () => void; addLabel: string; isFil: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {isFil ? 'Wala pang naidagdag.' : 'No entries yet.'}
          </p>
        )}
        {entries.map((entry, i) => (
          <motion.div key={entry.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            {renderItem(entry, i)}
          </motion.div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1.5" />{addLabel}
      </Button>
    </div>
  )
}

// ======================== MAIN COMPONENT ========================

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
}

export function ApplicantProfileEditPage() {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<FormData>(emptyFormData())
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadedResume, setUploadedResume] = useState<{ fileName: string; fileSize: number } | null>(null)
  const [parseLoading, setParseLoading] = useState(false)

  // Dialog states for sub-entries
  const [eduDialog, setEduDialog] = useState<{ open: boolean; index: number; data: EducationEntry }>({ open: false, index: -1, data: emptyEducation() })
  const [expDialog, setExpDialog] = useState<{ open: boolean; index: number; data: ExperienceEntry }>({ open: false, index: -1, data: emptyExperience() })
  const [skillDialog, setSkillDialog] = useState<{ open: boolean; index: number; data: SkillEntry }>({ open: false, index: -1, data: emptySkill() })
  const [langDialog, setLangDialog] = useState<{ open: boolean; index: number; data: LanguageEntry }>({ open: false, index: -1, data: emptyLanguage() })
  const [certDialog, setCertDialog] = useState<{ open: boolean; index: number; data: CertificationEntry }>({ open: false, index: -1, data: emptyCertification() })
  const [refDialog, setRefDialog] = useState<{ open: boolean; index: number; data: ReferenceEntry }>({ open: false, index: -1, data: emptyReference() })
  const [trainDialog, setTrainDialog] = useState<{ open: boolean; index: number; data: TrainingEntry }>({ open: false, index: -1, data: emptyTraining() })

  // Load existing profile
  const { isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const res = await apiFetch(`/api/applicant-profile?userId=${user?.id}`)
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    // We get data from query cache
    const cached = queryClient.getQueryData<any>(['my-profile', user?.id])
    if (!cached?.profile) return
    const p = cached.profile
    setFormData({
      firstName: p.firstName || '', middleName: p.middleName || '', lastName: p.lastName || '', suffixName: p.suffixName || '',
      gender: p.gender || '', birthDate: formatDateString(p.birthDate), birthPlace: p.birthPlace || '', nationality: p.nationality || 'Filipino',
      civilStatus: p.civilStatus || '', religion: p.religion || '', height: p.height || '', weight: p.weight || '',
      address: p.address || '', city: p.city || '', province: p.province || '', region: p.region || '', zipCode: p.zipCode || '',
      phone: p.phone || '', altPhone: p.altPhone || '', email: p.email || '',
      emergencyName: p.emergencyName || '', emergencyRelation: p.emergencyRelation || '', emergencyPhone: p.emergencyPhone || '',
      applicantType: p.applicantType || 'domestic_helper',
      householdTasks: (() => { try { return JSON.parse(p.householdTasks || '[]') } catch { return [] } })(),
      passportNo: p.passportNo || '', passportExpiry: formatDateString(p.passportExpiry), passportStatus: p.passportStatus || 'none',
      hasVisa: p.hasVisa || false, visaCountry: p.visaCountry || '', visaType: p.visaType || '',
      visaStatus: p.visaStatus || 'none', visaExpiry: formatDateString(p.visaExpiry),
      medicalStatus: p.medicalStatus || 'none', medicalExpiry: formatDateString(p.medicalExpiry),
      highestEducation: p.highestEducation || '', preferredCountry: p.preferredCountry || '',
      preferredJob: p.preferredJob || '', salaryExpectation: p.salaryExpectation || '',
      availabilityDate: p.availabilityDate || '',
      education: (cached.education || []).map((e: any) => ({ ...e, startYear: String(e.startYear || ''), endYear: String(e.endYear || '') })),
      experience: (cached.experience || []).map((e: any) => ({ ...e, startDate: formatDateString(e.startDate), endDate: formatDateString(e.endDate) })),
      skills: (cached.skills || []).map((s: any) => ({ ...s, yearsExperience: String(s.yearsExperience || '') })),
      languages: (cached.languages || []).map((l: any) => ({ ...l })),
      certifications: (cached.certifications || []).map((c: any) => ({ ...c, issuedDate: formatDateString(c.issuedDate), expiryDate: formatDateString(c.expiryDate) })),
      references: (cached.references || []).map((r: any) => ({ ...r })),
      trainings: (cached.trainings || []).map((t: any) => ({ ...t, startDate: formatDateString(t.startDate), endDate: formatDateString(t.endDate), hours: String(t.hours || '') })),
    })
    // Check for existing resume
    const docs = cached.documents || []
    const resume = docs.find((d: any) => d.documentType === 'resume')
    if (resume) setUploadedResume({ fileName: resume.fileName, fileSize: resume.fileSize })
  }, [queryClient, user?.id])

  // Generic field updater
  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { education, experience, skills, languages, certifications, references, trainings, ...profileFields } = data
      const payload = {
        userId: user?.id,
        ...profileFields,
        householdTasks: JSON.stringify(data.householdTasks),
        education: education.map(({ id, ...rest }: any) => ({ ...rest, startYear: Number(rest.startYear) || 0, endYear: Number(rest.endYear) || 0 })),
        experience: experience.map(({ id, ...rest }: any) => rest),
        skills: skills.map(({ id, ...rest }: any) => ({ ...rest, yearsExperience: Number(rest.yearsExperience) || 0 })),
        languages: languages.map(({ id, ...rest }: any) => rest),
        certifications: certifications.map(({ id, ...rest }: any) => rest),
        references: references.map(({ id, ...rest }: any) => rest),
        trainings: trainings.map(({ id, ...rest }: any) => ({ ...rest, hours: Number(rest.hours) || 0 })),
      }
      const res = await apiFetch('/api/applicant-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed') }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile', user?.id] })
      toast.success(isFil ? 'Na-save na ang profile!' : 'Profile saved!')
    },
    onError: (err: any) => toast.error(err.message),
  })

  // Upload resume
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const res = await apiFetch('/api/resume/upload', { method: 'POST', body: form })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed') }
      return res.json()
    },
    onSuccess: (data) => {
      setUploadedResume({ fileName: data.fileName, fileSize: data.fileSize })
      toast.success(isFil ? 'Na-upload na ang resume!' : 'Resume uploaded!')
    },
    onError: (err: any) => toast.error(err.message),
  })

  // Parse resume
  const parseResume = async () => {
    if (!user?.id) return
    setParseLoading(true)
    try {
      const res = await apiFetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Parse failed')
      const ex = data.extracted || {}
      if (ex.firstName || ex.lastName) {
        setFormData((prev) => ({
          ...prev,
          firstName: ex.firstName || prev.firstName,
          middleName: ex.middleName || prev.middleName,
          lastName: ex.lastName || prev.lastName,
          email: ex.email || prev.email,
          phone: ex.phone || prev.phone,
          address: ex.address || prev.address,
          education: ex.education?.length ? ex.education.map((e: any) => ({ ...emptyEducation(), ...e, startYear: String(e.startYear || ''), endYear: String(e.endYear || '') })) : prev.education,
          experience: ex.experience?.length ? ex.experience.map((e: any) => ({ ...emptyExperience(), ...e, startDate: e.startDate || '', endDate: e.endDate || '' })) : prev.experience,
          skills: ex.skills?.length ? ex.skills.map((s: any) => ({ ...emptySkill(), ...s })) : prev.skills,
          languages: ex.languages?.length ? ex.languages.map((l: any) => ({ ...emptyLanguage(), ...l })) : prev.languages,
          certifications: ex.certifications?.length ? ex.certifications.map((c: any) => ({ ...emptyCertification(), ...c })) : prev.certifications,
        }))
        toast.success(isFil ? 'Na-parse na ang resume! Tinignan ang mga field.' : 'Resume parsed! Check the fields below.')
      } else {
        toast.info(isFil ? 'Hindi makuha ang data. Subukan ulit.' : 'Could not extract data. Try again.')
      }
    } catch (err: any) {
      toast.error(err.message || (isFil ? 'Hindi na-parse ang resume' : 'Failed to parse resume'))
    } finally {
      setParseLoading(false)
    }
  }

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 4)) }
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)) }

  const handleSave = async (gotoProfile = false) => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error(isFil ? 'Kailangan ang pangalan at apelyido.' : 'First name and last name are required.')
      return
    }
    try {
      await saveMutation.mutateAsync(formData)
      toast.success(isFil ? 'Na-save na ang profile!' : 'Profile saved!')
      if (gotoProfile) navigate('applicant-profile')
    } catch (err: any) {
      toast.error(err.message || (isFil ? 'Hindi na-save' : 'Save failed'))
    }
  }

  // File drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        toast.error(isFil ? 'Hindi suportado ang file type. Gumamit ng PDF, DOC, o DOCX.' : 'Invalid file type. Use PDF, DOC, or DOCX.')
        return
      }
      setResumeFile(file)
      uploadMutation.mutate(file)
    }
  }, [uploadMutation, isFil])

  // ======================== STEPS ========================

  const STEPS = isFil
    ? ['Resume & Personal', 'Edukasyon & Karanasan', 'Kasanayan & Wika', 'Pasaporte & Medikal', 'Dokumento & Reference']
    : ['Resume & Personal', 'Education & Experience', 'Skills & Languages', 'Travel & Medical', 'Documents & References']

  const STEP_ICONS = [User, GraduationCap, Award, Shield, FolderOpen]

  if (profileLoading) return <div className="space-y-4"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>

  // ======================== STEP 1 ========================
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Resume Upload */}
      <SectionCard title={isFil ? 'Resume Upload' : 'Resume Upload'} icon={Upload} description={isFil ? 'I-upload ang iyong resume (PDF, DOC, DOCX) at i-parse para makuha ang impormasyon.' : 'Upload your resume (PDF, DOC, DOCX) and parse to extract information.'}>
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setResumeFile(f); uploadMutation.mutate(f) }
            }}
          />
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">{isFil ? 'Uploading...' : 'Uploading...'}</p></div>
          ) : uploadedResume ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-emerald-600" />
              <p className="text-sm font-medium">{uploadedResume.fileName}</p>
              <p className="text-xs text-muted-foreground">{(uploadedResume.fileSize / 1024).toFixed(1)} KB</p>
              <Button type="button" variant="link" size="sm" className="text-xs">{isFil ? 'Palitan' : 'Replace'}</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">{isFil ? 'I-drag ang file dito o mag-click para mag-browse' : 'Drag file here or click to browse'}</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 10MB)</p>
            </div>
          )}
        </div>
        {uploadedResume && (
          <Button
            type="button" variant="outline" className="w-full mt-2" onClick={parseResume} disabled={parseLoading}
          >
            {parseLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isFil ? 'I-parse ang Resume' : 'Parse Resume'}
          </Button>
        )}
      </SectionCard>

      {/* Personal Info */}
      <SectionCard title={isFil ? 'Personal na Impormasyon' : 'Personal Information'} icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label={isFil ? 'Pangalan' : 'First Name'} value={formData.firstName} onChange={(v) => updateField('firstName', v)} required />
          <FormField label={isFil ? 'Panggitna' : 'Middle Name'} value={formData.middleName} onChange={(v) => updateField('middleName', v)} />
          <FormField label={isFil ? 'Apelyido' : 'Last Name'} value={formData.lastName} onChange={(v) => updateField('lastName', v)} required />
          <FormField label={isFil ? 'Suffix' : 'Suffix'} value={formData.suffixName} onChange={(v) => updateField('suffixName', v)} />
          <SelectField
            label={isFil ? 'Kasarian' : 'Gender'} value={formData.gender} onChange={(v) => updateField('gender', v)}
            options={GENDER_OPTIONS.map(g => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))} isFil={isFil}
          />
          <DatePickerField label={isFil ? 'Petsa ng Kapanganakan' : 'Birth Date'} value={formData.birthDate} onChange={(v) => updateField('birthDate', v)} isFil={isFil} />
          <FormField label={isFil ? 'Lugar ng Kapanganakan' : 'Birth Place'} value={formData.birthPlace} onChange={(v) => updateField('birthPlace', v)} />
          <FormField label={isFil ? 'Nasyonalidad' : 'Nationality'} value={formData.nationality} onChange={(v) => updateField('nationality', v)} />
          <SelectField
            label={isFil ? 'Status Sibil' : 'Civil Status'} value={formData.civilStatus} onChange={(v) => updateField('civilStatus', v)}
            options={CIVIL_STATUS_OPTIONS.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} isFil={isFil}
          />
          <FormField label={isFil ? 'Relihiyon' : 'Religion'} value={formData.religion} onChange={(v) => updateField('religion', v)} />
          <FormField label={isFil ? 'Taas (cm)' : 'Height (cm)'} value={formData.height} onChange={(v) => updateField('height', v)} type="number" />
          <FormField label={isFil ? 'Bigat (kg)' : 'Weight (kg)'} value={formData.weight} onChange={(v) => updateField('weight', v)} type="number" />
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title={isFil ? 'Address' : 'Address'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2 md:col-span-3">
            <FormField label={isFil ? 'Address' : 'Address'} value={formData.address} onChange={(v) => updateField('address', v)} />
          </div>
          <FormField label={isFil ? 'Lungsod' : 'City'} value={formData.city} onChange={(v) => updateField('city', v)} />
          <FormField label={isFil ? 'Probinsya' : 'Province'} value={formData.province} onChange={(v) => updateField('province', v)} />
          <FormField label={isFil ? 'Rehiyon' : 'Region'} value={formData.region} onChange={(v) => updateField('region', v)} />
          <FormField label={isFil ? 'Zip Code' : 'Zip Code'} value={formData.zipCode} onChange={(v) => updateField('zipCode', v)} />
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard title={isFil ? 'Kontak' : 'Contact'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label={isFil ? 'Telepono' : 'Phone'} value={formData.phone} onChange={(v) => updateField('phone', v)} type="tel" />
          <FormField label={isFil ? 'Alt. Telepono' : 'Alt. Phone'} value={formData.altPhone} onChange={(v) => updateField('altPhone', v)} type="tel" />
          <FormField label="Email" value={formData.email} onChange={(v) => updateField('email', v)} type="email" />
        </div>
      </SectionCard>

      {/* Emergency Contact */}
      <SectionCard title={isFil ? 'Emergency Contact' : 'Emergency Contact'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label={isFil ? 'Pangalan' : 'Name'} value={formData.emergencyName} onChange={(v) => updateField('emergencyName', v)} />
          <FormField label={isFil ? 'Relasyon' : 'Relation'} value={formData.emergencyRelation} onChange={(v) => updateField('emergencyRelation', v)} />
          <FormField label={isFil ? 'Telepono' : 'Phone'} value={formData.emergencyPhone} onChange={(v) => updateField('emergencyPhone', v)} type="tel" />
        </div>
      </SectionCard>

      {/* Applicant Type */}
      <SectionCard title={isFil ? 'Uri ng Aplikante' : 'Applicant Type'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label={isFil ? 'Uri' : 'Type'} value={formData.applicantType} onChange={(v) => updateField('applicantType', v)}
            options={APPLICANT_TYPE_OPTIONS.map(t => ({ value: t, label: t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))} isFil={isFil}
          />
        </div>
        {formData.applicantType === 'domestic_helper' && (
          <div className="mt-4">
            <Label className="text-xs font-medium mb-2 block">{isFil ? 'Mga Gawain sa Bahay' : 'Household Tasks'}</Label>
            <div className="flex flex-wrap gap-2">
              {HOUSEHOLD_TASKS.map((task) => {
                const active = formData.householdTasks.includes(task)
                const labels = HOUSEHOLD_TASK_LABELS[task]
                return (
                  <Badge
                    key={task} variant={active ? 'default' : 'outline'}
                    className={cn('cursor-pointer select-none px-3 py-1.5 text-sm transition-colors', active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        householdTasks: active ? prev.householdTasks.filter(t => t !== task) : [...prev.householdTasks, task],
                      }))
                    }}
                  >
                    {active && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {isFil ? labels.fil : labels.en}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )

  // ======================== STEP 2 ========================
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Education */}
      <SectionCard title={isFil ? 'Edukasyon' : 'Education'} icon={GraduationCap}>
        <EntryList
          entries={formData.education} isFil={isFil}
          addLabel={isFil ? 'Dagdag Edukasyon' : 'Add Education'}
          onAdd={() => setEduDialog({ open: true, index: -1, data: emptyEducation() })}
          renderItem={(entry, i) => (
            <div className="flex items-start justify-between p-3 rounded-lg border gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.degree}{entry.fieldOfStudy ? ` in ${entry.fieldOfStudy}` : ''}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.institution}</p>
                <p className="text-xs text-muted-foreground">{entry.startYear} - {entry.endYear}{entry.honors ? ` • ${entry.honors}` : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEduDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, education: p.education.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Experience */}
      <SectionCard title={isFil ? 'Karanasan' : 'Experience'} icon={Briefcase}>
        <EntryList
          entries={formData.experience} isFil={isFil}
          addLabel={isFil ? 'Dagdag Karanasan' : 'Add Experience'}
          onAdd={() => setExpDialog({ open: true, index: -1, data: emptyExperience() })}
          renderItem={(entry, i) => (
            <div className="flex items-start justify-between p-3 rounded-lg border gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{entry.position}</p>
                  {entry.isCurrent && <Badge variant="outline" className="text-xs text-emerald-600 shrink-0">{isFil ? 'Kasalukuyan' : 'Current'}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{entry.company}{entry.country ? ` • ${entry.country}` : ''}</p>
                <p className="text-xs text-muted-foreground">{entry.startDate ? new Date(entry.startDate).toLocaleDateString() : ''} - {entry.endDate ? new Date(entry.endDate).toLocaleDateString() : (isFil ? 'Kasalukuyan' : 'Present')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Education Dialog */}
      <Dialog open={eduDialog.open} onOpenChange={(o) => setEduDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isFil ? 'Edukasyon' : 'Education'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><FormField label={isFil ? 'Institusyon' : 'Institution'} value={eduDialog.data.institution} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, institution: v } }))} required /></div>
            <FormField label={isFil ? 'Degree' : 'Degree'} value={eduDialog.data.degree} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, degree: v } }))} required />
            <FormField label={isFil ? 'Field of Study' : 'Field of Study'} value={eduDialog.data.fieldOfStudy} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, fieldOfStudy: v } }))} />
            <FormField label={isFil ? 'Simula' : 'Start Year'} value={eduDialog.data.startYear} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, startYear: v } }))} type="number" placeholder="2020" />
            <FormField label={isFil ? 'Tapos' : 'End Year'} value={eduDialog.data.endYear} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, endYear: v } }))} type="number" placeholder="2024" />
            <div className="sm:col-span-2"><FormField label={isFil ? 'Parangal' : 'Honors'} value={eduDialog.data.honors} onChange={(v) => setEduDialog(d => ({ ...d, data: { ...d.data, honors: v } }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEduDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!eduDialog.data.institution || !eduDialog.data.degree) { toast.error(isFil ? 'Kailangan ang institusyon at degree.' : 'Institution and degree are required.'); return }
              setFormData(prev => {
                const copy = [...prev.education]
                if (eduDialog.index >= 0) copy[eduDialog.index] = eduDialog.data
                else copy.push(eduDialog.data)
                return { ...prev, education: copy }
              })
              setEduDialog(d => ({ ...d, open: false }))
            }}>{isFil ? 'Save' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={expDialog.open} onOpenChange={(o) => setExpDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isFil ? 'Karanasan' : 'Experience'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <FormField label={isFil ? 'Kumpanya' : 'Company'} value={expDialog.data.company} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, company: v } }))} required />
            <FormField label={isFil ? 'Posisyon' : 'Position'} value={expDialog.data.position} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, position: v } }))} required />
            <FormField label={isFil ? 'Bansa' : 'Country'} value={expDialog.data.country} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, country: v } }))} />
            <DatePickerField label={isFil ? 'Petsa ng Simula' : 'Start Date'} value={expDialog.data.startDate} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, startDate: v } }))} isFil={isFil} />
            <DatePickerField label={isFil ? 'Petsa ng Katapusan' : 'End Date'} value={expDialog.data.endDate} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, endDate: v } }))} isFil={isFil} />
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={expDialog.data.isCurrent} onCheckedChange={(c) => setExpDialog(d => ({ ...d, data: { ...d.data, isCurrent: c } }))} />
              <Label className="text-sm">{isFil ? 'Kasalukuyan pa rin' : 'Currently working here'}</Label>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium">{isFil ? 'Deskripsyon' : 'Description'}</Label>
              <Textarea
                value={expDialog.data.description}
                onChange={(e) => setExpDialog(d => ({ ...d, data: { ...d.data, description: e.target.value } }))}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <FormField label={isFil ? 'Buwanang Sahod' : 'Monthly Salary'} value={expDialog.data.monthlySalary} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, monthlySalary: v } }))} />
            <FormField label={isFil ? 'Kontak ng Empleyado' : 'Employer Contact'} value={expDialog.data.employerContact} onChange={(v) => setExpDialog(d => ({ ...d, data: { ...d.data, employerContact: v } }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!expDialog.data.company || !expDialog.data.position) { toast.error(isFil ? 'Kailangan ang kumpanya at posisyon.' : 'Company and position are required.'); return }
              setFormData(prev => {
                const copy = [...prev.experience]
                if (expDialog.index >= 0) copy[expDialog.index] = expDialog.data
                else copy.push(expDialog.data)
                return { ...prev, experience: copy }
              })
              setExpDialog(d => ({ ...d, open: false }))
            }}>{isFil ? 'Save' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ======================== STEP 3 ========================
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Skills */}
      <SectionCard title={isFil ? 'Mga Kasanayan' : 'Skills'} icon={Award}>
        <EntryList
          entries={formData.skills} isFil={isFil}
          addLabel={isFil ? 'Dagdag Kasanayan' : 'Add Skill'}
          onAdd={() => setSkillDialog({ open: true, index: -1, data: emptySkill() })}
          renderItem={(entry, i) => (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">{entry.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{entry.level}{entry.yearsExperience ? ` • ${entry.yearsExperience} yrs` : ''}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSkillDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Languages */}
      <SectionCard title={isFil ? 'Mga Wika' : 'Languages'} icon={Languages}>
        <EntryList
          entries={formData.languages} isFil={isFil}
          addLabel={isFil ? 'Dagdag Wika' : 'Add Language'}
          onAdd={() => setLangDialog({ open: true, index: -1, data: emptyLanguage() })}
          renderItem={(entry, i) => (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">{entry.language}</p>
                <p className="text-xs text-muted-foreground capitalize">{entry.proficiency}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setLangDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, languages: p.languages.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Certifications */}
      <SectionCard title={isFil ? 'Mga Sertipikasyon' : 'Certifications'} icon={BookOpen}>
        <EntryList
          entries={formData.certifications} isFil={isFil}
          addLabel={isFil ? 'Dagdag Sertipikasyon' : 'Add Certification'}
          onAdd={() => setCertDialog({ open: true, index: -1, data: emptyCertification() })}
          renderItem={(entry, i) => (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.issuingBody}{entry.issuedDate ? ` • ${new Date(entry.issuedDate).getFullYear()}` : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setCertDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, certifications: p.certifications.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Skill Dialog */}
      <Dialog open={skillDialog.open} onOpenChange={(o) => setSkillDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isFil ? 'Kasanayan' : 'Skill'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={isFil ? 'Pangalan' : 'Name'} value={skillDialog.data.name} onChange={(v) => setSkillDialog(d => ({ ...d, data: { ...d.data, name: v } }))} required />
            <SelectField label={isFil ? 'Antas' : 'Level'} value={skillDialog.data.level} onChange={(v) => setSkillDialog(d => ({ ...d, data: { ...d.data, level: v } }))} options={SKILL_LEVEL_OPTIONS.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))} isFil={isFil} />
            <FormField label={isFil ? 'Taon ng Karanasan' : 'Years of Experience'} value={skillDialog.data.yearsExperience} onChange={(v) => setSkillDialog(d => ({ ...d, data: { ...d.data, yearsExperience: v } }))} type="number" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!skillDialog.data.name) { toast.error(isFil ? 'Kailangan ang pangalan.' : 'Name is required.'); return }
              setFormData(prev => {
                const copy = [...prev.skills]
                if (skillDialog.index >= 0) copy[skillDialog.index] = skillDialog.data
                else copy.push(skillDialog.data)
                return { ...prev, skills: copy }
              })
              setSkillDialog(d => ({ ...d, open: false }))
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={langDialog.open} onOpenChange={(o) => setLangDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isFil ? 'Wika' : 'Language'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={isFil ? 'Wika' : 'Language'} value={langDialog.data.language} onChange={(v) => setLangDialog(d => ({ ...d, data: { ...d.data, language: v } }))} required />
            <SelectField label={isFil ? 'Pamantayan' : 'Proficiency'} value={langDialog.data.proficiency} onChange={(v) => setLangDialog(d => ({ ...d, data: { ...d.data, proficiency: v } }))} options={PROFICIENCY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))} isFil={isFil} />
            <SelectField label={isFil ? 'Pag-sasalita' : 'Speaking'} value={langDialog.data.speaking} onChange={(v) => setLangDialog(d => ({ ...d, data: { ...d.data, speaking: v } }))} options={[{ value: '', label: isFil ? '—' : '—' }, ...PROFICIENCY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))]} isFil={isFil} />
            <SelectField label={isFil ? 'Pagbabasa' : 'Reading'} value={langDialog.data.reading} onChange={(v) => setLangDialog(d => ({ ...d, data: { ...d.data, reading: v } }))} options={[{ value: '', label: isFil ? '—' : '—' }, ...PROFICIENCY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))]} isFil={isFil} />
            <SelectField label={isFil ? 'Pagsusulat' : 'Writing'} value={langDialog.data.writing} onChange={(v) => setLangDialog(d => ({ ...d, data: { ...d.data, writing: v } }))} options={[{ value: '', label: isFil ? '—' : '—' }, ...PROFICIENCY_OPTIONS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))]} isFil={isFil} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLangDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!langDialog.data.language) { toast.error(isFil ? 'Kailangan ang wika.' : 'Language is required.'); return }
              setFormData(prev => {
                const copy = [...prev.languages]
                if (langDialog.index >= 0) copy[langDialog.index] = langDialog.data
                else copy.push(langDialog.data)
                return { ...prev, languages: copy }
              })
              setLangDialog(d => ({ ...d, open: false }))
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={certDialog.open} onOpenChange={(o) => setCertDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isFil ? 'Sertipikasyon' : 'Certification'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><FormField label={isFil ? 'Pangalan' : 'Name'} value={certDialog.data.name} onChange={(v) => setCertDialog(d => ({ ...d, data: { ...d.data, name: v } }))} required /></div>
            <div className="sm:col-span-2"><FormField label={isFil ? 'Nag-isyu' : 'Issuing Body'} value={certDialog.data.issuingBody} onChange={(v) => setCertDialog(d => ({ ...d, data: { ...d.data, issuingBody: v } }))} /></div>
            <DatePickerField label={isFil ? 'Petsa ng Pag-isyu' : 'Issued Date'} value={certDialog.data.issuedDate} onChange={(v) => setCertDialog(d => ({ ...d, data: { ...d.data, issuedDate: v } }))} isFil={isFil} />
            <DatePickerField label={isFil ? 'Petsa ng Expiry' : 'Expiry Date'} value={certDialog.data.expiryDate} onChange={(v) => setCertDialog(d => ({ ...d, data: { ...d.data, expiryDate: v } }))} isFil={isFil} />
            <div className="sm:col-span-2"><FormField label={isFil ? 'Credential ID' : 'Credential ID'} value={certDialog.data.credentialId} onChange={(v) => setCertDialog(d => ({ ...d, data: { ...d.data, credentialId: v } }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!certDialog.data.name) { toast.error(isFil ? 'Kailangan ang pangalan.' : 'Name is required.'); return }
              setFormData(prev => {
                const copy = [...prev.certifications]
                if (certDialog.index >= 0) copy[certDialog.index] = certDialog.data
                else copy.push(certDialog.data)
                return { ...prev, certifications: copy }
              })
              setCertDialog(d => ({ ...d, open: false }))
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ======================== STEP 4 ========================
  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Passport */}
      <SectionCard title={isFil ? 'Pasaporte' : 'Passport'} icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label={isFil ? 'Passport No.' : 'Passport No.'} value={formData.passportNo} onChange={(v) => updateField('passportNo', v)} />
          <DatePickerField label={isFil ? 'Expiry Date' : 'Expiry Date'} value={formData.passportExpiry} onChange={(v) => updateField('passportExpiry', v)} isFil={isFil} />
          <SelectField label={isFil ? 'Status' : 'Status'} value={formData.passportStatus} onChange={(v) => updateField('passportStatus', v)} options={PASSPORT_STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} isFil={isFil} />
        </div>
      </SectionCard>

      {/* Visa */}
      <SectionCard title="Visa" icon={Stamp}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={formData.hasVisa} onCheckedChange={(c) => updateField('hasVisa', c)} />
            <Label className="text-sm font-medium">{isFil ? 'Mayroon akong Visa' : 'I have a Visa'}</Label>
          </div>
          {formData.hasVisa && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormField label={isFil ? 'Bansa' : 'Country'} value={formData.visaCountry} onChange={(v) => updateField('visaCountry', v)} />
              <FormField label={isFil ? 'Uri' : 'Type'} value={formData.visaType} onChange={(v) => updateField('visaType', v)} />
              <SelectField label={isFil ? 'Status' : 'Status'} value={formData.visaStatus} onChange={(v) => updateField('visaStatus', v)} options={PASSPORT_STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} isFil={isFil} />
              <DatePickerField label={isFil ? 'Expiry Date' : 'Expiry Date'} value={formData.visaExpiry} onChange={(v) => updateField('visaExpiry', v)} isFil={isFil} />
            </motion.div>
          )}
        </div>
      </SectionCard>

      {/* Medical */}
      <SectionCard title={isFil ? 'Medikal' : 'Medical'} icon={Stethoscope}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <SelectField label={isFil ? 'Status' : 'Status'} value={formData.medicalStatus} onChange={(v) => updateField('medicalStatus', v)} options={MEDICAL_STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} isFil={isFil} />
          <DatePickerField label={isFil ? 'Expiry Date' : 'Expiry Date'} value={formData.medicalExpiry} onChange={(v) => updateField('medicalExpiry', v)} isFil={isFil} />
        </div>
      </SectionCard>

      {/* Preferences */}
      <SectionCard title={isFil ? 'Mga Gusto' : 'Preferences'} icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label={isFil ? 'Pinakamataas na Edukasyon' : 'Highest Education'} value={formData.highestEducation} onChange={(v) => updateField('highestEducation', v)} />
          <FormField label={isFil ? 'Piniling Bansa' : 'Preferred Country'} value={formData.preferredCountry} onChange={(v) => updateField('preferredCountry', v)} />
          <FormField label={isFil ? 'Piniling Trabaho' : 'Preferred Job'} value={formData.preferredJob} onChange={(v) => updateField('preferredJob', v)} />
          <FormField label={isFil ? 'Inaasahang Sahod' : 'Salary Expectation'} value={formData.salaryExpectation} onChange={(v) => updateField('salaryExpectation', v)} />
          <DatePickerField label={isFil ? 'Petsa ng Kailability' : 'Availability Date'} value={formData.availabilityDate} onChange={(v) => updateField('availabilityDate', v)} isFil={isFil} />
        </div>
      </SectionCard>
    </div>
  )

  // ======================== STEP 5 ========================
  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Documents (read-only list from server) */}
      <SectionCard title={isFil ? 'Mga Dokumento' : 'Documents'} icon={FolderOpen} description={isFil ? 'Ang mga dokumento ay pinamamahalaan ng FIRA. Ang verification status ay read-only.' : 'Documents are managed by FIRA. Verification status is read-only.'}>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {uploadedResume && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{uploadedResume.fileName}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedResume.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Resume</Badge>
            </div>
          )}
          {!uploadedResume && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isFil ? 'Wala pang na-upload na dokumento.' : 'No documents uploaded.'}
            </p>
          )}
        </div>
      </SectionCard>

      {/* References */}
      <SectionCard title={isFil ? 'Mga Reference' : 'References'} icon={UsersIcon}>
        <EntryList
          entries={formData.references} isFil={isFil}
          addLabel={isFil ? 'Dagdag Reference' : 'Add Reference'}
          onAdd={() => setRefDialog({ open: true, index: -1, data: emptyReference() })}
          renderItem={(entry, i) => (
            <div className="flex items-start justify-between p-3 rounded-lg border gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.position}{entry.company ? ` at ${entry.company}` : ''}</p>
                <p className="text-xs text-muted-foreground">{entry.relationship}{entry.yearsKnown ? ` • ${entry.yearsKnown} yrs` : ''}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setRefDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, references: p.references.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Trainings */}
      <SectionCard title={isFil ? 'Mga Pagsasanay' : 'Trainings'} icon={BookOpen}>
        <EntryList
          entries={formData.trainings} isFil={isFil}
          addLabel={isFil ? 'Dagdag Pagsasanay' : 'Add Training'}
          onAdd={() => setTrainDialog({ open: true, index: -1, data: emptyTraining() })}
          renderItem={(entry, i) => (
            <div className="flex items-start justify-between p-3 rounded-lg border gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.trainingName}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : ''}
                  {entry.startDate && entry.endDate ? ' - ' : ''}
                  {entry.endDate ? new Date(entry.endDate).toLocaleDateString() : ''}
                  {entry.hours ? ` • ${entry.hours} hrs` : ''}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setTrainDialog({ open: true, index: i, data: entry })}><Upload className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setFormData(p => ({ ...p, trainings: p.trainings.filter((_, j) => j !== i) }))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        />
      </SectionCard>

      {/* Reference Dialog */}
      <Dialog open={refDialog.open} onOpenChange={(o) => setRefDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isFil ? 'Reference' : 'Reference'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <FormField label={isFil ? 'Pangalan' : 'Name'} value={refDialog.data.name} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, name: v } }))} required />
            <FormField label={isFil ? 'Kumpanya' : 'Company'} value={refDialog.data.company} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, company: v } }))} />
            <FormField label={isFil ? 'Posisyon' : 'Position'} value={refDialog.data.position} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, position: v } }))} />
            <FormField label={isFil ? 'Telepono' : 'Phone'} value={refDialog.data.phone} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, phone: v } }))} type="tel" />
            <FormField label="Email" value={refDialog.data.email} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, email: v } }))} type="email" />
            <FormField label={isFil ? 'Relasyon' : 'Relationship'} value={refDialog.data.relationship} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, relationship: v } }))} />
            <FormField label={isFil ? 'Taong Kilala' : 'Years Known'} value={refDialog.data.yearsKnown} onChange={(v) => setRefDialog(d => ({ ...d, data: { ...d.data, yearsKnown: v } }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!refDialog.data.name) { toast.error(isFil ? 'Kailangan ang pangalan.' : 'Name is required.'); return }
              setFormData(prev => {
                const copy = [...prev.references]
                if (refDialog.index >= 0) copy[refDialog.index] = refDialog.data
                else copy.push(refDialog.data)
                return { ...prev, references: copy }
              })
              setRefDialog(d => ({ ...d, open: false }))
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={trainDialog.open} onOpenChange={(o) => setTrainDialog(d => ({ ...d, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{isFil ? 'Pagsasanay' : 'Training'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><FormField label={isFil ? 'Pangalan ng Pagsasanay' : 'Training Name'} value={trainDialog.data.trainingName} onChange={(v) => setTrainDialog(d => ({ ...d, data: { ...d.data, trainingName: v } }))} required /></div>
            <div className="sm:col-span-2"><FormField label={isFil ? 'Institusyon' : 'Institution'} value={trainDialog.data.institution} onChange={(v) => setTrainDialog(d => ({ ...d, data: { ...d.data, institution: v } }))} /></div>
            <DatePickerField label={isFil ? 'Petsa ng Simula' : 'Start Date'} value={trainDialog.data.startDate} onChange={(v) => setTrainDialog(d => ({ ...d, data: { ...d.data, startDate: v } }))} isFil={isFil} />
            <DatePickerField label={isFil ? 'Petsa ng Katapusan' : 'End Date'} value={trainDialog.data.endDate} onChange={(v) => setTrainDialog(d => ({ ...d, data: { ...d.data, endDate: v } }))} isFil={isFil} />
            <FormField label={isFil ? 'Oras (oras)' : 'Hours'} value={trainDialog.data.hours} onChange={(v) => setTrainDialog(d => ({ ...d, data: { ...d.data, hours: v } }))} type="number" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrainDialog(d => ({ ...d, open: false }))}>{isFil ? 'Kanselahin' : 'Cancel'}</Button>
            <Button onClick={() => {
              if (!trainDialog.data.trainingName) { toast.error(isFil ? 'Kailangan ang pangalan.' : 'Training name is required.'); return }
              setFormData(prev => {
                const copy = [...prev.trainings]
                if (trainDialog.index >= 0) copy[trainDialog.index] = trainDialog.data
                else copy.push(trainDialog.data)
                return { ...prev, trainings: copy }
              })
              setTrainDialog(d => ({ ...d, open: false }))
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5]

  return (
    <div className="view-transition space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate('applicant-profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isFil ? 'I-edit ang Profile' : 'Edit Profile'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFil ? 'Hakbang {step + 1} ng 5' : 'Step {step + 1} of 5'}
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => {
            const Icon = STEP_ICONS[i]
            const isActive = i === step
            const isDone = i < step
            return (
              <button
                key={i} onClick={() => { setDirection(i > step ? 1 : -1); setStep(i) }}
                className="flex flex-col items-center gap-1.5 flex-1 group"
              >
                <div className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200',
                  isActive ? 'border-primary bg-primary text-primary-foreground scale-110' :
                  isDone ? 'border-primary bg-primary/10 text-primary' :
                  'border-muted-foreground/30 text-muted-foreground'
                )}>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  'text-[10px] sm:text-xs font-medium text-center leading-tight hidden sm:block',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
        {/* Progress bar */}
        <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-muted-foreground/20 -z-10">
          <motion.div className="h-full bg-primary" animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {stepRenderers[step]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-4xl mx-auto pt-4 pb-8">
        <Button variant="outline" onClick={goBack} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" />{isFil ? 'Bumalik' : 'Back'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {isFil ? 'I-save' : 'Save'}
          </Button>
          {step < 4 ? (
            <Button onClick={goNext}>
              {isFil ? 'Ipatuloy' : 'Continue'}<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => handleSave(true)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {isFil ? 'I-save ang Profile' : 'Save Profile'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
