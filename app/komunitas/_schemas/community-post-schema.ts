import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional().default('')

export const communityDraftSchema = z
  .object({
    id: z.string().uuid().nullable(),
    postKind: z.enum(['insight', 'collaboration_request']),
    title: z.string().trim().min(2, 'Judul minimal 2 karakter.').max(160),
    body: z.string().trim().min(10, 'Isi minimal 10 karakter.').max(10000),
    authorDisplayName: z.string().trim().min(2).max(100),
    workspaceDisplayName: z.string().trim().min(2).max(120),
    categoryIds: z.array(z.number().int().positive()).max(20),
    collaborationKind: z.enum(['marketing', 'distribution', 'supplier', 'event', 'production', 'other']).optional(),
    partnerExpectation: optionalText(2000),
    proposedContribution: optionalText(2000),
    responseInstructions: optionalText(1000),
    locationScope: optionalText(200),
    closesAt: optionalText(40),
  })
  .superRefine((value, context) => {
    if (value.postKind !== 'collaboration_request') return
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
  })

export type CommunityDraftInput = z.input<typeof communityDraftSchema>
