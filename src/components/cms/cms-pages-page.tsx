'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, Loader2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'
import { useAppStore } from '@/store/app-store'

export function CmsPagesPage() {
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', status: 'published', order: 0 })
  const queryClient = useQueryClient()

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/pages')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/pages?id=${editId}` : '/api/cms/pages'
      const method = editId ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ title: '', slug: '', content: '', status: 'published', order: 0 })
      toast.success(editId ? L('Page updated!', 'Na-update ang pahina!') : L('Page created!', 'Nalikha ang pahina!'))
    },
    onError: () => toast.error(L('Failed to save page', 'Hindi na-save ang pahina')),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/cms/pages?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success(L('Page deleted!', 'Na-delete ang pahina!'))
    },
    onError: () => {
      toast.error(L('Failed to delete page', 'Hindi na-delete ang pahina'))
    },
  })

  const openEdit = (p: any) => {
    setEditId(p.id)
    setForm({ title: p.title, slug: p.slug, content: p.content, status: p.status, order: p.order })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm({ title: '', slug: '', content: '', status: 'draft', order: pages.length })
    setDialogOpen(true)
  }

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setForm({ ...form, title, slug })
  }

  const publishedPages = pages.filter((p: any) => p.status === 'published')
  const draftPages = pages.filter((p: any) => p.status === 'draft')

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{L('CMS Pages', 'Mga Pahina ng CMS')}</h1>
          <p className="text-muted-foreground text-sm">{L('Create and manage website pages', 'Lumikha at pamahalaan ang mga pahina ng website')}</p>
        </div>
        <Button onClick={openNew} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> {L('New Page', 'Bagong Pahina')}</Button>
      </div>

      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">{L('Published', 'Na-publish')} ({publishedPages.length})</TabsTrigger>
          <TabsTrigger value="drafts">{L('Drafts', 'Mga Draft')} ({draftPages.length})</TabsTrigger>
          <TabsTrigger value="all">{L('All', 'Lahat')} ({pages.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="published">
          <PageList pages={publishedPages} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="drafts">
          <PageList pages={draftPages} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="all">
          <PageList pages={pages} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? L('Edit Page', 'I-edit ang Pahina') : L('Create Page', 'Lumikha ng Pahina')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{L('Title', 'Pamagat')}</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <Label>{L('Slug', 'Slug')}</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="page-slug" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{L('Status', 'Status')}</Label>
              <div className="flex gap-2">
                <Button variant={form.status === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setForm({ ...form, status: 'draft' })}>{L('Draft', 'Draft')}</Button>
                <Button variant={form.status === 'published' ? 'default' : 'outline'} size="sm" onClick={() => setForm({ ...form, status: 'published' })}>{L('Published', 'Na-publish')}</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{L('Content (HTML supported)', 'Nilalaman (sumusuportang HTML)')}</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your page content here..." className="min-h-[300px] font-mono text-sm" />
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

function PageList({ pages, onEdit, onDelete, isLoading }: { pages: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void; isLoading: boolean }) {
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  if (pages.length === 0) return <Card className="p-8 text-center"><FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">{L('No pages found', 'Walang nahanap na pahina')}</p></Card>
  return (
    <div className="space-y-6 pb-8">
      {pages.map((page: any) => (
        <Card key={page.id} className="border-border dark:border-blue-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{page.title}</h3>
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs">{page.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">/{page.slug}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(page)}><Edit className="h-4 w-4" /></Button>
              <AlertDialog open={!!deleteTarget && deleteTarget === page.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setDeleteTarget(page.id)}><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{L('Are you sure?', 'Sigurado ka ba?')}</AlertDialogTitle>
                    <AlertDialogDescription>{L('This action cannot be undone.', 'Hindi na maibabalik ang aksyong ito.')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{L('Cancel', 'Kanselahin')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { onDelete(page.id); setDeleteTarget(null) }} className="bg-red-600 hover:bg-red-700">{L('Delete', 'I-delete')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
