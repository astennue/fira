'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Users, Shield, Check, X, UserCog, Ban, Unlock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore, roleDisplayNames } from '@/store/app-store'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export function SuperAdminUsersPage() {
  const { language } = useAppStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      const res = await fetch(`/api/users?admin=true&${params.toString()}`)
      if (!res.ok) return []
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setDialogOpen(false)
      if (variables.action === 'approve') toast.success('User approved!')
      else if (variables.action === 'reject') toast.success('User rejected!')
      else if (variables.action === 'deactivate') toast.success('User deactivated!')
      else if (variables.action === 'activate') toast.success('User activated!')
    },
    onError: () => toast.error('Failed to update user'),
  })

  const filteredUsers = Array.isArray(users) ? users : []

  const roleColor: Record<string, string> = {
    super_admin: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300',
    applicant: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300',
    local_agency: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300',
    international_agency: 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300',
    employer: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
        <p className="text-muted-foreground text-sm">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="applicant">Applicant</SelectItem>
                <SelectItem value="local_agency">Local Agency</SelectItem>
                <SelectItem value="international_agency">FIRA Admin</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user: any) => (
            <Card key={user.id} className={`border ${!user.isActive ? 'border-red-100 dark:border-red-900/50 opacity-60' : 'border-border dark:border-blue-900/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`text-xs font-semibold ${user.isActive ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' : 'bg-muted text-muted-foreground'}`}>
                      {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{user.name}</h3>
                      <Badge className={`text-xs ${roleColor[user.role] || 'bg-muted'}`}>
                        {roleDisplayNames[user.role as keyof typeof roleDisplayNames]?.en || user.role}
                      </Badge>
                      {!user.isApproved && <Badge variant="destructive" className="text-xs">Pending</Badge>}
                      {!user.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0 hidden sm:block">
                    <p>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!user.isApproved && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateMutation.mutate({ userId: user.id, action: 'approve' })}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => updateMutation.mutate({ userId: user.id, action: 'reject' })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUser(user); setDialogOpen(true) }}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                    {user.isActive ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={() => updateMutation.mutate({ userId: user.id, action: 'deactivate' })}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateMutation.mutate({ userId: user.id, action: 'activate' })}>
                        <Unlock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-lg font-bold">
                    {selectedUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <Badge className="mt-2">{roleDisplayNames[selectedUser.role as keyof typeof roleDisplayNames]?.en || selectedUser.role}</Badge>
              </div>
              <div className="space-y-2 text-sm bg-muted rounded-lg p-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{selectedUser.isActive ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approved</span><span>{selectedUser.isApproved ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{selectedUser.phone || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
              </div>
              <div className="flex gap-2">
                {!selectedUser.isApproved && (
                  <Button className="flex-1" onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: 'approve' })}>Approve</Button>
                )}
                {selectedUser.isActive ? (
                  <Button variant="outline" className="flex-1 text-orange-600" onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: 'deactivate' })}>Deactivate</Button>
                ) : (
                  <Button variant="outline" className="flex-1 text-green-600" onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: 'activate' })}>Activate</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
