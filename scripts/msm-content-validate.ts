import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createSchema,validateDocument} from 'sanity';
import {schema} from '../packages/sanity-schema/src';
import {buildMsmPlan} from './msm-content-model';

async function main(){
  const all=JSON.parse(readFileSync('EXPORT/msm-rewrite/before.json','utf8'));
  const plan=buildMsmPlan(all,url=>({_type:'cloudinary.asset',secure_url:url}));
  const compiled=createSchema({name:'msm-rewrite',types:[{name:'cloudinary.asset',type:'object',fields:[{name:'secure_url',type:'string'}]},...schema.types]});
  assert(compiled.get('caseStudy'), JSON.stringify((compiled as any)._validation));
  const client={fetch:async(query:string)=>query.includes('count(')?0:null};
  const workspace={schema:compiled,getClient:()=>client,i18n:{loadNamespaces:async()=>undefined,t:(key:string,opts:any)=>opts?.defaultValue||key}} as any;
  const failures:any[]=[];
  for(const c of plan.changes.filter(c=>c.type!=='translation.metadata')){
    const base=all.find((d:any)=>d._id===`drafts.${c.id}`)||all.find((d:any)=>d._id===c.id)||{};
    const doc={...base,...c.fields,_id:`drafts.${c.id}`,_type:c.type,_rev:'test',_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString()};
    const markers=await validateDocument({document:doc,workspace,getDocumentExists:async()=>true,getClient:()=>client as any});
    const errors=markers.filter(m=>m.level==='error');if(errors.length)failures.push({id:c.id,errors});
  }
  writeFileSync('EXPORT/msm-rewrite/schema-validation.json',JSON.stringify(failures,null,2)+'\n');
  console.log(JSON.stringify({documents:plan.changes.length,failures},null,2));assert.equal(failures.length,0);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
