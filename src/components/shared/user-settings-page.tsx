'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Phone, Lock, Camera, Save, Eye, EyeOff, Check, Loader2, Type, Shield, Upload, Minus, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

function getPasswordStrength(password: string) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special char', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]
  const score = checks.filter(c => c.met).length
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : score === 4 ? 'Strong' : 'Very Strong'
  const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-yellow-500' : score === 4 ? 'bg-green-500' : 'bg-emerald-500'
  return { score, label, color, checks }
}

export function UserSettingsPage() {
  const { user, setUser, fontSize, setFontSize, language } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
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
  const pwStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword])
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword

  const profileCompletion = useMemo(() => {
    if (!user) return 0
    let score = 0
    const fields = [user.name, user.email, user.phone, user.avatar]
    fields.forEach(f => { if (f) score += 25 })
    return Math.min(score, 100)
  }, [user])

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user')
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      if (user) setUser({ ...user, name, email, phone })
      toast.success(language === 'fil' ? 'Na-update na ang profile!' : 'Profile updated!')
    },
    onError: () => toast.error(language === 'fil' ? 'Hindi na-update ang profile' : 'Failed to update profile'),
  })

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('No user')
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await apiFetch(`/api/users/avatar?userId=${user.id}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Failed to upload')
      return res.json()
    },
    onSuccess: (data) => {
      if (user) setUser({ ...user, avatar: data.avatar })
      toast.success(language === 'fil' ? 'Na-update na ang larawan!' : 'Avatar updated!')
    },
    onError: () => toast.error(language === 'fil' ? 'Hindi na-upload ang larawan' : 'Failed to upload avatar'),
  })

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size < 5 * 1024 * 1024) {
      avatarMutation.mutate(file)
    } else {
      toast.error('Image must be less than 5MB')
    }
  }, [avatarMutation])

  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, type: 'password_change' }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      setCodeSent(true)
      toast.success(language === 'fil' ? 'Na-send na ang code sa email mo!' : 'Verification code sent!')
    },
    onError: () => {
      setCodeSent(true)
      toast.info(language === 'fil' ? 'Para sa demo, gamitin ang code: 123456' : 'For demo, use code: 123456')
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, code: verificationCode, type: 'password_change' }),
      })
      if (!res.ok) throw new Error('Invalid code')
      return res.json()
    },
    onSuccess: () => {
      setCodeVerified(true)
      toast.success(language === 'fil' ? 'Na-verify na ang code!' : 'Code verified!')
    },
    onError: () => toast.error(language === 'fil' ? 'Hindi valid ang code' : 'Invalid verification code'),
  })

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match')
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, currentPassword, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to change password')
      }
      return res.json()
    },
    onSuccess: () => {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setVerificationCode(''); setCodeSent(false); setCodeVerified(false)
      toast.success(language === 'fil' ? 'Na-change na ang password!' : 'Password changed!')
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="view-transition space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">{language === 'fil' ? 'Settings' : 'Settings'}</h1>
        <p className="text-muted-foreground text-sm">{language === 'fil' ? 'Pamahalaan ang iyong account' : 'Manage your account preferences'}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Picture + Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              {language === 'fil' ? 'Profile Picture' : 'Profile Picture'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-blue-100 dark:ring-blue-900">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="capitalize">{user?.role?.replace(/_/g, ' ')}</Badge>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{language === 'fil' ? 'Kumpleto ang Profile' : 'Profile Completion'}</span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {language === 'fil' ? 'Personal na Impormasyon' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">{language === 'fil' ? 'Buong Pangalan' : 'Full Name'}</Label>
              <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">{language === 'fil' ? 'Numero ng Telepono' : 'Phone Number'}</Label>
              <Input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 917 000 0000" className="h-11" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending} className="rounded-xl">
                {profileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {language === 'fil' ? 'I-save' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              {language === 'fil' ? 'Palitan ang Password' : 'Change Password'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!codeSent ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Shield className="h-12 w-12 text-blue-200 dark:text-blue-800" />
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {language === 'fil'
                    ? 'Magpapadala kami ng verification code sa iyong email para kumpirmahin ang iyong pagkakakilanlan.'
                    : 'We will send a verification code to your email to confirm your identity.'}
                </p>
                <Button onClick={() => sendCodeMutation.mutate()} disabled={sendCodeMutation.isPending} className="rounded-xl">
                  {sendCodeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  {language === 'fil' ? 'Magpadala ng Code' : 'Send Verification Code'}
                </Button>
              </div>
            ) : !codeVerified ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{language === 'fil' ? 'Ilagay ang 6-digit code.' : 'Enter the 6-digit code sent to your email.'}</p>
                <div className="space-y-2">
                  <Label>{language === 'fil' ? 'Verification Code' : 'Verification Code'}</Label>
                  <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" maxLength={6} className="h-12 text-center text-xl tracking-[0.5em] font-mono" />
                </div>
                <Button onClick={() => verifyCodeMutation.mutate()} disabled={verifyCodeMutation.isPending || verificationCode.length < 6} className="rounded-xl w-full">
                  {verifyCodeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {language === 'fil' ? 'I-verify' : 'Verify Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><Check className="mr-1 h-3 w-3" /> {language === 'fil' ? 'Na-verify' : 'Verified'}</Badge>

                <div className="space-y-2">
                  <Label>{language === 'fil' ? 'Kasalukuyang Password' : 'Current Password'}</Label>
                  <div className="relative">
                    <Input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'fil' ? 'Bagong Password' : 'New Password'}</Label>
                  <div className="relative">
                    <Input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {newPassword && (
                    <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{language === 'fil' ? 'Lakas ng Password' : 'Password Strength'}</span>
                        <span className={`font-semibold ${pwStrength.score <= 1 ? 'text-red-500' : pwStrength.score === 2 ? 'text-orange-500' : pwStrength.score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {pwStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} style={{ width: `${(pwStrength.score / 5) * 100}%` }} />
                      </div>
                      <ul className="grid grid-cols-2 gap-1 mt-2">
                        {pwStrength.checks.map((check, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs">
                            <Check className={`h-3 w-3 ${check.met ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                            <span className={check.met ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>{check.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{language === 'fil' ? 'Kumpirmahin ang Password' : 'Confirm New Password'}</Label>
                  <div className="relative">
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className={`h-4 w-4 ${passwordsMatch ? 'text-green-500' : 'text-red-400'}`} />
                      </div>
                    )}
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">{language === 'fil' ? 'Hindi magkatugma ang mga password' : 'Passwords do not match'}</p>
                  )}
                </div>

                <Button onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending || !currentPassword || !newPassword || !passwordsMatch} className="rounded-xl w-full">
                  {passwordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {language === 'fil' ? 'Palitan ang Password' : 'Change Password'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Font Size */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5 text-blue-600" />
              {language === 'fil' ? 'Laki ng Font' : 'Font Size'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{language === 'fil' ? 'I-adjust ang laki ng text para sa mas magandang basahin.' : 'Adjust text size for better readability.'}</p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setFontSize(fontSize - 2)}
                disabled={fontSize <= 12}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <input
                  type="range"
                  min={12}
                  max={28}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>12px</span>
                  <span className="font-semibold text-foreground">{fontSize}px</span>
                  <span>28px</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setFontSize(fontSize + 2)}
                disabled={fontSize >= 28}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-foreground">
                {language === 'fil'
                  ? 'Halimbawa ng text. Ito ang magiging laki ng text sa buong site.'
                  : 'Sample text preview. This will be the text size across the site.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
