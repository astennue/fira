'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Loader2, Plus, MapPin, Banknote, Briefcase, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/fetch'
import { convertToPHP, formatPHP, getCurrencySymbol } from '@/lib/currency'
import { useQuery } from '@tanstack/react-query'

const CATEGORIES = [
  'Domestic Helper',
  'Caregiver',
  'Healthcare Worker',
  'Construction Worker',
  'Hospitality Staff',
  'Office Staff',
  'Engineering',
  'IT Professional',
  'Manufacturing',
  'Agriculture',
  'Other',
] as const

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract'] as const

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'SAR', symbol: '﷼' },
  { code: 'QAR', symbol: '﷼' },
  { code: 'KWD', symbol: 'د.ك' },
  { code: 'BHD', symbol: 'د.ب' },
  { code: 'OMR', symbol: 'ر.ع.' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'HKD', symbol: 'HK$' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'TWD', symbol: 'NT$' },
  { code: 'KRW', symbol: '₩' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'NZD', symbol: 'NZ$' },
  { code: 'PHP', symbol: '₱' },
] as const

const SALARY_PERIODS = ['Monthly', 'Weekly', 'Daily', 'Annual'] as const
const VISIBILITIES = [
  { value: 'public', label: 'Public', labelFil: 'Pampubliko' },
  { value: 'private', label: 'Private', labelFil: 'Pribado' },
  { value: 'agency_only', label: 'Agency Only', labelFil: 'Ahensya Lamang' },
] as const

type FormErrors = Record<string, string>

