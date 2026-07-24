import { access, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const rasterExtensions = new Set(['.png', '.jpg', '.jpeg'])
const vectorExtension = '.svg'

function parseArguments(argv) {
  const options = {
    check: false,
    fit: 'cover',
    height: null,
    inputPaths: [],
    outputDirectory: null,
    outputFile: null,
    quality: 82,
    width: null,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--check') {
      options.check = true
      continue
    }

    if (argument === '--out-dir') {
      options.outputDirectory = argv[index + 1]
      index += 1
      continue
    }

    if (argument === '--output') {
      options.outputFile = argv[index + 1]
      index += 1
      continue
    }

    if (argument === '--width' || argument === '--height') {
      options[argument.slice(2)] = Number(argv[index + 1])
      index += 1
      continue
    }

    if (argument === '--fit') {
      options.fit = argv[index + 1]
      index += 1
      continue
    }

    if (argument === '--quality') {
      options.quality = Number(argv[index + 1])
      index += 1
      continue
    }

    options.inputPaths.push(argument)
  }

  if (options.inputPaths.length === 0) options.inputPaths.push('public')
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('Quality must be an integer between 1 and 100.')
  }
  if (options.outputFile && options.inputPaths.length !== 1) {
    throw new Error('--output requires exactly one input path.')
  }
  if (!['cover', 'contain', 'fill', 'inside', 'outside'].includes(options.fit)) {
    throw new Error('Fit must be cover, contain, fill, inside, or outside.')
  }

  return options
}

async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function collectAssets(inputPath) {
  const inputStats = await stat(inputPath)
  if (inputStats.isFile()) return [inputPath]

  const entries = await readdir(inputPath, { withFileTypes: true })
  const nestedAssets = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(inputPath, entry.name)
      return entry.isDirectory() ? collectAssets(entryPath) : [entryPath]
    }),
  )

  return nestedAssets.flat()
}

function resolveOutputPath(inputPath, inputRoot, options) {
  if (options.outputFile) return options.outputFile

  const parsedPath = path.parse(inputPath)
  const webpName = `${parsedPath.name}.webp`

  if (!options.outputDirectory) return path.join(parsedPath.dir, webpName)

  const rootStatsPath = path.resolve(inputRoot)
  const relativeDirectory =
    path.resolve(inputPath) === rootStatsPath ? '' : path.dirname(path.relative(inputRoot, inputPath))

  return path.join(options.outputDirectory, relativeDirectory === '.' ? '' : relativeDirectory, webpName)
}

async function optimizeInput(inputRoot, options) {
  const assets = await collectAssets(inputRoot)
  let converted = 0
  let verified = 0
  let vectors = 0
  const missing = []

  for (const asset of assets) {
    const extension = path.extname(asset).toLowerCase()

    if (extension === vectorExtension) {
      vectors += 1
      continue
    }

    if (!rasterExtensions.has(extension)) continue

    const outputPath = resolveOutputPath(asset, inputRoot, options)

    if (options.check) {
      if (await pathExists(outputPath)) verified += 1
      else missing.push(outputPath)
      continue
    }

    await mkdir(path.dirname(outputPath), { recursive: true })
    const image = sharp(asset).rotate()

    if (options.width || options.height) {
      image.resize({
        width: options.width,
        height: options.height,
        fit: options.fit,
        position: 'attention',
      })
    }

    await image
      .webp({
        quality: options.quality,
        effort: 5,
        smartSubsample: true,
      })
      .toFile(outputPath)
    converted += 1
    process.stdout.write(`[image.converted] ${asset} -> ${outputPath}\n`)
  }

  return { converted, missing, vectors, verified }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const totals = { converted: 0, missing: [], vectors: 0, verified: 0 }

  for (const inputPath of options.inputPaths) {
    const result = await optimizeInput(inputPath, options)
    totals.converted += result.converted
    totals.missing.push(...result.missing)
    totals.vectors += result.vectors
    totals.verified += result.verified
  }

  if (totals.missing.length > 0) {
    for (const missingPath of totals.missing) {
      process.stderr.write(`[image.missing] ${missingPath}\n`)
    }
    throw new Error(`${totals.missing.length} WebP asset(s) must be generated.`)
  }

  process.stdout.write(
    `[image.complete] converted=${totals.converted} verified=${totals.verified} svg_preserved=${totals.vectors}\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`[image.failed] ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
