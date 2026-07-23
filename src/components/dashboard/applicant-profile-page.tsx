'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  User, FileText, GraduationCap, Briefcase, Globe, Award,
  Languages, Heart, FolderOpen, AlertTriangle, CheckCircle, XCircle,
  Shield, Stamp, Stethoscope, ChevronRight, Edit, Camera, Phone, Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

export function ApplicantProfilePage() {
  const { user, navigate, language } = useAppStore()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/applicant-profile?userId=${user?.id}`)
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!user?.id,
  })

  const profile = profileData?.profile
  const education = profileData?.education || []
  const experience = profileData?.experience || []
  const skills = profileData?.skills || []
  const languages = profileData?.languages || []
  const certifications = profileData?.certifications || []
  const documents = profileData?.documents || []
  const references = profileData?.references || []
  const trainings = profileData?.trainings || []

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-2">{language === 'fil' ? 'Wala pang profile' : 'No profile yet'}</h2>
        <p className="text-sm text-muted-foreground mb-4">{language === 'fil' ? 'Kumpletuhin ang iyong profile para makapag-apply.' : 'Complete your profile to apply for jobs.'}</p>
        <Button onClick={() => navigate('applicant-profile-edit')}>{language === 'fil' ? 'Gumawa ng Profile' : 'Create Profile'}</Button>
      </div>
    )
  }

  let householdTasks: string[] = []
  try { householdTasks = JSON.parse(profile.householdTasks || '[]') } catch {}

  const statusIcons: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
    valid: { icon: CheckCircle, color: 'text-emerald-600', label: 'Valid' },
    expired: { icon: XCircle, color: 'text-red-500', label: 'Expired' },
    processing: { icon: Clock, color: 'text-amber-500', label: 'Processing' },
    none: { icon: XCircle, color: 'text-gray-400', label: 'None' },
    passed: { icon: CheckCircle, color: 'text-emerald-600', label: 'Passed' },
    failed: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
    scheduled: { icon: Clock, color: 'text-blue-500', label: 'Scheduled' },
  }

  const renderStatusBadge = (status: string) => {
    const info = statusIcons[status] || statusIcons.none
    const Icon = info.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${info.color}`}>
        <Icon className="h-3.5 w-3.5" />{info.label}
      </span>
    )
  }

  return (
    <div className="view-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {language === 'fil' ? 'Ang Profile Ko' : 'My Profile'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile.isComplete
              ? (language === 'fil' ? 'Ang iyong profile ay kumpleto.' : 'Your profile is complete.')
              : (language === 'fil' ? 'Kumpletuhin ang iyong profile.' : 'Complete your profile.')}
          </p>
        </div>
        <Button onClick={() => navigate('applicant-profile-edit')}>
          <Edit className="mr-2 h-4 w-4" />
          {language === 'fil' ? 'I-edit' : 'Edit'}
        </Button>
      </div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Personal na Impormasyon' : 'Personal Information'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: language === 'fil' ? 'Pangalan' : 'Full Name', value: `${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}` },
                profile.gender && { label: language === 'fil' ? 'Kasarian' : 'Gender', value: profile.gender },
                profile.birthDate && { label: language === 'fil' ? 'Petsa ng Kapanganakan' : 'Birth Date', value: new Date(profile.birthDate).toLocaleDateString() },
                profile.civilStatus && { label: language === 'fil' ? 'Status Sibil' : 'Civil Status', value: profile.civilStatus },
                profile.height && { label: language === 'fil' ? 'Taas' : 'Height', value: `${profile.height} cm` },
                profile.weight && { label: language === 'fil' ? 'Bigat' : 'Weight', value: `${profile.weight} kg` },
                profile.address && { label: language === 'fil' ? 'Address' : 'Address', value: profile.address, span: true },
                profile.city && { label: language === 'fil' ? 'Lungsod' : 'City', value: profile.city },
                profile.province && { label: language === 'fil' ? 'Probinsya' : 'Province', value: profile.province },
                profile.phone && { label: language === 'fil' ? 'Telepono' : 'Phone', value: profile.phone },
                profile.email && { label: 'Email', value: profile.email },
                profile.applicantType && { label: language === 'fil' ? 'Uri ng Aplikante' : 'Applicant Type', value: profile.applicantType?.replace('_', ' ') },
                profile.yearsExperience && { label: language === 'fil' ? 'Taon ng Karanasan' : 'Years of Experience', value: `${profile.yearsExperience} years` },
              ].filter(Boolean).map((item: any, i: number) => (
                <div key={i} className={item.span ? 'col-span-2 md:col-span-3' : ''}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Household Tasks (Domestic Helper) */}
      {householdTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader><CardTitle>{language === 'fil' ? 'Mga Gawain sa Bahay' : 'Household Tasks'}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {householdTasks.map((task: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1">{task}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Passport, Visa, Medical Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle>{language === 'fil' ? 'Pasaporte, Visa, at Medikal' : 'Passport, Visa & Medical'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Passport */}
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{language === 'fil' ? 'Pasaporte' : 'Passport'}</span>
                </div>
                {profile.passportNo ? (
                  <div className="space-y-1">
                    <p className="text-sm">{profile.passportNo}</p>
                    {profile.passportExpiry && <p className="text-xs text-muted-foreground">Expires: {new Date(profile.passportExpiry).toLocaleDateString()}</p>}
                    {renderStatusBadge(profile.passportStatus || 'none')}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{language === 'fil' ? 'Wala pang pasaporte' : 'No passport yet'}</p>
                )}
              </div>
              {/* Visa */}
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Stamp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Visa</span>
                </div>
                {profile.hasVisa ? (
                  <div className="space-y-1">
                    <p className="text-sm">{profile.visaCountry || 'N/A'}</p>
                    {profile.visaType && <p className="text-xs text-muted-foreground">{profile.visaType}</p>}
                    {renderStatusBadge(profile.visaStatus || 'none')}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{language === 'fil' ? 'Wala pang visa' : 'No visa yet'}</p>
                )}
              </div>
              {/* Medical */}
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{language === 'fil' ? 'Medikal' : 'Medical'}</span>
                </div>
                <div>
                  {renderStatusBadge(profile.medicalStatus || 'none')}
                  {profile.medicalExpiry ? (
                    <p className="text-xs text-muted-foreground mt-1">Expires: {new Date(profile.medicalExpiry).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Education */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader><CardTitle><GraduationCap className="h-4 w-4 mr-2" />{language === 'fil' ? 'Edukasyon' : 'Education'}</CardTitle></CardHeader>
            <CardContent>
              {education.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang idagdag.' : 'No entries yet.'}</p>
              ) : (
                <div className="space-y-3">
                  {education.map((e: any) => (
                    <div key={e.id} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{e.degree} {e.fieldOfStudy ? `in ${e.fieldOfStudy}` : ''}</p>
                      <p className="text-xs text-muted-foreground">{e.institution}</p>
                      <p className="text-xs text-muted-foreground">{e.startYear} - {e.endYear}{e.honors ? ` • ${e.honors}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Experience */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card>
            <CardHeader><CardTitle><Briefcase className="h-4 w-4 mr-2" />{language === 'fil' ? 'Karanasan' : 'Experience'}</CardTitle></CardHeader>
            <CardContent>
              {experience.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang idagdag.' : 'No entries yet.'}</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {experience.map((e: any) => (
                    <div key={e.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{e.position}</p>
                        {e.isCurrent && <Badge variant="outline" className="text-xs text-emerald-600">{language === 'fil' ? 'Kasalukuyan' : 'Current'}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{e.company}{e.country ? ` • ${e.country}` : ''}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.startDate).toLocaleDateString()} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : (language === 'fil' ? 'Kasalukuyan' : 'Present')}
                      </p>
                      {e.description && <p className="text-xs mt-1 line-clamp-2">{e.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
          <Card>
            <CardHeader><CardTitle><Award className="h-4 w-4 mr-2" />{language === 'fil' ? 'Mga Kasanayan' : 'Skills'}</CardTitle></CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang idagdag.' : 'No entries yet.'}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <Badge key={s.id} variant="secondary" className="text-sm py-1">
                      {s.name}
                      <span className="text-muted-foreground ml-1">({s.level})</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Languages */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader><CardTitle><Languages className="h-4 w-4 mr-2" />{language === 'fil' ? 'Mga Wika' : 'Languages'}</CardTitle></CardHeader>
            <CardContent>
              {languages.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang idagdag.' : 'No entries yet.'}</p>
              ) : (
                <div className="space-y-2">
                  {languages.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm font-medium">{l.language}</span>
                      <Badge variant="outline" className="text-xs capitalize">{l.proficiency}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Certifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
          <Card>
            <CardHeader><CardTitle><FileText className="h-4 w-4 mr-2" />{language === 'fil' ? 'Mga Sertipikasyon' : 'Certifications'}</CardTitle></CardHeader>
            <CardContent>
              {certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang idagdag.' : 'No entries yet.'}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {certifications.map((c: any) => (
                    <div key={c.id} className="p-2 rounded border">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.issuingBody || ''} {c.issuedDate ? `• ${new Date(c.issuedDate).getFullYear()}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle><FolderOpen className="h-4 w-4 mr-2" />{language === 'fil' ? 'Mga Dokumento' : 'Documents'}</CardTitle></CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Wala pang na-upload.' : 'No documents uploaded.'}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {documents.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{d.documentType?.replace(/_/g, ' ')}</span>
                      {d.isVerified ? (
                        <Badge className="text-xs bg-emerald-100 text-emerald-800">{language === 'fil' ? 'Verified' : 'Verified'}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">{language === 'fil' ? 'Pending' : 'Pending'}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