export function FiraJobCreatePage() {
  const { user, navigate, language } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Form state
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
  const [salaryPeriod, setSalaryPeriod] = useState('')
  const [requirements, setRequirements] = useState('')
  const [benefits, setBenefits] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [deadline, setDeadline] = useState('')
  const [employerId, setEmployerId] = useState('')
  const [agencyId, setAgencyId] = useState('')

  // Fetch employers
  const { data: employersData } = useQuery({
    queryKey: ['employers-select'],
    queryFn: async () => {
      const res = await apiFetch('/api/employers')
      if (!res.ok) return { employers: [] }
      return res.json()
    },
  })
  const employers = Array.isArray(employersData?.employers) ? employersData.employers : []

  // Fetch agencies
  const { data: agenciesData } = useQuery({
    queryKey: ['agencies-select'],
    queryFn: async () => {
      const res = await apiFetch('/api/agencies')
      if (!res.ok) return { agencies: [] }
      return res.json()
    },
  })
  const agencies = Array.isArray(agenciesData?.agencies) ? agenciesData.agencies : []

  const isFil = language === 'fil'

  // Validation
  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}
    if (!title.trim()) newErrors.title = isFil ? 'Kinakailangan ang posisyon.' : 'Job title is required.'
    if (!description.trim()) newErrors.description = isFil ? 'Kinakailangan ang deskripsyon.' : 'Description is required.'
    if (!country.trim()) newErrors.country = isFil ? 'Kinakailangan ang bansa.' : 'Country is required.'
    if (!category) newErrors.category = isFil ? 'Pumili ng kategorya.' : 'Please select a category.'
    if (!requirements.trim()) newErrors.requirements = isFil ? 'Kinakailangan ang mga kinakailangan.' : 'Requirements are required.'
    if (!requiredSkills.trim()) newErrors.requiredSkills = isFil ? 'Kinakailangan ang mga kasanayan.' : 'Required skills are required.'
    if (salaryMin && salaryMax && Number(salaryMax) < Number(salaryMin)) {
      newErrors.salaryMax = isFil ? 'Hindi dapat mas mababa sa minimum.' : 'Must not be less than minimum.'
    }
    if (salaryMin && Number(salaryMin) < 0) {
      newErrors.salaryMin = isFil ? 'Hindi dapat negatibo.' : 'Must not be negative.'
    }
    return newErrors
  }, [title, description, country, category, requirements, requiredSkills, salaryMin, salaryMax, isFil])

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const showFieldError = (field: string) => touched[field] && errors[field]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Mark all required fields as touched so errors show
      setTouched({
        title: true,
        description: true,
        country: true,
        category: true,
        requirements: true,
        requiredSkills: true,
        salaryMin: true,
        salaryMax: true,
      })
      toast.error(isFil ? 'May mga maling field. Pakiayusin.' : 'There are errors. Please fix them.')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userRole: user.role,
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
          visibility,
          deadline: deadline || undefined,
          employerId: employerId || undefined,
          agencyId: agencyId || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create job order' }))
        throw new Error(err.error || 'Failed to create job order')
      }

      toast.success(isFil ? 'Matagumpay na nagawa ang job order!' : 'Job order created successfully!')
      navigate('fira-jobs')
    } catch (error: any) {
      toast.error(error.message || (isFil ? 'Nag-error. Subukan muli.' : 'An error occurred. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // PHP conversion values
  const phpMin = salaryMin && Number(salaryMin) > 0 ? convertToPHP(Number(salaryMin), salaryCurrency) : null
  const phpMax = salaryMax && Number(salaryMax) > 0 ? convertToPHP(Number(salaryMax), salaryCurrency) : null
  const periodLabel = salaryPeriod
    ? salaryPeriod.toLowerCase()
    : isFil ? 'buwan' : 'month'

  return (
    <div className="view-transition space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('fira-jobs')} aria-label={isFil ? 'Bumalik' : 'Back'}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6" />
            {isFil ? 'Gumawa ng Job Order' : 'Create Job Order'}
          </h1>
          <p className="text-muted-foreground mt-0.5">
            {isFil ? 'Gumawa ng bagong job order para sa mga employer' : 'Create a new job order on behalf of an employer'}
          </p>
        </div>
      </div>

      {/* Summary validation error banner */}
      {Object.keys(errors).length > 0 && touched.title && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">
              {isFil ? 'May mga kinakailangang field na hindi pa napupunan:' : 'Some required fields need your attention:'}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Job Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {isFil ? 'Detalye ng Trabaho' : 'Job Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {isFil ? 'Posisyon / Title' : 'Job Title'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); clearFieldError('title') }}
                  onBlur={() => markTouched('title')}
                  placeholder={isFil ? 'Hal. Domestic Helper sa Dubai' : 'e.g. Domestic Helper in Dubai'}
                  className={showFieldError('title') ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {showFieldError('title') && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  {isFil ? 'Kategorya' : 'Category'} <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); clearFieldError('category'); markTouched('category') }}>
                  <SelectTrigger id="category" className={showFieldError('category') ? 'border-destructive' : ''}>
                    <SelectValue placeholder={isFil ? 'Pumili ng kategorya...' : 'Select category...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showFieldError('category') && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {isFil ? 'Deskripsyon' : 'Description'} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); clearFieldError('description') }}
                onBlur={() => markTouched('description')}
                rows={3}
                placeholder={isFil ? 'Ilarawan ang trabaho...' : 'Describe the job role and responsibilities...'}
                className={showFieldError('description') ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {showFieldError('description') && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.description}
                </p>
              )}
            </div>

            <Separator className="my-2" />

            {/* Location sub-group */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {isFil ? 'Lokasyon' : 'Location'}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">
                    {isFil ? 'Bansa' : 'Country'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); clearFieldError('country') }}
                    onBlur={() => markTouched('country')}
                    placeholder={isFil ? 'Hal. United Arab Emirates' : 'e.g. United Arab Emirates'}
                    className={showFieldError('country') ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {showFieldError('country') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.country}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">{isFil ? 'Lungsod' : 'City'}</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={isFil ? 'Hal. Dubai' : 'e.g. Dubai'}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Employment details sub-group */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Job Type */}
              <div className="space-y-2">
                <Label htmlFor="jobType">{isFil ? 'Uri ng Trabaho' : 'Job Type'}</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder={isFil ? 'Pumili...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contract Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">{isFil ? 'Tagal ng Kontrata' : 'Contract Duration'}</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={isFil ? 'Hal. 2 years' : 'e.g. 2 years'}
                />
              </div>

              {/* Number of Slots */}
              <div className="space-y-2">
                <Label htmlFor="slots">
                  {isFil ? 'Bilang ng Slot' : 'Number of Slots'}
                </Label>
                <Input
                  id="slots"
                  type="number"
                  min="1"
                  value={slots}
                  onChange={(e) => setSlots(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section: Compensation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              {isFil ? 'Kompensasyon' : 'Compensation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Salary Min */}
              <div className="space-y-2">
                <Label htmlFor="salaryMin">{isFil ? 'Sahod (Min)' : 'Salary Min'}</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salaryMin}
                  onChange={(e) => { setSalaryMin(e.target.value); clearFieldError('salaryMin') }}
                  onBlur={() => markTouched('salaryMin')}
                  placeholder="0.00"
                  className={showFieldError('salaryMin') ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {showFieldError('salaryMin') && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.salaryMin}
                  </p>
                )}
              </div>

              {/* Salary Max */}
              <div className="space-y-2">
                <Label htmlFor="salaryMax">{isFil ? 'Sahod (Max)' : 'Salary Max'}</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salaryMax}
                  onChange={(e) => { setSalaryMax(e.target.value); clearFieldError('salaryMax') }}
                  onBlur={() => markTouched('salaryMax')}
                  placeholder="0.00"
                  className={showFieldError('salaryMax') ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {showFieldError('salaryMax') && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.salaryMax}
                  </p>
                )}
              </div>

              {/* Salary Currency */}
              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">{isFil ? 'Pera' : 'Salary Currency'}</Label>
                <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                  <SelectTrigger id="salaryCurrency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((cur) => (
                      <SelectItem key={cur.code} value={cur.code}>
                        {cur.code} ({cur.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Period */}
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">{isFil ? 'Panahon ng Sahod' : 'Salary Period'}</Label>
                <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
                  <SelectTrigger id="salaryPeriod">
                    <SelectValue placeholder={isFil ? 'Pumili...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_PERIODS.map((period) => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary preview with PHP conversion */}
            {(salaryMin || salaryMax) && Number(salaryMin || salaryMax) > 0 && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {isFil ? 'Preview ng Sahod' : 'Salary Preview'}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-lg font-semibold">
                    {getCurrencySymbol(salaryCurrency)}
                    {salaryMin && Number(salaryMin) > 0 ? Number(salaryMin).toLocaleString() : '0'}
                    {salaryMax && Number(salaryMax) > 0 ? ` – ${Number(salaryMax).toLocaleString()}` : ''}
                    <span className="text-sm font-normal text-muted-foreground"> / {periodLabel}</span>
                  </p>
                </div>
                {/* PHP conversion */}
                {salaryCurrency !== 'PHP' && (phpMin !== null || phpMax !== null) && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {formatPHP(phpMin || 0)}
                    {phpMax !== null ? ` – ${formatPHP(phpMax)}` : ''}
                    /{periodLabel} (PHP)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{isFil ? 'Mga Kinakailangan' : 'Requirements'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">
                {isFil ? 'Mga Kinakailangan' : 'Requirements'} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => { setRequirements(e.target.value); clearFieldError('requirements') }}
                onBlur={() => markTouched('requirements')}
                rows={4}
                placeholder={isFil
                  ? 'Ilista ang mga kinakailangan (edad, karanasan, lisensya, atbp.)...'
                  : 'List the requirements (age, experience, license, etc.)...'}
                className={showFieldError('requirements') ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {showFieldError('requirements') && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.requirements}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label htmlFor="benefits">{isFil ? 'Mga Benepisyo' : 'Benefits'}</Label>
              <Textarea
                id="benefits"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                rows={3}
                placeholder={isFil
                  ? 'Hal. Free accommodation, medical insurance, paid leave...'
                  : 'e.g. Free accommodation, medical insurance, paid leave...'}
              />
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">
                {isFil ? 'Mga Kinakailangang Kasanayan' : 'Required Skills'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="requiredSkills"
                value={requiredSkills}
                onChange={(e) => { setRequiredSkills(e.target.value); clearFieldError('requiredSkills') }}
                onBlur={() => markTouched('requiredSkills')}
                placeholder={isFil
                  ? 'Hal. caregiving, first aid, communication'
                  : 'e.g. caregiving, first aid, communication'}
                className={showFieldError('requiredSkills') ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {showFieldError('requiredSkills') && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.requiredSkills}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {isFil ? 'Ihiwalay ang bawat kasanayan ng kuwit (,)' : 'Separate each skill with a comma (,)'}
              </p>
              {requiredSkills && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {requiredSkills.split(',').map(
                    (skill, i) => skill.trim() && <Badge key={i} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section: Assignment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{isFil ? 'Pag-assign' : 'Assignment'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">{isFil ? 'Pagkakakitaan' : 'Visibility'}</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITIES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {isFil ? v.labelFil : v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Application Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">{isFil ? 'Huling Araw ng Pag-apply' : 'Application Deadline'}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <Separator className="my-2" />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Assign to Employer */}
              <div className="space-y-2">
                <Label htmlFor="employerId">{isFil ? 'I-assign sa Empleyador' : 'Assign to Employer'}</Label>
                <Select value={employerId} onValueChange={setEmployerId}>
                  <SelectTrigger id="employerId">
                    <SelectValue placeholder={isFil
                      ? (employers.length === 0 ? 'Walang nahanap na empleyador' : 'Pumili ng empleyador...')
                      : (employers.length === 0 ? 'No employers found' : 'Select employer...')
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {isFil ? 'Walang nahanap na empleyador' : 'No employers available'}
                      </div>
                    )}
                    {employers.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.employerProfile?.companyName || emp.name}
                        {emp.employerProfile?.country ? ` — ${emp.employerProfile.country}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign to Agency */}
              <div className="space-y-2">
                <Label htmlFor="agencyId">{isFil ? 'I-assign sa Ahensya' : 'Assign to Agency'}</Label>
                <Select value={agencyId} onValueChange={setAgencyId}>
                  <SelectTrigger id="agencyId">
                    <SelectValue placeholder={isFil
                      ? (agencies.length === 0 ? 'Walang nahanap na ahensya' : 'Pumili ng ahensya...')
                      : (agencies.length === 0 ? 'No agencies found' : 'Select agency...')
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {isFil ? 'Walang nahanap na ahensya' : 'No agencies available'}
                      </div>
                    )}
                    {agencies.map((ag: any) => (
                      <SelectItem key={ag.id} value={ag.id}>
                        {ag.name}
                        {ag.country ? ` — ${ag.country}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('fira-jobs')}
            disabled={loading}
          >
            {isFil ? 'Kanselahin' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[180px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isFil ? 'Sinisimpan...' : 'Creating...'}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {isFil ? 'Gumawa ng Job Order' : 'Create Job Order'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
