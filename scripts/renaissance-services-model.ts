import assert from 'node:assert/strict';
import media from './data/renaissance-service-media.json';

export const serviceMappings = [
  {id: 'f6eea649-36bb-4398-907d-7df055747982', row: 18, card: 11},
  {id: '93e175b0-cfe2-4918-bedd-e4893c27e79a', row: 19, card: 8},
  {id: 'service-product-management-support-en', row: 20, card: 10},
  {id: 'f172b651-99a4-4471-94c6-1ac402a109eb', row: 21, card: 9},
  {id: 'service-paid-media-planning-buying-en', row: 23, name: 'Paid Media Planning & Buying', media: media['Paid Amplification']},
  {id: 'd118cc4d-59f7-44a2-9ebd-64fffd1f773f', row: 24, name: 'Event Management & Production', media: media['Events & Trade Shows']},
] as const;

export function planServices(documents: any[]) {
  const map = new Map(documents.map(d => [d._id, d]));
  const home = structuredClone(map.get('page-renaissance-home-en'));
  const page = structuredClone(map.get('page-renaissance-services-en'));
  assert(home && page);
  const cards = home.content.find((b: any) => b._key === 'renaissance-services').cards;
  const services = serviceMappings.map((mapping, i) => {
    assert(!map.has(`drafts.${mapping.id}`), 'Do not replace an existing service draft.');
    const block = page.content.find((b: any) => b._key === `rpr-v4-${mapping.row}`);
    assert(block?.content);
    const card = 'card' in mapping ? cards.find((c: any) => c._key === `rpr-v4-${mapping.card}`) : null;
    const background = card?.media || ('media' in mapping ? mapping.media : undefined);
    const content = {
      name: 'name' in mapping ? mapping.name : block.title,
      introText: card?.text || '',
      serviceDescription: block.content.map((b: any) => b.children.map((c: any) => c.text || '').join('')).join('\n\n'),
      sortOrder: i,
      ...(background ? {serviceBackground: {_type: 'cloudinaryImage', asset: background, alt: card?.altText || ''}} : {}),
    };
    const existing = map.get(mapping.id);
    assert(!existing?.channel?.includes('renaissanceWeb'), 'Migration already applied or scope changed.');
    const service = existing ? {
      ...structuredClone(existing), channel: [...(existing.channel || []), 'renaissanceWeb'],
      siteContent: [...(existing.siteContent || []), {_key: 'renaissance-en', _type: 'serviceWebsiteContent', channel: 'renaissanceWeb', mediaMode: 'custom', ...content}],
    } : {_id: mapping.id, _type: 'services', language: 'en', channel: ['renaissanceWeb'], ...content};
    block.service = {_type: 'reference', _ref: mapping.id};
    delete block.content;
    if ('card' in mapping) delete block.title;
    if (card) {
      card.service = {_type: 'reference', _ref: mapping.id};
      for (const key of ['headline','text','media','altText']) delete card[key];
    }
    return service;
  });
  assert(!map.has(`drafts.${home._id}`) && !map.has(`drafts.${page._id}`), 'Preserve any new page drafts.');
  return [...services, home, page];
}
