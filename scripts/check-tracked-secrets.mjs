import { readFileSync, statSync } from 'node:fs'
import { extname } from 'node:path'
import { spawnSync } from 'node:child_process'

const allowedEnvironmentFiles = new Set(['.env.example'])
const forbiddenFileNames = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)(?:\.netrc|\.npmrc\.local|\.pgpass)$/i,
  /(^|\/)(?:id_rsa|id_ed25519)$/i,
  /(^|\/)(?:credentials[^/]*|service-account[^/]*)\.json$/i,
  /\.(?:backup|db|dump|sqlite|sqlite3|sql\.gz)$/i,
  /\.(?:jks|kdbx|key|keystore|p12|pfx|pem)$/i,
]
const secretPatterns = [
  ['private key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[opusr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Stripe live key', /\b[rs]k_live_[0-9A-Za-z]{20,}\b/],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['Supabase secret key', /\bsb_secret_[A-Za-z0-9_-]{20,}\b/],
]
const binaryExtensions = new Set(['.avif', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.webp', '.woff', '.woff2'])
const maximumScannedFileSize = 2 * 1024 * 1024

function trackedFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], {
    encoding: 'utf8',
    windowsHide: true,
  })

  if (result.status !== 0) {
    const detail = result.stderr.trim() || 'git ls-files failed'
    throw new Error(detail)
  }

  return result.stdout.split('\0').filter(Boolean)
}

const findings = []

for (const fileName of trackedFiles()) {
  const normalizedName = fileName.replaceAll('\\', '/')

  if (
    !allowedEnvironmentFiles.has(normalizedName) &&
    forbiddenFileNames.some((pattern) => pattern.test(normalizedName))
  ) {
    findings.push(`${normalizedName}: sensitive file name must not be tracked`)
    continue
  }

  if (binaryExtensions.has(extname(normalizedName).toLowerCase())) continue
  if (statSync(fileName).size > maximumScannedFileSize) continue

  const source = readFileSync(fileName, 'utf8')
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(source)) findings.push(`${normalizedName}: possible ${label}`)
  }
}

if (findings.length > 0) {
  console.error('Tracked-secret check failed:')
  for (const finding of findings) console.error(`- ${finding}`)
  console.error('Remove and rotate any real credential before committing.')
  process.exit(1)
}

console.log('Tracked-secret check passed.')
