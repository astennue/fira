'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/fetch'
import { useAppStore } from '@/store/app-store'
import { getStatusLabel, getStatusColor, getNextStatuses } from '@/lib/status'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Wrench,
  Globe,
  Award,
  BookOpen,
  FileText,
  UserCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Helper: format date safely ─────────────────────────────────────────────
function fmtDate(d: string | null | undefined, fmtStr = 'MMM d, yyyy'): string {
  if (!d) return '—'
  try { return format(new Date(d), fmtStr) } catch { return '—' }
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl lg:col-span-1" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

// ─── Section Card wrapper ────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, className = '' }: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

// ─── Info Row for personal info grid ─────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyList({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground py-2">{message}</p>
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function FiraApplicantDetailPage() {
  const { viewParams, navigate, language, user } = useAppStore()
  const queryClient = useQueryClient()
  const isFil = language === 'fil'
  const userId = viewParams.userId

  // Fetch profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['applicant-profile', userId],
    queryFn: async () => {
      const res = await apiFetch(`/api/applicant-profile?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to load profile')
      return res.json()
    },
    enabled: !!userId,
  })

  // Fetch applications
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applicant-applications', userId],
    queryFn: async () => {
      const res = await apiFetch(`/api/applications?applicantId=${userId}`)
      if (!res.ok) return { applications: [] }
      return res.json()
    },
    enabled: !!userId,
  })

  // Status change mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const res = await apiFetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'Failed to update status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-applications', userId] })
      toast.success(isFil ? 'Na-update na ang status!' : 'Status updated successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const profile = profileData?.profile
  const education = Array.isArray(profileData?.education) ? profileData.education : []
  const experience = Array.isArray(profileData?.experience) ? profileData.experience : []
  const skills = Array.isArray(profileData?.skills) ? profileData.skills : []
  const languages = Array.isArray(profileData?.languages) ? profileData.languages : []
  const certifications = Array.isArray(profileData?.certifications) ? profileData.certifications : []
  const trainings = Array.isArray(profileData?.trainings) ? profileData.trainings : []
  const documents = Array.isArray(profileData?.documents) ? profileData.documents : []
  const applications = Array.isArray(appsData?.applications) ? appsData.applications : []

  const fullName = profile
    ? [profile.firstName, profile.middleName, profile.lastName, profile.suffixName].filter(Boolean).join(' ')
    : userId || '—'

  const isLoading = profileLoading || appsLoading

  if (isLoading) return <DetailSkeleton />

  return (
    <div className="view-transition space-y-6 pb-8">
      {/* Back button + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('fira-applicants')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isFil ? 'Bumalik' : 'Back'}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
          {profile && (
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              {profile.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile.email}</span>}
              {profile.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {profile?.isComplete ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isFil ? 'Kompleto ang Profile' : 'Profile Complete'}
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {isFil ? 'Hindi Kompleto' : 'Incomplete'}
            </Badge>
          )}
          {profile?.applicantType && (
            <Badge variant="outline">
              {profile.applicantType === 'domestic_helper'
                ? (isFil ? 'Domestic Helper' : 'Domestic Helper')
                : (isFil ? 'Skilled Professional' : 'Skilled Professional')}
            </Badge>
          )}
        </div>
      </div>

      {!profile ? (
        <Card className="p-12 text-center">
          <UserCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{isFil ? 'Walang Profile' : 'No Profile Found'}</h3>
          <p className="text-sm text-muted-foreground">{isFil ? 'Ang aplikanteng ito ay wala pang na-set up na profile.' : 'This applicant has not set up a profile yet.'}</p>
        </Card>
      ) : (
        <>
          {/* Header + Personal Info row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Info Card */}
            <SectionCard
              title={isFil ? 'Personal na Impormasyon' : 'Personal Information'}
              icon={UserCircle}
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                <InfoRow label={isFil ? 'Pangalan' : 'First Name'} value={profile.firstName} />
                <InfoRow label={isFil ? 'Gitnang Pangalan' : 'Middle Name'} value={profile.middleName} />
                <InfoRow label={isFil ? 'Apelyido' : 'Last Name'} value={profile.lastName} />
                <InfoRow label={isFil ? 'Suffix' : 'Suffix'} value={profile.suffixName} />
                <InfoRow label={isFil ? 'Kasarian' : 'Gender'} value={profile.gender} />
                <InfoRow label={isFil ? 'Kaarawan' : 'Birth Date'} value={fmtDate(profile.birthDate)} />
                <InfoRow label={isFil ? 'Lugar ng Kapanganakan' : 'Birth Place'} value={profile.birthPlace} />
                <InfoRow label={isFil ? 'Nasyonalidad' : 'Nationality'} value={profile.nationality} />
                <InfoRow label={isFil ? 'Estado Sibil' : 'Civil Status'} value={profile.civilStatus} />
                <InfoRow label={isFil ? 'Relihiyon' : 'Religion'} value={profile.religion} />
                <InfoRow label={isFil ? 'Tangkad' : 'Height'} value={profile.height} />
                <InfoRow label={isFil ? 'Timbang' : 'Weight'} value={profile.weight} />
              </div>
            </SectionCard>

            {/* Address & Contact Card */}
            <SectionCard
              title={isFil ? 'Address & Kontak' : 'Address & Contact'}
              icon={MapPin}
            >
              <div className="space-y-3">
                <InfoRow label={isFil ? 'Address' : 'Address'} value={profile.address} />
                <InfoRow label={isFil ? 'Lungsod' : 'City'} value={profile.city} />
                <InfoRow label={isFil ? 'Probinsya' : 'Province'} value={profile.province} />
                <InfoRow label={isFil ? 'Rehiyon' : 'Region'} value={profile.region} />
                <InfoRow label={isFil ? 'Zip Code' : 'Zip Code'} value={profile.zipCode} />
                <InfoRow label={isFil ? 'Telepono' : 'Phone'} value={profile.phone} />
                <InfoRow label={isFil ? 'Alt. Telepono' : 'Alt. Phone'} value={profile.altPhone} />
                <InfoRow label={isFil ? 'Email' : 'Email'} value={profile.email} />
              </div>
            </SectionCard>
          </div>

          {/* Passport & Visa */}
          <SectionCard
            title={isFil ? 'Pasaporte & Visa' : 'Passport & Visa'}
            icon={BookOpen}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow label={isFil ? 'Passport No.' : 'Passport No.'} value={profile.passportNo} />
              <InfoRow label={isFil ? 'Pasaporte Expiry' : 'Passport Expiry'} value={fmtDate(profile.passportExpiry)} />
              <InfoRow label={isFil ? 'Status ng Pasaporte' : 'Passport Status'} value={profile.passportStatus} />
              <InfoRow label={isFil ? 'May Visa' : 'Has Visa'} value={profile.hasVisa ? (isFil ? 'Oo' : 'Yes') : (isFil ? 'Hindi' : 'No')} />
              <InfoRow label={isFil ? 'Bansa ng Visa' : 'Visa Country'} value={profile.visaCountry} />
              <InfoRow label={isFil ? 'Uri ng Visa' : 'Visa Type'} value={profile.visaType} />
              <InfoRow label={isFil ? 'Status ng Visa' : 'Visa Status'} value={profile.visaStatus} />
              <InfoRow label={isFil ? 'Visa Expiry' : 'Visa Expiry'} value={fmtDate(profile.visaExpiry)} />
              <InfoRow label={isFil ? 'Status Medikal' : 'Medical Status'} value={profile.medicalStatus} />
              <InfoRow label={isFil ? 'Medikal Expiry' : 'Medical Expiry'} value={fmtDate(profile.medicalExpiry)} />
            </div>
          </SectionCard>

          {/* Emergency Contact */}
          <SectionCard
            title={isFil ? 'Emergency Contact' : 'Emergency Contact'}
            icon={Phone}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow label={isFil ? 'Pangalan' : 'Name'} value={profile.emergencyName} />
              <InfoRow label={isFil ? 'Relasyon' : 'Relation'} value={profile.emergencyRelation} />
              <InfoRow label={isFil ? 'Telepono' : 'Phone'} value={profile.emergencyPhone} />
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard
            title={isFil ? 'Edukasyon' : 'Education'}
            icon={GraduationCap}
          >
            {education.length === 0 ? (
              <EmptyList message={isFil ? 'Walang naitalang edukasyon' : 'No education listed'} />
            ) : (
              <div className="space-y-3">
                {education.map((e: any) => (
                  <div key={e.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{e.degree}</p>
                      {e.fieldOfStudy && <p className="text-xs text-muted-foreground">{e.fieldOfStudy}</p>}
                      <p className="text-xs text-muted-foreground">{e.institution}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {e.startYear} – {e.endYear}
                    </div>
                    {e.honors && (
                      <Badge variant="secondary" className="text-xs shrink-0">{e.honors}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Experience */}
          <SectionCard
            title={isFil ? 'Karanasan' : 'Experience'}
            icon={Briefcase}
          >
            {experience.length === 0 ? (
              <EmptyList message={isFil ? 'Walang naitalang karanasan' : 'No experience listed'} />
            ) : (
              <div className="space-y-3">
                {experience.map((e: any) => (
                  <div key={e.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{e.position}</p>
                      <p className="text-xs text-muted-foreground">{e.company}{e.country ? ` · ${e.country}` : ''}</p>
                      {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {fmtDate(e.startDate, 'MMM yyyy')} – {e.isCurrent ? (isFil ? 'Kasalukuyan' : 'Present') : fmtDate(e.endDate, 'MMM yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Skills & Languages row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={isFil ? 'Mga Kasanayan' : 'Skills'} icon={Wrench}>
              {skills.length === 0 ? (
                <EmptyList message={isFil ? 'Walang naitalang kasanayan' : 'No skills listed'} />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <Badge key={s.id} variant="secondary" className="text-xs">
                      {s.name}
                      {s.level && <span className="ml-1 opacity-60">· {s.level}</span>}
                      {s.yearsExperience && <span className="ml-1 opacity-60">· {s.yearsExperience}y</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title={isFil ? 'Mga Wika' : 'Languages'} icon={Globe}>
              {languages.length === 0 ? (
                <EmptyList message={isFil ? 'Walang naitalang wika' : 'No languages listed'} />
              ) : (
                <div className="space-y-2">
                  {languages.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="text-sm font-medium">{l.language}</span>
                      <Badge variant="outline" className="text-xs">{l.proficiency}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Certifications & Trainings row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title={isFil ? 'Mga Sertipikasyon' : 'Certifications'} icon={Award}>
              {certifications.length === 0 ? (
                <EmptyList message={isFil ? 'Walang sertipikasyon' : 'No certifications listed'} />
              ) : (
                <div className="space-y-2">
                  {certifications.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/40">
                      <p className="text-sm font-medium">{c.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {c.issuingBody && <span>{c.issuingBody}</span>}
                        <span>{fmtDate(c.issuedDate)}{c.expiryDate ? ` – ${fmtDate(c.expiryDate)}` : ''}</span>
                        {c.credentialId && <span>ID: {c.credentialId}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title={isFil ? 'Mga Pagsasanay' : 'Trainings'} icon={BookOpen}>
              {trainings.length === 0 ? (
                <EmptyList message={isFil ? 'Walang pagsasanay' : 'No trainings listed'} />
              ) : (
                <div className="space-y-2">
                  {trainings.map((t: any) => (
                    <div key={t.id} className="p-3 rounded-lg bg-muted/40">
                      <p className="text-sm font-medium">{t.trainingName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {t.institution && <span>{t.institution}</span>}
                        <span>{fmtDate(t.startDate)}{t.endDate ? ` – ${fmtDate(t.endDate)}` : ''}</span>
                        {t.hours && <span>{t.hours}h</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Documents */}
          <SectionCard title={isFil ? 'Mga Dokumento' : 'Documents'} icon={FileText}>
            {documents.length === 0 ? (
              <EmptyList message={isFil ? 'Walang na-upload na dokumento' : 'No documents uploaded'} />
            ) : (
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {documents.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{d.fileName}</p>
                          <p className="text-xs text-muted-foreground">{d.documentType}{d.fileSize ? ` · ${(d.fileSize / 1024).toFixed(1)} KB` : ''}</p>
                        </div>
                      </div>
                      {d.isVerified ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {isFil ? 'Na-verify' : 'Verified'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {isFil ? 'Hindi pa Na-verify' : 'Unverified'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Applications Table */}
          <SectionCard
            title={isFil ? 'Mga Aplikasyon' : 'Applications'}
            icon={Briefcase}
          >
            {applications.length === 0 ? (
              <EmptyList message={isFil ? 'Walang aplikasyon' : 'No applications'} />
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isFil ? 'Trabaho' : 'Job'}</TableHead>
                      <TableHead>{isFil ? 'Empleyador' : 'Employer'}</TableHead>
                      <TableHead>{isFil ? 'Bansa' : 'Country'}</TableHead>
                      <TableHead>{isFil ? 'Status' : 'Status'}</TableHead>
                      <TableHead>{isFil ? 'Petsa' : 'Date'}</TableHead>
                      <TableHead className="w-[180px]">{isFil ? 'Aksyon' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app: any) => {
                      const job = app.jobOrder
                      const nextStatuses = user?.role ? getNextStatuses(app.status, user.role) : []
                      return (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium text-sm">{job?.title || '—'}</TableCell>
                          <TableCell className="text-sm">{job?.employer?.companyName || '—'}</TableCell>
                          <TableCell className="text-sm">{job?.country || '—'}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs border ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status, isFil)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fmtDate(app.createdAt)}</TableCell>
                          <TableCell>
                            {nextStatuses.length > 0 ? (
                              <Select
                                disabled={updateStatusMutation.isPending}
                                onValueChange={(val) => {
                                  updateStatusMutation.mutate({ applicationId: app.id, status: val })
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder={isFil ? 'Baguhin...' : 'Change...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {nextStatuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {isFil ? s.label.fil : s.label.en}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    </TableBody>
                  </Table>
                </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  )
}
