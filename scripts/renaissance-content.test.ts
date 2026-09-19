import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {campaigns,redirects,copy,clientName,PILOT} from './renaissance-content-model';
import {CAMPAIGN_REGIONS,matchesCampaign} from '../apps/renaissance-web/lib/caseDiscovery';
import {CASE_STUDIES_QUERY,HOME_PAGE_QUERY} from '../packages/sanity-queries/src/groq';
const require=createRequire(import.meta.url);
const {parse,evaluate}=createRequire(require.resolve('sanity/package.json'))('groq-js');
const source=require('./data/renaissance-rewrite-v4.json');
async function query(q:string,docs:any[],channel='renaissanceWeb') {const params={channel,language:'en'};return(await evaluate(parse(q),{dataset:docs,params})).get();}

test('all case source cells occur in the appropriate body, without inventing Results for intro-only cases',()=>{
 assert.equal(campaigns.length,66);assert.equal(new Set(campaigns.map(c=>c.id)).size,66);assert.equal(new Set(campaigns.map(c=>c.slug)).size,66);
 const accounted:number[]=[];
 for(const c of campaigns){
  for(const row of c.sourceRows){const r=source.rows.find((r:any)=>r.row===row);accounted.push(row);
   const result=c.body.find(b=>b._type==='resultsMetrics');
   if(r.block==='H2')assert.equal(c.body[0].title,r.rewrite);
   else if(r.section==='Client Quote')assert.equal(`"${result.quote.text}" - ${result.quote.attribution}`,r.rewrite);
   else assert.equal(c.body.find(b=>b._type===(r.section==='Intro'?'headlineChallenge':'resultsMetrics')).description,r.rewrite);
  }
  if(c.sourceRows.length===1)assert.equal(c.body.length,1);
 }
 assert.deepEqual(accounted.sort((a,b)=>a-b),Array.from({length:133},(_,i)=>i+39));
});
test('legacy redirects preserve separate campaign phases and campaign identity',()=>{
 assert.equal(new Set(redirects.map(r=>r.source)).size,69);
 assert.notEqual(redirects.find(r=>r.source==='/case-studies/romeo-is-a-dead-man')?.destination,redirects.find(r=>r.source==='/case-studies/romeo-is-a-dead-man-1')?.destination);
 assert.equal(campaigns.find(c=>c.id===PILOT)?.slug,'making-stalker-2-unmissableeverywhere-all-at-once');
 assert.equal(clientName('Team 17'),'Team17');assert.equal(clientName('Timi Studios'),'Timi Studios');assert.notEqual(clientName('Koelnmesse'),clientName('Gamescom'));
});
test('discovery combines exact region membership with genre/platform search and explicit empty state',()=>{
 const studies=campaigns.map(c=>({...c,client:{name:c.client}}));
 for(const region of CAMPAIGN_REGIONS.slice(1))assert(studies.some(c=>matchesCampaign(c,region.value,'')),region.label);
 assert(studies.some(c=>matchesCampaign(c,'','RPG')));
 assert(studies.some(c=>matchesCampaign(c,'','PC')));
 assert.equal(studies.filter(c=>matchesCampaign(c,'','impossible-search-no-campaign')).length,0);
 assert(matchesCampaign({title:'Test',discovery:{regions:['uk-campaigns'],genres:['RPG'],platforms:['PC']}},'uk-campaigns','rpg pc'));
 assert(!matchesCampaign({title:'Test',discovery:{regions:['worldwide-campaigns']}},'uk-campaigns',''));
});
test('discovery is edition-specific and an empty override does not leak shared categories',async()=>{
 const d={_id:'c',_type:'caseStudy',channel:['renaissanceWeb','1spWeb'],language:'en',isPublished:true,title:'Shared',discovery:{regions:['uk-campaigns']},siteContent:[{channel:'renaissanceWeb',title:'Renaissance',discovery:{regions:[]}}]};
 assert.deepEqual((await query(CASE_STUDIES_QUERY,[d]))[0].discovery,{regions:[]});
 assert.deepEqual((await query(CASE_STUDIES_QUERY,[d],'1spWeb'))[0].discovery,{regions:['uk-campaigns']});
});
test('person references resolve within Renaissance and English while legacy inline portraits remain valid',async()=>{
 const docs=[{_id:'home',_type:'page',channel:'renaissanceWeb',language:'en',isHomepage:true,content:[{_type:'renaissancePortraitGrid',portraits:[{_key:'a',person:{_ref:'person'}},{_key:'foreign',person:{_ref:'other'}},{_key:'legacy',name:'Legacy',imageUrl:'/legacy.jpg'}]}]},{_id:'person',_type:'person',channel:['renaissanceWeb'],language:'en',fullname:'Named person',position:'Founder',image:{secure_url:'portrait.jpg'}},{_id:'other',_type:'person',channel:['1spWeb'],language:'en',fullname:'Other channel'}];
 const portraits=(await query(HOME_PAGE_QUERY,docs)).content[0].portraits;
 assert.equal(portraits.length,2);assert.equal(portraits[0].name,'Named person');assert.equal(portraits[0].image.secure_url,'portrait.jpg');assert.equal(portraits[1].name,'Legacy');
});
