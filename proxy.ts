import { type NextRequest, NextResponse } from 'next/server'
import { isProtectedPath } from '@/lib/auth/routes'
import { refreshAuthSession } from '@/lib/supabase/proxy'
import { LOCALE_COOKIE, resolveLocale } from '@/app/_i18n/locale'
import { isLocale } from '@/app/_i18n/dictionaries'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Locale detection for ALL routes (including public/demo/landing)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value ?? null
  const acceptLanguage = request.headers.get('accept-language')
  const resolvedLocale = resolveLocale({
    cookieLocale: isLocale(cookieLocale) ? cookieLocale : null,
    acceptLanguageHeader: acceptLanguage,
  })

  // Prepare response: auth flow may create its own response, so we handle locale cookie after
  let response: NextResponse
  let user: unknown = null

  if (isProtectedPath(pathname)) {
    const auth = await refreshAuthSession(request)
    response = auth.response
    user = auth.user
    if (!user) {
      // Preserve locale cookie on redirect as well
      if (!cookieLocale || !isLocale(cookieLocale)) {
        response.cookies.set(LOCALE_COOKIE, resolvedLocale, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365,
        })
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
      const redirect = NextResponse.redirect(loginUrl)
      // copy locale cookie to redirect response
      const localeCookie = response.cookies.get(LOCALE_COOKIE)
      if (localeCookie) {
        redirect.cookies.set(localeCookie.name, localeCookie.value, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365,
        })
      } else if (!cookieLocale || !isLocale(cookieLocale)) {
        redirect.cookies.set(LOCALE_COOKIE, resolvedLocale, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365,
        })
      }
      return redirect
    }
  } else {
    response = NextResponse.next({ request })
  }

  // Set locale cookie if missing or invalid (explicit user choice is already valid and kept)
  if (!cookieLocale || !isLocale(cookieLocale)) {
    response.cookies.set(LOCALE_COOKIE, resolvedLocale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
