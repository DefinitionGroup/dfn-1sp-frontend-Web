import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createSchema, validateDocument} from 'sanity';
import {schema} from '../packages/sanity-schema/src';
import {buildContentPlan} from './renaissance-content-model';
const all=JSON.parse(readFileSync('EXPORT/renaissance-rewrite-v4/content/before-inventory.json','utf8'));
const plan=buildContentPlan(all,url=>({_type:'cloudinary.asset',secure_url:url}));
const compiled=createSchema({name:'renaissance-v4',types:[{name:'cloudinary.asset',type:'object',fields:[{name:'secure_url',type:'string'}]},...schema.types]});
const client={fetch:async (query:string)=>query.includes('count(')?0:null};
const workspace={schema:compiled,getClient:()=>client,i18n:{loadNamespaces:async()=>undefined,t:(key:string,opts:any)=>opts?.defaultValue||key}} as any;
async function main(){
 const failures:any[]=[];
 for(const change of plan.changes){
  const base=all.find((d:any)=>d._id===`drafts.${change.id}`)||all.find((d:any)=>d._id===change.id)||{};
  const doc={...base,...change.fields,_id:`drafts.${change.id}`,_type:change.type,_rev:'test',_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString()};
  const markers=await validateDocument({document:doc,workspace,getDocumentExists:async()=>true,getClient:()=>client as any});
  const errors=markers.filter(m=>m.level==='error'); if(errors.length)failures.push({id:change.id,errors});
 }
 writeFileSync('EXPORT/renaissance-rewrite-v4/content/schema-validation.json',JSON.stringify(failures,null,2));
 console.log(JSON.stringify({documents:plan.changes.length,failures},null,2));assert.equal(failures.length,0);
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
