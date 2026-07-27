function buildContentSecurityPolicy(production) {
  const scriptSources = ["'self'", "'unsafe-inline'"]
  const connectSources = ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co']

  if (!production) {
    scriptSources.push("'unsafe-eval'")
    connectSources.push(
      'http://127.0.0.1:54321',
      'ws://127.0.0.1:54321',
      'http://localhost:54321',
      'ws://localhost:54321',
    )
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://*.supabase.co",
    `connect-src ${connectSources.join(' ')}`,
    "frame-src 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    ...(production ? ['upgrade-insecure-requests'] : []),
  ].join('; ')
}

export function getSecurityHeaders(production = process.env.NODE_ENV === 'production') {
  const headers = [
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(production),
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'X-XSS-Protection', value: '0' },
  ]

  if (production) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    })
  }

  return headers
}
