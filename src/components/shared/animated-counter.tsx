'use client'
import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 800, className }: AnimatedCounterProps) {
  // null = "show value directly" (first render / no animation needed)
  const [count, setCount] = useState<number | null>(null)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const prev = prevValueRef.current
    prevValueRef.current = value
    if (prev === value) return
    const diff = value - prev
    const increment = diff / (duration / 16)
    let start = prev
    const timer = setInterval(() => {
      start += increment
      if ((diff > 0 && start >= value) || (diff < 0 && start <= value)) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span className={className}>{(count ?? value).toLocaleString()}</span>
}
