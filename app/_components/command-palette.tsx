'use client'

import { Modal } from '@/app/_components/modal'
import { appRoutes } from '@/data/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

interface CommandPaletteProps {
  mode: 'private' | 'demo'
  open: boolean
  onClose: () => void
}

export function CommandPalette({ mode, open, onClose }: Readonly<CommandPaletteProps>) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const demoMode = mode === 'demo'

  const routes = useMemo(() => appRoutes.filter((route) => !demoMode || route.href !== '/collaboration'), [demoMode])
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID')
    if (!normalizedQuery) return routes
    return routes.filter((route) =>
      `${route.label} ${route.shortLabel} ${route.description}`.toLocaleLowerCase('id-ID').includes(normalizedQuery),
    )
  }, [query, routes])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const close = () => {
    setQuery('')
    onClose()
  }

  const visit = (href: string) => {
    close()
    router.push(demoMode ? `/demo${href}` : href)
  }

  return (
    <Modal
      open={open}
      title="Pindah cepat"
      description="Cari halaman kerja tanpa meninggalkan konteks."
      onClose={close}
    >
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && results[0]) visit(results[0].href)
          }}
          aria-label="Cari halaman"
          placeholder="Cari dashboard, transaksi, atau kalender"
          className="app-input min-h-12 w-full pl-10"
        />
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto" aria-live="polite">
        {results.length ? (
          <ul className="space-y-1">
            {results.map((route) => {
              const Icon = route.icon
              return (
                <li key={route.href}>
                  <button
                    type="button"
                    onClick={() => visit(route.href)}
                    className="group flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-950"
                  >
                    <Icon className="size-5 shrink-0 text-zinc-400 group-hover:text-zinc-950" aria-hidden="true" />
                    <span className="min-w-0">
                      <strong className="block text-sm font-medium text-zinc-900">{route.label}</strong>
                      <span className="block truncate text-xs text-zinc-500">{route.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            Tidak ada halaman yang cocok.
          </p>
        )}
      </div>

      <p className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
        Tekan Enter untuk membuka hasil pertama. Tekan Esc untuk menutup.
      </p>
    </Modal>
  )
}
