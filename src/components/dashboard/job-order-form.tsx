'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Send, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'

const CATEGORIES = [
  'Domestic Helper', 'Caregiver', 'Healthcare Worker', 'Construction Worker',
  'Hospitality Staff', 'Office Staff', 'Engineering', 'IT Professional',
  'Manufacturing', 'Agriculture', 'Other',
] as const

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract'] as const
const SALARY_PERIODS = ['Monthly', 'Weekly', 'Daily', 'Annual'] as const
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'SGD', 'HKD', 'PHP'] as const

type FormErrors = Record<string, string>

/**
 * Shared job order submission form for employers (endorsement to FIRA) and
 * local agencies. Submissions enter the FIRA approval queue (status:
 * pending, hidden from public until a FIRA approver publishes them).
 */
export function JobOrderForm({ mode }: { mode: 'agency' | 'employer' }) {
  const { user, navigate, language } = useAppStore()
  const isFil = language === 'fil'
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [jobType, setJobType] = useState('')
  const [duration, setDuration] = useState('')
  const [slots, setSlots] = useState('1')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('USD')
  const [salaryPeriod, setSalaryPeriod] = useState('Monthly')
  const [requirements, setRequirements] = useState('')
  const [benefits, setBenefits] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [deadline, setDeadline] = useState('')

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!title.trim()) e.title = isFil ? 'Kailangan ang posisyon' : 'Position title is required'
    if (!description.trim()) e.description = isFil ? 'Kailangan ang deskripsyon' : 'Description is required'
    if (!country.trim()) e.country = isFil ? 'Kailangan ang bansa' : 'Country is required'
    if (!category) e.category = isFil ? 'Kailangan ang kategorya' : 'Category is required'
    if (!requirements.trim()) e.requirements = isFil ? 'Kailangan ang mga requirement' : 'Requirements are required'
    if (!requiredSkills.trim()) e.requiredSkills = isFil ? 'Kailangan ang mga kasanayan' : 'Required skills are needed'
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      e.salaryMax = isFil ? 'Dapat mas mataas sa minimum' : 'Must be higher than minimum'
    }
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!user) return
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error(isFil ? 'May mga kulang na field. Pakikumpleto.' : 'Some fields are missing. Please complete them.')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          country,
          city: city || undefined,
          category,
          jobType: jobType || undefined,
          duration: duration || undefined,
          slots: Number(slots) || 1,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          salaryCurrency,
          salaryPeriod: salaryPeriod || undefined,
          contractType: jobType || undefined,
          requirements,
          benefits: benefits || undefined,
          requiredSkills,
          deadline: deadline || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || (isFil ? 'Hindi na-save ang job order.' : 'Failed to submit job order.'))
        return
      }
      toast.success(isFil
        ? 'Naipasa ang job order! Naghihintay na ng approval mula sa FIRA.'
        : 'Job order submitted! Awaiting FIRA approval.')
      navigate(mode === 'agency' ? 'agency-jobs' : 'employer-jobs')
    } catch {
      toast.error(isFil ? 'May naganap na error. Subukan muli.' : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const err = (field: string) =>
    errors[field] ? (
      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" />{errors[field]}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-900 dark:text-blue-200">
            {isFil
              ? 'Ang job order na ito ay ipapadala sa FIRA para sa approval. Makikita ito ng publiko kapag inaprubahan na ng FIRA staff.'
              : 'This job order will be sent to FIRA for approval. It becomes publicly visible once a FIRA staff approves it.'}
          </p>
          <Badge className="ml-auto shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {isFil ? 'Naghihintay' : 'Pending review'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">{isFil ? 'Posisyon / Job Title' : 'Position / Job Title'} *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isFil ? 'hal. Domestic Helper' : 'e.g. Domestic Helper'} className="mt-1.5" />
              {err('title')}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">{isFil ? 'Deskripsyon ng Trabaho' : 'Job Description'} *</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder={isFil ? 'Ilarawan ang mga tungkulin, responsibilidad, at working conditions...' : 'Describe duties, responsibilities, and working conditions...'} className="mt-1.5" />
              {err('description')}
            </div>
            <div>
              <Label htmlFor="country">{isFil ? 'Bansa ng Pagtatrabaho' : 'Country of Work'} *</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={isFil ? 'hal. Morocco' : 'e.g. Morocco'} className="mt-1.5" />
              {err('country')}
            </div>
            <div>
              <Label htmlFor="city">{isFil ? 'Lungsod (Opsyonal)' : 'City (Optional)'}</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder={isFil ? 'hal. Casablanca' : 'e.g. Casablanca'} className="mt-1.5" />
            </div>
            <div>
              <Label>{isFil ? 'Kategorya' : 'Category'} *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={isFil ? 'Pumili ng kategorya' : 'Select category'} /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {err('category')}
            </div>
            <div>
              <Label>{isFil ? 'Uri ng Trabaho' : 'Job Type'}</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={isFil ? 'Pumili' : 'Select type'} /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">{isFil ? 'Sahod at Detalye' : 'Salary & Details'}</h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="salaryMin">{isFil ? 'Minimum na Sahod' : 'Minimum Salary'}</Label>
              <Input id="salaryMin" type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="salaryMax">{isFil ? 'Maximum na Sahod' : 'Maximum Salary'}</Label>
              <Input id="salaryMax" type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="mt-1.5" />
              {err('salaryMax')}
            </div>
            <div>
              <Label>{isFil ? 'Currency' : 'Currency'}</Label>
              <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isFil ? 'Período' : 'Period'}</Label>
              <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SALARY_PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="slots">{isFil ? 'Bilang ng Slots' : 'Number of Slots'}</Label>
              <Input id="slots" type="number" min="1" value={slots} onChange={(e) => setSlots(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="duration">{isFil ? 'Kontrata / Duration (Opsyonal)' : 'Contract / Duration (Optional)'}</Label>
              <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={isFil ? 'hal. 2 taon' : 'e.g. 2 years'} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="deadline">{isFil ? 'Application Deadline (Opsyonal)' : 'Application Deadline (Optional)'}</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <Label htmlFor="requirements">{isFil ? 'Mga Kinalangan' : 'Requirements'} *</Label>
            <Textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} placeholder={isFil ? 'hal. Edad 23-45, may karanasan kahit 2 taon, handang magtrabaho sa abroad...' : 'e.g. Age 23-45, at least 2 years experience, willing to work abroad...'} className="mt-1.5" />
            {err('requirements')}
          </div>
          <div>
            <Label htmlFor="requiredSkills">{isFil ? 'Mga Kasanayan (hiwalay ng kuwit)' : 'Required Skills (comma-separated)'} *</Label>
            <Textarea id="requiredSkills" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} rows={3} placeholder={isFil ? 'hal. Pagluluto, Paglilinis, Pag-aalaga ng bata' : 'e.g. Cooking, Cleaning, Child care'} className="mt-1.5" />
            {err('requiredSkills')}
          </div>
          <div>
            <Label htmlFor="benefits">{isFil ? 'Mga Benepisyo (Opsyonal)' : 'Benefits (Optional)'}</Label>
            <Textarea id="benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder={isFil ? 'hal. Libreng tirahan, pagkain, health insurance, plane ticket' : 'e.g. Free lodging, food, health insurance, plane ticket'} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading
            ? (isFil ? 'Ipinapadala...' : 'Submitting...')
            : (isFil ? 'Ipasa ang Job Order sa FIRA' : 'Submit Job Order to FIRA')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(mode === 'agency' ? 'agency-jobs' : 'employer-jobs')}
          className="rounded-xl"
        >
          {isFil ? 'Kanselahin' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
