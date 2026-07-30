import Link from 'next/link'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

export function AuthFeedback({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p
      role="alert"
      className="mb-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <ExclamationCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

export function AuthShell({
  children,
  description,
  title,
}: Readonly<{ children: React.ReactNode; description: string; title: string }>) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fafafa] px-4 py-12">
      <section className="app-card w-full max-w-md overflow-hidden">
        <div className="border-b border-zinc-200 px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 font-serif font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-zinc-950 text-xs text-white">S</span>
            Siapin
          </Link>
        </div>
        <div className="p-6 md:p-7">
          <p className="app-label">Akun privat</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  )
}

export function AuthField({
  autoComplete,
  label,
  maxLength,
  minLength,
  name,
  type = 'text',
}: Readonly<{
  autoComplete: string
  label: string
  maxLength?: number
  minLength?: number
  name: string
  type?: string
}>) {
  return (
    <label className="block text-sm font-medium text-zinc-800">
      {label}
      <input
        required
        maxLength={maxLength}
        minLength={minLength}
        type={type}
        name={name}
        autoComplete={autoComplete}
        className="app-input mt-2 min-h-11 w-full"
      />
    </label>
  )
}
