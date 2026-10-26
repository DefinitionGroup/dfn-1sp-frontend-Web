export type GridMode = 'off' | 'signal' | 'drift' | 'liquid'
export const driftShapes = ['mixed', 'bars', 'blocks', 'crosses', 'steps', 'diamonds', 'rings'] as const
export type DriftShape = typeof driftShapes[number]
export type Effects = { grid: GridMode; heroDarkness: number; intensity: number; driftSize: number; driftSpeed: number; driftChaos: number; driftShape: DriftShape; bottomIntensity: number; water: boolean; hoverGlitch: boolean }
export const defaultEffects: Effects = { grid: 'off', heroDarkness: 0, intensity: 65, driftSize: 50, driftSpeed: 45, driftChaos: 50, driftShape: 'mixed', bottomIntensity: 100, water: true, hoverGlitch: true }
export const presets: { id: GridMode; title: string; detail: string }[] = [
  { id: 'off', title: 'Off', detail: 'Let the work speak.' },
  { id: 'signal', title: 'Signal Grid', detail: 'A reactive lattice with travelling pulses.' },
  { id: 'drift', title: 'Pixel Drift', detail: 'Neon fragments, torn imagery and digital interference.' },
  { id: 'liquid', title: 'Liquid Mesh', detail: 'A grid that bends and ripples around you.' },
]

// The public site runs the defaults above. The FX drawer, and saved choices,
// exist only in development or after visiting with ?fx (kept for the session).
const STORAGE_KEY = 'studioco2-effects'
const FX_SESSION_KEY = 'studioco2-fx'

const percent = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback

let fxEnabled: boolean | undefined

/** Browser only; decided once per page load. */
export function fxRequested(): boolean {
  if (fxEnabled !== undefined) return fxEnabled
  try {
    if (new URLSearchParams(location.search).has('fx')) sessionStorage.setItem(FX_SESSION_KEY, '1')
    fxEnabled = process.env.NODE_ENV === 'development' || sessionStorage.getItem(FX_SESSION_KEY) === '1'
  } catch { fxEnabled = process.env.NODE_ENV === 'development' }
  return fxEnabled
}

export function readEffects(): Effects {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!value) return defaultEffects
    return {
      grid: presets.some(p => p.id === value.grid) ? value.grid : 'off',
      heroDarkness: percent(value.heroDarkness, 0),
      intensity: Number.isFinite(value.intensity) ? Math.max(0, Math.min(100, value.intensity)) : 65,
      driftSize: percent(value.driftSize, percent(value.intensity, 50)),
      driftSpeed: percent(value.driftSpeed, 45),
      driftChaos: percent(value.driftChaos, percent(value.intensity, 50)),
      driftShape: driftShapes.includes(value.driftShape) ? value.driftShape : 'mixed',
      bottomIntensity: Number.isFinite(value.bottomIntensity) ? Math.max(0, Math.min(100, value.bottomIntensity)) : 100,
      water: typeof value.water === 'boolean' ? value.water : true,
      hoverGlitch: typeof value.hoverGlitch === 'boolean' ? value.hoverGlitch : true,
    }
  } catch { return defaultEffects }
}

export function saveEffects(effects: Effects) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(effects)) } catch { /* Settings remain usable without storage. */ }
}
