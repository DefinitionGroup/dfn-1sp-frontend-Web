'use client'

import Link from 'next/link'
import { ArrowUpRight, List, Moon, Sun, Play, Pause, SlidersHorizontal } from '@phosphor-icons/react'
import Logo from './Logo'
import { useSite } from './SiteProvider'

/** Over the hero reel the header is white; elsewhere it follows the theme. */
export default function SiteHeader({ overMedia = false }: { overMedia?: boolean }) {
  const { open, quiet, toggleQuiet, dark, toggleTheme, fxEnabled, navigation } = useSite()
  return <header className="site-header flex items-center justify-between">
    <Link className="header-brand" href="/#top" aria-label="StudioCO2 home"><Logo tone={overMedia ? 'white' : 'theme'} decorative /></Link>
    <nav className="desktop-nav flex items-center gap-8" aria-label="Main navigation">
      {navigation.map(({ label, href }, index) => <a key={href} href={href}>{label}{index === navigation.length - 1 && <ArrowUpRight />}</a>)}
    </nav>
    <div className="header-tools flex items-center gap-2">
      <button className="icon-button" onClick={toggleTheme} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun /> : <Moon />}</button>
      <button className="icon-button" onClick={toggleQuiet} aria-label={quiet ? 'Enable motion' : 'Pause motion'} aria-pressed={quiet}>{quiet ? <Play /> : <Pause />}</button>
      {fxEnabled
        ? <button className="effects-trigger" onClick={() => open({ type: 'menu' })} aria-label="Open menu and effects"><SlidersHorizontal /><span>Effects</span></button>
        : <button className="effects-trigger" data-role="menu" onClick={() => open({ type: 'menu' })} aria-label="Open menu"><List /><span>Menu</span></button>}
    </div>
  </header>
}
