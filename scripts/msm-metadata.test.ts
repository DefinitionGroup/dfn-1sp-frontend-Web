import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {buildMsmMetadata, MSM_DEFAULT_SHARING_IMAGE} from '../apps/msm-web/lib/metadata';
import {scopeMsmStructuredData} from '../apps/msm-web/lib/structured-data';
import {alignMsmPageStructuredData} from '../apps/msm-web/lib/structured-data';
import {buildMsmSeoInventory, MSM_SEO_INVENTORY_QUERY} from '../apps/msm-web/lib/seo-routes';
import {hideMsmMetadata} from '../packages/sanity-schema/src/Global/Objects/metadata-context';
import {msmMetadataPreview} from '../packages/sanity-schema/src/Global/Objects/metadata-preview';
import {buildMsmMetadataContentPlan} from './msm-metadata-model.mjs';
import {generateHomepageJsonLd, generateCaseStudyJsonLd} from '../lib/structured-data';

const require = createRequire(import.meta.url);
const {vercelStegaCombine} = createRequire(require.resolve('@sanity/client'))('@vercel/stega');
const marked = (text: string) => vercelStegaCombine(text, {origin: 'sanity.io', href: 'http://localhost:3000/studio'}, false);

test('Studio preview follows edition title inheritance, hidden summaries and invalid image fallback', () => {
  const preview = msmMetadataPreview({_type: 'caseStudy', title: 'Shared', description: 'Shared summary', seo: {title: 'Shared SEO', description: 'Shared SEO summary'}, mainVideo: {secure_url: 'https://res.cloudinary.com/demo/video/upload/clip.mp4'}, siteContent: [{_key: 'msm', channel: 'msmWeb', title: 'MSM edition', hideDescription: true}]}, 'msm', {openGraphImage: {secure_url: 'javascript:bad'}});
  assert.equal(preview.title, 'MSM edition');
  assert.equal(preview.description, buildMsmMetadata({}).description);
  assert.equal(preview.imageSource, 'Case / profile / unit media');
  const page = msmMetadataPreview({_type: 'page', title: 'Page', description: 'Unqueried body summary'}, undefined, {});
  assert.equal(page.description, buildMsmMetadata({}).description);
  const profile = msmMetadataPreview({_type: 'person', fullname: 'Name', position: 'Role', description: 'Body'}, undefined, {});
  assert.equal(profile.description, 'Role');
});

test('MSM structured data owns its brand and localized routes while third-party URLs remain intact', () => {
  const home = scopeMsmStructuredData(generateHomepageJsonLd({locale: 'de', socialLinks: [{name: 'LinkedIn', url: 'https://www.linkedin.com/company/msm-digital'}]}), 'de') as any;
  assert.equal(home['@graph'][0].name, 'MSM.digital');
  assert.equal(home['@graph'][0]['@id'], 'https://www.msm.digital/#organization');
  assert.equal(home['@graph'][0].sameAs[0], 'https://www.linkedin.com/company/msm-digital');
  assert.equal(home['@graph'][2].url, 'https://www.msm.digital/de');
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
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
});

test('whitespace overrides, invalid image protocols and invalid dates do not leak into metadata', () => {
  const result = buildMsmMetadata({locale: 'de', path: '/services/pr/', title: 'PR', type: 'article', publishedAt: 'not a date', metadata: {title: '   ', openGraphImage: {secure_url: 'javascript:alert(1)'}}});
  assert.equal(result.title, 'PR | MSM.digital');
  assert.equal(result.alternates?.canonical, 'https://www.msm.digital/de/services/pr');
  assert.equal((result.openGraph as any).images[0].url, MSM_DEFAULT_SHARING_IMAGE);
  assert.equal((result.openGraph as any).publishedTime, undefined);
});

