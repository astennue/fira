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
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  
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
      toast.success(L('Settings saved successfully!', 'Matagumpay na na-save ang mga Setting!'))
    },
    onError: () => toast.error(L('Failed to save settings', 'Hindi na-save ang mga Setting')),
  })

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...effectiveSettings, [key]: value })
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">{L('Site Settings', 'Mga Setting ng Site')}</h1>
          <p className="text-muted-foreground text-sm">{L('Configure general site information', 'I-configure ang pangkalahatang impormasyon ng site')}</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saveMutation.isPending ? L('Saving...', 'Nagsasave...') : L('Save All', 'I-save lahat')}
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
                <Globe className="h-5 w-5 text-blue-600" /> {L('General', 'Pangkalahatan')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{L('Site Name', 'Pangalan ng Site')}</Label>
                <Input value={effectiveSettings.site_name} onChange={(e) => updateSetting('site_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{L('Tagline', 'Tagline')}</Label>
                <Input value={effectiveSettings.site_tagline} onChange={(e) => updateSetting('site_tagline', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{L('Description', 'Deskripsyon')}</Label>
                <Textarea value={effectiveSettings.site_description} onChange={(e) => updateSetting('site_description', e.target.value)} className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label>{L('Logo URL', 'URL ng Logo')}</Label>
                <Input value={effectiveSettings.logo_url} onChange={(e) => updateSetting('logo_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>{L('Website URL', 'URL ng Website')}</Label>
                <Input value={effectiveSettings.website} onChange={(e) => updateSetting('website', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" /> {L('Contact Information', 'Impormasyon sa Kontak')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {L('Address', 'Alamat')}</Label>
                <Input value={effectiveSettings.address} onChange={(e) => updateSetting('address', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {L('Phone 1', 'Telepono 1')}</Label>
                  <Input value={effectiveSettings.phone_1} onChange={(e) => updateSetting('phone_1', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {L('Phone 2', 'Telepono 2')}</Label>
                  <Input value={effectiveSettings.phone_2} onChange={(e) => updateSetting('phone_2', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {L('Phone 3', 'Telepono 3')}</Label>
                  <Input value={effectiveSettings.phone_3} onChange={(e) => updateSetting('phone_3', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {L('Email', 'Email')}</Label>
                <Input value={effectiveSettings.email} onChange={(e) => updateSetting('email', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{L('Social Media URLs', 'Mga URL sa Social Media')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url'].map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace('_url', '')}</Label>
                  <Input value={effectiveSettings[key] || ''} onChange={(e) => updateSetting(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
