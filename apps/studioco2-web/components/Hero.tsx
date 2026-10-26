'use client'

import { Fragment, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { ArrowUpRight, Play } from '@phosphor-icons/react'
import GlitchText from './GlitchText'
import Logo from './Logo'
import PixelDrift from './PixelDrift'
import SignalBurst from './SignalBurst'
import SiteHeader from './SiteHeader'
import { useSite } from './SiteProvider'
import type { HeroContent } from '@studioco2/lib/content'

const ShaderCanvas = dynamic(() => import('./ShaderCanvas'), { ssr: false })

/** Optional FX presets; they stay inside the clipped hero media layer. */
function HeroMediaEffects() {
  const { effects, quiet, dark, shaderFailed, failShader } = useSite()
  return <>
    {effects.grid !== 'off' && (effects.grid === 'drift' || effects.intensity > 0) && !shaderFailed && <ShaderCanvas mode={{ signal: 1, drift: 2, liquid: 3 }[effects.grid]} intensity={effects.grid === 'drift' ? 100 : effects.intensity} drift={effects} quiet={quiet} dark={dark} onFailure={failShader} />}
    {effects.grid === 'drift' && <PixelDrift effects={effects} quiet={quiet} />}
  </>
}

export default function Hero({ content }: { content: HeroContent }) {
  const { effects, fxEnabled, open, quiet } = useSite()
  const playRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 35 })
  const springY = useSpring(y, { stiffness: 350, damping: 35 })
  // The FX drawer can override the editor's darkness while tuning.
  const darkness = fxEnabled ? effects.heroDarkness : content.darkness

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let visible = false
    const syncPlayback = () => {
      if (visible && !quiet && !document.hidden) void video.play().catch(() => {})
      else video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    }, { threshold: 0 })
    observer.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [quiet])

  const reel = content.reel
  return <section className="hero" id="top" aria-labelledby="brand-title">
    <div className="hero-media" aria-hidden="true">
    {content.video && <video ref={videoRef} className="hero-image" muted loop playsInline poster={content.video.poster} preload="metadata" aria-hidden="true">
      {content.video.mobile && <source src={content.video.mobile} media="(max-width: 600px)" type="video/mp4" />}
      <source src={content.video.desktop} type="video/mp4" />
    </video>}
    <div className="hero-video-darkness" style={{ opacity: darkness / 100 }} />
    <HeroMediaEffects />
    </div>
    <div className="hero-scrim" />
    <SiteHeader overMedia />
    <div className="hero-content">
      <SignalBurst quiet={quiet} />
      <h1 id="brand-title" className="hero-brand w-full" aria-label="studioco2">
        <motion.span aria-hidden="true" initial={quiet ? false : { y: 18 }} animate={{ y: 0 }} transition={{ duration: .65, ease: [.16, 1, .3, 1] }}><Logo tone="white" decorative /></motion.span>
      </h1>
      <motion.div className="hero-bottom" initial={quiet ? false : { y: 10 }} animate={{ y: 0 }} transition={{ duration: .4 }}>
        <div className="hero-copy">
          <h2>{content.headline.map((line, index) => <Fragment key={line}>{index > 0 && <br />}<GlitchText quiet={quiet} delay={100 + index * 80}>{line}</GlitchText></Fragment>)}</h2>
          <p>{content.text.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</p>
        </div>
        <div className="hero-actions flex items-center gap-3">
          <a href={content.primaryCta.href} className="button button-light">{content.primaryCta.label} <ArrowUpRight /></a>
          {reel && content.reelLabel && <motion.button ref={playRef} className="button button-outline" onClick={() => open({ type: 'reel', reel })} style={quiet ? undefined : { x: springX, y: springY }}
            onPointerMove={event => {
              if (quiet || event.pointerType !== 'mouse') return
              const box = playRef.current!.getBoundingClientRect()
              x.set((event.clientX - box.x - box.width / 2) * .12)
              y.set((event.clientY - box.y - box.height / 2) * .16)
            }} onPointerLeave={() => { x.set(0); y.set(0) }}>
            {content.reelLabel} <Play weight="fill" />
          </motion.button>}
        </div>
      </motion.div>
    </div>
  </section>
}
