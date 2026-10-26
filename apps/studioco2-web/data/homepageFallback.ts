// Homepage content until the Studio CO2 CMS pages exist (Phase 2). Copy and
// imagery come from the P5 prototype. Project titles and summaries are
// editorial proposals, not verified case-study titles.

export type Project = { title: string; type: string; sector: string; image: string; alt: string; description: string; focus: string }
export type Reel = { src: string; poster: string; fullFilmUrl: string }
export type NavigationItem = { label: string; href: string }

export type HeroContent = {
  headline: string[]
  text: string[]
  primaryCta: NavigationItem
  reelLabel: string
  video: { desktop: string; mobile: string; poster: string }
  reel: Reel
}
export type Capability = { title: string; image: string; alt: string; text: string }
export type IntroContent = {
  label: string
  weightLabel: string
  headline: { first: string; beforeImage: string; afterImage: string }
  image: string
  description: string[]
  capabilities: Capability[]
}
export type WorkContent = {
  label: string
  hint: string
  headline: { first: string; second: string; muted: string }
  text: string[]
  projects: Project[]
  projectNote: string
}
export type ContactContent = {
  email: string
  phone: { label: string; href: string }
  address: string[]
  family: NavigationItem
  invitation: string
  cta: string
  copyright: string
  conceptNote: string
}

export type Overlay = { type: 'project'; project: Project; note: string } | { type: 'reel'; reel: Reel } | { type: 'menu' } | null

export type CaseFilters = { service: string; sector: string }
export const allCaseFilters: CaseFilters = { service: '', sector: '' }
export function filterProjects(projects: Project[], filters: CaseFilters) {
  return projects.filter(project => (!filters.service || project.type === filters.service) && (!filters.sector || project.sector === filters.sector))
}

export const siteNavigation: NavigationItem[] = [
  { label: 'Work', href: '#work' },
  { label: 'Studio', href: '#studio' },
  { label: 'Get in touch', href: '#contact' },
]

export const siteContact: ContactContent = {
  email: 'info@studioco2.com',
  phone: { label: '+44 (0) 1483 414 415', href: 'tel:+441483414415' },
  address: ['Cheyenne House, West Street', 'Farnham, Surrey. UK.'],
  family: { label: 'Part of the 1SP family', href: 'https://www.1sp.agency' },
  invitation: 'Good things start with a conversation.',
  cta: 'Get in touch',
  copyright: '© 2026 studioco2',
  conceptNote: 'Portfolio concept',
}

export const homepageFallback: { hero: HeroContent; intro: IntroContent; work: WorkContent } = {
  hero: {
    headline: ['Independent minds.', 'Digital chemistry.'],
    text: ['Ideas, identities and experiences.', 'Made to move people.'],
    primaryCta: { label: 'View work', href: '#work' },
    reelLabel: 'Watch reel',
    // The reel files are local only (gitignored) until they move to Cloudinary.
    video: { desktop: '/media/reel.mp4', mobile: '/media/reel-mobile.mp4', poster: '/media/hero-poster.jpg' },
    reel: { src: '/media/reel.mp4', poster: '/media/hero-poster.jpg', fullFilmUrl: 'https://studioco2.com/wp-content/uploads/2022/05/STUDIO-CO2_NEW_SHOWREEL_FINAL_MAY22.mp4' },
  },
  intro: {
    label: 'A studio for the unexpected.',
    weightLabel: 'Make it bolder',
    headline: { first: 'Different minds.', beforeImage: 'Better', afterImage: 'chemistry.' },
    image: '/media/work-05.webp',
    description: ['We bring strategy, design and making together.', 'Different perspectives. One shared curiosity.'],
    capabilities: [
      { title: 'Think.', image: '/media/work-05.webp', alt: 'Studioco2 team sharing ideas around a table', text: 'Strategy, concepts and creative direction. Finding the idea that makes your brand matter.' },
      { title: 'Make.', image: '/media/work-03.webp', alt: 'A carefully lit audio product detail', text: 'Identity, film and digital content. Giving every idea a form, a voice and a life of its own.' },
      { title: 'Move.', image: '/media/work-04.webp', alt: 'Halo installation bringing a digital world to life', text: 'Spaces, retail and experiences. Taking brands into the world and bringing people into the story.' },
    ],
  },
  work: {
    label: 'Selected work',
    hint: 'Move across. Look closer.',
    headline: { first: 'Made', second: 'to', muted: 'move.' },
    text: ['On a screen. In a space.', 'In someone’s head.'],
    projectNote: 'From the studio archive. Titles and summaries are proposed for this portfolio concept.',
    projects: [
      { title: 'Play, made physical.', type: 'Experiences', sector: 'Gaming', image: '/media/work-04.webp', alt: 'Halo Infinite retail display built around a shopping trolley and a Master Chief helmet', description: 'Bringing a digital world into physical space. A Halo retail display from the Studioco2 archive.', focus: 'Spatial design / Brand experience' },
      { title: 'Inside the game.', type: 'Content', sector: 'Gaming', image: '/media/work-01.webp', alt: 'A player smiling at the wheel of a racing simulator', description: 'The people behind the pixels. Gaming imagery that puts the player at the heart of the story.', focus: 'Art direction / Film / Photography' },
      { title: 'Every detail, amplified.', type: 'Design', sector: 'Audio', image: '/media/work-03.webp', alt: 'Close-up of a gold and black volume dial on an audio amplifier', description: 'Texture, light and the anticipation of sound. Product storytelling from the studio archive.', focus: 'Creative direction / Product storytelling' },
      { title: 'Build another world.', type: 'Experiences', sector: 'Gaming', image: '/media/work-06.webp', alt: 'Minecraft themed retail experience with a green pixelated display', description: 'An invitation to step into the game. A Minecraft retail environment from the Studioco2 archive.', focus: 'Retail / Physical experiences' },
    ],
  },
}
