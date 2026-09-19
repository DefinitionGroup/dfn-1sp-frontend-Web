import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {HOME_PAGE_QUERY, PAGE_QUERY, SERVICES_BY_CHANNEL_QUERY, SERVICES_BY_CHANNEL_LIMIT_QUERY, INTERACTIVE_SERVICES_CAROUSEL_QUERY} from '../packages/sanity-queries/src/groq';
import {resolveServiceCard, serviceDescriptionBlocks} from '../apps/renaissance-web/lib/serviceContent';
const require = createRequire(import.meta.url);
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const shared = {_id:'service',_type:'services',channel:['1spWeb','renaissanceWeb'],language:'en',name:'Shared name',introText:'Shared short copy',serviceDescription:'Shared full copy',sortOrder:8,serviceBackground:{asset:{_type:'cloudinary.asset',secure_url:'shared.mp4'}}};
const edition = {channel:'renaissanceWeb',name:'Renaissance name',introText:'Renaissance short copy',serviceDescription:'Full paragraph.\n\nSecond paragraph.',sortOrder:0,mediaMode:'custom',serviceBackground:{asset:{_type:'cloudinary.asset',secure_url:'renaissance.mp4'},alt:'Service film'}};
const page = {_id:'page',_type:'page',channel:'renaissanceWeb',language:'en',isHomepage:true,isPublished:true,slug:{current:'services'},content:[
  {_key:'cards',_type:'cardContainerComponent',cards:[{_key:'one',_type:'cardInsideComponent',service:{_ref:'service'}}]},
  {_key:'section',_type:'contentSection',service:{_ref:'service'},anchorId:'stable-anchor'},
]};
async function run(query:string, dataset:any[], channel='renaissanceWeb') {
  const params={channel,language:'en',slug:'services',maxItems:12};
  return (await evaluate(parse(query,{params}),{dataset,params})).get();
}
test('service listings and carousel use the same channel edition without changing shared copy', async()=>{
  for(const query of [SERVICES_BY_CHANNEL_QUERY,SERVICES_BY_CHANNEL_LIMIT_QUERY,INTERACTIVE_SERVICES_CAROUSEL_QUERY]) {
    const docs=[{...shared,siteContent:[edition]}];
    const rena=(await run(query,docs))[0]; const one=(await run(query,docs,'1spWeb'))[0];
    assert.equal(rena.name,edition.name); assert.equal(rena.serviceDescription,edition.serviceDescription);
    assert.equal(rena.serviceBackground.asset.secure_url,'renaissance.mp4');
    assert.equal(one.name,shared.name);assert.equal(one.serviceBackground.asset.secure_url,'shared.mp4');
  }
});
test('custom empty media does not inherit another website video; empty text stays empty',async()=>{
  const [service]=await run(SERVICES_BY_CHANNEL_QUERY,[{...shared,siteContent:[{channel:'renaissanceWeb',mediaMode:'custom',introText:''}]}]);
  assert.equal(service.serviceBackground,null); assert.equal(service.introText,'');assert.equal(service.serviceDescription,shared.serviceDescription);
});
test('Home and Services dereference current content and media from one global identity',async()=>{
  for(const query of [HOME_PAGE_QUERY,PAGE_QUERY]) {
    const resolved=await run(query,[page,{...shared,siteContent:[edition]}]);
    const card=resolveServiceCard(resolved.content[0].cards[0]);
    assert.equal(card?.headline,edition.name);assert.equal(card?.text,edition.introText);assert.equal(card?.media?.secure_url,'renaissance.mp4');
    assert.equal(resolved.content[1].anchorId,'stable-anchor');
    assert.equal(serviceDescriptionBlocks(resolved.content[1].service).length,2);
  }
});
test('wrong-language, unassigned and deleted service references do not render stale inline copies',async()=>{
  for(const service of [null,{...shared,language:'de'},{...shared,channel:['1spWeb']}]) {
    const resolved=await run(HOME_PAGE_QUERY,[page,...(service?[service]:[])]);
    assert.equal(resolveServiceCard({...resolved.content[0].cards[0],headline:'stale',text:'stale'}),null);
    assert(!resolved.content[1].service?._id);
  }
});
test('existing inline cards retain their original behavior',()=>{
  const card={headline:'Inline',text:'Existing',media:{_type:'cloudinary.asset',secure_url:'inline.jpg'}};
  assert.equal(resolveServiceCard(card),card);
});
