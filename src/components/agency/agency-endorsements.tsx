'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Endorsement {
  id: string;
  agencyStatus: string;
  firaStatus: string;
  employerStatus: string;
  agencyNotes?: string;
  firaNotes?: string;
  createdAt: string;
  application: { applicant: { name: string }; jobOrder: { title: string; employer?: { companyName: string } } };
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', endorsed: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-800',
};

export function AgencyEndorsements() {
  const { t } = useI18n();
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/endorsements').then(r => r.json()).then(data => {
      setEndorsements(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.endorsements')}</h1>
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : endorsements.length === 0 ? (
        <Card className="py-12 px-4 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">No endorsements yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {endorsements.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.application?.applicant?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{e.application?.jobOrder?.title} · {e.application?.jobOrder?.employer?.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] ${statusColors[e.agencyStatus] || 'bg-gray-100'}`}>Agency: {e.agencyStatus}</Badge>
                    <Badge className={`text-[10px] ${statusColors[e.firaStatus] || 'bg-gray-100'}`}>FIRA: {e.firaStatus}</Badge>
                    <Badge className={`text-[10px] ${statusColors[e.employerStatus] || 'bg-gray-100'}`}>Employer: {e.employerStatus}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}