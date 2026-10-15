import type {CardInsideComponent, Service} from '@1sp/sanity-types';

export type ServiceSource = {serviceConfigured?: boolean; service?: Service | null};

export function resolveServiceCard(card: CardInsideComponent & ServiceSource): CardInsideComponent | null {
  if (!card.serviceConfigured) return card;
  if (!card.service?._id) return null;
  const service = card.service;
  const background = service.serviceBackground;
  const clamp = (value: number | undefined) => Math.max(0, Math.min(100, value ?? 50));
  const mediaPosition = background?.focusMode === "manual" ? `${clamp(background.focusX)}% ${clamp(background.focusY)}%` : undefined;
  return {...card, mediaPosition, headline: service.name, text: service.introText || '', media: service.serviceBackground?.asset || undefined, altText: service.serviceBackground?.alt};
}

export function serviceDescriptionBlocks(service: Service) {
  return (service.serviceDescription || '').split(/\n\s*\n/).filter(Boolean).map((text, i) => ({
    _type: 'block' as const, _key: `${service._id}-${i}`, style: 'normal', markDefs: [],
    children: [{_type: 'span' as const, _key: `text-${i}`, text, marks: []}],
  }));
}
