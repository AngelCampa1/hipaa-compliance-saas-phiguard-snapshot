import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const marketingRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(marketingRoot, '../..')
const sourcePath = path.join(marketingRoot, 'src/assets/brand/phiguard-logo-source.png')
const marketingPublic = path.join(marketingRoot, 'public')
const webPublic = path.join(repoRoot, 'apps/web/public')
const pdfBrandAssets = path.join(repoRoot, 'packages/pdf/src/assets/brand')

const WHITE_THRESHOLD = 244
const INK_THRESHOLD = 238

async function readRgba(filePath) {
  const image = sharp(filePath).ensureAlpha()
  const metadata = await image.metadata()
  const data = await image.raw().toBuffer()
  return { data, width: metadata.width, height: metadata.height }
}

function isNearWhite(data, index) {
  const r = data[index]
  const g = data[index + 1]
  const b = data[index + 2]
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD
}

function isInk(data, index) {
  const r = data[index]
  const g = data[index + 1]
  const b = data[index + 2]
  return r < INK_THRESHOLD || g < INK_THRESHOLD || b < INK_THRESHOLD
}

function findInkBounds({ data, width, height }) {
  let left = width
  let right = -1
  let top = height
  let bottom = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      if (!isInk(data, index)) continue

      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }

  if (right < left || bottom < top) {
    throw new Error('Could not find visible logo pixels in source image.')
  }

  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

function findLogoSplit({ data, width, height }, bounds) {
  const minInkPerColumn = Math.max(3, Math.round(bounds.height * 0.015))
  const columnInk = []

  for (let x = bounds.left; x < bounds.left + bounds.width; x += 1) {
    let count = 0
    for (let y = bounds.top; y < bounds.top + bounds.height; y += 1) {
      const index = (y * width + x) * 4
      if (isInk(data, index)) count += 1
    }
    columnInk.push(count)
  }

  let bestGap = null
  let currentStart = null

  columnInk.forEach((count, offset) => {
    const isEmpty = count <= minInkPerColumn
    if (isEmpty && currentStart === null) currentStart = offset
    if (!isEmpty && currentStart !== null) {
      const end = offset - 1
      const length = end - currentStart + 1
      const center = currentStart + length / 2
      const afterMark = center > bounds.width * 0.18
      const beforeWordmark = center < bounds.width * 0.55
      if (afterMark && beforeWordmark && (!bestGap || length > bestGap.length)) {
        bestGap = { start: currentStart, end, length }
      }
      currentStart = null
    }
  })

  if (!bestGap) {
    return Math.round(bounds.left + bounds.width * 0.34)
  }

  return bounds.left + Math.round((bestGap.start + bestGap.end) / 2)
}

function makeTransparentCanvas({ data, width, height }, options = {}) {
  const output = Buffer.from(data)
  const visited = new Uint8Array(width * height)
  const queue = []
  const markRight = options.markRight ?? width

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const pixel = y * width + x
    if (visited[pixel]) return
    const index = pixel * 4
    if (!isNearWhite(output, index)) return
    visited[pixel] = 1
    queue.push(pixel)
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0)
    enqueue(x, height - 1)
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y)
    enqueue(width - 1, y)
  }

  for (let head = 0; head < queue.length; head += 1) {
    const pixel = queue[head]
    const x = pixel % width
    const y = Math.floor(pixel / width)
    const index = pixel * 4
    output[index + 3] = 0

    enqueue(x + 1, y)
    enqueue(x - 1, y)
    enqueue(x, y + 1)
    enqueue(x, y - 1)
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = markRight; x < width; x += 1) {
      const index = (y * width + x) * 4
      if (isNearWhite(output, index)) output[index + 3] = 0
    }
  }

  return output
}

function makeInverseVariant(data, width, startX) {
  const output = Buffer.from(data)
  for (let index = 0; index < output.length; index += 4) {
    const pixel = index / 4
    const x = pixel % width
    if (x < startX) continue

    const alpha = output[index + 3]
    if (alpha === 0) continue

    const r = output[index]
    const g = output[index + 1]
    const b = output[index + 2]
    const isNavy = b > g && g >= r && b < 125
    const isLowLuminanceText = r < 75 && g < 110 && b < 145

    if (isNavy || isLowLuminanceText) {
      output[index] = 248
      output[index + 1] = 250
      output[index + 2] = 252
    }
  }
  return output
}

