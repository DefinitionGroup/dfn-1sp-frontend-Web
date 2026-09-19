import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildResultsPlan,assertMigratedResults,resultsBody} from './renaissance-results-model';
import {resultGroups} from './renaissance-results-data';
import {metricPresentation} from '../packages/utils/src/result-metrics';
import {campaigns,CHANNEL} from './renaissance-content-model';
const ROOT='EXPORT/renaissance-rewrite-v4/results';
async function main(){
 assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
 const before=JSON.parse(readFileSync(`${ROOT}/baseline.json`,'utf8'));
 const plan=buildResultsPlan(before);assert.equal(plan.changes.length,60);
 const after=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
 const ids=new Set(plan.changes.map(c=>c.id));
 for(const old of before)if(!ids.has(old._id))assert.deepEqual(after.find(d=>d._id===old._id),old,`Unrelated document changed: ${old._id}`);
 let groups=0,metrics=0;
 for(const change of plan.changes){
  const actual=after.find(d=>d._id===change.id);assertMigratedResults(actual,change.row);
  const {_rev,_updatedAt,...old}=before.find((d:any)=>d._id===change.id);
  const {_rev:newRev,_updatedAt:newTime,...current}=actual;
  assert.deepEqual(current,{...old,...change.fields});
  const result=resultsBody(actual).body.filter((b:any)=>b._type==='resultsMetrics');groups+=result.length;metrics+=result.flatMap((b:any)=>b.metrics).length;
 }
 for(const c of campaigns.filter(c=>!c.sourceRows.some(r=>resultGroups[r])))assert.equal(resultsBody(after.find(d=>d._id===`drafts.${c.id}`)).body.filter((b:any)=>b._type==='resultsMetrics').length,0);
 assert.equal(buildResultsPlan(after).changes.length,0);
 const result={verifiedAt:new Date().toISOString(),project:'wu6i3y0h',dataset:'production',channel:CHANNEL,language:'en',caseDrafts:60,resultGroups:groups,metrics,casesWithoutResults:6,narrativeOrRankingCases:4,publishedDocumentsUnchanged:before.filter((d:any)=>!d._id.startsWith('drafts.')).length,unrelatedDocumentsUnchanged:true,repeatRunChanges:0};
 writeFileSync(`${ROOT}/final-audit.json`,JSON.stringify(result,null,2)+'\n',{mode:0o600});
 writeFileSync(`${ROOT}/complete-mapping.json`,JSON.stringify(plan.ledger,null,2)+'\n',{mode:0o600});
 const lines=['# Renaissance Results — source and metric mapping','','Saved draft mapping, 19 September 2026. Values and labels are derived from the supplied v4 rewrite, not independent verification of campaign measurements. Every case uses the existing global identity and Renaissance body ownership. Original paragraphs and revision snapshots remain in the ignored recovery folder.',''];
 for(const item of plan.ledger){lines.push(`## ${campaigns.find(c=>`drafts.${c.id}`===item.id)!.title}`,'',`Source: ${item.sourceCell}. Document: \`${item.id}\`; owner: \`${item.owner}\`.`,'');
 for(const group of item.groups){lines.push(`### ${group.title}`,'',`Block: \`${group.blockKey}\`${group.context?`. Context: ${group.context}`:''}.`,'');if(group.metrics.length){lines.push('| Display | Label | Explanation / context | Original claim |','| --- | --- | --- | --- |');for(const m of group.metrics)lines.push(`| ${metricPresentation(m).final} | ${m.label} | ${[m.description,m.context].filter(Boolean).join(' / ')} | ${m.sourceText} |`);lines.push('');}if(group.description)lines.push(group.description,'');if(group.quote)lines.push(`> ${group.quote.text}`,`> — ${group.quote.attribution}`,'');}}
 writeFileSync('docs/renaissance-results-metrics-mapping.md',lines.join('\n'));
 console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
