import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {campaigns,copy,CHANNEL,PILOT} from './renaissance-content-model';
import {assertMigratedResults,resultsBody} from './renaissance-results-model';
import {resultGroups} from './renaissance-results-data';
import {PAGE_QUERY,CASE_STUDIES_QUERY,CASE_STUDY_BY_SLUG_QUERY} from '../packages/sanity-queries/src/groq';
const ROOT='EXPORT/renaissance-rewrite-v4/content';
const source=JSON.parse(readFileSync('scripts/data/renaissance-rewrite-v4.json','utf8')).rows;
function strings(value:any):string[]{return typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];}
async function main(){
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
 assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
 const before=JSON.parse(readFileSync(`${ROOT}/${readdirSync(ROOT).filter(f=>/^before-\d.*\.json$/.test(f)).sort().at(-1)}`,'utf8'));
 const after=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
 const applied=JSON.parse(readFileSync(`${ROOT}/applied-plan.json`,'utf8')).mutations;
 const changed=new Set(applied.map((d:any)=>d._id));
 for(const old of before.filter((d:any)=>!changed.has(d._id)))assert.equal(after.find(d=>d._id===old._id)?._rev,old._rev,`Unrelated revision changed: ${old._id}`);
 const written=after.filter(d=>changed.has(d._id));const texts=new Set(written.flatMap(strings));
 const split=new Set([8,9,10,11,18,19,20,21,155]);
 for(const row of source){if(row.row===27)continue;if(split.has(row.row))continue;if(resultGroups[row.row]){
 const campaign=campaigns.find(c=>c.sourceRows.includes(row.row))!;const document=written.find(d=>d._id===`drafts.${campaign.id}`);
 if(resultsBody(document).body.filter((b:any)=>b._type==='resultsMetrics').some((b:any)=>b.metrics?.length)||!texts.has(row.rewrite))assertMigratedResults(document,row.row);
 else assert(texts.has(row.rewrite));continue;
 }assert(texts.has(row.rewrite),`Source copy missing: F${row.row}`);}
 const home=written.find(d=>d._id==='drafts.page-renaissance-home-en');
 for(let n=8;n<=11;n++){const b=home.content.find((b:any)=>b._key==='renaissance-services').cards.find((b:any)=>b._key===`rpr-v4-${n}`);assert.equal(`${b.headline} - ${b.text}`,copy(n));}
 const services=written.find(d=>d._id==='drafts.page-renaissance-services-en');
 for(let n=18;n<=21;n++){const b=services.content.find((b:any)=>b._key===`rpr-v4-${n}`);assert.equal(`${b.title}: ${b.content[0].children[0].text}`,copy(n));}
 const auto=written.find(d=>d.slug?.current==='autonauts').casesPageBuilder.find((b:any)=>b.quote)?.quote;assert.equal(`"${auto.text}" - ${auto.attribution}`,copy(155));
 assert(!texts.has(copy(27)),'Editorial instruction became public copy');
 const params={channel:CHANNEL,language:'en'};
 const preview=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'drafts'});assert.equal(preview.length,66);
 for(const c of campaigns){const d=preview.find(d=>d._id===c.id);assert(d?.mainImageUrl?.startsWith('https://res.cloudinary.com/'));assert(d.client?.name);if(c.id!==PILOT)assert.equal(d.description,c.summary);}
 const about=await client.fetch<any>(PAGE_QUERY,{...params,slug:'about-us'},{perspective:'drafts'});assert.equal(about.content[1].portraits.length,19);assert.equal(about.content[3].sharedContent.content.logos.length,10);
 const clients=await client.fetch<any>(PAGE_QUERY,{...params,slug:'clients'},{perspective:'drafts'});assert.equal(clients.content[1].collectionClients.length,125);
 for(const slug of ['services','cases','about-us','clients'])assert.equal(await client.fetch(PAGE_QUERY,{...params,slug},{perspective:'published'}),null);
 const settings=after.find(d=>d._id==='drafts.site-settings-renaissanceWeb-en');assert.equal(settings.renaissanceEnquiryEmail,'martin@definition.studio');
 const result={verifiedAt:new Date().toISOString(),publishedDocumentsUnchanged:before.filter((d:any)=>!d._id.startsWith('drafts.')).length,unrelatedDraftsUnchanged:true,copyCellsVerified:169,editorialInstructionExcluded:'F27',caseCount:66,caseHeroAndClientComplete:true,clientLogos:125,teamPortraits:19,awardLogos:10,publishedNewPagesAbsent:true,enquiryEmail:settings.renaissanceEnquiryEmail};
 writeFileSync(`${ROOT}/final-audit.json`,JSON.stringify(result,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
