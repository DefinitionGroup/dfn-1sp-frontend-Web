import {mkdirSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildMsmMetadata} from '../apps/msm-web/lib/metadata';
import {MSM_SEO_INVENTORY_QUERY, buildMsmSeoInventory} from '../apps/msm-web/lib/seo-routes';

async function main() {
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'published'});
  const data = await client.fetch(MSM_SEO_INVENTORY_QUERY);
  const routes = buildMsmSeoInventory(data.documents, data.translations);
  const documents = await client.fetch('*[_id in $ids]', {ids: routes.map(route => route.id)});
  const rows = routes.map(route => {
    const doc = documents.find((doc: {_id: string}) => doc._id === route.id);
    const edition = doc.siteContent?.find((edition: {channel: string}) => edition.channel === 'msmWeb');
    const seo = ['caseStudy', 'person'].includes(doc._type) ? edition?.seo : doc.metadata;
    const metadata = buildMsmMetadata({locale: route.language, path: route.path, title: edition?.title || doc.title || doc.fullname || doc.name, description: edition?.description || doc.description || doc.claim || doc.position, metadata: seo, languages: route.languages,
      type: doc._type === 'caseStudy' ? 'article' : doc._type === 'person' ? 'profile' : 'website', publishedAt: doc.publishedAt});
    const image = (metadata.openGraph as {images: {url: string; alt?: string}[]}).images[0];
    return {id: route.id, type: doc._type, language: route.language, path: route.path,
      title: metadata.title, description: metadata.description, canonical: metadata.alternates?.canonical,
      socialTitle: (metadata.openGraph as {title: string}).title, socialDescription: (metadata.openGraph as {description: string}).description,
      image: image.url, imageAlt: image.alt, languages: route.languages || {}, sitemap: route.sitemap, noIndex: !route.indexable,
      sources: Object.fromEntries(['title', 'description', 'image', 'openGraphTitle', 'openGraphDescription', 'openGraphImage'].map(field => [field, seo?.[field] ? 'authored' : 'inherited / default']))};
  });
  const report = {projectId: 'wu6i3y0h', dataset: 'production', checkedAt: new Date().toISOString(), routes: rows.length, pairedRoutes: rows.filter(row => Object.keys(row.languages).length > 1).length, rows};
  mkdirSync('EXPORT/msm-metadata-2026-10-06', {recursive: true});
  const output = process.argv.find(arg => arg.startsWith('--output='))?.slice('--output='.length) || 'EXPORT/msm-metadata-2026-10-06/audit.json';
  writeFileSync(output, JSON.stringify(report, null, 2), {mode: 0o600});
  console.log(JSON.stringify({routes: report.routes, pairedRoutes: report.pairedRoutes, output, counts: Object.fromEntries(['page', 'caseStudy', 'msmUnit', 'person'].map(type => [type, rows.filter(row => row.type === type).length]))}));
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
