'use client'

import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useIsClient } from '@studioco2/lib/client'
import { bayerThresholdTile, ditherDotSize, ditherStepTable, pixelSampleTile } from '@studioco2/lib/dither'
import type { Effects } from '@studioco2/lib/effects'

/** A click-through top-layer compositor. Its backdrop includes text, media and dialogs. */
export default function ViewportDither({ effects, dark }: { effects: Effects; dark: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null)
  // The body portal exists only in the browser.
  const mounted = useIsClient()
  useLayoutEffect(() => {
    const layer = layerRef.current
    if (!layer || typeof layer.showPopover !== 'function') return
    let frame = 0
    const raise = () => {
      if (!layer.isConnected) return
      if (layer.matches(':popover-open')) layer.hidePopover()
      layer.showPopover()
      layer.dataset.topLayer = 'true'
    }
    raise()
    // A native modal also enters the top layer; reinsert this noninteractive effect after it.
    const observer = new MutationObserver(records => {
      if (records.some(record => record.target instanceof HTMLDialogElement && record.target.open)) {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(raise)
      }
    })
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      if (layer.matches(':popover-open')) layer.hidePopover()
    }
  }, [effects.water, mounted])
  if (!effects.water || !mounted) return null
  // Keep saved intensity choices, with half-opacity ink at every setting.
  const strength = effects.bottomIntensity / 200
  return createPortal(<>
    <svg className="water-filter-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="viewport-pixel-dither" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB" primitiveUnits="userSpaceOnUse">
          <feImage href={pixelSampleTile} x="0" y="0" width={ditherDotSize} height={ditherDotSize} preserveAspectRatio="none" result="sample-tile" />
          <feTile in="sample-tile" result="sample-map" />
          <feDisplacementMap in="SourceGraphic" in2="sample-map" scale={ditherDotSize} xChannelSelector="R" yChannelSelector="G" result="pixels" />
          <feColorMatrix in="pixels" type="matrix" values={dark
            ? '.299 .587 .114 0 .12  .299 .587 .114 0 .12  .299 .587 .114 0 .12  0 0 0 1 0'
            : '-.299 -.587 -.114 0 1.12  -.299 -.587 -.114 0 1.12  -.299 -.587 -.114 0 1.12  0 0 0 1 0'} result="luminance" />
          <feImage href={bayerThresholdTile} x="0" y="0" width={8 * ditherDotSize} height={8 * ditherDotSize} preserveAspectRatio="none" result="bayer-tile" />
          <feTile in="bayer-tile" result="thresholds" />
          <feComposite in="luminance" in2="thresholds" operator="arithmetic" k1="0" k2="1" k3="-1" k4="1" result="thresholded" />
          <feComponentTransfer in="thresholded" result="monochrome">
            <feFuncR type="discrete" tableValues={ditherStepTable} /><feFuncG type="discrete" tableValues={ditherStepTable} /><feFuncB type="discrete" tableValues={ditherStepTable} /><feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
          {/* Print black pixels in both themes; gaps retain the live backdrop. */}
          <feColorMatrix in="monochrome" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${strength} 0 0 0 0`} result="ink" />
          <feComposite in="ink" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
    </svg>
    <div ref={layerRef} popover="manual" className="viewport-water" data-mode="dither" aria-hidden="true">
      <div className="water-refraction dither-refraction" style={{ backdropFilter: effects.bottomIntensity ? 'url(#viewport-pixel-dither)' : 'none', WebkitBackdropFilter: effects.bottomIntensity ? 'url(#viewport-pixel-dither)' : 'none' }} />
    </div>
  </>, document.body)
}
