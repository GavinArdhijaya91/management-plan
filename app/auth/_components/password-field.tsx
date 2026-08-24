'use client'

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface PasswordFieldProps {
  autoComplete: 'current-password' | 'new-password'
  label: string
  maxLength?: number
  minLength?: number
  name?: string
}

export function PasswordField({
  autoComplete,
  label,
  maxLength,
  minLength,
  name = 'password',
}: Readonly<PasswordFieldProps>) {
  const [visible, setVisible] = useState(false)
  const inputId = `${name}-field`
  const toggleLabel = visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
  const ToggleIcon = visible ? EyeSlashIcon : EyeIcon

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          required
          id={inputId}
          maxLength={maxLength}
          minLength={minLength}
          type={visible ? 'text' : 'password'}
          name={name}
          autoComplete={autoComplete}
          className="app-input min-h-11 w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={toggleLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-zinc-500 transition-[background-color,color,transform] hover:bg-zinc-100 hover:text-zinc-950 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-950"
        >
          <ToggleIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
