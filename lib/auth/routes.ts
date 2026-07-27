const protectedPrefixes = [
  '/dashboard',
  '/kalender',
  '/manajemen',
  '/notifikasi',
  '/planning',
  '/profil',
  '/tren-pasar',
  '/workspace',
] as const

export function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
