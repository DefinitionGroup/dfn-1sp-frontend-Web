// Default: read-only dry-run. Apply with FLZR_APPLY_SERVICES_LAYOUT=1 through
// `pnpm exec sanity exec scripts/flzr-services-section-layout.cjs --with-user-token`.
const { getCliClient } = require('sanity/cli');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({
    projectId: 'wu6i3y0h', dataset: 'production', perspective: 'raw', useCdn: false,
  });
  const ids = ['page-flizr-services-v2-en', 'drafts.page-flizr-services-v2-en'];
  const pages = await client.fetch('*[_id in $ids]', { ids });
  assert(pages.some(page => page._id === ids[0]), 'Published Services page required');
  const updates = pages.map(page => {
    assert.equal(page.channel, 'flizrWeb');
    assert.equal(page.language, 'en');
    assert.equal(page.slug.current, 'services');
    const blocks = page.content.filter(block => block._type !== 'flzrSectionBand');
    const badgeLabels = {
      'services-v2-hero': 'FLZR',
      'services-v2-intro': 'Services',
      'services-v2-gallery': 'Services',
      'services-v2-model': 'Strategy',
      'services-v2-cases': 'Cases',
      'services-v2-contact': 'Contact',
    };
    const content = blocks.flatMap((block, index) => {
      const badgeLabel = badgeLabels[block._key];
      assert(badgeLabel, `Missing badge label for ${block._key}`);
      const next = structuredClone(block);
      // The Services hero is standalone; only following content uses bands.
      if (next._type === 'oneSPHeader') return [next];
      if (next._type === 'servicesGalleryFiltered') next._type = 'flzrServicesGrid';
      // The band owns section padding, avoiding two stacked spacing systems.
      if ('paddingY' in next) next.paddingY = '8';
      if ('paddingTop' in next) next.paddingTop = '0';
      if ('marginBottom' in next) next.marginBottom = '0';
      if (next._type === 'flzrServicesGrid') next.backgroundColor = 'transparent';
      return [{
        _key: `${block._key}-band`, _type: 'flzrSectionBand',
        mode: 'section', surfaceTone: 'fade', showBadge: true,
        badgeNumber: String(index + 1).padStart(2, '0'), badgeLabel,
      }, next];
    });
    content.push({ _key: 'services-section-reset', _type: 'flzrSectionBand', mode: 'reset' });
    assert.equal(content.filter(b => b._type === 'flzrServicesGrid').length, 1);
    assert.equal(content.filter(b => b._type === 'servicesGalleryFiltered').length, 0);
    // Only layout fields may change; wording, media, CTA links and selections stay exact.
    const layoutFields = ['_type', 'paddingY', 'paddingTop', 'marginBottom', 'backgroundColor'];
    const withoutLayout = block => Object.fromEntries(Object.entries(block).filter(([key]) => !layoutFields.includes(key)));
    assert.deepEqual(content.filter(b => b._type !== 'flzrSectionBand').map(withoutLayout), blocks.map(withoutLayout));
    return { id: page._id, ifRevisionID: page._rev, set: { content } };
  });
  const mutations = updates.map(patch => ({ patch }));
  await client.mutate(mutations, { dryRun: true });
  console.log(`Dry-run passed: ${pages.length} Services document(s), each content block in its own band; carousel replaced by grid.`);
  if (process.env.FLZR_APPLY_SERVICES_LAYOUT !== '1') return;
  fs.mkdirSync('tmp/flzr-services-layout', { recursive: true });
  fs.writeFileSync(`tmp/flzr-services-layout/before-${Date.now()}.json`, JSON.stringify(pages, null, 2));
  await client.mutate(mutations, { visibility: 'sync' });
  const after = await client.fetch('*[_id in $ids]', { ids });
  for (const page of after) assert.deepEqual(page.content, updates.find(u => u.id === page._id).set.content);
  console.log('Applied and verified. All Services copy, media and links preserved; homepage untouched.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
