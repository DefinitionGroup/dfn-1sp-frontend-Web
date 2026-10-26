'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { X, ArrowUpRight } from '@phosphor-icons/react'
import EffectControls from './EffectControls'
import Logo from './Logo'
import type { Effects } from '@studioco2/lib/effects'
import type { NavigationItem, Overlay as OverlayValue } from '@studioco2/data/homepageFallback'

export default function Overlay({ value, close, quiet, effects, changeEffects, shaderFailed, fxEnabled, navigation }: { effects: Effects; changeEffects: (value: Effects) => void; shaderFailed: boolean; fxEnabled: boolean; navigation: NavigationItem[]; value: Exclude<OverlayValue, null>; close: () => void; quiet: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const dialog = ref.current!
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }) }
  }, [])

  const title = value.type === 'project' ? value.project.title : value.type === 'reel' ? 'Studioco2 in motion.' : fxEnabled ? 'Tune the signal.' : 'Menu'
  return <motion.dialog initial={quiet ? false : { opacity: 0, transform: value.type === 'menu' ? 'translateX(100%)' : 'translateY(24px)' }} animate={{ opacity: 1, transform: 'translate(0, 0)' }} exit={{ opacity: 0, transform: quiet ? 'translate(0, 0)' : value.type === 'menu' ? 'translateX(100%)' : 'translateY(24px)' }} transition={{ duration: quiet ? .1 : .3, ease: [.23, 1, .32, 1] }} className={`overlay overlay-${value.type}`} ref={ref} onCancel={event => { event.preventDefault(); close() }} aria-labelledby="overlay-title" onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="overlay-surface">
      <div className="overlay-top"><Logo /><button className="close-button" onClick={close} aria-label="Close dialog" autoFocus><X /> Close</button></div>
      <h2 id="overlay-title">{title}</h2>
      {value.type === 'project' && <>
        <img className="detail-image" src={value.project.image} alt={value.project.alt} width="800" height="500" />
        <div className="detail-copy"><p>{value.project.description}</p><span>{value.project.focus}</span></div>
        <p className="content-note">{value.note}</p>
      </>}
      {value.type === 'reel' && <><video className="reel-video" controls playsInline preload="auto" autoPlay poster={value.reel.poster} src={value.reel.src} onError={() => setFailed(true)} />
        {failed && <p role="alert">The reel couldn’t load. <a href={value.reel.fullFilmUrl}>Open the original reel</a>.</p>}
        <p className="content-note">A short cut from the Studioco2 showreel. <a href={value.reel.fullFilmUrl} target="_blank" rel="noreferrer">Watch the full film <ArrowUpRight /></a></p>
      </>}
      {value.type === 'menu' && <><nav className="effects-nav" aria-label="Studio navigation">{navigation.map(({ label, href }) => <a key={href} href={href} onClick={close}>{label}<ArrowUpRight /></a>)}</nav>
        {fxEnabled && <div onClick={event => { if ((event.target as HTMLElement).closest('.water-jump')) close() }}><EffectControls effects={effects} change={changeEffects} quiet={quiet} failed={shaderFailed} /></div>}</>}
    </div>
  </motion.dialog>
}
