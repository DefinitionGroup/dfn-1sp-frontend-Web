import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createSchema, validateDocument} from 'sanity';
import {getCliClient} from 'sanity/cli';
import {cloudinarySchemaPlugin} from 'sanity-plugin-cloudinary';
import {schema} from '../packages/sanity-schema/src';
import {HOME_PAGE_QUERY, PAGE_QUERY, SERVICES_BY_CHANNEL_QUERY} from '../packages/sanity-queries/src/groq';
import {planServices, serviceMappings} from './renaissance-services-model';

const require = createRequire(import.meta.url);
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const root = 'EXPORT/renaissance-global-services';
const save = (name: string, data: unknown) => writeFileSync(`${root}/${name}.json`, JSON.stringify(data, null, 2)+'\n', {mode: 0o600});
const read = (name: string) => JSON.parse(readFileSync(`${root}/${name}.json`, 'utf8'));
const query = '*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"] | order(_id)';
const clean = ({_rev, _updatedAt, _createdAt, ...doc}: any) => doc;
async function offline(query: string, dataset: any[], params: any) {return (await evaluate(parse(query, {params}), {dataset, params})).get();}

async function main() {
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({useCdn: false, perspective: 'raw'});
  assert.equal(client.config().projectId, 'wu6i3y0h'); assert.equal(client.config().dataset, 'production');
  const before = read('before');
  const mode = process.env.RENAISSANCE_SERVICES_MODE || 'prepare';
  const current = await client.fetch(query);
  if (mode === 'verify') {
    const plan = read('plan');
    const ids = new Set(plan.documents.map((d: any) => d._id));
    assert.deepEqual(current.filter((d: any) => !ids.has(d._id)), before.filter((d: any) => !ids.has(d._id)), 'Unrelated documents changed.');
    for (const proposed of plan.documents) assert.deepEqual(clean(current.find((d: any) => d._id === proposed._id)), clean(proposed));
    const params = {channel: 'renaissanceWeb', language: 'en'};
    const services = await client.fetch(SERVICES_BY_CHANNEL_QUERY, params, {perspective: 'published'});
    assert.equal(services.length, 6);
    const home = await client.fetch(HOME_PAGE_QUERY, params, {perspective: 'published'});
    const page = await client.fetch(PAGE_QUERY, {...params, slug: 'services'}, {perspective: 'published'});
    const cards = home.content.find((b: any) => b._key === 'renaissance-services').cards;
    assert.equal(cards.filter((c: any) => c.service?._id).length, 4);
    assert.equal(page.content.filter((b: any) => b.service?._id).length, 6);
    for (const mapping of serviceMappings) {
      const block = page.content.find((b: any) => b._key === `rpr-v4-${mapping.row}`);
      const original = before.find((d: any) => d._id === page._id).content.find((b: any) => b._key === block._key);
      assert.equal(block.service.serviceDescription, original.content.map((b:any) => b.children.map((c:any) => c.text || '').join('')).join('\n\n'));
    }
    for (const channel of ['1spWeb','flizrWeb','msmWeb','studioco2Web']) {
      const params = {channel, language: 'en'};
      assert.deepEqual((await offline(SERVICES_BY_CHANNEL_QUERY, current, params)).map(({_updatedAt, channel, ...d}: any) => ({...d, channel: channel?.filter((c:string) => c !== "renaissanceWeb")})), (await offline(SERVICES_BY_CHANNEL_QUERY, before, params)).map(({_updatedAt, channel, ...d}: any) => ({...d, channel: channel?.filter((c:string) => c !== "renaissanceWeb")})), `${channel} service output changed`);
    }
    save('verification', {verifiedAt: new Date().toISOString(), services: services.map((d:any) => ({id:d._id,name:d.name,hasMedia:!!d.serviceBackground})), homeReferences:4, pageReferences:6, unrelatedDocumentsUnchanged:true, otherChannelOutputUnchanged:true});
    console.log('Verified six global services, all ten page references, exact copy, and unchanged other-channel output.'); return;
  }
  assert(!existsSync(`${root}/result.json`), 'Already applied; use verify.');
  assert.deepEqual(current, before, 'Dataset changed since backup. Refresh and review before continuing.');
  const documents = planServices(before);
  if (mode === 'prepare') {
    const ids = new Set(documents.map(d => d._id));
    const projected = [...before.filter((d: any) => !ids.has(d._id)), ...documents];
    const validationClient: any = {withConfig: () => validationClient, fetch: (q: string, params: any) => offline(q, projected, params)};
    const cloudinaryTypes = cloudinarySchemaPlugin().schema?.types; assert(Array.isArray(cloudinaryTypes));
    const compiled = createSchema({name: 'renaissance-services', types: [...cloudinaryTypes, ...schema.types]});
    const workspace = {schema:compiled, getClient:()=>validationClient, i18n:{loadNamespaces:async()=>undefined,t:(key:string,opts:any)=>opts?.defaultValue||key}} as any;
    const markers = [];
    for (const document of documents) markers.push({id:document._id, markers:await validateDocument({document,workspace,getClient:()=>validationClient,getDocumentExists:async({id}:{id:string})=>projected.some(d=>d._id===id)})});
    save('schema-validation',markers);
    assert(!markers.some(d=>d.markers.some(m=>m.level==='error')), 'Schema validation failed.');
    save('plan',{transactionId:randomUUID(),backupSha256:createHash('sha256').update(readFileSync(`${root}/before.json`)).digest('hex'),documents});
  }
  const plan = read('plan'); assert.deepEqual(documents, plan.documents);
  assert.equal(createHash('sha256').update(readFileSync(`${root}/before.json`)).digest('hex'),plan.backupSha256);
  const tx = client.transaction().transactionId(plan.transactionId);
  for (const document of documents) {
    if (document._rev) tx.patch(document._id, (p:any)=>p.ifRevisionId(document._rev).unset(['_revision_lock_pseudo_field_']));
  }
  for (const document of documents) {
    const {_rev,_updatedAt,...payload} = document;
    if (_rev) tx.createOrReplace(payload); else tx.create(payload);
  }
  const apply = mode === 'apply';
  assert(apply || mode === 'prepare');
  if (apply) assert(existsSync(`${root}/dry-run.json`));
  const result = await tx.commit({dryRun:!apply, visibility:'sync', tag:'renaissance.services'});
  save(apply?'result':'dry-run',result);
  console.log(JSON.stringify({mode,documents:documents.length,sharedServices:4,newServices:2,pages:2}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
