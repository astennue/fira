'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { AppUser } from '@/lib/types';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setUser, setAuthModalMode } = useAppStore();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('applicant');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user as AppUser);
        setAuthModalOpen(false);
        toast.success(`Welcome back, ${data.user.name}!`);
      } else {
        toast.error(data.error || t('auth.loginError'));
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: regName, email: regEmail, password: regPassword, role: regRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user as AppUser);
        setAuthModalOpen(false);
        toast.success(t('auth.registerSuccess'));
      } else {
        toast.error(data.error || t('auth.registerError'));
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            {authModalMode === 'login' ? t('auth.login') : t('auth.register')}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={authModalMode}
          onValueChange={(v) => setAuthModalMode(v as 'login' | 'register')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              {t('auth.signIn')}
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              {t('auth.signUp')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('auth.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin " />}
                {t('auth.signIn')}
              </Button>

              {/* Quick login buttons for demo */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center mb-2">Demo Accounts</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setLoginEmail('admin@fira.com.ph'); setLoginPassword('FiraAdmin2025!'); }}
                  >
                    FIRA Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setLoginEmail('agency@fira.com.ph'); setLoginPassword('AgencyAdmin2025!'); }}
                  >
                    Agency
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setLoginEmail('employer@fira.com.ph'); setLoginPassword('FiraEmployer2025!'); }}
                  >
                    Employer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setLoginEmail('applicant@fira.com.ph'); setLoginPassword('Applicant2025!'); }}
                  >
                    Applicant
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">{t('auth.fullName')}</Label>
                <Input
                  id="reg-name"
                  placeholder="Juan Dela Cruz"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">{t('auth.email')}</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t('auth.password')}</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('auth.selectRole')}</Label>
                <Select value={regRole} onValueChange={setRegRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">{t('auth.role.applicant')}</SelectItem>
                    <SelectItem value="agency_admin">{t('auth.role.agency')}</SelectItem>
                    <SelectItem value="employer">{t('auth.role.employer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin " />}
                {t('auth.signUp')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}