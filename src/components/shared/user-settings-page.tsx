'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Phone, Lock, Camera, Save, Eye, EyeOff, Check, Loader2, Type } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type FontSize } from '@/store/app-store'
import { toast } from 'sonner'

export function UserSettingsPage() {
  const { user, setUser, fontSize, setFontSize, language } = useAppStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const profileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/applicant-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-user', name, phone }),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => {
      if (user) setUser({ ...user, name, phone })
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-verification-code', email: user?.email, type: 'password_change' }),
      })
      if (!res.ok) throw new Error('Failed to send code')
      return res.json()
    },
    onSuccess: () => {
      setCodeSent(true)
      toast.success('Verification code sent to your email!')
    },
    onError: () => {
      setCodeSent(true)
      toast.info('For demo, use code: 123456')
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-code', email: user?.email, code: verificationCode, type: 'password_change' }),
      })
      if (!res.ok) throw new Error('Invalid code')
      return res.json()
    },
    onSuccess: () => {
      setCodeVerified(true)
      toast.success('Code verified!')
    },
    onError: () => toast.error('Invalid verification code'),
  })

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match')
      if (!codeVerified) throw new Error('Please verify your code first')
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', email: user?.email, currentPassword, newPassword }),
      })
      if (!res.ok) throw new Error('Failed to change password')
      return res.json()
    },
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setVerificationCode('')
      setCodeSent(false)
      setCodeVerified(false)
      toast.success('Password changed successfully!')
    },
    onError: (err) => toast.error(err.message),
  })

  const fontSizeOptions: { value: FontSize; label: string; sample: string }[] = [
    { value: 'small', label: 'Small', sample: 'Aa' },
    { value: 'medium', label: 'Medium', sample: 'Aa' },
    { value: 'large', label: 'Large', sample: 'Aa' },
  ]

  return (
    <div data-font-size={fontSize}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'fil' ? 'Settings' : 'Settings'}
        </h1>
        <p className="text-gray-500 text-sm">Manage your account preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Badge className="mt-1">{user?.role}</Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 917 000 0000" className="h-11" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="rounded-xl">
                <Save className="mr-2 h-4 w-4" /> {profileMutation.isPending ? 'Saving...' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!codeSent ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm text-gray-500 text-center">We will send a verification code to your email to confirm your identity.</p>
                <Button onClick={() => sendCodeMutation.mutate()} disabled={sendCodeMutation.isPending} className="rounded-xl">
                  {sendCodeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send Verification Code
                </Button>
              </div>
            ) : !codeVerified ? (
              <>
                <p className="text-sm text-gray-500">Enter the 6-digit code sent to your email.</p>
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" maxLength={6} className="h-11 text-center text-lg tracking-widest font-mono" />
                </div>
                <Button onClick={() => verifyCodeMutation.mutate()} disabled={verifyCodeMutation.isPending || verificationCode.length < 6} className="rounded-xl w-full">
                  {verifyCodeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Verify Code
                </Button>
              </>
            ) : (
              <>
                <Badge className="bg-green-100 text-green-800 mb-2"><Check className="mr-1 h-3 w-3" /> Verified</Badge>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11" />
                </div>
                <Button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending} className="rounded-xl w-full">
                  {passwordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Change Password
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Font Size Preference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5 text-blue-600" /> Font Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Choose your preferred text size for better readability.</p>
            <div className="flex gap-3">
              {fontSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFontSize(opt.value)}
                  className={`flex-1 rounded-xl p-4 border-2 text-center transition-all ${fontSize === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <p className={`font-bold ${opt.value === 'small' ? 'text-sm' : opt.value === 'medium' ? 'text-base' : 'text-lg'}`}>{opt.sample}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
