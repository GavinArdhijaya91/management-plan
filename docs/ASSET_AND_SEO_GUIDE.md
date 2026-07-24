# Asset and SEO Guide

Siapin keeps public discovery separate from private workspace pages. The
landing page and contact page may be indexed. Dashboard, transactions,
calendar, notifications, profile, and market-analysis pages use `noindex` and
are excluded from the sitemap.

## Site URL

Set the canonical production origin:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

The value controls canonical URLs, Open Graph URLs, robots, sitemap, and
structured data. Local development falls back to `http://localhost:3000`.

## Raster images

Supported source formats:

- `.png`
- `.jpg`
- `.jpeg`

Generate WebP counterparts for raster files in `public/`:

```bash
pnpm images:optimize
```

Verify that every public raster source has a WebP counterpart:

```bash
pnpm images:check
```

Generate the 1200×630 Open Graph preview:

```bash
pnpm images:og
```

The underlying script also supports explicit transformations:

```bash
node scripts/optimize-images.mjs source.png \
  --output public/images/example.webp \
  --width 1200 \
  --height 630 \
  --fit cover \
  --quality 84
```

Generated WebP files should be committed so deployments do not need to mutate
the source tree.

## SVG assets

SVG files remain vector files and are never converted by the raster pipeline.
Place trusted SVG assets in `public/` and reference them with an absolute path,
for example `/icon.svg`.

Next.js image configuration permits SVG with a restrictive Content Security
Policy and attachment disposition. Do not allow untrusted user-uploaded SVG
files in a public bucket: SVG can contain active content. For user uploads,
prefer PNG, JPEG, or WebP and validate MIME type plus file contents.

## Image usage

- Use WebP or AVIF for photographic and screenshot content.
- Keep SVG for icons, logos, and illustrations that must scale cleanly.
- Provide meaningful alternative text for informative images.
- Use empty alternative text for purely decorative images.
- Include intrinsic width and height to prevent layout shift.
- Do not expose private workspace screenshots as SEO or social assets.

## SEO routes

- `app/robots.ts` controls crawler access.
- `app/sitemap.ts` lists public canonical pages.
- `app/manifest.ts` describes installable application metadata.
- `app/layout.tsx` owns default metadata and social previews.
- Private route layouts apply `noindex`.
- `StructuredData` emits `SoftwareApplication` JSON-LD.

Update metadata whenever the production name, positioning, domain, or public
route structure changes.
