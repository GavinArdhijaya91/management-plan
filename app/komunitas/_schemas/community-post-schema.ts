import { z } from 'zod'
import { inspectCommunityContent, normalizeCommunityText } from '../_domain/community-content-guard'

const normalizedText = (max: number) => z.string().transform(normalizeCommunityText).pipe(z.string().max(max))
const optionalText = (max: number) => normalizedText(max).optional().default('')

export const communityDraftSchema = z
  .object({
    id: z.string().uuid().nullable(),
    postKind: z.enum(['insight', 'collaboration_request']),
    title: normalizedText(160).pipe(z.string().min(2, 'Judul minimal 2 karakter.')),
    body: normalizedText(10000).pipe(z.string().min(10, 'Isi minimal 10 karakter.')),
    authorDisplayName: z.string().trim().min(2).max(100),
    workspaceDisplayName: z.string().trim().min(2).max(120),
    categoryIds: z
      .array(z.number().int().positive())
      .max(20)
      .refine((ids) => new Set(ids).size === ids.length, 'Kategori tidak boleh duplikat.'),
    collaborationKind: z.enum(['marketing', 'distribution', 'supplier', 'event', 'production', 'other']).optional(),
    partnerExpectation: optionalText(2000),
    proposedContribution: optionalText(2000),
    responseInstructions: optionalText(1000),
    locationScope: optionalText(200),
    closesAt: optionalText(40),
    website: z.string().max(0).optional().default(''),
  })
  .superRefine((value, context) => {
    const contentIssue = inspectCommunityContent([
      value.title,
      value.body,
      value.partnerExpectation,
      value.proposedContribution,
      value.responseInstructions,
      value.locationScope,
    ])
    if (contentIssue) context.addIssue({ code: 'custom', path: ['body'], message: contentIssue })

    if (value.postKind === 'collaboration_request') {
      const required: Array<[keyof typeof value, string, number]> = [
        ['partnerExpectation', 'Jelaskan mitra yang dicari.', 10],
        ['proposedContribution', 'Jelaskan kontribusi yang ditawarkan.', 10],
        ['responseInstructions', 'Cantumkan cara merespons.', 2],
      ]
      if (!value.collaborationKind)
        context.addIssue({ code: 'custom', path: ['collaborationKind'], message: 'Pilih jenis kolaborasi.' })
      for (const [field, message, minimum] of required) {
        if (String(value[field] ?? '').trim().length < minimum)
          context.addIssue({ code: 'custom', path: [field], message })
      }
    }
  })

export type CommunityDraftInput = z.input<typeof communityDraftSchema>
