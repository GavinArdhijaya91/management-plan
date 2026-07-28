'use client'

import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T, decode?: (storedValue: unknown) => T | null) {
  const [value, setValue] = useState<T>(initialValue)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        const decoded = decode ? decode(parsed) : (parsed as T)

        if (decoded === null) {
          window.localStorage.removeItem(key)
        } else {
          // Hydration-safe synchronization with the browser storage boundary.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setValue(decoded)
        }
      }
    } catch {
      window.localStorage.removeItem(key)
    } finally {
      setReady(true)
    }
  }, [decode, key])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The UI remains usable when storage is unavailable or full.
    }
  }, [key, ready, value])

  return [value, setValue, ready] as const
}
