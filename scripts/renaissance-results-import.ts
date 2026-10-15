import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildResultsPlan,assertMigratedResults} from './renaissance-results-model';
import {campaigns,CHANNEL} from './renaissance-content-model';
import {resultGroups} from './renaissance-results-data';
import {CASE_STUDY_BY_SLUG_QUERY} from '../packages/sanity-queries/src/groq';
const ROOT='EXPORT/renaissance-rewrite-v4/results';
const apply=process.env.RENAISSANCE_RESULTS_APPLY==='1';
const rows=process.env.RENAISSANCE_RESULTS_ROWS?.split(',').map(Number);
const snapshot='*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
const save=(name:string,data:unknown)=>writeFileSync(`${ROOT}/${name}.json`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
async function main(){
 assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});assert(client.config().token);
 mkdirSync(ROOT,{recursive:true,mode:0o700});
 const all=await client.fetch<any[]>(snapshot);save('latest-before',all);const plan=buildResultsPlan(all,rows);
 const stamp=new Date().toISOString().replaceAll(':','-');
 const summary={apply,project:'wu6i3y0h',dataset:'production',channel:CHANNEL,language:'en',drafts:plan.changes.length,groups:plan.ledger.flatMap(c=>c.groups).length,metrics:plan.ledger.flatMap(c=>c.groups).flatMap(g=>g.metrics).length,publish:false};
 save(`plan-${stamp}`,{summary,...plan});save('latest-plan',{summary,...plan});console.log(JSON.stringify(summary));
 if(!apply||!plan.changes.length)return;
 assert.equal(createHash('sha256').update(readFileSync('EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz')).digest('hex'),'4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18');
 if(!existsSync(`${ROOT}/baseline.json`))save('baseline',all);
 save(`before-${stamp}`,all);
 const tx=client.transaction();for(const c of plan.changes)tx.patch(c.id,p=>p.ifRevisionId(c.rev).set(c.fields));await tx.commit();
 const after=await client.fetch<any[]>(snapshot),changed=new Set(plan.changes.map(c=>c.id));
 for(const doc of all)if(!changed.has(doc._id))assert.deepEqual(after.find(d=>d._id===doc._id),doc,`Unrelated document changed: ${doc._id}`);
 for(const c of plan.changes){const actual=after.find(d=>d._id===c.id);const before=all.find(d=>d._id===c.id);const {_rev,_updatedAt,...old}=before;const {_rev:newRev,_updatedAt:newUpdated,...now}=actual;assert.deepEqual(now,{...old,...c.fields});assertMigratedResults(actual,c.row);}
 for(const c of plan.changes){const campaign=campaigns.find(ca=>`drafts.${ca.id}`===c.id)!;const resolved=await client.fetch<any>(CASE_STUDY_BY_SLUG_QUERY,{channel:CHANNEL,language:'en',slug:campaign.slug},{perspective:'drafts'});assert.deepEqual(resolved.casesPageBuilder.filter((b:any)=>b._type==='resultsMetrics').map((b:any)=>b.metrics),resultGroups[c.row].map(g=>g.metrics.map(({sourceText,...m},i)=>({...m,_key:`rpr-v4-${c.row}-${resultGroups[c.row].indexOf(g)+1}-metric-${i+1}`}))));}
 const result={...summary,publishedDocumentsUnchanged:all.filter(d=>!d._id.startsWith('drafts.')).length,unrelatedDocumentsUnchanged:true,verifiedAt:new Date().toISOString()};save(`verification-${stamp}`,result);console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
