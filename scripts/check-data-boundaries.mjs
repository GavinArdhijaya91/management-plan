import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const presentationTypesDirectory = path.join(projectRoot, 'types')
const forbiddenCanonicalExports = [
  'ActionItem',
  'BusinessGoal',
  'BusinessPlan',
  'BusinessReview',
  'CalendarEvent',
  'ContactMessage',
  'FinancialAccount',
  'MarketProduct',
  'Notification',
  'Profile',
  'Transaction',
  'Workspace',
  'WorkspaceMember',
]

const typeFiles = (await readdir(presentationTypesDirectory)).filter((file) => file.endsWith('.ts'))
const violations = []

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectTypeScriptFiles(entryPath)))
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(entryPath)
    }
  }

  return files
}

const presentationFiles = (
  await Promise.all(
    ['app', 'components', 'data', 'types'].map((directory) =>
      collectTypeScriptFiles(path.join(projectRoot, directory)),
    ),
  )
).flat()

for (const filePath of presentationFiles) {
  const source = await readFile(filePath, 'utf8')
  const relativePath = path.relative(projectRoot, filePath)

  for (const name of forbiddenCanonicalExports) {
    const declaration = new RegExp(`(?:export\\s+)?(?:interface|type|class)\\s+${name}\\b`)
    if (declaration.test(source)) {
      violations.push(`${relativePath}: canonical declaration "${name}"`)
    }
  }
}

const requiredBoundaryFiles = [
  'docs/DATA_ACCESS_CONTRACT.md',
  'lib/supabase/database.types.ts',
  'lib/supabase/domain-types.ts',
  'lib/supabase/rpc-types.ts',
]

for (const relativePath of requiredBoundaryFiles) {
  try {
    await readFile(path.join(projectRoot, relativePath))
  } catch {
    violations.push(`missing required boundary file "${relativePath}"`)
  }
}

const browserClientSource = await readFile(path.join(projectRoot, 'lib/supabase/client.ts'), 'utf8')
const serverClientSource = await readFile(path.join(projectRoot, 'lib/supabase/server.ts'), 'utf8')

if (!browserClientSource.includes('createBrowserClient<Database>')) {
  violations.push('browser Supabase client is not typed with Database')
}
if (!serverClientSource.includes('createServerClient<Database>')) {
  violations.push('server Supabase client is not typed with Database')
}

const migrationDirectory = path.join(projectRoot, 'supabase/migrations')
const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith('.sql')).sort()
const migrationSources = await Promise.all(
  migrationFiles.map(async (file) => ({
    file,
    source: await readFile(path.join(migrationDirectory, file), 'utf8'),
  })),
)
const combinedMigrations = migrationSources
  .map(({ source }) => source)
  .join('\n')
  .toLowerCase()
const migrationVersions = new Set()

for (const { file, source } of migrationSources) {
  const version = file.split('_')[0]
  if (migrationVersions.has(version)) {
    violations.push(`duplicate migration version "${version}"`)
  }
  migrationVersions.add(version)

  const publicFunctionPattern = /create or replace function\s+(public\.[a-z0-9_]+)\s*\([^)]*\)/gi
  for (const match of source.matchAll(publicFunctionPattern)) {
    const functionName = match[1].toLowerCase()
    if (!combinedMigrations.includes(`revoke all on function ${functionName}`)) {
      violations.push(`${file}: public function "${functionName}" lacks REVOKE ALL`)
    }
  }
}

if (violations.length > 0) {
  console.error('[data-boundary.failed]')
  violations.forEach((violation) => console.error(`- ${violation}`))
  process.exit(1)
}

console.log(
  `[data-boundary.complete] presentation_files=${presentationFiles.length} type_modules=${typeFiles.length} migrations=${migrationFiles.length} forbidden_exports=0`,
)
