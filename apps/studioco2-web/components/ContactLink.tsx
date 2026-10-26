'use client'

import { useState } from 'react'
import GlitchArrow from './GlitchArrow'
import GlitchText from './GlitchText'
import { clean } from '@studioco2/lib/media'

export default function ContactLink({ quiet, email, label }: { quiet: boolean; email: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const active = hovered || focused
  return <a className="contact-title" href={`mailto:${clean(email)}`} data-pixel-active={active}
    onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) { setHovered(true); setReplayKey(value => value + 1) } }}
    onPointerLeave={() => setHovered(false)} onFocus={() => { setFocused(true); setReplayKey(value => value + 1) }} onBlur={() => setFocused(false)}>
    <GlitchText className="contact-title-text" quiet={quiet} play={active} replayKey={replayKey} duration={1400}>{label}</GlitchText>
    <span className="contact-arrow" aria-hidden="true">
      <GlitchArrow quiet={quiet} decorative active={active} replayKey={replayKey} duration={1600} />
    </span>
  </a>
}
