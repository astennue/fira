'use client'

import { useQuery } from '@tanstack/react-query'
import { User, Mail, Phone, Globe, MapPin, Award, BookOpen, Briefcase, Languages, Shield, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'

export function ApplicantProfilePage() {
  const { user } = useAppStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['applicant-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/users?role=applicant&search=${encodeURIComponent(user?.email || '')}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const u = (data.users || []).find((u: Record<string, unknown>) => u.id === user?.id)
      return u || null
    },
    enabled: !!user?.id && user?.role === 'applicant',
  })

  if (isLoading) {
    return <div className="view-transition space-y-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>
  }

  const p = profile?.applicantProfile as Record<string, unknown> | undefined
  const completeness = p ? Math.round(Object.values(p).filter(Boolean).length / Object.keys(p).length * 100) : 0

  return (
    <div className="view-transition space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your professional information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Completeness</CardTitle>
            <span className="text-sm font-medium text-primary">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{p?.firstName ? `${p.firstName} ${p.lastName}` : user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{user?.role}</Badge>
                {user?.isApproved ? <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</Badge> : <Badge variant="secondary">Pending Approval</Badge>}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Gender:</span><span>{p?.gender || 'Not set'}</span>
                <span className="text-muted-foreground">Nationality:</span><span>{p?.nationality || 'Filipino'}</span>
                <span className="text-muted-foreground">Civil Status:</span><span>{p?.civilStatus || 'Not set'}</span>
                <span className="text-muted-foreground">Experience:</span><span>{p?.yearsExperience ? `${p.yearsExperience} years` : 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" /> Preferences</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Preferred Country:</span><span>{p?.preferredCountry || 'Not set'}</span>
                <span className="text-muted-foreground">Preferred Job:</span><span>{p?.preferredJob || 'Not set'}</span>
                <span className="text-muted-foreground">Address:</span><span className="truncate col-span-2">{p?.city ? `${p.city}, ${p.province}` : 'Not set'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {p?.resumeText && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><FileText className="h-4 w-4" /> Resume Summary</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{String(p.resumeText)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
