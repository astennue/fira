'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Eye, UserCheck, UserX, Briefcase, Star, Globe, Phone, Mail, MapPin, FileText, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Endorsement {
  id: string;
  agencyStatus: string;
  firaStatus: string;
  employerStatus: string;
  agencyNotes?: string;
  firaNotes?: string;
  employerNotes?: string;
  createdAt: string;
  application: {
    id: string;
    applicant: { id: string; name: string; email: string; role: string };
    jobOrder: { title: string; employer?: { companyName: string; country: string } };
  };
}

export function EmployerDashboard({ showEndorsements, showProfile }: { showEndorsements?: boolean; showProfile?: boolean } = {}) {
  const { user, navigate } = useAppStore();
  const { t } = useI18n();
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/endorsements').then(r => r.json()).then(data => {
      setEndorsements(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'employer_accept' | 'employer_decline') => {
    const res = await fetch('/api/endorsements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, actionedById: user?.id }),
    });
    if (res.ok) {
      setEndorsements(prev => prev.map(e => e.id === id ? { ...e, employerStatus: action === 'employer_accept' ? 'accepted' : 'declined' } : e));
      toast.success(action === 'employer_accept' ? 'Candidate accepted!' : 'Candidate declined');
    }
  };

  const pending = endorsements.filter(e => e.employerStatus === 'pending');
  const accepted = endorsements.filter(e => e.employerStatus === 'accepted');

  if (showProfile) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.myProfile')}</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-amber-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="bg-amber-100 text-amber-700 mt-1">Employer</Badge>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">Employer profile management. Contact FIRA admin to update company details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('employer.dashboard.title')}</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t('employer.dashboard.pendingEndorsements'), value: pending.length, icon: FileText, color: 'bg-amber-100 text-amber-700' },
          { label: t('employer.dashboard.accepted'), value: accepted.length, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { label: t('employer.dashboard.totalEndorsements'), value: endorsements.length, icon: Users, color: 'bg-blue-100 text-blue-700' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">{t('employer.endorsements.title')}</h2>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
      ) : endorsements.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">No endorsements received yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {endorsements.map(e => {
            const isAccepted = e.employerStatus === 'accepted';
            const isPending = e.employerStatus === 'pending';
            return (
              <Card key={e.id} className={isAccepted ? 'ring-2 ring-green-500' : ''}>
                <CardContent className="p-4">
                  {isPending && (
                    <Alert className="mb-3 border-amber-200 bg-amber-50">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800">
                        {t('employer.endorsements.profileOnly')}
                      </AlertDescription>
                    </Alert>
                  )}
                  {isAccepted && (
                    <Alert className="mb-3 border-green-100 bg-green-50">
                      <Eye className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-xs text-green-700">
                        {t('employer.endorsements.contactRevealed')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="font-semibold">{e.application?.applicant?.name || 'Unknown Applicant'}</p>
                        <p className="text-sm text-muted-foreground">{e.application?.jobOrder?.title}</p>
                        {isAccepted && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{e.application?.applicant?.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${e.firaStatus === 'approved' ? 'bg-green-100 text-green-700' : e.firaStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        FIRA: {e.firaStatus}
                      </Badge>
                      <Badge className={`text-[10px] ${e.employerStatus === 'accepted' ? 'bg-green-100 text-green-700' : e.employerStatus === 'declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {e.employerStatus}
                      </Badge>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(e.id, 'employer_accept')}>
                        <UserCheck className="h-4 w-4 " />{t('employer.endorsements.accept')}
                      </Button>
                      <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleAction(e.id, 'employer_decline')}>
                        <UserX className="h-4 w-4 " />{t('employer.endorsements.decline')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}