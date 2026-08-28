'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Loader2, ScrollText, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

const defaultTerms = { title: 'Terms of Service', content: '', version: '1.0' }
const defaultPrivacy = { title: 'Data Privacy Consent', content: '', version: '1.0' }

export function CmsTermsPage() {
  const { fontSize, language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  const queryClient = useQueryClient()

  const [terms, setTerms] = useState<{ title: string; content: string; version: string } | null>(null)
  const [privacy, setPrivacy] = useState<{ title: string; content: string; version: string } | null>(null)

  const { data: termsData = [], isLoading } = useQuery({
    queryKey: ['cms-terms'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/terms')
      if (!res.ok) return []
      return res.json()
    },
  })

  const effectiveTerms = terms || (() => {
    const tos = termsData.find((t: any) => t.type === 'terms_of_service')
    if (tos) return { title: tos.title, content: tos.content, version: tos.version }
    return { ...defaultTerms }
  })()

  const effectivePrivacy = privacy || (() => {
    const dpc = termsData.find((t: any) => t.type === 'data_privacy_consent')
    if (dpc) return { title: dpc.title, content: dpc.content, version: dpc.version }
    return { ...defaultPrivacy }
  })()

  const saveTermsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/cms/terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'terms_of_service', ...effectiveTerms }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-terms'] })
      toast.success(L('Terms of Service updated!', 'Na-update ang Mga Tuntunin ng Serbisyo!'))
    },
    onError: () => {
      toast.error(L('Failed to update Terms of Service', 'Hindi na-update ang Mga Tuntunin ng Serbisyo'))
    },
  })

  const savePrivacyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/cms/terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'data_privacy_consent', ...effectivePrivacy }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-terms'] })
      toast.success(L('Data Privacy Consent updated!', 'Na-update ang Patakaran sa Privacy!'))
    },
    onError: () => {
      toast.error(L('Failed to update Data Privacy Consent', 'Hindi na-update ang Patakaran sa Privacy'))
    },
  })

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">{L('Terms & Privacy', 'Mga Tuntunin at Privacy')}</h1>
        <p className="text-muted-foreground text-sm">{L('Edit Terms of Service and Data Privacy Consent', 'I-edit ang Mga Tuntunin ng Serbisyo at Patakaran sa Privacy')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="terms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="terms" className="gap-2">
              <ScrollText className="h-4 w-4" /> {L('Terms of Service', 'Mga Tuntunin ng Serbisyo')}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <FileCheck className="h-4 w-4" /> {L('Data Privacy Consent', 'Patakaran sa Privacy')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{L('Terms of Service', 'Mga Tuntunin ng Serbisyo')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{L('Version', 'Bersyon')} {effectiveTerms.version}</p>
                  </div>
                  <Badge>terms_of_service</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{L('Title', 'Pamagat')}</Label>
                  <Input value={effectiveTerms.title} onChange={(e) => setTerms({ ...effectiveTerms, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{L('Version', 'Bersyon')}</Label>
                  <Input value={effectiveTerms.version} onChange={(e) => setTerms({ ...effectiveTerms, version: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{L('Content (HTML supported)', 'Nilalaman (sumusuportang HTML)')}</Label>
                  <Textarea
                    value={effectiveTerms.content}
                    onChange={(e) => setTerms({ ...effectiveTerms, content: e.target.value })}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder={L('Write the Terms of Service content here...', 'Isulat ang nilalaman ng Mga Tuntunin ng Serbisyo dito...')}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveTermsMutation.mutate()} disabled={saveTermsMutation.isPending} className="rounded-xl">
                    {saveTermsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saveTermsMutation.isPending ? L('Saving...', 'Nagsasave...') : L('Save Changes', 'I-save ang mga Pagbabago')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{L('Data Privacy Consent', 'Patakaran sa Privacy')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{L('Version', 'Bersyon')} {effectivePrivacy.version}</p>
                  </div>
                  <Badge>data_privacy_consent</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{L('Title', 'Pamagat')}</Label>
                  <Input value={effectivePrivacy.title} onChange={(e) => setPrivacy({ ...effectivePrivacy, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{L('Version', 'Bersyon')}</Label>
                  <Input value={effectivePrivacy.version} onChange={(e) => setPrivacy({ ...effectivePrivacy, version: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{L('Content (HTML supported)', 'Nilalaman (sumusuportang HTML)')}</Label>
                  <Textarea
                    value={effectivePrivacy.content}
                    onChange={(e) => setPrivacy({ ...effectivePrivacy, content: e.target.value })}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder={L('Write the Data Privacy Consent content here...', 'Isulat ang nilalaman ng Patakaran sa Privacy dito...')}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => savePrivacyMutation.mutate()} disabled={savePrivacyMutation.isPending} className="rounded-xl">
                    {savePrivacyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {savePrivacyMutation.isPending ? L('Saving...', 'Nagsasave...') : L('Save Changes', 'I-save ang mga Pagbabago')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
