'use client'

import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  items: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

export function TypewriterText({
  items,
  className = '',
  typingSpeed = 62,
  deletingSpeed = 32,
  pauseDuration = 1700,
}: TypewriterTextProps) {
  const [itemIndex, setItemIndex] = useState(0)
  const [characterIndex, setCharacterIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const currentItem = items[itemIndex] ?? ''

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion || !currentItem) return

    let delay = deleting ? deletingSpeed : typingSpeed
    if (!deleting && characterIndex === currentItem.length) delay = pauseDuration

    const timer = window.setTimeout(() => {
      if (!deleting && characterIndex < currentItem.length) {
        setCharacterIndex((current) => current + 1)
        return
      }
      if (!deleting) {
        setDeleting(true)
        return
      }
      if (characterIndex > 0) {
        setCharacterIndex((current) => current - 1)
        return
      }
      setDeleting(false)
      setItemIndex((current) => (current + 1) % items.length)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [characterIndex, currentItem, deleting, deletingSpeed, items.length, pauseDuration, reducedMotion, typingSpeed])

  const visibleText = reducedMotion ? (items[0] ?? '') : currentItem.slice(0, characterIndex)

  return (
    <span className={`block ${className}`}>
      <span aria-hidden="true">
        {visibleText}
        <span className="typewriter-cursor" />
      </span>
      <span className="sr-only">{items[0]}</span>
    </span>
  )
}
