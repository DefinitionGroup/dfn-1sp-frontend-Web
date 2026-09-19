import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

async function main() {
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({useCdn: false, perspective: 'raw'});
  assert.equal(client.config().projectId, 'wu6i3y0h');
  assert.equal(client.config().dataset, 'production');
  const documents = await client.fetch('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"] | order(_id)');
  const root = 'EXPORT/renaissance-global-services';
  mkdirSync(root, {recursive: true, mode: 0o700});
  writeFileSync(`${root}/before.json`, JSON.stringify(documents, null, 2), {flag: 'wx', mode: 0o600});
  console.log(JSON.stringify({
    services: documents.filter((d: any) => d._type === 'services').map((d: any) => ({id:d._id,name:d.name,channel:d.channel,language:d.language,media:!!d.serviceBackground})),
    pages: documents.filter((d: any) => ['page-renaissance-home-en','page-renaissance-services-en'].includes(d._id)).map((d: any) => ({id:d._id,blocks:d.content.filter((b:any) => d._id.includes('services') || b._key === 'renaissance-services')})),
  }, null, 2));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
