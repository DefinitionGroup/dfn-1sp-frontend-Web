import { assetUrl, clean, cloudinary, imageUrl, lines, videoPoster } from './media'
import type { CapabilitiesBlock, CasesStackBlock, ContactSettings, HeroBlock, SpecimenBlock, StackCase } from './types'

// Component-facing shapes. Adapters below turn CMS blocks (or the P5 fallback,
// which uses the same block shapes) into these.

export type NavigationItem = { label: string; href: string }
export type Reel = { src: string; poster?: string; fullFilmUrl?: string }

export type HeroContent = {
  headline: string[]
  text: string[]
  primaryCta: NavigationItem
  reelLabel?: string
  darkness: number
  video?: { desktop: string; mobile?: string; poster?: string }
  reel?: Reel
}

export type Capability = { key: string; title: string; image?: string; alt: string; text: string }

export type SpecimenContent = { anchor: string; label?: string; headline: string[]; image?: string; description: string[] }

/** A stack card. Cases with an href open their page; fallback projects open a dialog. */
export type Project = { id: string; href?: string; title: string; type: string; sector: string; image?: string; alt: string; description: string; focus?: string }

export type WorkContent = { anchor: string; label?: string; hint?: string; headline: string[]; text: string[]; showFilters: boolean; projects: Project[]; projectNote?: string }

export type ContactContent = {
  email?: string
  phone?: NavigationItem
  address: string[]
  family?: NavigationItem
  invitation?: string
  cta: string
  copyright: string
  conceptNote?: string
}

export type Overlay = { type: 'project'; project: Project; note?: string } | { type: 'reel'; reel: Reel } | { type: 'menu' } | null

export type CaseFilters = { service: string; sector: string }
export const allCaseFilters: CaseFilters = { service: '', sector: '' }
export function filterProjects(projects: Project[], filters: CaseFilters) {
  return projects.filter(project => (!filters.service || project.type === filters.service) && (!filters.sector || project.sector === filters.sector))
}

export const caseHref = (slug: string | null | undefined) => slug ? `/cases/${clean(slug)}` : undefined

export function heroContent(block: HeroBlock): HeroContent {
  const desktop = assetUrl(block.video)
  const poster = imageUrl(assetUrl(block.poster), 1920) ?? videoPoster(desktop)
  const reelLabel = block.reelLabel?.trim() || undefined
  return {
    headline: lines(block.headline),
    text: lines(block.text),
    primaryCta: { label: block.primaryLabel || 'View work', href: clean(block.primaryHref) || '#work' },
    reelLabel: desktop ? reelLabel : undefined,
    darkness: Math.max(0, Math.min(100, clean(block.darkness) ?? 0)),
    // Without a dedicated mobile cut, Cloudinary scales the reel for small screens.
    video: desktop ? { desktop: cloudinary(desktop, 'q_auto')!, mobile: assetUrl(block.mobileVideo) ?? cloudinary(desktop, 'q_auto,c_scale,w_720'), poster } : undefined,
    reel: desktop ? { src: desktop, poster, fullFilmUrl: clean(block.fullFilmUrl) || undefined } : undefined,
  }
}

export function specimenContent(block: SpecimenBlock): SpecimenContent {
  return {
    anchor: clean(block.anchor) || 'studio',
    label: block.label || undefined,
    headline: lines(block.headline),
    image: imageUrl(assetUrl(block.inlineImage), 640),
    description: lines(block.description),
  }
}

export function capabilities(block: CapabilitiesBlock): Capability[] {
  return (block.items ?? []).filter(item => item.title).map(item => ({
    key: item._key,
    title: item.title!,
    image: imageUrl(assetUrl(item.image), 1600),
    alt: item.alt || '',
    text: item.text || '',
  }))
}

export function projectFromCase(item: StackCase): Project {
  const title = item.title || 'Untitled case'
  return {
    id: item._id,
    href: caseHref(item.slug),
    title,
    type: clean(item.discipline) || '',
    sector: clean(item.sector) || '',
    image: imageUrl(item.mainImageUrl, 1600),
    alt: item.alt || title,
    description: item.description || '',
    focus: item.focus || undefined,
  }
}

export function workContent(block: CasesStackBlock): WorkContent {
  return {
    anchor: clean(block.anchor) || 'work',
    label: block.label || undefined,
    hint: block.hint || undefined,
    headline: lines(block.headline),
    text: lines(block.text),
    showFilters: block.showFilters !== false,
    projects: (block.cases ?? []).filter((item): item is StackCase => Boolean(item?._id)).map(projectFromCase),
  }
}

export function contactContent(settings: ContactSettings, fallback: ContactContent): ContactContent {
  const phone = settings.phone?.trim()
  return {
    email: settings.email || undefined,
    phone: phone ? { label: phone, href: `tel:${clean(phone).replace(/\(0\)/g, '').replace(/[^+\d]/g, '')}` } : undefined,
    address: lines(settings.address),
    family: settings.familyUrl ? { label: settings.familyLabel || fallback.family?.label || '', href: clean(settings.familyUrl) } : undefined,
    invitation: settings.invitation || undefined,
    cta: settings.ctaLabel || fallback.cta,
    copyright: fallback.copyright,
  }
}

/** Splits a headline’s last line so the muted word or inline image can sit before its final word. */
export function splitLastWord(headline: string[]) {
  const head = headline.slice(0, -1)
  const last = headline.at(-1) ?? ''
  const index = last.lastIndexOf(' ')
  return { head, before: index > 0 ? last.slice(0, index) : '', final: index > 0 ? last.slice(index + 1) : last }
}
