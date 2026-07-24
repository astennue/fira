'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Star, Save, X, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function CmsTestimonialsPage() {
  const { language, fontSize } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', position: '', company: '', feedback: '', rating: 5, avatar: '', isActive: true })
  const queryClient = useQueryClient()

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['cms-testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/cms/testimonials')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/testimonials?id=${editId}` : '/api/cms/testimonials'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-testimonials'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ name: '', position: '', company: '', feedback: '', rating: 5, avatar: '', isActive: true })
      toast.success(editId ? 'Testimonial updated!' : 'Testimonial created!')
    },
    onError: () => toast.error('Failed to save testimonial'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-testimonials'] })
      toast.success('Testimonial deleted!')
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
    <div data-font-size={fontSize}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 text-sm">Manage client testimonials and reviews</p>
        </div>
        <Button onClick={openNew} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Testimonial</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t: any) => (
            <Card key={t.id} className={`border ${t.isActive ? 'border-blue-100' : 'border-gray-200 opacity-60'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic mb-3 line-clamp-3">&ldquo;{t.feedback}&rdquo;</p>
                <div className="flex items-center gap-2">
                  {t.avatar ? (
                    <img src={t.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{t.name?.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.position}{t.company ? ` at ${t.company}` : ''}</p>
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
            <DialogTitle>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1 h-10 items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setForm({ ...form, rating: i + 1 })}>
                      <Star className={`h-7 w-7 cursor-pointer ${i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Job title" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Testimonial text..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
