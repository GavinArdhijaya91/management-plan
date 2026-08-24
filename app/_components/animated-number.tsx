'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
  duration?: number
}

export function AnimatedNumber({
  value,
  format = (current) => new Intl.NumberFormat('id-ID').format(current),
  duration = 700,
}: Readonly<AnimatedNumberProps>) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) {
      const frame = window.requestAnimationFrame(() => {
        setDisplayValue(value)
        previousValue.current = value
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const startValue = previousValue.current === value ? 0 : previousValue.current
    const difference = value - startValue
    const startedAt = performance.now()
    let frame = 0

    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(startValue + difference * eased))
      if (progress < 1) frame = window.requestAnimationFrame(update)
      else previousValue.current = value
    }

    frame = window.requestAnimationFrame(update)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, value])

  return <>{format(displayValue)}</>
}
