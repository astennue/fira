import { cn } from '@/lib/utils'

/**
 * MatchWise logo mark — rounded royal-blue tile with MW monogram + gold spark.
 * Mirrors the deck cover identity (royal #1F3FA6→#2859D5 gradient, gold #F6C615).
 */
export function MwMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('size-8 shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id="mwg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1F3FA6" />
          <stop offset="1" stopColor="#3D6BE0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#mwg)" />
      <rect x="1" y="1" width="38" height="38" rx="10" stroke="rgba(255,255,255,0.18)" />
      <path d="M9.5 27.5 L9.5 13.5 L14.5 22 L19.5 13.5 L19.5 27.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M23 27.5 L23 13.5 L27 21.5 L31 13.5 L31 27.5" stroke="#F6C615" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/** Full wordmark: mark + "MatchWise" (Wise in gold). `light` renders for dark/hero backgrounds. */
export function MwWordmark({ className, markClassName, compact = false, light = false }: { className?: string; markClassName?: string; compact?: boolean; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <MwMark className={markClassName} />
      {!compact && (
        <span className={cn(
          'font-display text-lg font-bold tracking-tight leading-none',
          light ? 'text-white' : 'text-foreground',
        )}>
          Match<span className="text-gold">Wise</span>
        </span>
      )}
    </span>
  )
}
