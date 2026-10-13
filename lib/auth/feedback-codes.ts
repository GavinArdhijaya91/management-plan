// S2: URL ?error= / ?success= tidak boleh merender teks mentah dari URL
// (rawan phishing: tautan resmi bisa menempelkan pengumuman palsu).
// Halaman hanya menerima KODE dari allowlist, lalu memetakan ke pesan.

export const AUTH_ERROR_MESSAGES = {
  invalid_credentials: 'Email atau kata sandi salah. Coba lagi.',
  session_expired: 'Sesi berakhir. Silakan masuk kembali.',
  oauth_failed: 'Masuk dengan penyedia gagal. Coba lagi.',
  signup_failed: 'Pendaftaran gagal. Periksa data lalu coba lagi.',
  rate_limited: 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.',
} as const

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES

export function resolveAuthError(code: string | undefined): string | null {
  if (!code) return null
  return (AUTH_ERROR_MESSAGES as Record<string, string>)[code] ?? null
}

export const PAGE_NOTICE_MESSAGES = {
  workspace_required: 'Pilih workspace terlebih dahulu.',
  permission_denied: 'Role Anda tidak memiliki izin untuk aksi itu.',
  saved: 'Perubahan berhasil disimpan.',
  invite_sent: 'Undangan berhasil dikirim.',
  export_ready: 'Ekspor berhasil disiapkan.',
} as const

export function resolvePageNotice(code: string | undefined): string | null {
  if (!code) return null
  return (PAGE_NOTICE_MESSAGES as Record<string, string>)[code] ?? null
}
