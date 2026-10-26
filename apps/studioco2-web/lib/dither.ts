// An 8×8 ordered Bayer threshold, matching the reference's luminance-driven dots.
// The tile samples the live browser backdrop; no DOM screenshot or duplicate page.
const svgUrl = (body: string, size: number) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${body}</svg>`)}`
const bayer2 = [0, 2, 3, 1]
export const ditherDotSize = 2

export const bayerThresholdTile = svgUrl(Array.from({ length: 64 }, (_, index) => {
  const x = index % 8
  const y = Math.floor(index / 8)
  let rank = 0
  for (let bit = 0; bit < 3; bit++) rank += bayer2[((y >> bit) & 1) * 2 + ((x >> bit) & 1)] * 4 ** (2 - bit)
  const level = Math.round(rank / 64 * 255)
  return `<rect x="${x * ditherDotSize}" y="${y * ditherDotSize}" width="${ditherDotSize}" height="${ditherDotSize}" fill="rgb(${level},${level},${level})"/>`
}).join(''), 8 * ditherDotSize)

// Each two-pixel square samples its centre before luminance is thresholded.
export const pixelSampleTile = svgUrl(Array.from({ length: ditherDotSize ** 2 }, (_, index) => {
  const x = index % ditherDotSize
  const y = Math.floor(index / ditherDotSize)
  const centre = (ditherDotSize - 1) / 2
  const r = Math.round((.5 + (centre - x) / ditherDotSize) * 255)
  const g = Math.round((.5 + (centre - y) / ditherDotSize) * 255)
  return `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${r},${g},128)"/>`
}).join(''), ditherDotSize)

// feComposite clamps channels. A near-one step implements luminance > threshold
// while keeping alpha opaque throughout the arithmetic pipeline.
export const ditherStepTable = `${'0 '.repeat(255)}1`
