import {stegaClean} from '@sanity/client/stega';

// Preview annotations belong on visible copy. Enum/CSS/URL comparisons need
// their original values or draft mode can render a different composition.
const controls = new Set(['headlineMode','selectionMode','titleTag','paddingY','paddingTop','marginBottom','textAlign','alignment','variant','linkType','externalUrl','type','resource_type','format','animationMode','displayScale','qualifier','diagramType','style']);
export function cleanMsmPreviewControls<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cleanMsmPreviewControls) as T;
  if (typeof value === 'string') return (stegaClean(value) === '' ? '' : value) as T;
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key,item]) => [key, controls.has(key) && typeof item === 'string' ? stegaClean(item) : cleanMsmPreviewControls(item)])) as T;
}
