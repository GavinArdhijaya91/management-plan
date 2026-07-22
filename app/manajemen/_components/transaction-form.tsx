'use client'

import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { transactionSchema, type TransactionFormValues } from '@/app/manajemen/_schemas/transaction-schema'
import type { TransactionDraft } from '@/app/manajemen/_domain/transaction-aggregate'

interface TransactionFormProps {
  initialValues: TransactionDraft
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: TransactionFormValues) => void
}

const transactionResolver: Resolver<TransactionFormValues> = async (values) => {
  const result = transactionSchema.safeParse(values)
  if (result.success) return { values: result.data, errors: {} }

  const errors: Record<string, { type: string; message: string }> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !errors[field]) errors[field] = { type: issue.code, message: issue.message }
  }
  return { values: {}, errors }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-xs text-red-600" role="alert">
      {message}
    </p>
  )
}

export function TransactionForm({ initialValues, submitLabel, onCancel, onSubmit }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: transactionResolver,
    defaultValues: initialValues,
  })

  useEffect(() => reset(initialValues), [initialValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <label className="block text-sm font-medium">
        Tanggal
        <input
          type="date"
          {...register('date')}
          aria-invalid={Boolean(errors.date)}
          className="app-input mt-1.5 w-full"
        />
        <FieldError message={errors.date?.message} />
      </label>

      <label className="block text-sm font-medium">
        Tipe
        <select {...register('type')} className="app-input mt-1.5 w-full">
          <option value="Penjualan">Penjualan</option>
          <option value="Pengeluaran">Pengeluaran</option>
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Jumlah
          <input
            type="number"
            inputMode="numeric"
            min="0"
            {...register('amount')}
            aria-invalid={Boolean(errors.amount)}
            className="app-input mt-1.5 w-full"
          />
          <FieldError message={errors.amount?.message} />
        </label>
        <label className="block text-sm font-medium">
          Modal
          <input
            type="number"
            inputMode="numeric"
            min="0"
            {...register('modal')}
            aria-invalid={Boolean(errors.modal)}
            className="app-input mt-1.5 w-full"
          />
          <FieldError message={errors.modal?.message} />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-11 rounded-xl border border-zinc-200 px-4 text-sm font-medium disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="app-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
