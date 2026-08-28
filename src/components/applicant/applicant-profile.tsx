'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { COUNTRIES, JOB_CATEGORIES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Save, Pencil, MapPin, Phone, Globe, Briefcase, Star, GraduationCap, Award, FileText, BookOpen, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  nickname?: string;
  birthDate?: string;
  gender?: string;
  civilStatus?: string;
  religion?: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  emailAddress?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  sssNumber?: string;
  pagibigNumber?: string;
  philhealthNumber?: string;
  tinNumber?: string;
  preferredCountry?: string;
  preferredJobCategory?: string;
  salaryExpectation?: number;
  availabilityDate?: string;
  education?: { level: string; schoolName: string; course?: string; fromYear?: number; toYear?: number; isGraduated: boolean }[];
  experience?: { employerName: string; country?: string; position: string; duties?: string; salary?: number }[];
  skills?: { category: string; name: string; proficiency: string; yearsExperience?: number }[];
  languages?: { language: string; proficiency: string }[];
}

const defaultProfile: ProfileData = {
  firstName: '', lastName: '', gender: '', civilStatus: '', nationality: 'Filipino',
};

export function ApplicantProfile() {
  const { user } = useAppStore();
  const { t } = useI18n();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [originalProfile, setOriginalProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/profile', { headers: { 'x-user-id': user.id } })
      .then(r => r.json())
      .then(data => {
        const p = data.applicantProfile || defaultProfile;
        setProfile(p);
        setOriginalProfile(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ applicantProfile: profile }),
      });
      if (res.ok) {
        toast.success('Profile saved!');
        setEditing(false);
        setOriginalProfile(profile);
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Connection error'); }
    finally { setSaving(false); }
  };

  const update = (key: string, value: string | number | undefined) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
      <Icon className="h-4 w-4 text-green-600" />
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
  );

  const Field = ({ label, value, field, type = 'text', options }: { label: string; value: string | number | undefined; field: string; type?: string; options?: { value: string; label: string }[] }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? (
        options ? (
          <Select value={String(value || '')} onValueChange={v => update(field, v)}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input type={type} value={String(value || '')} onChange={e => update(field, type === 'number' ? Number(e.target.value) : e.target.value)} className="h-10" />
        )
      ) : (
        <p className="text-sm font-medium min-h-[2.5rem] flex items-center">{value || '-'}</p>
      )}
    </div>
  );

  const genderOptions = [{ value: 'male', label: t('form.gender.male') }, { value: 'female', label: t('form.gender.female') }];
  const civilOptions = [
    { value: 'single', label: t('form.civilStatus.single') },
    { value: 'married', label: t('form.civilStatus.married') },
    { value: 'widowed', label: t('form.civilStatus.widowed') },
    { value: 'separated', label: t('form.civilStatus.separated') },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">{t('applicant.profile.title')}</h1>
        <Button
          variant={editing ? 'default' : 'outline'}
          className={editing ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {saving ? 'Saving...' : editing ? <><Save className="h-4 w-4 " />{t('common.save')}</> : <><Pencil className="h-4 w-4 " />{t('applicant.profile.edit')}</>}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 space-y-1">
          <SectionHeader icon={User} title="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('form.firstName')} value={profile.firstName} field="firstName" />
            <Field label={t('form.lastName')} value={profile.lastName} field="lastName" />
            <Field label={t('form.middleName')} value={profile.middleName} field="middleName" />
            <Field label={t('form.nickname')} value={profile.nickname} field="nickname" />
            <Field label={t('form.birthDate')} value={profile.birthDate?.split('T')[0]} field="birthDate" type="date" />
            <Field label={t('form.gender')} value={profile.gender} field="gender" options={genderOptions} />
            <Field label={t('form.civilStatus')} value={profile.civilStatus} field="civilStatus" options={civilOptions} />
            <Field label={t('form.religion')} value={profile.religion} field="religion" />
            <Field label={t('form.height')} value={profile.heightCm} field="heightCm" type="number" />
            <Field label={t('form.weight')} value={profile.weightKg} field="weightKg" type="number" />
            <Field label={t('form.bloodType')} value={profile.bloodType} field="bloodType" />
          </div>

          <Separator className="my-4" />
          <SectionHeader icon={Phone} title="Contact Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('form.mobileNumber')} value={profile.mobileNumber} field="mobileNumber" />
            <Field label={t('form.emailAddress')} value={profile.emailAddress} field="emailAddress" />
            <div className="sm:col-span-2"><Field label={t('form.presentAddress')} value={profile.presentAddress} field="presentAddress" /></div>
            <div className="sm:col-span-2"><Field label={t('form.permanentAddress')} value={profile.permanentAddress} field="permanentAddress" /></div>
          </div>

          <Separator className="my-4" />
          <SectionHeader icon={User} title="Emergency Contact" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t('form.emergencyName')} value={profile.emergencyName} field="emergencyName" />
            <Field label={t('form.emergencyRelation')} value={profile.emergencyRelation} field="emergencyRelation" />
            <Field label={t('form.emergencyPhone')} value={profile.emergencyPhone} field="emergencyPhone" />
          </div>

          <Separator className="my-4" />
          <SectionHeader icon={FileText} title="Identification" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('form.passportNumber')} value={profile.passportNumber} field="passportNumber" />
            <Field label={t('form.sssNumber')} value={profile.sssNumber} field="sssNumber" />
            <Field label={t('form.pagibigNumber')} value={profile.pagibigNumber} field="pagibigNumber" />
            <Field label={t('form.philhealthNumber')} value={profile.philhealthNumber} field="philhealthNumber" />
            <Field label={t('form.tinNumber')} value={profile.tinNumber} field="tinNumber" />
          </div>

          <Separator className="my-4" />
          <SectionHeader icon={Heart} title="Preferences" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('form.preferredCountry')} value={profile.preferredCountry} field="preferredCountry" options={COUNTRIES.map(c => ({ value: c, label: c }))} />
            <Field label="Job Category" value={profile.preferredJobCategory} field="preferredJobCategory" options={JOB_CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
            <Field label={t('common.salary')} value={profile.salaryExpectation} field="salaryExpectation" type="number" />
            <Field label="Availability" value={profile.availabilityDate?.split('T')[0]} field="availabilityDate" type="date" />
          </div>
        </CardContent>
      </Card>

      {/* Skills & Experience display (read-only for now) */}
      {!editing && profile.skills && profile.skills.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-green-600" />Skills</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{s.name} ({s.proficiency})</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {!editing && profile.experience && profile.experience.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-green-600" />Work Experience</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {profile.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-green-100 pl-3">
                <p className="font-medium text-sm">{exp.position} - {exp.employerName}</p>
                <p className="text-xs text-muted-foreground">{exp.country} · {exp.salary ? `$${exp.salary}/mo` : ''}</p>
                {exp.duties && <p className="text-xs text-muted-foreground mt-1">{exp.duties}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!editing && profile.languages && profile.languages.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-green-600" />Languages</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {profile.languages.map((l, i) => (
              <Badge key={i} variant="outline" className="text-xs">{l.language} - {l.proficiency}</Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}