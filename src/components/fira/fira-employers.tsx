'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Employer { id: string; companyName: string; companyAddress?: string; country?: string; contactPerson?: string; contactEmail?: string; isApproved: boolean; user?: { name: string; email: string; isActive: boolean }; _count?: { jobOrders: number; endorsements: number } }

export function FiraEmployers() {
  const { t } = useI18n();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/employers').then(r => r.json()).then(data => {
      setEmployers(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, isApproved: boolean) => {
    const res = await fetch('/api/employers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isApproved }) });
    if (res.ok) {
      setEmployers(prev => prev.map(e => e.id === id ? { ...e, isApproved } : e));
      toast.success(isApproved ? 'Employer approved' : 'Employer rejected');
    }
  };

  const filtered = employers.filter(e => !search || e.companyName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">{t('nav.employers')}</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search employers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : (
        <div className="space-y-3">
          {filtered.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Globe className="h-5 w-5 text-blue-700" /></div>
                    <div>
                      <p className="font-semibold">{e.companyName}</p>
                      <p className="text-xs text-muted-foreground">{e.country || 'Unknown'} · {e.contactPerson || e.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{e.contactEmail || e.user?.email} · {e._count?.jobOrders || 0} jobs · {e._count?.endorsements || 0} endorsements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={e.isApproved ? 'bg-green-100 text-green-700 text-xs' : 'bg-amber-100 text-amber-700 text-xs'}>{e.isApproved ? 'Approved' : 'Pending'}</Badge>
                    <Button size="sm" variant="outline" className={`h-8 text-xs ${e.isApproved ? 'text-red-600 hover:text-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      onClick={() => handleToggle(e.id, !e.isApproved)}>
                      {e.isApproved ? <><XCircle className="h-3 w-3 " />Reject</> : <><CheckCircle className="h-3 w-3 " />Approve</>}
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