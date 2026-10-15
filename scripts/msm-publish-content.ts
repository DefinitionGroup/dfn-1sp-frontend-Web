import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {createSchema, validateDocument} from 'sanity';
import {cloudinarySchemaPlugin} from 'sanity-plugin-cloudinary';
import {schema} from '../packages/sanity-schema/src';
import {compactCloudinaryStorage} from '../packages/utils/src/cloudinary-storage';
import {CASE_STUDIES_QUERY, CASE_STUDY_BY_SLUG_QUERY, HOME_PAGE_QUERY, PAGE_QUERY, MSM_UNIT_BY_SLUG_QUERY} from '../packages/sanity-queries/src/groq';

const ROOT = 'EXPORT/msm-publication-20260920';
const BACKUP = 'EXPORT/production-before-msm-publish-20260920.tar.gz';
const QUERY = '*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
const mode = process.env.MSM_PUBLICATION_MODE || 'prepare';
const save = (name: string, data: unknown) => writeFileSync(`${ROOT}/${name}.json`, JSON.stringify(data, null, 2) + '\n', {mode: 0o600});
const read = (name: string) => JSON.parse(readFileSync(`${ROOT}/${name}.json`, 'utf8'));
const clean = (d: any) => {const {_id, _rev, _createdAt, _updatedAt, _system, ...body} = d; return body;};
const channels = (d: any): string[] => typeof d.channel === 'string' ? [d.channel] : d.channel || [];
const scoped = (d: any) => d._id.startsWith('drafts.') && (channels(d).includes('msmWeb') || d._type === 'msmUnit');
function refs(value: any): string[] {
  if (!value || typeof value !== 'object') return [];
  return [...(typeof value._ref === 'string' ? [value._ref] : []), ...Object.values(value).flatMap(refs)];
}
function strengthen(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(strengthen);
  const result = Object.fromEntries(Object.entries(value).map(([k,v]) => [k, strengthen(v)]));
  if (result._type === 'reference' && result._strengthenOnPublish) {
    if (!result._strengthenOnPublish.weak) delete result._weak;
    delete result._strengthenOnPublish;
  }
  return result;
}
function transaction(client: any, plan: any) {
  const tx = client.transaction().transactionId(plan.transactionId);
  for (const item of plan.items) {
    tx.patch(item.draftId, (p: any) => p.ifRevisionId(item.draftRevision).unset(['_publication_revision_guard_']));
    if (item.publishedRevision) tx.patch(item.published._id, (p: any) => p.ifRevisionId(item.publishedRevision).unset(['_publication_revision_guard_']));
  }
  for (const item of plan.items) {
    if (item.publishedRevision) tx.createOrReplace(item.published);
    else tx.create(item.published);
  }
  for (const item of plan.items) tx.delete(item.draftId);
  return tx;
}
async function prepare(client: any, all: any[]) {
  assert(!existsSync(`${ROOT}/result.json`), 'Publication already recorded; use verify mode');
  const sha256 = createHash('sha256').update(readFileSync(BACKUP)).digest('hex');
  assert.equal(sha256, readFileSync(BACKUP + '.sha256', 'utf8').split(' ')[0]);
  const entry = execFileSync('tar', ['-tzf', BACKUP], {encoding:'utf8'}).split('\n').find(p => p.endsWith('/data.ndjson'));
  assert(entry);
  const backup = execFileSync('tar', ['-xOzf', BACKUP, entry], {encoding:'utf8', maxBuffer:20_000_000}).trim().split('\n').map(l=>JSON.parse(l));
  const selected = all.filter(scoped);
  const ids = new Set(selected.map(d=>d._id.slice(7)));
  const translations = all.filter(d=>d._id.startsWith('drafts.') && d._type==='translation.metadata' && refs(d).length > 0 && refs(d).every(id=>ids.has(id)));
  const drafts = [...selected, ...translations];
  for (const d of translations) ids.add(d._id.slice(7));
  assert.equal(drafts.length, 430, 'Publication scope changed; inspect before proceeding');
  const migration = JSON.parse(readFileSync('EXPORT/msm-rewrite/ready-plan.json','utf8'));
  assert.deepEqual([...ids].sort(), migration.mutations.map((d:any)=>d._id.slice(7)).sort(), 'Unexpected content outside the MSM migration');
  const publishedIds = new Set(all.filter(d=>!d._id.startsWith('drafts.')).map(d=>d._id));
  const sharedPortraits: string[] = [];
  for (const d of drafts) {
    assert.equal(backup.find(b=>b._id===d._id)?._rev,d._rev,`Draft changed since backup: ${d._id}`);
    const pub=all.find(p=>p._id===d._id.slice(7));
    assert.equal(backup.find(b=>b._id===d._id.slice(7))?._rev,pub?._rev,`Published changed since backup: ${d._id}`);
    if (d._type!=='translation.metadata') assert(['en','de'].includes(d.language));
    for(const ref of refs(d)) {
      assert(!ref.startsWith('drafts.'),`Direct draft reference: ${d._id}`);
      assert(ids.has(ref)||publishedIds.has(ref),`Unpublished dependency: ${d._id} -> ${ref}`);
    }
    if(pub && channels(pub).some(c=>c!=='msmWeb')) {
      const strip=(v:any)=>{const {channel,siteContent,...base}=clean(v); return base;};
      const before=strip(pub), after=strip(d);
      // The approved MSM migration fills missing shared portraits; it never replaces one.
      if(d._type==='person' && !pub.image && d.image) {
        const expected=compactCloudinaryStorage(migration.mutations.find((m:any)=>m._id===d._id));
        assert.deepEqual(d.image,expected.image); assert.equal(d.altText,expected.altText);
        delete before.image; delete after.image; delete before.altText; delete after.altText;
        sharedPortraits.push(d._id.slice(7));
      }
      assert.deepEqual(after,before,`Unexpected shared change: ${d._id}`);
      assert.deepEqual(channels(d).filter(c=>c!=='msmWeb'),channels(pub).filter(c=>c!=='msmWeb'));
      assert.deepEqual((d.siteContent||[]).filter((e:any)=>e.channel!=='msmWeb'),(pub.siteContent||[]).filter((e:any)=>e.channel!=='msmWeb'));
    }
  }
  const cloudinaryTypes=cloudinarySchemaPlugin().schema?.types; assert(Array.isArray(cloudinaryTypes));
  const compiled=createSchema({name:'msm-publication',types:[...cloudinaryTypes,...schema.types]});
  const validationClient=client.withConfig({perspective:'drafts'});
  const workspace={schema:compiled,getClient:()=>validationClient,i18n:{loadNamespaces:async()=>undefined,t:(key:string,opts:any)=>opts?.defaultValue||key}} as any;
  const failures:any[]=[], warnings:any[]=[];
  const documents=drafts.filter(d=>d._type!=='translation.metadata');
  for(let start=0;start<documents.length;start+=8) {
    await Promise.all(documents.slice(start,start+8).map(async document=>{
      const markers=await validateDocument({document,workspace,getClient:()=>validationClient,getDocumentExists:async({id}:{id:string})=>publishedIds.has(id)||ids.has(id.replace(/^drafts\./,''))});
      const errors=markers.filter(m=>m.level==='error');if(errors.length)failures.push({id:document._id,errors});
      const notices=markers.filter(m=>m.level!=='error');if(notices.length)warnings.push({id:document._id,notices});
    }));
  }
  save('validation',{documents:documents.length,failures,warnings});assert.equal(failures.length,0,'Schema errors; see validation.json');
  const plan={projectId:'wu6i3y0h',dataset:'production',channel:'msmWeb',languages:['en','de'],backup:BACKUP,sha256,transactionId:randomUUID(),sharedPortraits,
    items:drafts.map(d=>{const pub=all.find(p=>p._id===d._id.slice(7));return {draftId:d._id,draftRevision:d._rev,publishedRevision:pub?._rev,
      published:{...strengthen(clean(d)),_id:d._id.slice(7),_createdAt:pub?._createdAt||d._createdAt}};})};
  save('before',all);save('plan',plan);
  await transaction(client,plan).commit({dryRun:true,visibility:'sync',tag:'msm.publish.preflight'});
  save('dry-run',{passed:true,at:new Date().toISOString()});
  console.log(JSON.stringify({mode:'prepared',documents:drafts.length,newPublished:plan.items.filter(i=>!i.publishedRevision).length,updatedPublished:plan.items.filter(i=>i.publishedRevision).length,sharedPortraits:sharedPortraits.length,schemaErrors:0,schemaWarnings:warnings.length,dryRun:'passed'}));
}
async function verify(client: any, plan: any) {
  const after=await client.fetch(QUERY), before=read('before');
  const affected=new Set(plan.items.flatMap((i:any)=>[i.draftId,i.published._id]));
  for(const d of before.filter((d:any)=>!affected.has(d._id)))assert.deepEqual(after.find((a:any)=>a._id===d._id),d,`Unrelated changed: ${d._id}`);
  for(const item of plan.items) {
    assert(!after.some((d:any)=>d._id===item.draftId),`Draft remains: ${item.draftId}`);
    const pub=after.find((d:any)=>d._id===item.published._id);assert(pub);assert.deepEqual(clean(pub),clean(item.published));
    for(const ref of refs(pub))assert(after.some((d:any)=>d._id===ref),`Unresolved reference: ${ref}`);
  }
  assert.equal(after.filter(scoped).length,0);
  const published=client.withConfig({perspective:'published'}), summaries=[];
  for(const language of ['en','de']) {
    const params={channel:'msmWeb',language};
    const cases=await published.fetch(CASE_STUDIES_QUERY,params);assert.equal(cases.length,language==='en'?69:63);
    const home=await published.fetch(HOME_PAGE_QUERY,params);assert.equal(home.content[0].headlineMode,'headlineReveal');
    for(const slug of ['services','contact','units','disclaimer','privacy-policy','services/pr','services/hashtaglove'])assert(await published.fetch(PAGE_QUERY,{...params,slug}),`${language}/${slug}`);
    for(const slug of ['communications','channel-marketing','xr-labs','technology-systems']) {
      const unit=await published.fetch(MSM_UNIT_BY_SLUG_QUERY,{language,slug});assert(unit?.cases?.length && unit?.leadership?.length && unit.heroImageUrl);
    }
    const cs=await published.fetch(CASE_STUDY_BY_SLUG_QUERY,{...params,slug:language==='en'?'ea-need-for-speed-influencer-campaign':'ea-need-for-speed-influencer-kampagne'});
    assert(cs.mainVideoUrl);assert.deepEqual(cs.casesPageBuilder.find((b:any)=>b._type==='resultsMetrics').metrics.map((m:any)=>m.value),[250000,2000000]);
    summaries.push({language,cases:cases.length,homepageBlocks:home.content.length,units:4,serviceAndLegalRoutes:true});
  }
  const stats=await client.request({uri:'/data/stats/production'});
  const result={completedAt:new Date().toISOString(),projectId:'wu6i3y0h',dataset:'production',channel:'msmWeb',documentsPublished:plan.items.length,
    types:plan.items.reduce((a:any,i:any)=>({...a,[i.published._type]:(a[i.published._type]||0)+1}),{}),
    remainingMsmDrafts:0,unrelatedDocumentsUnchanged:true,otherChannelEditionsUnchanged:true,sharedPortraitsAdded:plan.sharedPortraits.length,
    remainingUnrelatedDrafts:after.filter((d:any)=>d._id.startsWith('drafts.')).length,attributes:stats.fields.count,summaries};
  save('after',after);save('verification',result);console.log(JSON.stringify(result,null,2));
}
async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
  assert(['prepare','apply','verify'].includes(mode));
  const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
  assert(client.config().token,'Use --with-user-token');mkdirSync(ROOT,{recursive:true,mode:0o700});
  if(mode==='prepare')return prepare(client,await client.fetch(QUERY));
  const plan=read('plan');assert.equal(plan.projectId,'wu6i3y0h');assert.equal(plan.dataset,'production');assert.equal(plan.channel,'msmWeb');
  if(mode==='apply') {
    assert(!existsSync(`${ROOT}/result.json`),'Already applied; use verify mode');assert.equal(read('dry-run').passed,true);
    const result=await transaction(client,plan).commit({visibility:'sync',tag:'msm.publish.apply'});save('result',result);
  }
  await verify(client,plan);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
