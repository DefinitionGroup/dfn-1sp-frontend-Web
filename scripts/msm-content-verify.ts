import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {CASE_STUDIES_QUERY,CASE_STUDY_BY_SLUG_QUERY,MSM_UNIT_BY_SLUG_QUERY,HOME_PAGE_QUERY,PAGE_QUERY} from '../packages/sanity-queries/src/groq';
const root='EXPORT/msm-rewrite';
const clean=(d:any)=>{const {_rev,_createdAt,_updatedAt,_system,...body}=d;return body;};
async function main(){
  const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
  const plan=JSON.parse(readFileSync(`${root}/ready-plan.json`,'utf8'));
  const baseline=JSON.parse(readFileSync(`${root}/before.json`,'utf8'));
  const raw=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]');
  const expectedIds=new Set(plan.mutations.map((d:any)=>d._id));
  for(const b of baseline.filter((d:any)=>!d._id.startsWith('_.')&&d._type!=='sanity.previewUrlSecret'&&!expectedIds.has(d._id)))assert.deepEqual(raw.find(d=>d._id===b._id),b,`Non-target changed: ${b._id}`);
  for(const body of plan.mutations)assert.deepEqual(clean(raw.find(d=>d._id===body._id)),body);
  const draft=await client.fetch<any[]>('*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]',{}, {perspective:'drafts'});
  for(const route of Object.values(plan.routes) as any[]){
    const d=draft.find(d=>d._id===route.id);assert(d,`Missing route ${route.path}`);assert.equal(d.language,route.language);
    if(d._type==='page')assert.equal(d.channel,'msmWeb');
    else if(d._type!=='msmUnit')assert(d.channel.includes('msmWeb'));
    if(d._type==='caseStudy')assert(d.casesPageBuilder?.length&&d.seo?.title&&d.seo?.description);
    if(d._type==='person')assert(d.siteContent.find((e:any)=>e.channel==='msmWeb')?.slug?.current);
  }
  const summaries=[];
  for(const language of ['en','de']){
    const params={channel:'msmWeb',language};
    const cases=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'drafts'});
    const published=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'published'});
    assert.equal(cases.length,language==='en'?69:63);assert.equal(published.length,language==='en'?5:0);
    const home=await client.fetch<any>(HOME_PAGE_QUERY,params,{perspective:'drafts'});assert.equal(home.content[0].headlineMode,'headlineReveal');
    for(const slug of ['services','contact','units','disclaimer','privacy-policy','services/pr','services/hashtaglove'])assert(await client.fetch(PAGE_QUERY,{...params,slug},{perspective:'drafts'}));
    const units=[];
    for(const slug of ['communications','channel-marketing','xr-labs','technology-systems']){
      const unit=await client.fetch<any>(MSM_UNIT_BY_SLUG_QUERY,{language,slug},{perspective:'drafts'});assert(unit.cases.length&&unit.heroImageUrl&&unit.leadership.length);
      if(unit.contactCta)assert(unit.contactCta.cta?.link?.externalUrl);assert(unit.leadership.every((l:any)=>l.position&&l.quote&&l.phone));
      units.push({slug,cases:unit.cases.length,leaders:unit.leadership.length});
    }
    const cs=await client.fetch<any>(CASE_STUDY_BY_SLUG_QUERY,{...params,slug:language==='en'?'ea-need-for-speed-influencer-campaign':'ea-need-for-speed-influencer-kampagne'},{perspective:'drafts'});
    assert(cs.mainVideoUrl);assert.equal(cs.casesPageBuilder.at(-1)._type,'intertitleCTA');assert.deepEqual(cs.casesPageBuilder.find((b:any)=>b._type==='resultsMetrics').metrics.map((m:any)=>m.value),[250000,2000000]);
    summaries.push({language,draftCases:cases.length,publishedCases:published.length,units});
  }
  const stats=await client.request<any>({uri:'/data/stats/production'});assert(stats.fields.count.value<stats.fields.count.limit);
  const types=plan.mutations.reduce((a:any,d:any)=>({...a,[d._type]:(a[d._type]||0)+1}),{});
  const countMetrics=(v:any):number=>!v||typeof v!=='object'?0:(v._type==='metric'?1:0)+Object.values(v).reduce<number>((n,x)=>n+countMetrics(x),0);
  const results={completedAt:new Date().toISOString(),projectId:'wu6i3y0h',dataset:'production',channel:'msmWeb',sourcePages:202,sourceRows:1977,draftsWritten:plan.mutations.length,types,metricInstances:countMetrics(plan.mutations),uploadedMedia:Object.keys(JSON.parse(readFileSync(`${root}/assets.json`,'utf8'))).length,attributes:stats.fields.count,publishedAndUnrelatedUnchanged:true,published:false,summaries};
  writeFileSync(`${root}/final-verification.json`,JSON.stringify(results,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(results,null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
