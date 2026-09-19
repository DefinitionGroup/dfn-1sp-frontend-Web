import type { ResultMetric } from '@1sp/sanity-types';

const scales = { none: 1, thousand: 1_000, million: 1_000_000, billion: 1_000_000_000 };
const scaleLabels = { none: '', thousand: 'k', million: 'm', billion: 'bn' };
const qualifierPrefixes = { exact: '', plus: '', moreThan: 'Over ', approximately: '~', nearly: 'Nearly ', lessThan: 'Under ' };
// Sanity preview metadata belongs on editable text, never on formatting controls.
const clean = (value: string | undefined) => value?.replace(/[\u200b-\u200f\ufeff]/g, '') ?? '';

export function metricPresentation(metric: ResultMetric, locale = 'en') {
  const scale = clean(metric.displayScale) as keyof typeof scales;
  const qualifier = clean(metric.qualifier) as keyof typeof qualifierPrefixes;
  const divisor = scales[scale] ?? 1;
  const value = metric.value / divisor;
  const decimals = metric.decimalPlaces;
  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 3,
  });
  const prefix = `${qualifierPrefixes[qualifier] ?? ''}${clean(metric.prefix)}`;
  const suffix = `${scaleLabels[scale] ?? ''}${clean(metric.suffix)}${qualifier === 'plus' ? '+' : ''}`;
  const text = (current: number) => `${prefix}${format.format(current)}${suffix}`;
  return { value, text, final: text(value), isStatic: clean(metric.animationMode) === 'static' };
}

export function hasMetricFormatting(metric: ResultMetric) {
  return ['displayScale', 'decimalPlaces', 'qualifier', 'prefix', 'animationMode'].some(key =>
    metric[key as keyof ResultMetric] !== undefined,
  );
}

export function resultSectionId(content: Array<{_type?: string; _key?: string}>, block: {_key?: string}, index: number) {
  if (content.findIndex(item => item._type === 'resultsMetrics') === index) return 'results';
  return `results-${clean(block._key).replace(/[^a-zA-Z0-9_-]/g, '-') || index}`;
}
