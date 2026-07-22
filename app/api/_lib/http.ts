import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init })
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}
