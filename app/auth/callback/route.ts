import { NextResponse, type NextRequest } from 'next/server'
import { getSafeInternalPath } from '@/lib/auth/redirect'
import { getSiteUrl } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = getSafeInternalPath(request.nextUrl.searchParams.get('next'), '/workspace/select')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, getSiteUrl()))
  }

  return NextResponse.redirect(new URL('/auth/login?error=Link konfirmasi tidak valid atau kedaluwarsa.', getSiteUrl()))
}
