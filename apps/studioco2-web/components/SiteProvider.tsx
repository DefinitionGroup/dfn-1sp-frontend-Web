'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'motion/react'
import Overlay from './Overlay'
import ViewportDither from './ViewportDither'
import { unchanging, useDocumentDark, useMediaQuery } from '@studioco2/lib/client'
import { defaultEffects, fxRequested, readEffects, saveEffects } from '@studioco2/lib/effects'
import type { Effects } from '@studioco2/lib/effects'
import type { NavigationItem, Overlay as OverlayValue } from '@studioco2/lib/content'

type Site = {
  quiet: boolean
  toggleQuiet: () => void
  dark: boolean
  toggleTheme: () => void
  effects: Effects
  fxEnabled: boolean
  overlay: OverlayValue
  open: (value: OverlayValue) => void
  shaderFailed: boolean
  failShader: () => void
  navigation: NavigationItem[]
}

const SiteContext = createContext<Site | null>(null)

export function useSite() {
  const site = useContext(SiteContext)
  if (!site) throw new Error('useSite must be used inside SiteProvider.')
  return site
}

/** Site-wide state from the prototype's App: theme, Pause, effects and dialogs. */
export default function SiteProvider({ navigation, children }: { navigation: NavigationItem[]; children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayValue>(null)
  const [shaderFailed, setShaderFailed] = useState(false)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [paused, setPaused] = useState(false)
  const quiet = reduced || paused

  // The theme follows the OS until the visitor chooses one in the header.
  const dark = useDocumentDark()
  const themeChosen = useRef(false)
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const change = (event: MediaQueryListEvent) => {
      if (!themeChosen.current) document.documentElement.dataset.theme = event.matches ? 'dark' : 'light'
    }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  const toggleTheme = () => {
    themeChosen.current = true
    document.documentElement.dataset.theme = dark ? 'light' : 'dark'
  }

  // Public visitors get the defaults; tuning and saved choices need the FX drawer.
  const fxEnabled = useSyncExternalStore(unchanging, fxRequested, () => false)
  const saved = useMemo(() => fxEnabled ? readEffects() : defaultEffects, [fxEnabled])
  const [tuned, setTuned] = useState<Effects | null>(null)
  const effects = tuned ?? saved
  useEffect(() => { if (fxEnabled && tuned) saveEffects(tuned) }, [fxEnabled, tuned])

  const site: Site = {
    quiet, toggleQuiet: () => setPaused(!paused), dark, toggleTheme, effects, fxEnabled,
    overlay, open: setOverlay, shaderFailed, failShader: () => setShaderFailed(true), navigation,
  }
  return <SiteContext.Provider value={site}>
    <div className="site" data-quiet={quiet}>
      {children}
      <AnimatePresence>{overlay && <Overlay value={overlay} close={() => setOverlay(null)} quiet={quiet} effects={effects} changeEffects={setTuned} shaderFailed={shaderFailed} fxEnabled={fxEnabled} navigation={navigation} />}</AnimatePresence>
    </div>
    <ViewportDither effects={effects} dark={dark} />
  </SiteContext.Provider>
}
