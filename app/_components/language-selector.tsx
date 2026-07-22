'use client'

import { localeOptions, type Continent } from '@/app/_i18n/dictionaries'
import { useLanguage } from '@/app/_i18n/language-provider'
import { Check, Globe2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const continents: Continent[] = ['Asia', 'America', 'Europe']

export function LanguageSelector() {
  const { dictionary, locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const activeOption = localeOptions.find((option) => option.code === locale) ?? localeOptions[0]

  useEffect(() => {
    if (!open) return
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={dictionary.language.change}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
      >
        <Globe2 className="size-4" aria-hidden="true" />
        <span className="app-data">{activeOption.shortLabel}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="font-serif text-lg font-semibold">{dictionary.language.title}</p>
            <p className="text-xs text-zinc-500">{dictionary.language.region}: Asia, America, Europe</p>
          </div>
          <div
            role="listbox"
            aria-label={dictionary.language.title}
            className="max-h-[min(28rem,70vh)] overflow-y-auto"
          >
            {continents.map((continent) => (
              <div key={continent} className="border-t border-zinc-100 py-2 first:border-0">
                <p className="app-label px-3 py-1">{continent}</p>
                {localeOptions
                  .filter((option) => option.continent === continent)
                  .map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      role="option"
                      aria-selected={locale === option.code}
                      onClick={() => {
                        setLocale(option.code)
                        setOpen(false)
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-zinc-100"
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-zinc-100 font-mono text-xs">
                        {option.shortLabel}
                      </span>
                      <span className="flex-1">
                        <strong className="block text-sm">{option.label}</strong>
                        <span className="block text-xs text-zinc-500">{option.country}</span>
                      </span>
                      {locale === option.code && <Check className="size-4" aria-hidden="true" />}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
