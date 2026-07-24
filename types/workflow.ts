/** Presentation-only calendar item used by the local-storage demo. */
export interface DemoCalendarEvent {
  id: number
  date: number
  month: number
  year: number
  title: string
  type: 'supplier' | 'gaji' | 'stok' | 'lainnya'
  time?: string
}

/** Client-side contact-form draft; not a `public.contact_messages` row. */
export interface ContactFormEntry {
  id: number
  createdAt: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
}
