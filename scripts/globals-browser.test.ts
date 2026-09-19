import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {GLOBAL_BROWSER_QUERY, globalBrowserScope, globalCreateTemplate, channelLabels} from '../packages/sanity-schema/src/Studio/globalBrowserModel';
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
test('scope URLs and creation templates never silently assign the default website',()=>{
  assert.deepEqual(globalBrowserScope({channel:'unknown',language:'unknown'}),{channel:'all',language:'en'});
  assert.deepEqual(globalCreateTemplate('services','renaissanceWeb','en')?.parameters,{channel:'renaissanceWeb',language:'en'});
  assert.deepEqual(globalCreateTemplate('person','unassigned','en')?.parameters,{channel:'',language:'en'});
  assert.equal(globalCreateTemplate('client','all','all'),null);
  assert.equal(globalCreateTemplate('client','renaissanceWeb','de'),null);
  assert.equal(channelLabels(['1spWeb','renaissanceWeb']),'1SP · Renaissance');
});
