'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import type { ResultMetric } from '@1sp/sanity-types';
import { metricPresentation } from '../result-metrics';

/** Final text is server-rendered. Only the aria-hidden copy counts up. */
export function MetricNumber({ metric, locale = 'en', className = '' }: {
  metric: ResultMetric; locale?: string; className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const inView = useInView(root, { once: true, amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const { value, final, isStatic } = metricPresentation(metric, locale);

  useEffect(() => {
    const element = digits.current;
    if (!element || !root.current) return;
    const container = root.current;
    element.textContent = final;
    if (isStatic || reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      played.current = true;
      container.dataset.metricAnimation = 'static';
      return;
    }
    if (played.current) { container.dataset.metricAnimation = 'complete'; return; }
    if (!inView) return;
    played.current = true;
    container.dataset.metricAnimation = 'running';
    const { text } = metricPresentation(metric, locale);
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: current => { element.textContent = text(current); },
      onComplete: () => { element.textContent = final; container.dataset.metricAnimation = 'complete'; },
    });
    return () => { controls.stop(); element.textContent = final; container.dataset.metricAnimation = 'complete'; };
    // Formatting changes settle immediately; they must not restart the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion, isStatic, value, final, locale]);

  if (!Number.isFinite(metric.value)) return null;
  return (
    <span ref={root} className={className} data-metric-value={final} data-metric-animation="ready"
      style={{ display: 'inline-grid', fontVariantNumeric: 'tabular-nums', maxWidth: '100%' }}>
      <span className="sr-only">{final}</span>
      <span aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden' }}>{final}</span>
      <span aria-hidden="true" ref={digits} style={{ gridArea: '1 / 1' }}>{final}</span>
    </span>
  );
}
