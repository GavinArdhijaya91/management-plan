import { type NextRequest, NextResponse } from 'next/server'
import { isProtectedPath } from '@/lib/auth/routes'
import { refreshAuthSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!isProtectedPath(pathname)) return NextResponse.next()

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
