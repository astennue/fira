'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export function CmsPagesPage() {
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', status: 'published', order: 0 })
  const queryClient = useQueryClient()

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: async () => {
      const res = await fetch('/api/cms/pages')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/pages?id=${editId}` : '/api/cms/pages'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ title: '', slug: '', content: '', status: 'published', order: 0 })
      toast.success(editId ? 'Page updated!' : 'Page created!')
    },
    onError: () => toast.error('Failed to save page'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/pages?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success('Page deleted!')
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-gray-500 text-sm">Manage website content pages</p>
        </div>
        <Button onClick={openNew} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> New Page</Button>
      </div>

      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedPages.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftPages.length})</TabsTrigger>
          <TabsTrigger value="all">All ({pages.length})</TabsTrigger>
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
            <DialogTitle>{editId ? 'Edit Page' : 'Create Page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="page-slug" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                <Button variant={form.status === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setForm({ ...form, status: 'draft' })}>Draft</Button>
                <Button variant={form.status === 'published' ? 'default' : 'outline'} size="sm" onClick={() => setForm({ ...form, status: 'published' })}>Published</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content (HTML supported)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your page content here..." className="min-h-[300px] font-mono text-sm" />
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

function PageList({ pages, onEdit, onDelete, isLoading }: { pages: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  if (pages.length === 0) return <Card className="p-8 text-center"><FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" /><p className="text-gray-500">No pages found</p></Card>
  return (
    <div className="space-y-3">
      {pages.map((page: any) => (
        <Card key={page.id} className="border-blue-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{page.title}</h3>
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs">{page.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">/{page.slug}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(page)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(page.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
