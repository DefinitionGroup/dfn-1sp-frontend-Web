import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {attributeCount} from './msm-attributes';
import {buildMsmPlan,CHANNEL} from './msm-content-model';
import {CASE_STUDIES_QUERY,CASE_STUDY_BY_SLUG_QUERY,HOME_PAGE_QUERY,PAGE_QUERY,MSM_UNIT_BY_SLUG_QUERY} from '../packages/sanity-queries/src/groq';

const ROOT='EXPORT/msm-rewrite';
const snapshotQuery='*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
const clean=(d:any)=>{const {_rev,_createdAt,_updatedAt,_system,...body}=d;return body;};
const save=(name:string,data:any)=>writeFileSync(`${ROOT}/${name}.json`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
async function main(){
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
  const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
  assert(client.config().token,'Use sanity exec --with-user-token');
  if(existsSync(`${ROOT}/verification.json`)){console.log('Migration already verified. Preserving subsequent editor changes.');return;}
  const before=JSON.parse(readFileSync(`${ROOT}/before.json`,'utf8')).filter((d:any)=>!d._id.startsWith('_.')&&d._type!=='sanity.previewUrlSecret');
  const assets=JSON.parse(readFileSync(`${ROOT}/assets.json`,'utf8'));
  const plan=buildMsmPlan(before,url=>{assert(assets[url],`Unimported media: ${url}`);return assets[url];});
  const stats=await client.request<any>({uri:'/data/stats/production'});
  const mutations=plan.changes.map(c=>({...clean(before.find((d:any)=>d._id===`drafts.${c.id}`)||before.find((d:any)=>d._id===c.id)||{_type:c.type}),...c.fields,_id:`drafts.${c.id}`}));
  // JSON serialization also strips optional undefined fields before exact comparisons.
  const bodies=JSON.parse(JSON.stringify(mutations));
  assert(bodies.every((d:any)=>d._id.startsWith('drafts.')));
  assert.equal(plan.coverage.length,1977);assert.equal(Object.keys(plan.routes).length,202);
  const expectedIds=new Set([...before.map((d:any)=>d._id.replace(/^drafts\./,'')),...plan.changes.map(c=>c.id)]);
  function checkRefs(value:any){if(!value||typeof value!=='object')return;if(value._ref)assert(expectedIds.has(value._ref),`Dangling reference: ${value._ref}`);Object.values(value).forEach(checkRefs);}
  bodies.forEach(checkRefs);
  save('ready-plan',{projectId:'wu6i3y0h',dataset:'production',channel:CHANNEL,publish:false,mutations:bodies,coverage:plan.coverage,issues:plan.issues,routes:plan.routes});
  console.log(JSON.stringify({mode:process.env.MSM_CONTENT_APPLY==='1'?'apply':'dry-run',drafts:bodies.length,sourcePages:202,sourceRows:1977,media:Object.keys(assets).length,publish:false}));
  if(process.env.MSM_CONTENT_APPLY!=='1')return;
  assert.deepEqual(JSON.parse(readFileSync(`${ROOT}/schema-validation.json`,'utf8')),[],'Schema validation must pass');
  const backup='EXPORT/msm-content-before-migration-20260919.tar.gz';
  const expectedHash=readFileSync(backup+'.sha256','utf8').split(' ')[0];assert.equal(createHash('sha256').update(readFileSync(backup)).digest('hex'),expectedHash);
  const fresh=await client.fetch<any[]>(snapshotQuery);
  for(const c of plan.changes)for(const id of [c.id,`drafts.${c.id}`])assert.equal(fresh.find(d=>d._id===id)?._rev,before.find((d:any)=>d._id===id)?._rev,`Source changed since backup: ${id}`);
  const replacements=new Map(bodies.map((d:any)=>[d._id,d]));
  const projected=[...fresh.filter(d=>!replacements.has(d._id)),...bodies];
  const estimated=stats.fields.count.value+attributeCount(projected)-attributeCount(fresh);
  assert(estimated<=stats.fields.count.limit-5,`Attribute preflight failed: estimated ${estimated}/${stats.fields.count.limit}; consolidate fields before applying.`);
  save('before-apply',fresh);
  const tx=client.transaction();
  for(const body of bodies){const draft=fresh.find(d=>d._id===body._id);if(draft){const {_id,_type,...fields}=body;tx.patch(body._id,p=>p.ifRevisionId(draft._rev).set(fields));}else tx.create(body);}
  await tx.commit();
  const after=await client.fetch<any[]>(snapshotQuery),written=new Set(bodies.map((d:any)=>d._id));
  for(const d of fresh.filter(d=>!written.has(d._id)))assert.deepEqual(after.find(a=>a._id===d._id),d,`Unrelated document changed: ${d._id}`);
  for(const body of bodies)assert.deepEqual(clean(after.find(d=>d._id===body._id)),body);
  const summaries=[];
  for(const language of ['en','de']){
    const params={channel:CHANNEL,language};
    const draftCases=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'drafts'});
    const publishedCases=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'published'});
    assert.equal(draftCases.length,language==='en'?69:63);assert.equal(publishedCases.length,language==='en'?5:0);
    const home=await client.fetch<any>(HOME_PAGE_QUERY,params,{perspective:'drafts'});assert.equal(home.content[0].headlineMode,'headlineReveal');
    for(const slug of ['services','contact','units','disclaimer','privacy-policy','services/pr','services/hashtaglove'])assert(await client.fetch(PAGE_QUERY,{...params,slug},{perspective:'drafts'}),`${language}/${slug}`);
    for(const slug of ['communications','channel-marketing','xr-labs','technology-systems']){const u=await client.fetch<any>(MSM_UNIT_BY_SLUG_QUERY,{language,slug},{perspective:'drafts'});assert(u?.cases?.length,`Missing unit cases: ${language}/${slug}`);}
    const cs=await client.fetch<any>(CASE_STUDY_BY_SLUG_QUERY,{...params,slug:language==='en'?'ea-need-for-speed-influencer-campaign':'ea-need-for-speed-influencer-kampagne'},{perspective:'drafts'});assert.equal(cs.casesPageBuilder.at(-1)._type,'intertitleCTA');
    summaries.push({language,draftCases:draftCases.length,publishedCases:publishedCases.length,homepage:true,serviceRoutes:true,units:4});
  }
  save('verification',{completedAt:new Date().toISOString(),projectId:'wu6i3y0h',dataset:'production',channel:CHANNEL,draftsWritten:bodies.length,sourcePages:202,sourceRows:1977,assets:Object.keys(assets).length,publishedDocumentsUnchanged:true,unrelatedDocumentsUnchanged:true,publish:false,summaries});
  console.log(JSON.stringify({draftsWritten:bodies.length,publishedDocumentsUnchanged:true,summaries}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
