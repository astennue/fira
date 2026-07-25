'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  HelpCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MessageCircleQuestion,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, useT } from '@/store/app-store'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FaqFormState {
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

const EMPTY_FORM: FaqFormState = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  isActive: true,
}

const DEFAULT_CATEGORIES = [
  'General',
  'For Applicants',
  'For Employers',
  'Deployment',
  'Documents',
  'Fees & Payments',
  'Other',
]

// ─── Animation Variants ──────────────────────────────────────────────────────

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CmsFaqPage() {
  const { language } = useAppStore()
  const t = useT()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FaqFormState>(EMPTY_FORM)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const queryClient = useQueryClient()

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const { data: faqs = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ['cms-faqs'],
    queryFn: async () => {
      const res = await fetch('/api/cms/faqs')
      if (!res.ok) return []
      return res.json()
    },
  })

  // ── Derived Categories ─────────────────────────────────────────────────────

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)))
    return [...DEFAULT_CATEGORIES, ...fromData.filter((c) => !DEFAULT_CATEGORIES.includes(c))]
  }, [faqs])

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredFaqs = useMemo(() => {
    let result = [...faqs]

    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      )
    }

    // Sort by order, then by createdAt
    result.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    return result
  }, [faqs, categoryFilter, searchQuery])

  // ── Grouped FAQs by Category ───────────────────────────────────────────────

  const groupedFaqs = useMemo(() => {
    if (categoryFilter !== 'all') {
      return { [categoryFilter]: filteredFaqs }
    }
    const groups: Record<string, FaqItem[]> = {}
    for (const faq of filteredFaqs) {
      const cat = faq.category || 'Uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(faq)
    }
    return groups
  }, [filteredFaqs, categoryFilter])

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isEdit = !!editId
      const url = '/api/cms/faqs'
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit
        ? { id: editId, question: form.question, answer: form.answer, category: form.category, order: form.order, isActive: form.isActive }
        : { question: form.question, answer: form.answer, category: form.category, order: form.order }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save FAQ')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-faqs'] })
      setDialogOpen(false)
      setEditId(null)
      setForm(EMPTY_FORM)
      toast.success(editId ? 'FAQ updated successfully!' : 'FAQ created successfully!')
    },
    onError: () => {
      toast.error(editId ? 'Failed to update FAQ' : 'Failed to create FAQ')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/cms/faqs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete FAQ')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-faqs'] })
      toast.success('FAQ deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete FAQ')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch('/api/cms/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      if (!res.ok) throw new Error('Failed to toggle FAQ status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-faqs'] })
    },
    onError: () => {
      toast.error('Failed to update FAQ status')
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openEdit = (faq: FaqItem) => {
    setEditId(faq.id)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order ?? 0,
      isActive: faq.isActive,
    })
    setDialogOpen(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, order: faqs.length })
    setDialogOpen(true)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    saveMutation.mutate()
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  // ── Category Color Map ────────────────────────────────────────────────────

  const categoryColorMap: Record<string, string> = {
    General: 'bg-blue-100 text-blue-700 border-blue-200',
    'For Applicants': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'For Employers': 'bg-violet-100 text-violet-700 border-violet-200',
    Deployment: 'bg-amber-100 text-amber-700 border-amber-200',
    Documents: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Fees & Payments': 'bg-rose-100 text-rose-700 border-rose-200',
    Other: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  const getCategoryStyle = (category: string) => {
    return categoryColorMap[category] || 'bg-sky-100 text-sky-700 border-sky-200'
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
            {t('FAQ Management')}
          </h1>
          <p className="text-gray-500 text-sm">
            Manage frequently asked questions and organize them by category
          </p>
        </div>
        <Button
          onClick={openNew}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* ─── Stats Bar ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Total FAQs</span>
            </div>
            <p className="text-xl font-bold text-blue-800 mt-1">{faqs.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Active</span>
            </div>
            <p className="text-xl font-bold text-emerald-800 mt-1">
              {faqs.filter((f) => f.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">Categories</span>
            </div>
            <p className="text-xl font-bold text-amber-800 mt-1">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-violet-600 font-medium">Showing</span>
            </div>
            <p className="text-xl font-bold text-violet-800 mt-1">{filteredFaqs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="pl-9 rounded-xl border-blue-100 focus:border-blue-300 focus:ring-blue-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-blue-100">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── FAQ List ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <Card className="border-blue-100">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-blue-200 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No FAQs found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by adding your first FAQ.'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button
                onClick={openNew}
                variant="outline"
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${categoryFilter}-${searchQuery}`}
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs font-medium border ${getCategoryStyle(category)}`}>
                    {category}
                  </Badge>
                  <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>

                {/* FAQ Cards */}
                <motion.div variants={listContainerVariants} className="space-y-2">
                  <AnimatePresence>
                    {items.map((faq) => {
                      const isExpanded = expandedIds.has(faq.id)
                      return (
                        <motion.div
                          key={faq.id}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <Card
                            className={`border transition-all duration-200 ${
                              faq.isActive
                                ? 'border-blue-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50'
                                : 'border-gray-200 opacity-60 hover:opacity-80'
                            }`}
                          >
                            <CardContent className="p-0">
                              <div className="flex items-start gap-3 p-4">
                                {/* Drag Handle / Order Indicator */}
                                <div className="flex flex-col items-center pt-0.5 text-gray-300">
                                  <GripVertical className="h-4 w-4" />
                                  <span className="text-[10px] mt-0.5 font-mono">#{faq.order ?? 0}</span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <button
                                      onClick={() => toggleExpanded(faq.id)}
                                      className="text-left flex-1 min-w-0 group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                                          {faq.question}
                                        </h3>
                                        {isExpanded ? (
                                          <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        ) : (
                                          <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        )}
                                      </div>
                                    </button>
                                  </div>

                                  {/* Expanded Answer */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                          {faq.answer}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Collapsed Preview */}
                                  {!isExpanded && (
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                      {faq.answer}
                                    </p>
                                  )}

                                  {/* Meta Row */}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge
                                      className={`text-[10px] border px-1.5 py-0 ${getCategoryStyle(faq.category || 'Other')}`}
                                    >
                                      {faq.category || 'Uncategorized'}
                                    </Badge>
                                    {!faq.isActive && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => openEdit(faq)}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50"
                                      onClick={() => handleDelete(faq.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">
                                      {faq.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <Switch
                                      checked={faq.isActive}
                                      onCheckedChange={(checked) =>
                                        toggleActiveMutation.mutate({ id: faq.id, isActive: checked })
                                      }
                                      disabled={toggleActiveMutation.isPending}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ─── Add/Edit Dialog ────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">
              {editId ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editId
                ? 'Update the question, answer, category, and order of this FAQ.'
                : 'Fill in the details to create a new frequently asked question.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="faq-question" className="text-sm font-medium text-gray-700">
                Question <span className="text-red-400">*</span>
              </Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g., What documents do I need to apply?"
                className="rounded-xl border-blue-100 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="faq-answer" className="text-sm font-medium text-gray-700">
                Answer <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Provide a clear and detailed answer..."
                className="min-h-[140px] rounded-xl border-blue-100 focus:border-blue-300 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Category & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faq-category" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger className="rounded-xl border-blue-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Or type a new category..."
                  className="rounded-xl border-blue-100 focus:border-blue-300 focus:ring-blue-200 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-order" className="text-sm font-medium text-gray-700">
                  Display Order
                </Label>
                <Input
                  id="faq-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="rounded-xl border-blue-100 focus:border-blue-300 focus:ring-blue-200"
                />
                <p className="text-[11px] text-gray-400">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            {/* Active Toggle (Edit mode only) */}
            {editId && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Active Status</Label>
                  <p className="text-[11px] text-gray-400">
                    Inactive FAQs will not be shown to visitors
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-md shadow-blue-500/20"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : editId ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
