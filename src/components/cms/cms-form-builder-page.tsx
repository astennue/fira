'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, GripVertical, ArrowUp, ArrowDown, X, Type, AlignLeft, List, CheckSquare, Calendar, Hash, Mail, Phone, FileUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

const fieldTypes = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'multiselect', label: 'Multi-Select', icon: CheckSquare },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'file', label: 'File Upload', icon: FileUp },
]

export function CmsFormBuilderPage() {
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '', fieldType: 'text', options: '', section: 'Personal Information', isRequired: false, order: 0, isActive: true })
  const queryClient = useQueryClient()

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ['cms-form-fields'],
    queryFn: async () => {
      const res = await fetch('/api/cms/form-fields')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/form-fields?id=${editId}` : '/api/cms/form-fields'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-form-fields'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ label: '', fieldType: 'text', options: '', section: 'Personal Information', isRequired: false, order: 0, isActive: true })
      toast.success(editId ? 'Field updated!' : 'Field created!')
    },
    onError: () => toast.error('Failed to save field'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/form-fields?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-form-fields'] })
      toast.success('Field deleted!')
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

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? index - 1 : index + 1
    if (newOrder < 0 || newOrder >= fields.length) return
    toast.info('Reorder by editing the order number')
  }

  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sections = [...new Set(sortedFields.map((f: any) => f.section || 'Personal Information'))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500 text-sm">Build and customize the application form</p>
        </div>
        <Button onClick={openNew} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Field</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{section}</h3>
              <div className="space-y-2">
                {sortedFields.filter((f: any) => (f.section || 'Personal Information') === section).map((field: any, i: number) => {
                  const ft = fieldTypes.find(t => t.value === field.fieldType)
                  const Icon = ft?.icon || Type
                  return (
                    <Card key={field.id} className={`border ${field.isActive ? 'border-blue-100' : 'border-gray-200 opacity-60'}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-gray-300 shrink-0" />
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{field.label}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                            {field.isRequired && <Badge variant="default" className="text-xs bg-red-500">Required</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(field)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(field.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogTitle>{editId ? 'Edit Field' : 'Add Form Field'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Full Name" required />
            </div>
            <div className="space-y-2">
              <Label>Field Type</Label>
              <div className="flex flex-wrap gap-2">
                {fieldTypes.map((ft) => (
                  <Button key={ft.value} variant={form.fieldType === ft.value ? 'default' : 'outline'} size="sm" className="rounded-lg gap-1.5" onClick={() => setForm({ ...form, fieldType: ft.value })}>
                    <ft.icon className="h-3.5 w-3.5" /> {ft.label}
                  </Button>
                ))}
              </div>
            </div>
            {(form.fieldType === 'select' || form.fieldType === 'multiselect') && (
              <div className="space-y-2">
                <Label>Options (comma separated)</Label>
                <Input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="Option 1, Option 2, Option 3" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="Personal Information" />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isRequired} onCheckedChange={(c) => setForm({ ...form, isRequired: !!c })} />
              <Label>Required field</Label>
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
