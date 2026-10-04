import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {buildMsmMetadata, MSM_DEFAULT_SHARING_IMAGE} from '../apps/msm-web/lib/metadata';
import {scopeMsmStructuredData} from '../apps/msm-web/lib/structured-data';
import {generateHomepageJsonLd, generateCaseStudyJsonLd} from '../lib/structured-data';

const require = createRequire(import.meta.url);
const {vercelStegaCombine} = createRequire(require.resolve('@sanity/client'))('@vercel/stega');
const marked = (text: string) => vercelStegaCombine(text, {origin: 'sanity.io', href: 'http://localhost:3000/studio'}, false);

test('MSM structured data owns its brand and localized routes while third-party URLs remain intact', () => {
  const home = scopeMsmStructuredData(generateHomepageJsonLd({locale: 'de', socialLinks: [{name: 'LinkedIn', url: 'https://www.linkedin.com/company/msm-digital'}]}), 'de') as any;
  assert.equal(home['@graph'][0].name, 'MSM.digital');
  assert.equal(home['@graph'][0]['@id'], 'https://www.msm.digital/#organization');
  assert.equal(home['@graph'][0].sameAs[0], 'https://www.linkedin.com/company/msm-digital');
  assert.equal(home['@graph'][2].url, 'https://www.msm.digital/de/');
  const article = scopeMsmStructuredData(generateCaseStudyJsonLd({title: 'Campaign', slug: 'campaign', locale: 'de'}), 'de') as any;
  assert.equal(article.url, 'https://www.msm.digital/de/cases/campaign');
  assert.equal(article.publisher.name, 'MSM.digital');
  assert.equal(article.publisher['@id'], 'https://www.msm.digital/#organization');
});

test('MSM pages have branded defaults, locale-aware canonical/OG URLs and a sharing image', () => {
  const result = buildMsmMetadata({locale: 'de', path: 'privacy-policy', title: 'Datenschutzhinweise'});
  assert.equal(result.title, 'Datenschutzhinweise | MSM.digital');
  assert.equal(result.alternates?.canonical, 'https://www.msm.digital/de/privacy-policy');
  const graph = result.openGraph as any;
  assert.equal(graph.url, result.alternates?.canonical);
  assert.equal(graph.locale, 'de_DE');
  assert.equal(graph.siteName, 'MSM.digital');
  assert.equal(graph.images[0].url, MSM_DEFAULT_SHARING_IMAGE);
  assert(!result.description?.includes('1SP'));
});

test('empty or invalid editorial images fall back without breaking page metadata', () => {
  for (const image of [{}, {asset: {}}, {asset: {_ref: 'missing-image'}}]) {
    const result = buildMsmMetadata({metadata: {openGraphImage: image as any}});
    assert.equal((result.openGraph as any).images[0].url, MSM_DEFAULT_SHARING_IMAGE);
  }
});

test('social overrides stay separate from SEO and preview annotations cannot reach head tags', () => {
  const result = buildMsmMetadata({path: 'services', title: 'Services', metadata: {
    title: marked('SEO | MSM.digital'), description: marked('Search description'),
    openGraphTitle: marked('Social title'), openGraphDescription: marked('Social description'),
    openGraphImage: {asset: {secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/msm.jpg'}} as any,
  }});
  assert.equal(result.title, 'SEO | MSM.digital');
  assert.equal(result.description, 'Search description');
  const graph = result.openGraph as any;
  assert.equal(graph.title, 'Social title');
  assert.equal(graph.description, 'Social description');
  assert(graph.images[0].url.includes('w_1200,h_630,c_fill'));
  assert.equal((result.twitter as any).title, graph.title);
});

test('video-backed metadata uses a still image for social sharing', () => {
  const result = buildMsmMetadata({metadata: {image: {asset: {secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/hero.mp4', resource_type: 'video'}} as any}});
  const url = (result.openGraph as any).images[0].url;
  assert(url.includes('so_0'));
  assert(url.endsWith('.jpg'));
  assert(!url.endsWith('.mp4'));
});

test('editorial noindex is emitted and beta guards cannot be overridden by a page', () => {
  assert.equal((buildMsmMetadata({metadata: {noIndex: true}}).robots as any).index, false);
  const names = ['DEPLOYMENT_TIER', 'NEXT_PUBLIC_SITE_URL', 'MONOREPO_TEST_PROJECT'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    process.env.DEPLOYMENT_TIER = 'beta';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://msm-beta.vercel.app';
    delete process.env.MONOREPO_TEST_PROJECT;
    const robots = buildMsmMetadata({metadata: {noIndex: false}}).robots as any;
    assert.equal(robots.index, false);
    assert.equal(robots.follow, false);
    assert.equal(robots.googleBot.index, false);
  } finally {
    for (const name of names) previous[name] === undefined ? delete process.env[name] : process.env[name] = previous[name];
  }
});
