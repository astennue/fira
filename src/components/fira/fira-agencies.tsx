'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Agency { id: string; name: string; licenseNo?: string; address?: string; isApproved: boolean; owner?: { name: string; email: string }; members?: { user: { name: string } }[]; _count?: { applicants: number; jobOrders: number } }

export function FiraAgencies() {
  const { t } = useI18n();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/agencies').then(r => r.json()).then(data => {
      setAgencies(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, isApproved: boolean) => {
    const res = await fetch('/api/agencies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isApproved }) });
    if (res.ok) {
      setAgencies(prev => prev.map(a => a.id === id ? { ...a, isApproved } : a));
      toast.success(isApproved ? 'Agency approved' : 'Agency rejected');
    }
  };

  const filtered = agencies.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.agencies')}</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search agencies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : (
        <div className="space-y-3">
          {filtered.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-700" /></div>
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.licenseNo || 'No license'} · {a.address || 'No address'}</p>
                      <p className="text-xs text-muted-foreground">Owner: {a.owner?.name} · {a._count?.applicants || 0} applicants · {a._count?.jobOrders || 0} jobs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={a.isApproved ? 'bg-green-100 text-green-700 text-xs' : 'bg-amber-100 text-amber-700 text-xs'}>{a.isApproved ? 'Approved' : 'Pending'}</Badge>
                    <Button size="sm" variant="outline" className={`h-8 text-xs ${a.isApproved ? 'text-red-600 hover:text-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      onClick={() => handleToggle(a.id, !a.isApproved)}>
                      {a.isApproved ? <><XCircle className="h-3 w-3 " />Reject</> : <><CheckCircle className="h-3 w-3 " />Approve</>}
                    </Button>
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