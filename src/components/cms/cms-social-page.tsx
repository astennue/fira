'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, Loader2, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Globe,
  whatsapp: Globe,
  website: Globe,
}

export function CmsSocialPage() {
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ platform: '', title: '', url: '', icon: '', order: 0, isActive: true })
  const queryClient = useQueryClient()

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['cms-social'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/social')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/social?id=${editId}` : '/api/cms/social'
      const method = editId ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-social'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ platform: '', title: '', url: '', icon: '', order: 0, isActive: true })
      toast.success(editId ? L('Social link updated!', 'Na-update ang social link!') : L('Social link created!', 'Nalikha ang social link!'))
    },
    onError: () => toast.error(L('Failed to save', 'Hindi na-save')),
  })

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/cms/social?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-social'] })
      toast.success(L('Social link deleted!', 'Na-delete ang social link!'))
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error(L('Failed to delete social link', 'Hindi na-delete ang social link'))
    },
  })

  const openEdit = (l: any) => {
    setEditId(l.id)
    setForm({ platform: l.platform, title: l.title || '', url: l.url, icon: l.icon || '', order: l.order, isActive: l.isActive })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm({ platform: '', title: '', url: '', icon: '', order: links.length, isActive: true })
    setDialogOpen(true)
  }

  const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'whatsapp', 'website']

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{L('Social Media Links', 'Mga Link sa Social Media')}</h1>
          <p className="text-muted-foreground text-sm">{L('Manage your social media presence', 'Pamahalaan ang iyong social media')}</p>
        </div>
        <Button onClick={openNew} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> {L('Add Link', 'Magdagdag ng Link')}</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {!isLoading && links.length === 0 && (
            <Card className="p-8 text-center">
              <Share2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{L('No social media links added yet.', 'Wala pang social media link na naidagdag.')}</p>
            </Card>
          )}
          {links.map((link: any) => {
            const Icon = platformIcons[link.platform] || Globe
            return (
              <Card key={link.id} className={`border ${link.isActive ? 'border-border dark:border-blue-900/30' : 'border-border opacity-60'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{link.platform}</p>
                      {link.title && <Badge variant="outline" className="text-xs">{link.title}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={link.isActive} disabled />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(link)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog open={!!deleteTarget && deleteTarget === link.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setDeleteTarget(link.id)}><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{L('Are you sure?', 'Sigurado ka ba?')}</AlertDialogTitle>
                          <AlertDialogDescription>{L('This action cannot be undone.', 'Hindi na maibabalik ang aksyong ito.')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{L('Cancel', 'Kanselahin')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { deleteMutation.mutate(link.id); setDeleteTarget(null) }} className="bg-red-600 hover:bg-red-700">{L('Delete', 'I-delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? L('Edit Social Link', 'I-edit ang Social Link') : L('Add Social Link', 'Magdagdag ng Social Link')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{L('Platform', 'Plataporma')}</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <Button key={p} variant={form.platform === p ? 'default' : 'outline'} size="sm" className="rounded-lg capitalize" onClick={() => setForm({ ...form, platform: p })}>
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{L('Title (optional)', 'Pamagat (opsyonal)')}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Official Facebook Page" />
            </div>
            <div className="space-y-2">
              <Label>{L('URL', 'URL')}</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." required />
            </div>
            <div className="space-y-2">
              <Label>{L('Display Order', 'Ayos ng Pagpapakita')}</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{L('Cancel', 'Kanselahin')}</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {saveMutation.isPending ? L('Saving...', 'Nagsasave...') : L('Save', 'I-save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
