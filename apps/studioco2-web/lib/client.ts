import { useSyncExternalStore } from 'react'

// Browser-only values. The server and the hydrating render use the fallback;
// React re-renders with the browser value right after hydration.

/** Subscribe function for values that do not change after load. */
export const unchanging = () => () => {}

/** True in the browser after hydration, e.g. for body portals. */
export function useIsClient() {
  return useSyncExternalStore(unchanging, () => true, () => false)
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(change => {
    const media = matchMedia(query)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, () => matchMedia(query).matches, () => false)
}

export function useDocumentHidden() {
  return useSyncExternalStore(change => {
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, () => document.hidden, () => false)
}

/** Mirrors <html data-theme>, which the root layout's inline script sets before paint. */
export function useDocumentDark() {
  return useSyncExternalStore(change => {
    const observer = new MutationObserver(change)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, () => document.documentElement.dataset.theme === 'dark', () => false)
}
