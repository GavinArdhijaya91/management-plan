const protectedPrefixes = [
  '/dashboard',
  '/calendar',
  '/collaboration',
  '/community',
  '/management',
  '/notifications',
  '/planning',
  '/profile',
  '/market-trends',
  '/workspace',
] as const
const protectedExactPaths = ['/portfolio'] as const

export function isProtectedPath(pathname: string) {
  return (
    protectedExactPaths.some((path) => pathname === path) ||
    protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  )
}
