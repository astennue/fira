'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { useAppStore } from '@/store/app-store'

export function FaqPage() {
  const { language } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['all-faqs'],
    queryFn: async () => {
      const res = await fetch('/api/cms/faqs?public=true&all=true')
      if (!res.ok) return []
      return res.json()
    },
  })

  const faqs = Array.isArray(faqsData) ? faqsData.filter((f: any) => f.isActive) : []

  const categories = useMemo(() => {
    const cats = new Set(faqs.map((f: any) => f.category))
    return ['All', ...Array.from(cats)]
  }, [faqs])

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f: any) => {
      const matchCategory = activeCategory === 'All' || f.category === activeCategory
      const matchSearch = !searchQuery ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [faqs, activeCategory, searchQuery])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-fira-hero text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="bg-white/15 text-white/90 border-white/25 mb-4">FAQ</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'fil' ? 'Mga Madalas Itanong' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-blue-200 max-w-xl mx-auto">
              {language === 'fil'
                ? 'Narito ang mga sagot sa mga karaniwang tanong tungkol sa aming serbisyo.'
                : 'Here are answers to common questions about our services.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center bg-muted rounded-xl p-1.5 mb-6">
            <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
            <Input
              type="search"
              placeholder={language === 'fil' ? 'Maghanap ng tanong...' : 'Search questions...'}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12 bg-fira-gradient-soft flex-1">
        <div className="container mx-auto px-4 max-w-3xl">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center rounded-xl">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {language === 'fil' ? 'Walang natagpuang FAQ.' : 'No FAQs found.'}
              </p>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq: any, i: number) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AccordionItem value={`faq-${i}`} className="bg-card rounded-xl px-6 border border-border dark:border-blue-900/30 data-[state=open]:shadow-md transition-shadow">
                    <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </div>
  )
}
