export interface CalendarEvent {
  id: number
  date: number
  month: number
  year: number
  title: string
  type: 'supplier' | 'gaji' | 'stok' | 'lainnya'
  time?: string
}

export interface ContactMessage {
  id: number
  createdAt: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
}
