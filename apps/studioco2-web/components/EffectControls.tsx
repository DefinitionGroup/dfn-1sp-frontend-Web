'use client'

import { ArrowCounterClockwise, Check } from '@phosphor-icons/react'
import { defaultEffects, presets, driftShapes } from '@studioco2/lib/effects'
import type { Effects } from '@studioco2/lib/effects'

export default function EffectControls({ effects, change, quiet, failed }: {
  effects: Effects; change: (value: Effects) => void; quiet: boolean; failed: boolean
}) {
  return <div className="effect-controls">
    <label className="effect-intensity hero-darkness-control">
      <span>Hero video darkness<output>{effects.heroDarkness}%</output></span>
      <input type="range" min="0" max="100" step="5" value={effects.heroDarkness} aria-label="Hero video darkness" aria-describedby="hero-darkness-hint" onChange={event => change({ ...effects, heroDarkness: Number(event.target.value) })} />
      <small id="hero-darkness-hint">Original at 0%. Black at 100%. Text and FX stay bright.</small>
    </label>
    <fieldset className="effect-presets">
      <legend>Hero video FX</legend>
      {presets.map(preset => <label key={preset.id} className={`effect-preset ${effects.grid === preset.id ? 'is-selected' : ''}`}>
        <input type="radio" name="shader-preset" value={preset.id} checked={effects.grid === preset.id} onChange={() => change({ ...effects, grid: preset.id })} />
        <span className={`preset-preview preview-${preset.id}`} aria-hidden="true" />
        <span className="preset-text"><strong>{preset.title}</strong><span>{preset.detail}</span></span>
        <Check className="preset-check" aria-hidden="true" />
      </label>)}
    </fieldset>
    {effects.grid === 'drift' ? <div className="drift-controls">
      {([
        ['driftSize', 'Size', 'Scale of the fragments.'],
        ['driftSpeed', 'Speed', 'Movement speed. Zero holds position.'],
        ['driftChaos', 'Flickering chaos', 'Blinking, fragment density and distortion. Zero stays steady.'],
      ] as const).map(([key, label, hint]) => <label className="effect-intensity" key={key}>
        <span>{label}<output>{effects[key]}%</output></span>
        <input type="range" min="0" max="100" step="5" value={effects[key]} aria-label={label} onChange={event => change({ ...effects, [key]: Number(event.target.value) })} />
        <small>{hint}</small>
      </label>)}
      <label className="shape-control">Shapes
        <select aria-label="Shapes" value={effects.driftShape} onChange={event => change({ ...effects, driftShape: event.target.value as Effects['driftShape'] })}>
          {driftShapes.map(shape => <option key={shape} value={shape}>{shape === 'mixed' ? 'Mixed · all shapes' : shape[0].toUpperCase() + shape.slice(1)}</option>)}
        </select>
      </label>
      <p className="effect-note chaos-note">Only on the hero video. Text and controls stay clear.</p>
    </div> : <label className="effect-intensity"><span>Grid intensity <output>{effects.intensity}%</output></span>
      <input type="range" min="0" max="100" step="5" value={effects.intensity} aria-label="Grid intensity" onChange={event => change({ ...effects, intensity: Number(event.target.value) })} />
    </label>}
    <fieldset className="water-controls">
      <legend>Bottom pixel dither</legend>
      <label className="effect-switch"><span>Bottom effect</span><input type="checkbox" role="switch" checked={effects.water} onChange={event => change({ ...effects, water: event.target.checked })} /><span className="switch-track" aria-hidden="true" /></label>
      <label className="effect-intensity bottom-intensity"><span>Bottom intensity <output>{effects.bottomIntensity}%</output></span>
        <input type="range" min="0" max="100" step="5" value={effects.bottomIntensity} aria-label="Bottom intensity" disabled={!effects.water} onChange={event => change({ ...effects, bottomIntensity: Number(event.target.value) })} />
      </label>
    </fieldset>
    <fieldset className="hover-controls">
      <legend>Project interaction</legend>
      <label className="effect-switch"><span>Project glitch · {effects.hoverGlitch ? 'On' : 'Off'}</span><input type="checkbox" role="switch" aria-label="Project glitch" checked={effects.hoverGlitch} onChange={event => change({ ...effects, hoverGlitch: event.target.checked })} /><span className="switch-track" aria-hidden="true" /></label>
      <p className="effect-note">Controls project text scrambling, neon and image glitches, and the entry nudge. Standard reveal controls always work.</p>
    </fieldset>
    <div className="effect-actions"><button className="effect-reset" onClick={() => change(defaultEffects)}><ArrowCounterClockwise /> Reset effects</button><button type="button" className="water-jump">View bottom effect ↘</button></div>
    <p className="effect-note" role="status">{failed ? 'WebGL is unavailable. Pixel Dither still uses the native compositor.' : quiet ? 'Motion is paused. Project glitch is disabled.' : 'The bottom effect processes everything beneath it. Your choices are saved on this device.'}</p>
  </div>
}