async function toPng(data, width, height) {
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

async function writeContainedPng(data, width, height, outPath, size) {
  const png = await toPng(data, width, height)
  await sharp(png)
    .resize(size.width, size.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath)
}

async function writeSvgWrapper(outPath, href, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${href}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
  await fs.writeFile(outPath, svg, 'utf8')
}

async function writeAllPublic(relativePath, buffer) {
  await Promise.all([
    fs.writeFile(path.join(marketingPublic, relativePath), buffer),
    fs.writeFile(path.join(webPublic, relativePath), buffer).catch(async (error) => {
      if (error.code !== 'ENOENT') throw error
      await fs.mkdir(path.dirname(path.join(webPublic, relativePath)), { recursive: true })
      await fs.writeFile(path.join(webPublic, relativePath), buffer)
    }),
  ])
}

async function writePdfLogoDataModule() {
  const [horizontal, mark] = await Promise.all([
    fs.readFile(path.join(pdfBrandAssets, 'logo-horizontal.png')),
    fs.readFile(path.join(pdfBrandAssets, 'logo-mark.png')),
  ])
  const moduleSource = `export const pdfLogoHorizontalDataUri = 'data:image/png;base64,${horizontal.toString('base64')}'
export const pdfLogoMarkDataUri = 'data:image/png;base64,${mark.toString('base64')}'
`
  await fs.writeFile(path.join(pdfBrandAssets, 'logo-data.ts'), moduleSource, 'utf8')
}

async function run() {
  await Promise.all([
    fs.mkdir(path.join(marketingPublic, 'email'), { recursive: true }),
    fs.mkdir(marketingPublic, { recursive: true }),
    fs.mkdir(webPublic, { recursive: true }),
    fs.mkdir(pdfBrandAssets, { recursive: true }),
  ])

  const source = await readRgba(sourcePath)
  const bounds = findInkBounds(source)
  const splitX = findLogoSplit(source, bounds)
  const markPadding = Math.round(bounds.height * 0.04)
  const horizontalPadding = Math.round(bounds.height * 0.03)
  const horizontalBounds = {
    left: Math.max(0, bounds.left - horizontalPadding),
    top: Math.max(0, bounds.top - horizontalPadding),
    width: Math.min(source.width - bounds.left + horizontalPadding, bounds.width + horizontalPadding * 2),
    height: Math.min(source.height - bounds.top + horizontalPadding, bounds.height + horizontalPadding * 2),
  }
  const markBounds = {
    left: Math.max(0, bounds.left - markPadding),
    top: Math.max(0, bounds.top - markPadding),
    width: Math.min(source.width - bounds.left + markPadding, splitX - bounds.left + markPadding * 2),
    height: Math.min(source.height - bounds.top + markPadding, bounds.height + markPadding * 2),
  }

  const horizontal = await sharp(sourcePath).extract(horizontalBounds).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const mark = await sharp(sourcePath).extract(markBounds).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const horizontalMarkRight = Math.max(0, splitX - horizontalBounds.left)
  const horizontalTransparent = makeTransparentCanvas(
    { data: horizontal.data, width: horizontal.info.width, height: horizontal.info.height },
    { markRight: horizontalMarkRight },
  )
  const markTransparent = makeTransparentCanvas({ data: mark.data, width: mark.info.width, height: mark.info.height })
  const horizontalInverse = makeInverseVariant(horizontalTransparent, horizontal.info.width, horizontalMarkRight)
  const markInverse = Buffer.from(markTransparent)

  await writeContainedPng(horizontalTransparent, horizontal.info.width, horizontal.info.height, path.join(marketingPublic, 'logo-horizontal.png'), { width: 910, height: 200 })
  await writeContainedPng(horizontalInverse, horizontal.info.width, horizontal.info.height, path.join(marketingPublic, 'logo-horizontal-inverse.png'), { width: 910, height: 200 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(marketingPublic, 'logo-mark.png'), { width: 512, height: 512 })
  await writeContainedPng(markInverse, mark.info.width, mark.info.height, path.join(marketingPublic, 'logo-mark-inverse.png'), { width: 512, height: 512 })

  const sharedAssets = [
    ['logo-horizontal.png', await fs.readFile(path.join(marketingPublic, 'logo-horizontal.png'))],
    ['logo-horizontal-inverse.png', await fs.readFile(path.join(marketingPublic, 'logo-horizontal-inverse.png'))],
    ['logo-horizontal-dark.png', await fs.readFile(path.join(marketingPublic, 'logo-horizontal-inverse.png'))],
    ['logo-mark.png', await fs.readFile(path.join(marketingPublic, 'logo-mark.png'))],
    ['logo-mark-inverse.png', await fs.readFile(path.join(marketingPublic, 'logo-mark-inverse.png'))],
    ['logo-mark-dark.png', await fs.readFile(path.join(marketingPublic, 'logo-mark-inverse.png'))],
  ]
  await Promise.all(sharedAssets.map(([relativePath, buffer]) => writeAllPublic(relativePath, buffer)))

  await writeContainedPng(horizontalTransparent, horizontal.info.width, horizontal.info.height, path.join(marketingPublic, 'email/logo-horizontal.png'), { width: 364, height: 80 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(marketingPublic, 'email/logo-mark.png'), { width: 160, height: 160 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(marketingPublic, 'favicon.png'), { width: 512, height: 512 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(webPublic, 'favicon.png'), { width: 512, height: 512 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(marketingPublic, 'apple-touch-icon.png'), { width: 180, height: 180 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(webPublic, 'apple-touch-icon.png'), { width: 180, height: 180 })
  await writeContainedPng(horizontalTransparent, horizontal.info.width, horizontal.info.height, path.join(pdfBrandAssets, 'logo-horizontal.png'), { width: 364, height: 80 })
  await writeContainedPng(markTransparent, mark.info.width, mark.info.height, path.join(pdfBrandAssets, 'logo-mark.png'), { width: 160, height: 160 })
  await writePdfLogoDataModule()

  await Promise.all([
    writeSvgWrapper(path.join(marketingPublic, 'logo-horizontal.svg'), '/logo-horizontal.png', 910, 200),
    writeSvgWrapper(path.join(marketingPublic, 'logo-horizontal-inverse.svg'), '/logo-horizontal-inverse.png', 910, 200),
    writeSvgWrapper(path.join(marketingPublic, 'logo-horizontal-dark.svg'), '/logo-horizontal-inverse.png', 910, 200),
    writeSvgWrapper(path.join(marketingPublic, 'logo.svg'), '/logo-mark.png', 512, 512),
    writeSvgWrapper(path.join(marketingPublic, 'logo-mark.svg'), '/logo-mark.png', 512, 512),
    writeSvgWrapper(path.join(marketingPublic, 'favicon.svg'), '/favicon.png', 512, 512),
    writeSvgWrapper(path.join(marketingPublic, 'og-default.svg'), '/og/default.png', 1200, 630),
    writeSvgWrapper(path.join(webPublic, 'favicon.svg'), '/favicon.png', 512, 512),
  ])

  console.log(`wrote brand assets from ${path.relative(repoRoot, sourcePath)}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
