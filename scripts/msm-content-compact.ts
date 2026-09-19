import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildMsmPlan} from './msm-content-model';

import {attributeCount} from './msm-attributes';
const root = 'EXPORT/msm-rewrite';
const clean = (d: any) => {const {_rev,_createdAt,_updatedAt,_system,...body}=d;return body;};
const save = (name: string, data: any) => writeFileSync(`${root}/${name}.json`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
async function main() {
  const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
  const before=JSON.parse(readFileSync(`${root}/before.json`,'utf8'));
  const old=JSON.parse(readFileSync(`${root}/ready-plan.json`,'utf8'));
  const assets=JSON.parse(readFileSync(`${root}/assets.json`,'utf8'));
  const plan=buildMsmPlan(before,url=>{assert(assets[url]);return assets[url];});
  const bodies=JSON.parse(JSON.stringify(plan.changes.map(c=>({...clean(before.find((d:any)=>d._id===`drafts.${c.id}`)||before.find((d:any)=>d._id===c.id)||{_type:c.type}),...c.fields,_id:`drafts.${c.id}`}))));
  const current=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
  const replacement = new Map(bodies.map((d:any)=>[d._id,d]));
  const estimate=attributeCount(current.map(d=>replacement.get(d._id)||d));
  console.log(JSON.stringify({current:attributeCount(current),compacted:estimate,drafts:bodies.length,apply:process.env.MSM_COMPACT_APPLY==='1'}));
  save('compact-plan',{...old,mutations:bodies,coverage:plan.coverage,issues:plan.issues,routes:plan.routes,estimatedAttributes:estimate});
  if(process.env.MSM_COMPACT_APPLY!=='1')return;
  assert(estimate<1990,'Insufficient attribute headroom');
  const resume = process.env.MSM_COMPACT_RESUME === '1';
  const interimBaseline = resume ? JSON.parse(readFileSync(`${root}/compaction-interim.json`,'utf8')) : [];
  if (!resume) save(attributeCount(current)>=2000?'before-compaction':'before-refinement',current);
  let tx=client.transaction();let changed=0;
  for(const body of bodies){
    const existing=current.find(d=>d._id===body._id);assert(existing);
    if(isDeepStrictEqual(clean(existing),body))continue;
    assert.deepEqual(clean(existing),resume ? clean(interimBaseline.find((d:any)=>d._id===body._id)) : old.mutations.find((d:any)=>d._id===body._id),`Draft edited since import: ${body._id}`);
    const {_id,_type,...fields}=body;
    const unset=Object.keys(clean(existing)).filter(k=>!Object.hasOwn(body,k));
    tx.patch(body._id,p=>p.ifRevisionId(existing._rev).set(fields).unset(unset));changed++;
  }
  // At the limit Sanity rejects transactions containing sets even if the final
  // shape is smaller. Remove only superseded draft paths first, with a backup
  // and revision guards, then restore their content under the consolidated paths.
  if (attributeCount(current) >= 2000) {
    const prune = client.transaction();
    for (const body of bodies) {
      const existing=current.find(d=>d._id===body._id)!;
      const unset=Object.keys(clean(existing)).filter(k=>!Object.hasOwn(body,k));
      if (body._type === 'person' && existing.siteContent?.some((e:any)=>e.channel==='msmWeb')) unset.push('siteContent[_key=="msmWeb"]');
      if (body._type === 'page') {
        for (const block of existing.content || []) {
          if (block._type === 'msmUnitsGrid' && block.teasers) unset.push(`content[_key=="${block._key}"].teasers`);
          if (block._type === 'msmServiceDirectory') unset.push(`content[_key=="${block._key}"].items`);
        }
      }
      if (unset.length) prune.patch(body._id,p=>p.ifRevisionId(existing._rev).unset(unset));
    }
    await prune.commit();
    const interim=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
    save('compaction-interim',interim);
    console.log(JSON.stringify({interimAttributes:attributeCount(interim)}));
    tx=client.transaction();
    for(const body of bodies) {
      const existing=interim.find(d=>d._id===body._id)!;
      const {_id,_type,...fields}=body;
      tx.patch(body._id,p=>p.ifRevisionId(existing._rev).set(fields).unset(Object.keys(clean(existing)).filter(k=>!Object.hasOwn(body,k))));
    }
  }
  await tx.commit();
  const after=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
  for(const d of current.filter(d=>!replacement.has(d._id)))assert.deepEqual(after.find(a=>a._id===d._id),d,`Unrelated document changed: ${d._id}`);
  for(const body of bodies)assert.deepEqual(clean(after.find(d=>d._id===body._id)),body);
  save('after-compaction',after);
  save('compaction-verification',{completedAt:new Date().toISOString(),changed,attributes:attributeCount(after),publishedAndUnrelatedUnchanged:true});
  save('ready-plan',{...old,mutations:bodies,coverage:plan.coverage,issues:plan.issues,routes:plan.routes});
  console.log(JSON.stringify({changed,attributes:attributeCount(after),publishedAndUnrelatedUnchanged:true}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
