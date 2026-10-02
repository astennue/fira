'use client'

import { cn } from '@/lib/utils'

/**
 * MatchWise 19-state application tracker.
 * Positive progression mapped onto 8 milestones (deck blueprint).
 * Terminal negative states render in destructive tone at their branch point.
 */

export const TRACKER_POSITIVE = [
  'applied',            // 0
  'screening',          // 1
  'shortlisted',        // 2
  'interview',          // 3
  'assessment',         // 4
  'under_review',       // 5
  'pending_fira_review',// 6
  'fira_approved',      // 7
  'pending_employer_review', // 8
  'employer_accepted',  // 9
  'processing',         // 10
  'offered',            // 11
  'hired',              // 12
  'deployed',           // 13
  'completed',          // 14
] as const

export const TRACKER_NEGATIVE = ['rejected', 'withdrawn', 'fira_rejected', 'employer_declined'] as const

const MILESTONES: { label: string; from: number; to: number }[] = [
  { label: 'Applied', from: 0, to: 0 },
  { label: 'Screening', from: 1, to: 2 },
  { label: 'Interview', from: 3, to: 5 },
  { label: 'FIRA Review', from: 6, to: 7 },
  { label: 'Employer', from: 8, to: 9 },
  { label: 'Processing', from: 10, to: 12 },
  { label: 'Deployed', from: 13, to: 13 },
  { label: 'Completed', from: 14, to: 14 },
]

export function StatusTimeline({ status, className }: { status: string; className?: string }) {
  const negIdx = (TRACKER_NEGATIVE as readonly string[]).indexOf(status)
  const posIdx = (TRACKER_POSITIVE as readonly string[]).indexOf(status)
  const isNegative = negIdx >= 0
  const current = isNegative ? 6 : posIdx // negative positions branch around FIRA review

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* milestone labels */}
      <div className="flex justify-between">
        {MILESTONES.map((m) => {
          const active = current >= m.from && current <= m.to
          const done = current > m.to
          return (
            <span
              key={m.label}
              className={cn(
                'text-[9px] font-semibold uppercase tracking-wide text-center flex-1',
                done || active ? 'text-primary' : 'text-muted-foreground/60',
              )}
            >
              {m.label}
            </span>
          )
        })}
      </div>
      {/* 19-state track */}
      <div className="relative flex items-center gap-[3px]">
        {TRACKER_POSITIVE.map((s, i) => {
          const done = i < current
          const active = i === current && !isNegative
          const branch = isNegative && i === current
          return (
            <div
              key={s}
              title={s.replace(/_/g, ' ')}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                done ? 'bg-primary' : 'bg-muted',
                active && !isNegative && 'bg-gradient-to-r from-[#1f3fa6] to-[#3d6be0] ring-2 ring-[#f6c615]/60',
                branch && 'bg-destructive',
              )}
            />
          )
        })}
      </div>
      {/* footer row: state counter or terminal note */}
      <div className="flex justify-between items-center">
        <span className={cn('text-[10px] font-medium', isNegative ? 'text-destructive' : 'text-primary')}>
          {isNegative
            ? `Stopped — ${status.replace(/_/g, ' ')}`
            : `Step ${posIdx + 1} of 19 · ${status.replace(/_/g, ' ')}`}
        </span>
        {!isNegative && posIdx < TRACKER_POSITIVE.length - 1 && (
          <span className="text-[10px] text-muted-foreground">next: {(TRACKER_POSITIVE as readonly string[])[posIdx + 1]?.replace(/_/g, ' ')}</span>
        )}
      </div>
    </div>
  )
}
