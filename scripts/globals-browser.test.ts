import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {GLOBAL_BROWSER_QUERY, globalBrowserScope, globalBrowserSearch, globalCreateTemplate, channelLabels} from '../packages/sanity-schema/src/Studio/globalBrowserModel';
const require = createRequire(import.meta.url);
const {parse,evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const doc = (id:string, channel?:string[], language='en') => ({_id:id,_type:'person',name:id,channel,language});
async function query(dataset:any[], scope:Record<string,unknown>={}) {
  const params={schemaType:'person',channel:'all',language:'en',search:'',limit:100,...scope};
  return (await evaluate(parse(GLOBAL_BROWSER_QUERY,{params}),{dataset,params})).get();
}
test('missing, null and empty assignments are Unassigned, independently of draft status',async()=>{
  const result=await query([doc('missing'),{...doc('null'),channel:null},doc('empty',[]),doc('assigned',['renaissanceWeb']),doc('drafts.new',[])],{channel:'unassigned'});
  assert.deepEqual(result.items.map((d:any)=>d._id).sort(),['drafts.new','empty','missing','null']);
  assert.equal(result.total,4);
});
test('draft assignment wins over published assignment before filtering and counts each identity once',async()=>{
  const data=[doc('person',['renaissanceWeb']),doc('drafts.person',[])];
  assert.equal((await query(data,{channel:'renaissanceWeb'})).total,0);
  const result=await query(data,{channel:'unassigned'});
  assert.equal(result.total,1);assert.equal(result.items[0]._id,'drafts.person');assert.equal(result.items[0].hasPublished,true);
});
test('channel membership, language, edition names and search compose correctly',async()=>{
  const data=[{...doc('shared',['renaissanceWeb','1spWeb']),siteContent:[{channel:'renaissanceWeb',name:'Renaissance offering'}]},doc('german',['renaissanceWeb'],'de')];
  const result=await query(data,{channel:'renaissanceWeb',search:'Renaissance*'});
  assert.equal(result.total,1);assert.equal(result.items[0].title,'Renaissance offering');
  assert.equal((await query(data,{language:'all'})).total,2);
});
test('pagination retains the full filtered count',async()=>{
  const result=await query([doc('one'),doc('two')],{limit:1});
  assert.equal(result.total,2);assert.equal(result.items.length,1);
});
test('Klett case is searchable by client, subtitle, slug, ID, SEO and mixed-field words',async()=>{
  const client={_id:'client-klett',_type:'client',name:'Ernst Klett Verlag',siteContent:[{channel:'msmWeb',name:'Klett Sprachen'}]};
  const caseStudy={_id:'case-msm-ernst-klett-verlag-printed-content-enrichment-en',_type:'caseStudy',title:'Digitizing the Way You Learn',subtitle:'Linking printed and multimedia content',slug:{current:'ernst-klett-verlag-printed-content-enrichment'},client:{_ref:client._id},channel:['msmWeb'],language:'en',seo:{title:'CouplAR Content Enrichment'},description:'Interactive textbooks'};
  const german={...caseStudy,_id:'german-case',language:'de'};
  const otherSite={...caseStudy,_id:'other-site-case',channel:['flizrWeb']};
  for (const text of ['Klett','printed','enrichment','CouplAR','textbooks','Sprachen','Klett Digitizing','case-msm-ernst-klett-verlag-printed-content-enrichment-en']) {
    const result=await query([client,caseStudy,german,otherSite],{schemaType:'caseStudy',channel:'msmWeb',search:globalBrowserSearch(text)});
    assert.equal(result.total,1,text);
    assert.equal(result.items[0]._id,caseStudy._id,text);
  }
});
test('search tolerates missing metadata and combines shared and website-edition fields',async()=>{
  const data=[doc('basic',['msmWeb']),{...doc('edition',['msmWeb']),siteContent:[{channel:'msmWeb',title:'Local offering',subtitle:'Retail experts',description:'Interactive experiences',seo:{description:'Campaign excellence'}}]}];
  assert.equal((await query(data,{search:globalBrowserSearch('basic')})).total,1);
  for (const text of ['Local','Retail','Interactive','Campaign','edition Retail']) {
    assert.equal((await query(data,{search:globalBrowserSearch(text)})).total,1,text);
  }
  assert.equal(globalBrowserSearch('  Klett*  printed?  '),'Klett* printed*');
  assert.equal(globalBrowserSearch(' * ? '),'');
});
test('assigned scope overrides URL filters and produces the same results as Globals',async()=>{
  const assigned=globalBrowserScope({channel:'all',language:'de'},{channel:'msmWeb',language:'en'});
  assert.deepEqual(assigned,{channel:'msmWeb',language:'en'});
  const global=globalBrowserScope({channel:'msmWeb',language:'en'});
  const data=[doc('english',['msmWeb']),doc('german',['msmWeb'],'de'),doc('other',['flizrWeb'])];
  assert.deepEqual(await query(data,assigned),await query(data,global));
  assert.deepEqual(globalCreateTemplate('caseStudy',assigned.channel,assigned.language)?.parameters,{channel:'msmWeb',language:'en'});
});
test('scope URLs and creation templates never silently assign the default website',()=>{
  assert.deepEqual(globalBrowserScope({channel:'unknown',language:'unknown'}),{channel:'all',language:'en'});
  assert.deepEqual(globalCreateTemplate('services','renaissanceWeb','en')?.parameters,{channel:'renaissanceWeb',language:'en'});
  assert.deepEqual(globalCreateTemplate('person','unassigned','en')?.parameters,{channel:'',language:'en'});
  assert.equal(globalCreateTemplate('client','all','all'),null);
  assert.equal(globalCreateTemplate('client','renaissanceWeb','de'),null);
  assert.equal(channelLabels(['1spWeb','renaissanceWeb']),'1SP · Renaissance');
});
