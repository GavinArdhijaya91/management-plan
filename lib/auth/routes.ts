const protectedPrefixes = [
  '/dashboard',
  '/kalender',
  '/kolaborasi',
  '/manajemen',
  '/notifikasi',
  '/planning',
  '/profil',
  '/tren-pasar',
  '/workspace',
] as const
const protectedExactPaths = ['/portfolio'] as const

export function isProtectedPath(pathname: string) {
  return (
    protectedExactPaths.some((path) => pathname === path) ||
    protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  )
}
