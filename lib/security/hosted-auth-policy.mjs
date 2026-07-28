const requiredBooleanSettings = [
  ['disable_signup', false, 'Email signup must remain available.'],
  ['external_email_enabled', true, 'Email authentication must be enabled.'],
  ['external_anonymous_users_enabled', false, 'Anonymous sign-in must remain disabled.'],
  ['mailer_autoconfirm', false, 'Email ownership must be confirmed before sign-in.'],
  ['mailer_allow_unverified_email_sign_ins', false, 'Unverified email sign-in must remain disabled.'],
  ['mailer_secure_email_change_enabled', true, 'Email changes must be confirmed securely.'],
  ['refresh_token_rotation_enabled', true, 'Refresh-token rotation must remain enabled.'],
  ['security_update_password_require_reauthentication', true, 'Password changes must require reauthentication.'],
  ['security_manual_linking_enabled', false, 'Manual identity linking must remain disabled.'],
]

const upperBounds = [
  ['jwt_exp', 3600, 'JWT lifetime must not exceed one hour.'],
  ['security_refresh_token_reuse_interval', 10, 'Refresh-token reuse interval must not exceed 10 seconds.'],
  ['rate_limit_anonymous_users', 30, 'Anonymous Auth rate limit is too permissive.'],
  ['rate_limit_email_sent', 10, 'Email Auth rate limit is too permissive.'],
  ['rate_limit_otp', 30, 'OTP rate limit is too permissive.'],
  ['rate_limit_token_refresh', 1800, 'Token refresh rate limit is too permissive.'],
  ['rate_limit_verify', 360, 'Verification rate limit is too permissive.'],
]

export function evaluateHostedAuthConfig(config, expectedSiteUrl) {
  const failures = []
  const warnings = []

  for (const [key, expected, message] of requiredBooleanSettings) {
    if (config[key] !== expected) failures.push(`${key}: ${message}`)
  }

  for (const [key, maximum, message] of upperBounds) {
    const value = config[key]
    if (!Number.isInteger(value) || value < 0 || value > maximum) {
      failures.push(`${key}: ${message}`)
    }
  }

  if (!Number.isInteger(config.password_min_length) || config.password_min_length < 10) {
    failures.push('password_min_length: Hosted password minimum must be at least 10 characters.')
  }
  if (typeof config.password_required_characters !== 'string' || config.password_required_characters.length === 0) {
    failures.push('password_required_characters: Hosted Auth must require multiple character classes.')
  }

  let expectedOrigin
  try {
    const expected = new URL(expectedSiteUrl)
    if (expected.protocol !== 'https:' || expected.hostname === 'localhost') throw new Error()
    expectedOrigin = expected.origin
  } catch {
    failures.push('NEXT_PUBLIC_SITE_URL: A canonical hosted HTTPS origin is required.')
  }

  if (expectedOrigin) {
    try {
      const configuredSite = new URL(config.site_url)
      if (configuredSite.origin !== expectedOrigin) {
        failures.push('site_url: Hosted Auth does not use the canonical application origin.')
      }
    } catch {
      failures.push('site_url: Hosted Auth site URL is invalid.')
    }
  }

  const redirectUrls =
    typeof config.uri_allow_list === 'string'
      ? config.uri_allow_list
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : []

  if (redirectUrls.some((value) => value.includes('*'))) {
    failures.push('uri_allow_list: Wildcard Auth redirect URLs are forbidden.')
  }
  if (
    redirectUrls.some((value) => {
      try {
        const redirect = new URL(value)
        return redirect.protocol !== 'https:' || redirect.hostname === 'localhost'
      } catch {
        return true
      }
    })
  ) {
    failures.push('uri_allow_list: Every hosted Auth redirect must be a valid non-local HTTPS URL.')
  }
  if (
    expectedOrigin &&
    !redirectUrls.some((value) => {
      try {
        const redirect = new URL(value)
        return redirect.origin === expectedOrigin && redirect.pathname === '/auth/callback'
      } catch {
        return false
      }
    })
  ) {
    failures.push('uri_allow_list: The canonical authentication callback is missing.')
  }

  if (config.password_hibp_enabled !== true) {
    warnings.push('Leaked-password protection is not enabled or is unavailable on the current plan.')
  }
  if (config.security_captcha_enabled !== true) {
    warnings.push('CAPTCHA is not enabled; activate it only after the application submits provider tokens.')
  }
  if (!config.sessions_inactivity_timeout) {
    warnings.push('No hosted session inactivity timeout is configured.')
  }

  return { failures, warnings }
}
