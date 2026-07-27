import process from 'node:process'
import { evaluateHostedAuthConfig } from '../lib/security/hosted-auth-policy.mjs'

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim()
const projectRef = process.env.SUPABASE_PROJECT_REF?.trim()
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

if (!accessToken || !projectRef || !siteUrl) {
  console.error(
    '[hosted-auth.failed] SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, and NEXT_PUBLIC_SITE_URL are required.',
  )
  process.exit(1)
}
if (!/^[a-z0-9]{20}$/.test(projectRef)) {
  console.error('[hosted-auth.failed] SUPABASE_PROJECT_REF has an invalid format.')
  process.exit(1)
}

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  headers: {
    accept: 'application/json',
    authorization: `Bearer ${accessToken}`,
  },
  signal: AbortSignal.timeout(15_000),
})

if (!response.ok) {
  console.error(`[hosted-auth.failed] Management API returned HTTP ${response.status}.`)
  process.exit(1)
}

const config = await response.json()
const result = evaluateHostedAuthConfig(config, siteUrl)

for (const warning of result.warnings) console.warn(`[hosted-auth.warning] ${warning}`)
for (const failure of result.failures) console.error(`[hosted-auth.violation] ${failure}`)

if (result.failures.length > 0) process.exit(1)

console.log(
  `[hosted-auth.complete] required_controls=verified warnings=${result.warnings.length} project=${projectRef}`,
)
