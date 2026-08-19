'use client'
import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 800, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const prev = prevValueRef.current
    prevValueRef.current = value
    let start = prev
    const end = value
    if (start === end) return
    const diff = end - start
    const increment = diff / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if ((diff > 0 && start >= end) || (diff < 0 && start <= end)) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span className={className}>{count.toLocaleString()}</span>
}
