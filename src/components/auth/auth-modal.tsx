'use client'

import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff, Globe, User, Briefcase, Building2, ShieldCheck, AlertTriangle, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useAppStore, type UserRole, roleDisplayNames } from '@/store/app-store'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['applicant', 'local_agency', 'international_agency', 'employer'] as const),
    agencyName: z.string().optional(),
    phone: z.string().optional(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service and Data Privacy Consent' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => {
    if (data.role === 'local_agency' || data.role === 'international_agency') {
      return data.agencyName && data.agencyName.length >= 2
    }
    return true
  }, {
    message: 'Agency name is required',
    path: ['agencyName'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

function getPasswordStrength(password: string): { score: number; label: string; color: string; checks: { label: string; met: boolean }[] } {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]

  const score = checks.filter(c => c.met).length

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', checks }
  if (score === 2) return { score, label: 'Fair', color: 'bg-orange-500', checks }
  if (score === 3) return { score, label: 'Good', color: 'bg-yellow-500', checks }
  if (score === 4) return { score, label: 'Strong', color: 'bg-green-500', checks }
  return { score, label: 'Very Strong', color: 'bg-emerald-500', checks }
}

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser, navigate, language, fontSize } = useAppStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'applicant',
      agencyName: '',
      phone: '',
      agreeTerms: false as unknown as true,
    },
  })

  const selectedRole = registerForm.watch('role')
  const passwordValue = registerForm.watch('password')
  const agreeTerms = registerForm.watch('agreeTerms')

  const passwordStrength = useMemo(() => getPasswordStrength(passwordValue || ''), [passwordValue])

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...data }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Login failed' }))
        throw new Error(err.error || 'Login failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      const role = data.user.role as UserRole
      setUser(data.user)
      setAuthModalOpen(false)
      loginForm.reset()
      toast.success(
        language === 'fil' ? 'Maligayang pagbabalik!' : 'Welcome back!',
        { description: `${language === 'fil' ? 'Naka-sign in bilang' : 'Signed in as'} ${data.user.name}` }
      )
      navigate(`${role}-dashboard` as any)
    },
    onError: (err) => {
      toast.error(
        language === 'fil' ? 'Hindi matagumpay ang pag-sign in' : 'Login failed',
        { description: err.message }
      )
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, agreeTerms, ...payload } = data as RegisterFormData & { confirmPassword: string; agreeTerms: boolean }
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...payload }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Registration failed' }))
        throw new Error(err.error || 'Registration failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setUser(data.user)
      setAuthModalOpen(false)
      registerForm.reset()

      const needsApproval = !data.user.isApproved
      if (needsApproval) {
        toast.success(
          language === 'fil' ? 'Matagumpay ang pagpaparehistro!' : 'Registration successful!',
          {
            description: language === 'fil'
              ? 'Ang iyong account ay naka-pending para sa approval.'
              : 'Your account is pending approval.',
            duration: 5000,
          }
        )
      } else {
        toast.success(
          language === 'fil' ? 'Matagumpay ang pagpaparehistro!' : 'Account created!',
          { description: language === 'fil' ? 'Maligayang bago sa FIRA!' : 'Welcome to FIRA!' }
        )
      }
      navigate('applicant-dashboard')
    },
    onError: (err) => {
      toast.error(
        language === 'fil' ? 'Hindi matagumpay ang pagpaparehistro' : 'Registration failed',
        { description: err.message }
      )
    },
  })

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-font-size={fontSize}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white font-bold text-sm">
              F
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">FIRA</span>
          </DialogTitle>
          <DialogDescription>
            {language === 'fil'
              ? 'Mag-sign in sa iyong account o gumawa ng bago'
              : 'Sign in to your account or create a new one'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-50">
            <TabsTrigger value="login" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-lg">
              {language === 'fil' ? 'Mag-sign In' : 'Sign In'}
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white rounded-lg">
              {language === 'fil' ? 'Magparehistro' : 'Register'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11"
                    {...loginForm.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 rounded-xl" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'fil' ? 'Mag-sign In' : 'Sign In'}
              </Button>

              <div className="text-center text-xs text-gray-500 space-y-1 pt-2 bg-blue-50 rounded-xl p-4">
                <p className="font-medium text-gray-700">
                  {language === 'fil' ? 'Mga Test Account:' : 'Test Accounts:'}
                </p>
                <p>Applicant: applicant@fira.com.ph</p>
                <p>Agency (PH): agency@fira.com.ph</p>
                <p>FIRA Admin: admin@fira.com.ph</p>
                <p>Employer: employer@fira.com.ph</p>
                <p className="text-gray-400">Password: see role + 2025!</p>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">
                  {language === 'fil' ? 'Buong Pangalan' : 'Full Name'}
                </Label>
                <Input
                  id="reg-name"
                  placeholder={language === 'fil' ? 'Juan Dela Cruz' : 'Juan Dela Cruz'}
                  className="h-11"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-role">
                  {language === 'fil' ? 'Ako ay isang...' : 'I am a...'}
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(val) => registerForm.setValue('role', val as UserRole)}
                >
                  <SelectTrigger id="reg-role" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        <span>{language === 'fil' ? 'Aplikante (Job Seeker)' : 'Applicant (Job Seeker)'}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="local_agency">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{language === 'fil' ? 'Ahensya sa Pilipinas' : 'Local Agency (Philippines)'}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="international_agency">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>FIRA Admin (International)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="employer">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{language === 'fil' ? 'Empleyador (Foreign)' : 'Employer (Foreign)'}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedRole === 'local_agency' || selectedRole === 'international_agency') && (
                <div className="space-y-2">
                  <Label htmlFor="reg-agency">
                    {language === 'fil' ? 'Pangalan ng Ahensya' : 'Agency Name'}
                  </Label>
                  <Input
                    id="reg-agency"
                    placeholder={language === 'fil' ? 'Pangalan ng ahensya...' : 'Agency name...'}
                    className="h-11"
                    {...registerForm.register('agencyName')}
                  />
                  {registerForm.formState.errors.agencyName && (
                    <p className="text-xs text-red-500">{registerForm.formState.errors.agencyName.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg-phone">
                  {language === 'fil' ? 'Numero ng Telepono (Optional)' : 'Phone Number (Optional)'}
                </Label>
                <Input
                  id="reg-phone"
                  placeholder="+63 917 000 0000"
                  className="h-11"
                  {...registerForm.register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11"
                    {...registerForm.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.password.message}</p>
                )}

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Password Strength</span>
                      <span className={`font-medium ${passwordStrength.score <= 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-orange-500' : passwordStrength.score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="space-y-1">
                      {passwordStrength.checks.map((check, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs">
                          <Check className={`h-3 w-3 ${check.met ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={check.met ? 'text-green-700' : 'text-gray-400'}>{check.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">
                  {language === 'fil' ? 'Kumpirmahin ang Password' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11"
                    {...registerForm.register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms & Privacy Agreement */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree-terms"
                    checked={!!agreeTerms}
                    onCheckedChange={(checked) => registerForm.setValue('agreeTerms', checked === true ? true : false as unknown as true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="agree-terms" className="text-xs leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => useAppStore.getState().navigate('cms-terms')}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => useAppStore.getState().navigate('cms-terms')}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Data Privacy Consent
                    </button>
                  </Label>
                </div>
                {registerForm.formState.errors.agreeTerms && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.agreeTerms.message}</p>
                )}
              </div>

              {(selectedRole === 'local_agency' || selectedRole === 'international_agency' || selectedRole === 'employer') && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-800">
                    {language === 'fil'
                      ? 'Ang iyong account ay kailangang i-approve muna bago ka makagamit ng system.'
                      : 'Your account needs approval before you can use the system.'}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 rounded-xl" disabled={registerMutation.isPending}>
                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'fil' ? 'Gumawa ng Account' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
