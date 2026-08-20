// Generates per-cluster OG images into public/og/*.png using satori + resvg.
// Run: pnpm --filter @phiguard/marketing gen:og
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/og')
const logoPath = path.resolve(__dirname, '../public/logo-horizontal-inverse.png')

const fontPath = require.resolve('@fontsource/public-sans/files/public-sans-latin-700-normal.woff')
const fontPathRegular = require.resolve('@fontsource/public-sans/files/public-sans-latin-400-normal.woff')

const clusters = [
  {
    slug: 'default',
    eyebrow: 'PHIGuard',
    title: 'HIPAA-native task management for small clinics',
    subtitle: 'BAA included · Per-clinic pricing · Audit trail built in',
  },
  {
    slug: 'alternatives',
    eyebrow: 'Alternatives',
    title: 'HIPAA-compliant alternatives to generic task tools',
    subtitle: 'Built for clinics, not retrofitted for compliance',
  },
  {
    slug: 'practice-types',
    eyebrow: 'By practice type',
    title: 'HIPAA task management for your specialty',
    subtitle: 'Pediatrics · OB/GYN · Dermatology · Mental health · More',
  },
  {
    slug: 'comparisons',
    eyebrow: 'Compare',
    title: 'PHIGuard vs. the platforms clinics evaluate',
    subtitle: 'BAA, audit trail, and per-clinic pricing side by side',
  },
  {
    slug: 'resources',
    eyebrow: 'Resources',
    title: 'HIPAA compliance guides for practice administrators',
    subtitle: 'Templates, checklists, and plain-language guides',
  },
]

async function loadFonts() {
  const [bold, regular] = await Promise.all([
    fs.readFile(fontPath),
    fs.readFile(fontPathRegular),
  ])
  return [
    { name: 'Public Sans', data: regular, weight: 400, style: 'normal' },
    { name: 'Public Sans', data: bold, weight: 700, style: 'normal' },
  ]
}

async function loadLogoDataUri() {
  const logo = await fs.readFile(logoPath)
  return `data:image/png;base64,${logo.toString('base64')}`
}

function template({ eyebrow, title, subtitle }, logoSrc) {
  const content = [
    {
      type: 'img',
      props: {
        src: logoSrc,
        width: 360,
        height: 78,
        style: {
          objectFit: 'contain',
          objectPosition: 'left center',
          width: '360px',
          height: '78px',
        },
      },
    },
    {
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', gap: '20px' },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: '22px', fontWeight: 700, color: '#99f6e4', textTransform: 'uppercase', letterSpacing: '0.12em' },
              children: eyebrow,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '64px', fontWeight: 700, lineHeight: 1.1, maxWidth: '1000px' },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '28px', fontWeight: 400, color: '#cbd5e1', lineHeight: 1.4, maxWidth: '1000px' },
              children: subtitle,
            },
          },
        ],
      },
    },
    {
      type: 'div',
      props: {
        style: { fontSize: '22px', color: '#99f6e4' },
        children: 'phiguard.app',
      },
    },
  ]

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        padding: '44px',
        background: '#111827',
        color: '#ffffff',
        fontFamily: 'Public Sans',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '1112px',
              height: '542px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '42px',
              border: '1px solid rgba(153, 246, 228, 0.18)',
              borderRadius: '36px',
              background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 58%, #1e3a8a 100%)',
            },
            children: content,
          },
        },
      ],
    },
  }
}

async function run() {
  await fs.mkdir(outDir, { recursive: true })
  const [fonts, logoSrc] = await Promise.all([loadFonts(), loadLogoDataUri()])
  for (const c of clusters) {
    const svg = await satori(template(c, logoSrc), { width: 1200, height: 630, fonts })
    const png = new Resvg(svg).render().asPng()
    const outPath = path.join(outDir, `${c.slug}.png`)
    await fs.writeFile(outPath, png)
    console.log(`wrote ${path.relative(process.cwd(), outPath)}`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
