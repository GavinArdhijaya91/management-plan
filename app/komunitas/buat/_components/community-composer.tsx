'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Check, Eye, Globe2, Save, ShieldCheck } from 'lucide-react'
import { Modal } from '@/app/_components/modal'
import type { CommunityCategory, CommunityPermissions, CommunityPostView } from '../../_domain/community-types'
import { collaborationKindLabels } from '../../_domain/community-formatters'
import { publishCommunityPost, saveCommunityDraft } from '../../actions'
import type { CommunityDraftInput } from '../../_schemas/community-post-schema'
import { CommunityPostKindBadge } from '../../_components/community-post-kind-badge'

interface Props {
  categories: CommunityCategory[]
  permissions: CommunityPermissions
  officialIdentity: { authorName: string; workspaceName: string }
  sourcePost: CommunityPostView | null
  editingDraft: boolean
}

export function CommunityComposer({ categories, permissions, officialIdentity, sourcePost, editingDraft }: Props) {
  const initial = useMemo<CommunityDraftInput>(
    () => ({
      id: editingDraft ? (sourcePost?.id ?? null) : null,
      postKind: sourcePost?.post_kind ?? 'insight',
      title: sourcePost?.title ?? '',
      body: sourcePost?.body ?? '',
      authorDisplayName: officialIdentity.authorName,
      workspaceDisplayName: officialIdentity.workspaceName,
      categoryIds: sourcePost?.categories.map((item) => item.id) ?? [],
      collaborationKind: sourcePost?.collaboration?.collaboration_kind ?? 'marketing',
      partnerExpectation: sourcePost?.collaboration?.partner_expectation ?? '',
      proposedContribution: sourcePost?.collaboration?.proposed_contribution ?? '',
      responseInstructions: sourcePost?.collaboration?.response_instructions ?? '',
      locationScope: sourcePost?.collaboration?.location_scope ?? '',
      closesAt: sourcePost?.collaboration?.closes_at?.slice(0, 16) ?? '',
    }),
    [editingDraft, officialIdentity, sourcePost],
  )
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<CommunityDraftInput>({ defaultValues: initial })
  const values = useWatch({ control }) as CommunityDraftInput
  const [draftId, setDraftId] = useState<string | null>(initial.id)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [pending, startTransition] = useTransition()
  const lastPayload = useRef('')
  const router = useRouter()

  const save = async () => {
    if (!permissions.canCreate) return null
    const payload = { ...getValues(), id: draftId }
    setSaveState('saving')
    setMessage(null)
    const result = await saveCommunityDraft(payload)
    if (!result.ok) {
      setSaveState('error')
      setMessage(result.message)
      return null
    }
    if (result.id) setDraftId(result.id)
    lastPayload.current = JSON.stringify({ ...payload, id: result.id ?? draftId })
    setSaveState('saved')
    return result.id ?? draftId
  }

  useEffect(() => {
    if (!permissions.canCreate || !isDirty || values.title.trim().length < 2 || values.body.trim().length < 10) return
    const payload = JSON.stringify({ ...values, id: draftId })
    if (payload === lastPayload.current) return
    const timer = window.setTimeout(() => {
      void save()
    }, 1200)
    return () => window.clearTimeout(timer)
    // save intentionally reads the latest form snapshot after the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isDirty, permissions.canCreate, values])

  const publish = () =>
    startTransition(async () => {
      const id = await save()
      if (!id) return
      const result = await publishCommunityPost(id)
      if (!result.ok) {
        setMessage(
          result.retryAt
            ? `${result.message} Coba kembali sekitar ${new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(new Date(result.retryAt))}.`
            : result.message,
        )
        if (result.code === 'identity') setPublishOpen(false)
        return
      }
      setPublishOpen(false)
      router.push(`/komunitas/${id}?published=1`)
      router.refresh()
    })

  if (!permissions.canCreate && editingDraft)
    return (
      <div className="app-card p-6">
        <h1 className="text-xl font-semibold">Draft hanya dapat dibaca</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Kamu tidak lagi punya izin mengedit draft ini. Hubungi pemilik workspace.
        </p>
        <ReadOnlyPreview values={initial} />
      </div>
    )

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form className="app-card p-5 sm:p-7" onSubmit={(event) => event.preventDefault()}>
          <fieldset disabled={!permissions.canCreate || pending} className="space-y-6 disabled:opacity-70">
            <div>
              <legend className="text-sm font-semibold">Jenis post</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <KindOption
                  value="insight"
                  current={values.postKind}
                  label="Insight"
                  description="Bagikan pengalaman yang berguna."
                  onSelect={() => setValue('postKind', 'insight', { shouldDirty: true })}
                />
                <KindOption
                  value="collaboration_request"
                  current={values.postKind}
                  label="Ajakan Kolaborasi"
                  description="Temukan mitra UMKM yang relevan."
                  onSelect={() => setValue('postKind', 'collaboration_request', { shouldDirty: true })}
                />
              </div>
            </div>
            <TextField
              label="Judul"
              counter={`${values.title.length}/160`}
              error={values.title.length > 160}
              input={
                <input
                  {...register('title')}
                  maxLength={160}
                  className="app-input mt-2 w-full"
                  placeholder="Judul yang jelas dan spesifik"
                />
              }
            />
            <TextField
              label="Isi"
              counter={`${values.body.length}/10000`}
              error={values.body.length > 10000}
              input={
                <textarea
                  {...register('body')}
                  maxLength={10000}
                  rows={10}
                  className="app-input mt-2 w-full resize-y"
                  placeholder="Tuliskan pengalaman atau kebutuhan kolaborasimu…"
                />
              }
            />

            {values.postKind === 'collaboration_request' && (
              <div className="space-y-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                <label className="block text-sm font-medium">
                  Jenis kolaborasi
                  <select {...register('collaborationKind')} className="app-input mt-2 w-full">
                    {Object.entries(collaborationKindLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField
                  label="Yang kami tawarkan"
                  input={
                    <textarea
                      {...register('proposedContribution')}
                      maxLength={2000}
                      rows={4}
                      className="app-input mt-2 w-full"
                    />
                  }
                />
                <TextField
                  label="Mitra yang kami cari"
                  input={
                    <textarea
                      {...register('partnerExpectation')}
                      maxLength={2000}
                      rows={4}
                      className="app-input mt-2 w-full"
                    />
                  }
                />
                <TextField
                  label="Cara merespons"
                  input={
                    <textarea
                      {...register('responseInstructions')}
                      maxLength={1000}
                      rows={3}
                      className="app-input mt-2 w-full"
                    />
                  }
                  helper="Info ini terlihat oleh pengguna Siapin. Jangan bagikan info sensitif selain cara menghubungimu."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Cakupan lokasi <span className="font-normal text-zinc-400">(opsional)</span>
                    <input {...register('locationScope')} maxLength={200} className="app-input mt-2 w-full" />
                  </label>
                  <label className="text-sm font-medium">
                    Batas waktu <span className="font-normal text-zinc-400">(opsional)</span>
                    <input type="datetime-local" {...register('closesAt')} className="app-input mt-2 w-full" />
                  </label>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium">
                Kategori <span className="font-normal text-zinc-400">(opsional)</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">Membantu UMKM lain menemukan postingan ini.</p>
              <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      value={category.id}
                      {...register('categoryIds', { valueAsNumber: true })}
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-9 items-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium peer-checked:border-zinc-950 peer-checked:bg-zinc-950 peer-checked:text-white">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold">Identitas saat diterbitkan</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-zinc-600">
                  Nama penulis
                  <input {...register('authorDisplayName')} className="app-input mt-1.5 w-full" />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Nama workspace
                  <input {...register('workspaceDisplayName')} className="app-input mt-1.5 w-full" />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('authorDisplayName', officialIdentity.authorName, { shouldDirty: true })
                  setValue('workspaceDisplayName', officialIdentity.workspaceName, { shouldDirty: true })
                }}
                className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
              >
                Gunakan nama resmi saat ini
              </button>
            </div>
          </fieldset>
          {message && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5">
            <p role="status" className="text-xs text-zinc-500">
              {saveState === 'saving'
                ? 'Menyimpan…'
                : saveState === 'saved'
                  ? 'Draft tersimpan otomatis.'
                  : saveState === 'error'
                    ? 'Autosave gagal.'
                    : 'Perubahan akan disimpan otomatis.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={!permissions.canCreate || pending}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium disabled:opacity-50"
              >
                <Save className="size-4" />
                Simpan draft
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium"
              >
                <Eye className="size-4" />
                Pratinjau
              </button>
              <button
                type="button"
                onClick={() => setPublishOpen(true)}
                disabled={!permissions.canPublish || pending}
                title={
                  !permissions.canPublish
                    ? 'Draft ini baru bisa diterbitkan setelah kamu mendapat izin publish dari pemilik workspace.'
                    : undefined
                }
                className="app-button disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Globe2 className="size-4" />
                Terbitkan
              </button>
            </div>
          </div>
        </form>
        <aside className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <ShieldCheck className="mb-2 size-5" />
            <p className="font-semibold">Privasi tetap milikmu</p>
            <p className="mt-1 leading-6">
              Post komunitas tidak pernah menggunakan data keuangan atau rencana bisnismu secara otomatis.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Bagikan dengan sadar</p>
            <p className="mt-1 leading-6">Jangan bagikan data keuangan atau informasi sensitif.</p>
          </div>
        </aside>
      </div>
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Pratinjau post">
        <ReadOnlyPreview values={values} />
      </Modal>
      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Terbitkan post?"
        description="Konten tidak dapat diedit setelah diterbitkan."
      >
        <ReadOnlyPreview values={values} />
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>Saya mengerti post ini tidak dapat diedit setelah diterbitkan.</span>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPublishOpen(false)}
            className="min-h-10 rounded-lg border border-zinc-200 px-4 text-sm font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!accepted || pending}
            className="app-button disabled:opacity-50"
          >
            {pending ? (
              'Menerbitkan…'
            ) : (
              <>
                <Check className="size-4" />
                Ya, terbitkan
              </>
            )}
          </button>
        </div>
      </Modal>
    </>
  )
}

function KindOption({
  value,
  current,
  label,
  description,
  onSelect,
}: {
  value: 'insight' | 'collaboration_request'
  current: string
  label: string
  description: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={current === value}
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left ${current === value ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950' : 'border-zinc-200 hover:bg-zinc-50'}`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span>
    </button>
  )
}
function TextField({
  label,
  counter,
  helper,
  input,
}: {
  label: string
  counter?: string
  helper?: string
  error?: boolean
  input: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium">
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        {counter && (
          <span aria-live="polite" className="font-mono text-xs font-normal text-zinc-400">
            {counter}
          </span>
        )}
      </span>
      {input}
      {helper && <span className="mt-1.5 block text-xs font-normal leading-5 text-zinc-500">{helper}</span>}
    </label>
  )
}
function ReadOnlyPreview({ values }: { values: CommunityDraftInput }) {
  return (
    <div className="mt-5 rounded-xl border border-zinc-200 p-4">
      <CommunityPostKindBadge kind={values.postKind} />
      <h3 className="mt-4 text-xl font-semibold">{values.title || 'Judul post'}</h3>
      <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
        {values.body || 'Isi post akan muncul di sini.'}
      </p>
      <p className="mt-4 text-xs text-zinc-500">
        <strong className="text-zinc-700">{values.workspaceDisplayName}</strong> · {values.authorDisplayName}
      </p>
    </div>
  )
}
