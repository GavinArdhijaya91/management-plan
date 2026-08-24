'use client'

import { useEffect, useState } from 'react'

interface LocalDateTimeProps {
  className?: string
  options?: Intl.DateTimeFormatOptions
  value: string
}

const defaultOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

function formatDateTime(value: string, options: Intl.DateTimeFormatOptions, timeZone?: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('id-ID', { ...options, timeZone }).format(date)
}

/**
 * Keeps the server render deterministic, then switches to the device time zone
 * after hydration. Timestamps should be supplied as ISO strings with an offset.
 */
export function LocalDateTime({ className, options = defaultOptions, value }: LocalDateTimeProps) {
  const [formatted, setFormatted] = useState(() => formatDateTime(value, options, 'UTC'))

  useEffect(() => {
    // The browser resolves an omitted timeZone from the user's device settings.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatted(formatDateTime(value, options))
  }, [options, value])

  return (
    <time className={className} dateTime={value}>
      {formatted}
    </time>
  )
}
