import { type NextRequest, NextResponse } from 'next/server'
import { refreshAuthSession } from '@/lib/supabase/proxy'

const protectedPrefixes = [
  '/dashboard',
  '/kalender',
  '/manajemen',
  '/notifikasi',
  '/profil',
  '/tren-pasar',
  '/workspace',
]
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (!isProtected) return NextResponse.next()

  const { response, user } = await refreshAuthSession(request)
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
