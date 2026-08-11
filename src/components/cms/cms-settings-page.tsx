'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Loader2, Settings, Globe, Phone, Mail, MapPin, Building } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

const defaultSettings: Record<string, string> = {
  site_name: 'FIRA - Fil International Recruitment Agency',
  site_tagline: 'WE RECRUIT. WE DEPLOY. WE MONITOR. WE DELIVER RESULTS',
  site_description: 'Connecting Filipino workers with global opportunities from Casablanca, Morocco.',
  address: '59 Boulevard Zerktouni, Casablanca, Morocco',
  phone_1: '+212 662 26 14 99',
  phone_2: '+212 662 26 08 05',
  phone_3: '+212 662 26 03 36',
  email: 'manpower@filinternational.ma',
  website: 'https://filinternational.ma',
  logo_url: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  twitter_url: '',
}

export function CmsSettingsPage() {
  
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<Record<string, string> | null>(null)

  const { data: settingsData = [], isLoading } = useQuery({
    queryKey: ['cms-settings'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/settings')
      if (!res.ok) return []
      return res.json()
    },
  })

  const effectiveSettings = settings || (() => {
    if (settingsData.length > 0) {
      const map: Record<string, string> = {}
      settingsData.forEach((s: any) => { map[s.key] = s.value })
      return { ...defaultSettings, ...map }
    }
    return defaultSettings
  })()

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(effectiveSettings),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] })
      toast.success('Settings saved successfully!')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...effectiveSettings, [key]: value })
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground text-sm">Configure general site information</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {saveMutation.isPending ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* General Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" /> General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input value={settings.site_name} onChange={(e) => updateSetting('site_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={settings.site_tagline} onChange={(e) => updateSetting('site_tagline', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={settings.site_description} onChange={(e) => updateSetting('site_description', e.target.value)} className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={settings.logo_url} onChange={(e) => updateSetting('logo_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={settings.website} onChange={(e) => updateSetting('website', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                <Input value={settings.address} onChange={(e) => updateSetting('address', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone 1</Label>
                  <Input value={settings.phone_1} onChange={(e) => updateSetting('phone_1', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone 2</Label>
                  <Input value={settings.phone_2} onChange={(e) => updateSetting('phone_2', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone 3</Label>
                  <Input value={settings.phone_3} onChange={(e) => updateSetting('phone_3', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</Label>
                <Input value={settings.email} onChange={(e) => updateSetting('email', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Social Media URLs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url'].map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace('_url', '')}</Label>
                  <Input value={settings[key] || ''} onChange={(e) => updateSetting(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
