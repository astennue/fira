'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Save, Loader2, Users, ChevronRight, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function CmsOrgChartPage() {
  const { fontSize } = useAppStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', position: '', department: '', parentId: '', avatar: '', email: '', phone: '', order: 0, isActive: true })
  const queryClient = useQueryClient()

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['cms-org-chart'],
    queryFn: async () => {
      const res = await apiFetch('/api/cms/org-chart')
      if (!res.ok) return []
      return res.json()
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/cms/org-chart?id=${editId}` : '/api/cms/org-chart'
      const method = editId ? 'PUT' : 'POST'
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-org-chart'] })
      setDialogOpen(false)
      setEditId(null)
      setForm({ name: '', position: '', department: '', parentId: '', avatar: '', email: '', phone: '', order: 0, isActive: true })
      toast.success(editId ? 'Member updated!' : 'Member added!')
    },
    onError: () => toast.error('Failed to save'),
  })

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/cms/org-chart?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-org-chart'] })
      toast.success('Member removed!')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Failed to delete member')
    },
  })

  const openEdit = (m: any) => {
    setEditId(m.id)
    setForm({ name: m.name, position: m.position, department: m.department || '', parentId: m.parentId || '', avatar: m.avatar || '', email: m.email || '', phone: m.phone || '', order: m.order, isActive: m.isActive })
    setDialogOpen(true)
  }

  const openNew = (parentId?: string) => {
    setEditId(null)
    setForm({ name: '', position: '', department: '', parentId: parentId || '', avatar: '', email: '', phone: '', order: members.length, isActive: true })
    setDialogOpen(true)
  }

  const getChildren = (parentId: string) => members.filter((m: any) => m.parentId === parentId)
  const rootMembers = members.filter((m: any) => !m.parentId || m.parentId === '')

  const renderMember = (member: any, level: number = 0) => {
    const children = getChildren(member.id)
    return (
      <div key={member.id} className="flex flex-col items-center">
        <Card className={`border ${member.isActive ? 'border-border dark:border-blue-800' : 'border-border opacity-60'} w-56 mb-3`}>
          <CardContent className="p-4 text-center">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full mx-auto mb-2 object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                {member.name?.charAt(0)}
              </div>
            )}
            <h4 className="font-semibold text-sm">{member.name}</h4>
            <p className="text-xs text-muted-foreground">{member.position}</p>
            {member.department && <Badge variant="outline" className="text-xs mt-1">{member.department}</Badge>}
            <div className="flex justify-center gap-1 mt-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(member)}><Edit className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openNew(member.id)}><Plus className="h-3.5 w-3.5" /></Button>
              <AlertDialog open={!!deleteTarget && deleteTarget === member.id} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setDeleteTarget(member.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { deleteMutation.mutate(member.id); setDeleteTarget(null) }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
        {children.length > 0 && (
          <>
            <div className="w-px h-4 bg-blue-300 dark:bg-blue-700" />
            <div className="flex gap-6 relative">
              {children.length > 1 && <div className="absolute top-0 h-px bg-blue-300 dark:bg-blue-700" style={{ left: '25%', right: '25%' }} />}
              {children.map((child: any) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-blue-300 dark:bg-blue-700" />
                  {renderMember(child, level + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Org Chart</h1>
          <p className="text-muted-foreground text-sm">Manage organizational structure</p>
        </div>
        <Button onClick={() => openNew()} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : members.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-1">No org chart yet</h3>
          <p className="text-muted-foreground mb-4">Add members to build your organizational chart</p>
          <Button onClick={() => openNew()} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add First Member</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex justify-center min-w-fit">
            {rootMembers.map((m: any) => renderMember(m))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Job title" required />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@fira.ma" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." />
            </div>
            <div className="space-y-2">
              <Label>Reports to</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              >
                <option value="">None (Root)</option>
                {members.filter((m: any) => m.id !== editId).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.position}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
