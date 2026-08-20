'use client'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <Card className={cn(
      'border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm',
      hover && 'transition-all duration-200 hover:shadow-md hover:border-border',
      className
    )}>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
