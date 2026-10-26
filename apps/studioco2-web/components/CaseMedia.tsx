'use client'

import { useEffect, useRef } from 'react'
import { useSite } from './SiteProvider'

/** Case video: muted loop that pauses offscreen, in hidden tabs and when motion is paused. */
export default function CaseMedia({ video, image, alt, className = '' }: { video?: string; image?: string; alt: string; className?: string }) {
  const { quiet } = useSite()
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let visible = false
    const sync = () => { if (visible && !quiet && !document.hidden) void element.play().catch(() => {}); else element.pause() }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(element)
    document.addEventListener('visibilitychange', sync)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); element.pause() }
  }, [quiet])
  if (video) return <video ref={ref} className={className} muted loop playsInline preload="metadata" poster={image} aria-label={alt} src={video} />
  if (image) return <img className={className} src={image} alt={alt} loading="lazy" />
  return null
}