test('native image alternative text follows the selected image and reaches both sharing protocols', () => {
  const result = buildMsmMetadata({metadata: {openGraphImage: {asset: {secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/msm.jpg'}, alt: marked('Authored artwork description')} as any}});
  assert.equal((result.openGraph as any).images[0].alt, 'Authored artwork description');
  assert.equal((result.twitter as any).images[0].alt, 'Authored artwork description');
});

test('catalogue filters publication/channel/locale, pairs actual translations and separates sitemap exclusion from noindex', async () => {
  const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
  const dataset = [
    {_id: 'en', _type: 'page', channel: 'msmWeb', language: 'en', isHomepage: true, slug: {current: 'homepage'}},
    {_id: 'de', _type: 'page', channel: 'msmWeb', language: 'de', isHomepage: true, slug: {current: 'homepage'}},
    {_id: 'unpaired', _type: 'page', channel: 'msmWeb', language: 'en', slug: {current: 'unpaired'}},
    {_id: 'hidden', _type: 'msmUnit', language: 'en', slug: {current: 'hidden'}, metadata: {noIndex: true}},
    {_id: 'excluded', _type: 'caseStudy', channel: ['msmWeb'], language: 'en', isPublished: true, slug: {current: 'excluded'}, siteContent: [{channel: 'msmWeb', seo: {excludeFromSitemap: true}}]},
    {_id: 'unpublished', _type: 'caseStudy', channel: ['msmWeb'], language: 'en', isPublished: false, slug: {current: 'unpublished'}},
    {_id: 'foreign', _type: 'page', channel: '1spWeb', language: 'en', slug: {current: 'foreign'}},
    {_id: 'drafts.en', _type: 'page', channel: 'msmWeb', language: 'en', slug: {current: 'draft'}},
    {_id: 'translations', _type: 'translation.metadata', translations: [{value: {_ref: 'en'}}, {value: {_ref: 'de'}}]},
  ];
  const data = await (await evaluate(parse(MSM_SEO_INVENTORY_QUERY), {dataset})).get();
  const routes = buildMsmSeoInventory(data.documents, data.translations);
  assert.deepEqual(routes.map(route => route.id), ['en', 'de', 'unpaired', 'hidden', 'excluded']);
  assert.deepEqual(routes[0].languages, {en: 'https://www.msm.digital', de: 'https://www.msm.digital/de'});
  assert.deepEqual(routes[1].languages, routes[0].languages);
  assert.equal(routes[2].languages, undefined);
  assert.equal(routes[3].indexable, false);
  assert.equal(routes[3].sitemap, false);
  assert.equal(routes[4].indexable, true);
  assert.equal(routes[4].sitemap, false);
});

test('social editor fields are scoped to the active edition even on multi-channel documents', () => {
  const document = {_type: 'person', channel: ['msmWeb', '1spWeb'], siteContent: [{_key: 'msm', channel: 'msmWeb'}, {_key: '1sp', channel: '1spWeb'}]};
  assert.equal(hideMsmMetadata({document, path: ['siteContent', {_key: 'msm'}, 'seo']}), false);
  assert.equal(hideMsmMetadata({document, path: ['siteContent', {_key: '1sp'}, 'seo']}), true);
});

test('content migration is idempotent, leaves drafts and other editions intact and uses source video for sharing', () => {
  const fixture = {_id: 'case', _rev: 'revision', _type: 'caseStudy', channel: ['msmWeb', '1spWeb'], language: 'en', title: 'Case title', description: 'Existing summary', slug: {current: 'case'}, isPublished: true, mainVideo: {secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/case.mp4'}, siteContent: [{_key: '1sp', channel: '1spWeb', seo: {title: 'Protected title'}}]};
  const draft = {...fixture, _id: 'drafts.case', _rev: 'draft-revision'};
  const result = buildMsmMetadataContentPlan([fixture, draft]);
  assert.equal(result.changes.length, 1);
  const set = result.changes[0].set;
  assert.deepEqual(set.siteContent[0], fixture.siteContent[0]);
  assert.equal(set.siteContent[1].seo.image.asset.secure_url, fixture.mainVideo.secure_url);
  assert.equal(buildMsmMetadataContentPlan([{...fixture, ...set}, draft]).changes.length, 0);
});

test('page structured data agrees with canonical and resolved copy/image without rewriting breadcrumb identities', () => {
  const metadata = buildMsmMetadata({locale: 'de', path: 'contact', title: 'Kontakt', description: 'Kontakt aufnehmen'});
  const data = alignMsmPageStructuredData({'@graph': [{'@type': 'ContactPage', url: 'wrong', name: 'wrong'}, {'@type': 'BreadcrumbList', name: 'Protected breadcrumb'}]}, metadata) as any;
  assert.equal(data['@graph'][0].url, metadata.alternates?.canonical);
  assert.equal(data['@graph'][0].description, metadata.description);
  assert.equal(data['@graph'][0].image.url, (metadata.openGraph as any).images[0].url);
  assert.equal(data['@graph'][1].name, 'Protected breadcrumb');
});
