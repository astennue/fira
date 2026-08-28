'use client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  // Application statuses
  applied: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  screening: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  interview_scheduled: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  interview_passed: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  pending_documents: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  documents_submitted: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  pending_fira_review: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  fira_approved: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  pending_employer_review: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  employer_accepted: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  deployed: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  completed: 'bg-gray-100 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300',
  rejected: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  cancelled: 'bg-gray-200 dark:bg-gray-950/50 text-gray-500 dark:text-gray-400',
  // Profile statuses
  complete: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  incomplete: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  // Generic
  active: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  inactive: 'bg-gray-100 dark:bg-gray-950/50 text-gray-500 dark:text-gray-400',
  pending: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  approved: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  open: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
  closed: 'bg-gray-100 dark:bg-gray-950/50 text-gray-500 dark:text-gray-400',
}

interface StatusBadgeProps {
  status: string
  className?: string
  label?: string
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return (
    <Badge variant="outline" className={cn('text-xs border-0 font-medium', statusColors[status] || 'bg-muted', className)}>
      {displayLabel}
    </Badge>
  )
}
