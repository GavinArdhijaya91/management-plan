import Link from 'next/link'

export function AuthShell({
  children,
  description,
  title,
}: Readonly<{ children: React.ReactNode; description: string; title: string }>) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f7f5] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
        <Link href="/" className="font-serif text-xl font-semibold">
          Siapin
        </Link>
        <h1 className="mt-8 font-serif text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  )
}

export function AuthField({
  autoComplete,
  label,
  minLength,
  name,
  type = 'text',
}: Readonly<{
  autoComplete: string
  label: string
  minLength?: number
  name: string
  type?: string
}>) {
  return (
    <label className="block text-sm font-medium text-zinc-800">
      {label}
      <input
        required
        minLength={minLength}
        type={type}
        name={name}
        autoComplete={autoComplete}
        className="mt-2 min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-950"
      />
    </label>
  )
}
