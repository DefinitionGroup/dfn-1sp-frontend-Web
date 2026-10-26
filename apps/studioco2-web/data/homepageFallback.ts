// P5 homepage in the same block shapes as the CMS. Rendered when Sanity has no
// published Studio CO2 homepage (or its content is empty). Project titles and
// summaries are editorial proposals, not verified case-study titles.

import type { ContactContent, NavigationItem } from '@studioco2/lib/content'
import type { Studioco2Block, StackCase } from '@studioco2/lib/types'

export const siteNavigation: NavigationItem[] = [
  { label: 'Work', href: '/#work' },
  { label: 'Studio', href: '/#studio' },
  { label: 'Get in touch', href: '#contact' },
]

export const fallbackContact: ContactContent = {
  email: 'info@studioco2.com',
  phone: { label: '+44 (0) 1483 414 415', href: 'tel:+441483414415' },
  address: ['Cheyenne House, West Street', 'Farnham, Surrey. UK.'],
  family: { label: 'Part of the 1SP family', href: 'https://www.1sp.agency' },
  invitation: 'Good things start with a conversation.',
  cta: 'Get in touch',
  copyright: `© ${new Date().getFullYear()} studioco2`,
  conceptNote: 'Portfolio concept',
}

export const fallbackProjectNote = 'From the studio archive. Titles and summaries are proposed for this portfolio concept.'

/** P5 archive projects; they open in a dialog because they have no case page. */
export const fallbackProjects: (StackCase & { alt: string; focus: string })[] = [
  { _id: 'p5-play', title: 'Play, made physical.', discipline: 'Experiences', sector: 'Gaming', mainImageUrl: '/media/work-04.webp', alt: 'Halo Infinite retail display built around a shopping trolley and a Master Chief helmet', description: 'Bringing a digital world into physical space. A Halo retail display from the Studioco2 archive.', focus: 'Spatial design / Brand experience' },
  { _id: 'p5-inside', title: 'Inside the game.', discipline: 'Content', sector: 'Gaming', mainImageUrl: '/media/work-01.webp', alt: 'A player smiling at the wheel of a racing simulator', description: 'The people behind the pixels. Gaming imagery that puts the player at the heart of the story.', focus: 'Art direction / Film / Photography' },
  { _id: 'p5-detail', title: 'Every detail, amplified.', discipline: 'Design', sector: 'Audio', mainImageUrl: '/media/work-03.webp', alt: 'Close-up of a gold and black volume dial on an audio amplifier', description: 'Texture, light and the anticipation of sound. Product storytelling from the studio archive.', focus: 'Creative direction / Product storytelling' },
  { _id: 'p5-world', title: 'Build another world.', discipline: 'Experiences', sector: 'Gaming', mainImageUrl: '/media/work-06.webp', alt: 'Minecraft themed retail experience with a green pixelated display', description: 'An invitation to step into the game. A Minecraft retail environment from the Studioco2 archive.', focus: 'Retail / Physical experiences' },
]

export const fallbackBlocks: Studioco2Block[] = [
  {
    _type: 'studioco2Hero', _key: 'hero',
    headline: 'Independent minds.\nDigital chemistry.',
    text: 'Ideas, identities and experiences.\nMade to move people.',
    primaryLabel: 'View work', primaryHref: '#work', reelLabel: 'Watch reel',
    fullFilmUrl: 'https://studioco2.com/wp-content/uploads/2022/05/STUDIO-CO2_NEW_SHOWREEL_FINAL_MAY22.mp4',
    darkness: 0,
    // The reel files are local only (gitignored) until they move to Cloudinary.
    video: { secure_url: '/media/reel.mp4' }, mobileVideo: { secure_url: '/media/reel-mobile.mp4' }, poster: { secure_url: '/media/hero-poster.jpg' },
  },
  {
    _type: 'studioco2Specimen', _key: 'specimen', anchor: 'studio',
    label: 'A studio for the unexpected.',
    headline: 'Different minds.\nBetter chemistry.',
    inlineImage: { secure_url: '/media/work-05.webp' },
    description: 'We bring strategy, design and making together.\nDifferent perspectives. One shared curiosity.',
  },
  {
    _type: 'studioco2Capabilities', _key: 'capabilities',
    items: [
      { _key: 'think', title: 'Think.', image: { secure_url: '/media/work-05.webp' }, alt: 'Studioco2 team sharing ideas around a table', text: 'Strategy, concepts and creative direction. Finding the idea that makes your brand matter.' },
      { _key: 'make', title: 'Make.', image: { secure_url: '/media/work-03.webp' }, alt: 'A carefully lit audio product detail', text: 'Identity, film and digital content. Giving every idea a form, a voice and a life of its own.' },
      { _key: 'move', title: 'Move.', image: { secure_url: '/media/work-04.webp' }, alt: 'Halo installation bringing a digital world to life', text: 'Spaces, retail and experiences. Taking brands into the world and bringing people into the story.' },
    ],
  },
  {
    _type: 'studioco2CasesStack', _key: 'work', anchor: 'work',
    label: 'Selected work', hint: 'Move across. Look closer.',
    headline: 'Made\nto move.',
    text: 'On a screen. In a space.\nIn someone’s head.',
    showFilters: true,
    cases: fallbackProjects,
  },
]
