import {cleanMsmPreviewControls} from '../apps/msm-web/lib/preview-controls';
import {attributeCount} from './msm-attributes';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {buildMsmPlan, rows, approvedCopy} from './msm-content-model';
import {HOME_PAGE_QUERY, CASE_STUDY_BY_SLUG_QUERY, MSM_UNIT_BY_SLUG_QUERY} from '../packages/sanity-queries/src/groq';
import {createPresentationResolvers} from '../sanity/presentation/resolve';

const require=createRequire(import.meta.url);
const {parse,evaluate}=createRequire(require.resolve('sanity/package.json'))('groq-js');
const run=async(query:string,dataset:any[],params:any)=> (await evaluate(parse(query),{dataset,params})).get();
const plan=buildMsmPlan([],url=>({_type:'cloudinary.asset',secure_url:url}));
const documents=plan.changes.map(c=>({_id:c.id,_type:c.type,...c.fields}));

test('every workbook row has a disposition and all 202 source pages have routes',()=>{
  assert.equal(plan.coverage.length,1977);assert.equal(new Set(plan.coverage.map(c=>c.row)).size,1977);
  assert.equal(Object.keys(plan.routes).length,202);
  assert.deepEqual(plan.coverage.filter(c=>c.status==='dependency').map(c=>c.row),[1639,1667]);
  for(const language of ['en','de']){
    const routes=Object.values(plan.routes).filter(r=>r.language===language);
    assert.equal(routes.length,language==='en'?102:100);
    assert.equal(routes.filter(r=>r.type==='caseStudy').length,language==='en'?64:63);
    assert.equal(routes.filter(r=>r.type==='person').length,11);
  }
});
test('editorial notes cannot become case outcomes or invented quotations',()=>{
  for(const n of [573,589,704,731,749,758,785,794,812,821,838,887,920,966,1319])assert.equal(approvedCopy(rows.find(r=>r.row===n)!),undefined);
  const cases=documents.filter(d=>d._type==='caseStudy');
  assert(!JSON.stringify(cases).includes('No metrics have been invented'));
  assert(!JSON.stringify(cases).includes('None have been invented'));
  assert(!JSON.stringify(cases).includes('quote sentence itself is missing'));
});
test('MSM overrides leave shared service copy and other editions untouched',()=>{
  const shared={_id:'c14eb875-b2d1-4e6e-9a92-60cdc249e30b',_type:'services',name:'Shared social',language:'en',channel:['1spWeb','renaissanceWeb'],serviceDescription:'Shared description',siteContent:[{_key:'renaissanceWeb',channel:'renaissanceWeb',name:'Renaissance social'}]};
  const p=buildMsmPlan([shared],url=>({_type:'cloudinary.asset',secure_url:url}));
  const c=p.changes.find(c=>c.id===shared._id)!;
  assert.equal(c.fields.name,undefined);assert.equal(c.fields.serviceDescription,undefined);
  assert.deepEqual(c.fields.siteContent[0],shared.siteContent[0]);
  assert(c.fields.channel.includes('msmWeb'));
});
test('draft data resolves the complete case edition with metrics and closing CTA',async()=>{
  const data=await run(CASE_STUDY_BY_SLUG_QUERY,documents,{channel:'msmWeb',language:'en',slug:'ea-need-for-speed-influencer-campaign'});
  assert.equal(data.title,'Reaching young car enthusiasts');
  assert.equal(data.seo.title,'EA Need for Speed Influencer Campaign | MSM.digital');
  assert.equal(data.casesPageBuilder.at(-1)._type,'intertitleCTA');
  assert.deepEqual(data.casesPageBuilder.find((b:any)=>b._type==='resultsMetrics').metrics.map((m:any)=>m.value),[250000,2000000]);
});
test('localized unit references preserve scope and use effective case titles',async()=>{
  const caseA={_id:'a',_type:'caseStudy',title:'Shared',language:'de',channel:['msmWeb'],isPublished:true,siteContent:[{channel:'msmWeb',title:'MSM title'}]};
  const person={_id:'person',_type:'person',name:'Person',language:'de',channel:['msmWeb']};
  const unit={_id:'u',_type:'msmUnit',language:'de',slug:{current:'test'},caseStudies:[{_ref:'a'},{_ref:'wrong'}],leadership:[{person:{_ref:'person'}},{person:{_ref:'wrong-person'}}]};
  const data=await run(MSM_UNIT_BY_SLUG_QUERY,[unit,caseA,{...caseA,_id:'wrong',language:'en'},person,{...person,_id:'wrong-person',channel:['1spWeb']}],{language:'de',slug:'test'});
  assert.deepEqual(data.cases.map((c:any)=>c.title),['MSM title']);assert.equal(data.leadership.length,1);
});
test('home has one visible editorial hero and channel-specific staff quotes',async()=>{
  const home=await run(HOME_PAGE_QUERY,documents,{channel:'msmWeb',language:'en'});
  assert.equal(home.content[0].headlineMode,'headlineReveal');assert.deepEqual(home.content[0].mobileParagraphs,[]);
  const people=home.content.find((b:any)=>b._type==='galleryPeopleStep').teamMembers;
  assert.equal(people.length,7);assert(people.every((p:any)=>p.tagline && p.profileUrl?.includes('/people/')));
});
test('Presentation resolves localized service and person documents',()=>{
  const {mainDocuments,locations}=createPresentationResolvers('msmWeb');
  const services=(mainDocuments as any[]).find(r=>r.route==='/:locale/services/:slug');
  assert.deepEqual(services.params({params:{locale:'de',slug:'pr'}}),{channel:'msmWeb',language:'de',slug:'services/pr'});
  assert.deepEqual((locations.person as any).resolve({name:'Name',language:'de',channel:['msmWeb'],siteContent:[{channel:'msmWeb',slug:{current:'name'}}]}),{locations:[{title:'Name',href:'/de/people/name'}]});
});

test('case service tags come from project cards rather than global navigation',()=>{
  const training=documents.find(d=>d._id==='case-msm-microsoft-trainings-en')!;
  assert(training.services.length>0);
  assert(!training.services.some((r:any)=>r._ref==='service-msm-hashtaglove-en'));
  assert(training.services.some((r:any)=>r._ref==='service-msm-training-en'));
});


test('preview annotations cannot change layout choices or create empty copy',()=>{
  const {vercelStegaCombine}=createRequire(require.resolve('@sanity/client'))('@vercel/stega');
  const marked=(s:string)=>vercelStegaCombine(s,{origin:'sanity.io',href:'http://localhost:3000/studio'},false);
  const input={headlineMode:marked('headlineReveal'),selectionMode:marked('manual'),titleTag:marked('h1'),headline:marked('Approved copy'),eyebrow:marked(''),children:[{text:' '}]};
  const output=cleanMsmPreviewControls(input);
  assert.equal(output.headlineMode,'headlineReveal');assert.equal(output.selectionMode,'manual');assert.equal(output.titleTag,'h1');
  assert.equal(output.headline,input.headline);assert.equal(output.eyebrow,'');assert.equal(output.children[0].text,' ');
});
test('attribute preflight counts shared paths once and nested types separately',()=>{
  assert.equal(attributeCount([{blocks:[{title:'One'},{title:'Two'}]},{blocks:[{title:'Three'}]}]),3);
  assert.equal(attributeCount([{a:1},{a:1.5},{a:null}]),3);
});
