import { NextResponse } from 'next/server'

function apiResponseInit(init: ResponseInit | undefined, defaultStatus: number) {
  const headers = new Headers(init?.headers)
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  headers.set('X-Content-Type-Options', 'nosniff')

  return { ...init, headers, status: init?.status ?? defaultStatus }
}

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, apiResponseInit(init, 200))
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, apiResponseInit(undefined, status))
}
