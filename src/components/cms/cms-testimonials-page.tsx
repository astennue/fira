'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Star, Save, Loader2, X, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

export function CmsTestimonialsPage() {
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', position: '', company: '', feedback: '', rating: 5, avatar: '', isActive: true })
  const queryClient = useQueryClient()

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['cms-testimonials'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/testimonials')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/testimonials?id=${editId}` : '/api/cms/testimonials'
      const method = editId ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-testimonials'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ name: '', position: '', company: '', feedback: '', rating: 5, avatar: '', isActive: true })
      toast.success(editId ? L('Testimonial updated!', 'Na-update ang Testimonial!') : L('Testimonial created!', 'Nalikha ang Testimonial!'))
    },
    onError: () => toast.error(L('Failed to save testimonial', 'Hindi na-save ang Testimonial')),
  })

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-testimonials'] })
      toast.success(L('Testimonial deleted!', 'Na-delete ang Testimonial!'))
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error(L('Failed to delete testimonial', 'Hindi na-delete ang Testimonial'))
    },
  })

  const openEdit = (t: any) => {
    setEditId(t.id)
    setForm({ name: t.name, position: t.position || '', company: t.company || '', feedback: t.feedback, rating: t.rating, avatar: t.avatar || '', isActive: t.isActive })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm({ name: '', position: '', company: '', feedback: '', rating: 5, avatar: '', isActive: true })
    setDialogOpen(true)
  }

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">{L('Testimonials', 'Mga Testimonial')}</h1>
          <p className="text-muted-foreground text-sm">{L('Manage client testimonials', 'Pamahalaan ang mga testimonial ng kliyente')}</p>
        </div>
        <Button onClick={openNew} className="rounded-md"><Plus className="h-4 w-4" /> {L('Add Testimonial', 'Magdagdag ng Testimonial')}</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : testimonials.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{L('No testimonials yet. Click "Add Testimonial" to get started.', 'Wala pang testimonial. I-click ang "Magdagdag ng Testimonial" para magsimula.')}</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t: any) => (
            <Card key={t.id} className={`border ${t.isActive ? 'border-border dark:border-blue-900/30' : 'border-border opacity-60'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground dark:text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Edit className="h-3.5 w-3.5" /></Button>
                    <AlertDialog open={!!deleteTarget && deleteTarget === t.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setDeleteTarget(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{language === 'fil' ? 'Sigurado ka ba?' : 'Are you sure?'}</AlertDialogTitle>
                          <AlertDialogDescription>{language === 'fil' ? 'Hindi na maibabalik ang aksyong ito.' : 'This action cannot be undone.'}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{language === 'fil' ? 'Kanselahin' : 'Cancel'}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { deleteMutation.mutate(t.id); setDeleteTarget(null) }} className="bg-red-600 hover:bg-red-700">{language === 'fil' ? 'Tanggalin' : 'Delete'}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic mb-3 line-clamp-3">&ldquo;{t.feedback}&rdquo;</p>
                <div className="flex items-center gap-2">
                  {t.avatar ? (
                    <img src={t.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">{t.name?.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.position}{t.company ? ` at ${t.company}` : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? L('Edit Testimonial', 'I-edit ang Testimonial') : L('Add Testimonial', 'Magdagdag ng Testimonial')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{L('Name', 'Pangalan')}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>{L('Rating', 'Rating')}</Label>
                <div className="flex gap-1 h-10 items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setForm({ ...form, rating: i + 1 })}>
                      <Star className={`h-7 w-7 cursor-pointer ${i < form.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground dark:text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{L('Position', 'Posisyon')}</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Job title" />
              </div>
              <div className="space-y-2">
                <Label>{L('Company', 'Kumpanya')}</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{L('Feedback', 'Feedback')}</Label>
              <Textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Testimonial text..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label>{L('Avatar URL', 'URL ng Avatar')}</Label>
              <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{L('Cancel', 'Kanselahin')}</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saveMutation.isPending ? L('Saving...', 'Nagsasave...') : L('Save', 'I-save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
