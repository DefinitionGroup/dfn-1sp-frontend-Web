import type { CloudinaryAsset } from './types'

const UPLOAD = /\/(image|video)\/upload\//

/** Adds Cloudinary delivery transformations to an upload URL; other URLs pass through. */
export function cloudinary(url: string | null | undefined, transformation: string) {
  if (!url) return undefined
  return UPLOAD.test(url) ? url.replace(UPLOAD, (match) => `${match}${transformation}/`) : url
}

export const assetUrl = (asset: CloudinaryAsset | undefined) => asset?.secure_url || undefined

export const imageUrl = (url: string | null | undefined, width: number) => cloudinary(url, `f_auto,q_auto,c_limit,w_${width}`)

/** First frame of a Cloudinary video as a still. */
export function videoPoster(url: string | null | undefined) {
  if (!url || !/\/video\/upload\//.test(url)) return undefined
  return cloudinary(url, 'so_0,f_jpg,q_auto,w_1920')?.replace(/\.[a-z0-9]+$/i, '.jpg')
}

/** Multi-line CMS copy: one line per row. Visual-editing markers stay on the text. */
export function lines(value: string | null | undefined) {
  return (value ?? '').split('\n').map(line => line.trim()).filter(Boolean)
}

// Draft previews encode visual-editing metadata as invisible characters in strings.
const STEGA = /[​-‏⁠-⁤﻿]/g

/** Values that drive logic (filters, anchors, links) or per-glyph effects must not carry those markers. */
export function clean<T>(value: T): T {
  return (typeof value === 'string' ? value.replace(STEGA, '') : value) as T
}
