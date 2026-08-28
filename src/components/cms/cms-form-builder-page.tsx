'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, Loader2, GripVertical, Type, AlignLeft, List, CheckSquare, Calendar, Hash, Mail, Phone, FileUp } from 'lucide-react'
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

const fieldCategories = [
  {
    label: 'Basic',
    types: [
      { value: 'text', label: 'Text', icon: Type },
      { value: 'textarea', label: 'Text Area', icon: AlignLeft },
      { value: 'number', label: 'Number', icon: Hash },
      { value: 'email', label: 'Email', icon: Mail },
      { value: 'phone', label: 'Phone', icon: Phone },
    ],
  },
  {
    label: 'Choice',
    types: [
      { value: 'select', label: 'Dropdown', icon: List },
      { value: 'multiselect', label: 'Multi-Select', icon: CheckSquare },
      { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    ],
  },
  {
    label: 'Advanced',
    types: [
      { value: 'date', label: 'Date', icon: Calendar },
      { value: 'file', label: 'File Upload', icon: FileUp },
    ],
  },
]

const allFieldTypes = fieldCategories.flatMap(c => c.types)

export function CmsFormBuilderPage() {
  const { language } = useAppStore()
  const L = (en: string, fil: string) => language === 'fil' ? fil : en
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '', fieldType: 'text', options: '', section: 'Personal Information', isRequired: false, order: 0, isActive: true })
  const queryClient = useQueryClient()

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ['cms-form-fields'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/form-fields')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/form-fields?id=${editId}` : '/api/cms/form-fields'
      const method = editId ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-form-fields'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ label: '', fieldType: 'text', options: '', section: 'Personal Information', isRequired: false, order: 0, isActive: true })
      toast.success(editId ? L('Field updated!', 'Na-update ang Field!') : L('Field created!', 'Nalikha ang Field!'))
    },
    onError: () => toast.error(L('Failed to save field', 'Hindi na-save ang Field')),
  })

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/cms/form-fields?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-form-fields'] })
      toast.success(L('Field deleted!', 'Na-delete ang Field!'))
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error(L('Failed to delete field', 'Hindi na-delete ang Field'))
    },
  })

  const openEdit = (f: any) => {
    setEditId(f.id)
    setForm({ label: f.label, fieldType: f.fieldType, options: f.options || '', section: f.section || 'Personal Information', isRequired: f.isRequired, order: f.order, isActive: f.isActive })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm({ label: '', fieldType: 'text', options: '', section: 'Personal Information', isRequired: false, order: fields.length, isActive: true })
    setDialogOpen(true)
  }

  const moveField = async (index: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? index - 1 : index + 1
    if (newOrder < 0 || newOrder >= sortedFields.length) return
    const field = sortedFields[index]
    const swapField = sortedFields[newOrder]
    try {
      await Promise.all([
        apiFetch(`/api/cms/form-fields?id=${field.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...field, order: newOrder }) }),
        apiFetch(`/api/cms/form-fields?id=${swapField.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...swapField, order: index }) }),
      ])
      queryClient.invalidateQueries({ queryKey: ['cms-form-fields'] })
    } catch {
      toast.error(L('Failed to reorder field', 'Hindi muling maayos ang Field'))
    }
  }

  const sortedFields = [...fields].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  const sections = [...new Set(sortedFields.map((f: any) => f.section || 'Personal Information'))]

  return (
    <div className="view-transition space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">{L('Application Form Builder', 'Tagabuo ng Application Form')}</h1>
          <p className="text-muted-foreground text-sm">{L('Design your custom application form', 'Idisenyo ang iyong custom na application form')}</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> {L('Add Field', 'Magdagdag ng Field')}</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : sortedFields.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <GripVertical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">{L('No fields added yet', 'Wala pang naidagdag na field')}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">{section}</h3>
              <div className="space-y-2">
                {sortedFields.filter((f: any) => (f.section || 'Personal Information') === section).map((field: any, i: number) => {
                  const ft = allFieldTypes.find(t => t.value === field.fieldType)
                  const Icon = ft?.icon || Type
                  const globalIndex = sortedFields.indexOf(field)
                  return (
                    <Card key={field.id} className={`border ${field.isActive ? 'border-border dark:border-blue-900/30' : 'border-border opacity-60'}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveField(globalIndex, 'up')} disabled={globalIndex === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><GripVertical className="h-4 w-4" /></button>
                        </div>
                        <div className="h-8 w-8 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{field.label}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                            {field.isRequired && <Badge variant="default" className="text-xs bg-red-500">{L('Required', 'Kinakailangan')}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(field)}><Edit className="h-3.5 w-3.5" /></Button>
                          <AlertDialog open={!!deleteTarget && deleteTarget === field.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setDeleteTarget(field.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{L('Are you sure?', 'Sigurado ka ba?')}</AlertDialogTitle>
                                <AlertDialogDescription>{L('This action cannot be undone.', 'Hindi na maibabalik ang aksyong ito.')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{L('Cancel', 'Kanselahin')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { deleteMutation.mutate(field.id); setDeleteTarget(null) }} className="bg-red-600 hover:bg-red-700">{L('Delete', 'I-delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? L('Edit Field', 'I-edit ang Field') : L('Add Form Field', 'Magdagdag ng Form Field')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{L('Field Label', 'Label ng Field')}</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Full Name" required />
            </div>
            <div className="space-y-2">
              <Label>{L('Field Type', 'Uri ng Field')}</Label>
              <div className="space-y-3">
                {fieldCategories.map((cat) => (
                  <div key={cat.label}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{cat.label === 'Basic' ? L('Basic', 'Pangunahin') : cat.label === 'Choice' ? L('Choice', 'Pagpipilian') : L('Advanced', 'Advanced')}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.types.map((ft) => (
                        <Button key={ft.value} variant={form.fieldType === ft.value ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setForm({ ...form, fieldType: ft.value })}>
                          <ft.icon className="h-3.5 w-3.5" /> {ft.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(form.fieldType === 'select' || form.fieldType === 'multiselect') && (
              <div className="space-y-2">
                <Label>{L('Options (comma separated)', 'Mga Opsyon (hiwalay ng kuwit)')}</Label>
                <Input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="Option 1, Option 2, Option 3" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{L('Section', 'Seksyon')}</Label>
                <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="Personal Information" />
              </div>
              <div className="space-y-2">
                <Label>{L('Order', 'Ayos')}</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isRequired} onCheckedChange={(c) => setForm({ ...form, isRequired: !!c })} />
              <Label>{L('Required field', 'Kinakailangang field')}</Label>
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
