import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createSchema,validateDocument} from 'sanity';
import {schema} from '../packages/sanity-schema/src';
const root='EXPORT/renaissance-rewrite-v4/results';
const all=JSON.parse(readFileSync(`${root}/latest-before.json`,'utf8'));
const plan=JSON.parse(readFileSync(`${root}/latest-plan.json`,'utf8'));
const compiled=createSchema({name:'results',types:[{name:'cloudinary.asset',type:'object',fields:[{name:'secure_url',type:'string'}]},...schema.types]});
const client={fetch:async()=>null};
const workspace={schema:compiled,getClient:()=>client,i18n:{loadNamespaces:async()=>undefined,t:(key:string,opts:any)=>opts?.defaultValue||key}} as any;
async function main(){
 const failures=[];
 for(const change of plan.changes){const document={...all.find((d:any)=>d._id===change.id),...change.fields};const markers=await validateDocument({document,workspace,getDocumentExists:async()=>true,getClient:()=>client as any});const errors=markers.filter(m=>m.level==='error');if(errors.length)failures.push({id:change.id,errors});}
 writeFileSync(`${root}/schema-validation.json`,JSON.stringify({documents:plan.changes.length,failures},null,2));console.log(JSON.stringify({documents:plan.changes.length,failures}));assert.equal(failures.length,0);
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
