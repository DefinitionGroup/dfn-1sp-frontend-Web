// MSM visibility changes only; dry-run, backup and revision guard precede apply.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const projectId='wu6i3y0h';
const dataset='production';
const folder='EXPORT/msm-case-unpublish-2026-10-04';
const auditPath=existsSync(`${folder}/audit.json`)?`${folder}/audit.json`:'/private/tmp/msm-case-audit-2026-10-04/comparison.json';
const audit=JSON.parse(readFileSync(auditPath,'utf8'));
assert.equal(audit.scope.project,projectId);assert.equal(audit.scope.dataset,dataset);assert.equal(audit.scope.channel,'msmWeb');
const noRows=audit.noRows;
assert.equal(noRows.length,17);assert(noRows.every(row=>row.include===false));
const ids=noRows.flatMap(row=>[row.enId,row.deId]);
assert.equal(new Set(ids).size,34);assert(ids.every(id=>typeof id==='string'&&id.startsWith('case-msm-')));
const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId,dataset,useCdn:false,perspective:'raw'});
const inventory=()=>client.fetch('*[_type == "caseStudy" && !(_id in path("drafts.**"))]{_id,_rev,language,channel,isPublished,slug}');
const visible=(docs,language)=>docs.filter(doc=>doc.language===language&&doc.channel?.includes('msmWeb')&&doc.isPublished===true);
const documentBody=doc=>Object.fromEntries(Object.entries(doc).filter(([key])=>!['_rev','_updatedAt','isPublished','channel'].includes(key)));

if(process.env.MSM_UNPUBLISH_NO_APPLY==='1'){
 const plan=JSON.parse(readFileSync(`${folder}/plan.json`,'utf8'));
 assert.equal(plan.projectId,projectId);assert.equal(plan.dataset,dataset);
 assert.deepEqual(plan.ids,ids);
 const backupBytes=readFileSync(plan.backup);
 assert.equal(createHash('sha256').update(backupBytes).digest('hex'),plan.backupSha256);
 const backup=JSON.parse(backupBytes);
 const current=await client.getDocuments(plan.changes.map(change=>change.id));
 let transaction=client.transaction();
 for(const [index,change] of plan.changes.entries()){
  const doc=current[index];assert.equal(doc?._rev,change.revision);assert.equal(doc._type,'caseStudy');
  assert(doc.channel.includes('msmWeb'));
  // The business flag controls all sites, so shared cases retain global publication.
  if(change.mode==='msm-only'){
   assert.deepEqual(doc.channel,['msmWeb']);
   transaction=transaction.patch(change.id,patch=>patch.ifRevisionId(change.revision).set({isPublished:false}));
  }else{
   assert(doc.channel.some(channel=>channel!=='msmWeb'));
   transaction=transaction.patch(change.id,patch=>patch.ifRevisionId(change.revision).set({channel:doc.channel.filter(channel=>channel!=='msmWeb')}));
  }
 }
 const receipt=plan.changes.length?await transaction.commit():{transactionId:null};
 const after=await client.getDocuments(plan.changes.map(change=>change.id));
 for(const [index,change] of plan.changes.entries()){
  const doc=after[index];const before=backup.documents.find(item=>item?._id===change.id);
  assert.deepEqual(documentBody(doc),documentBody(before),'Case content must stay intact.');
  if(change.mode==='msm-only'){assert.equal(doc.isPublished,false);assert.deepEqual(doc.channel,before.channel);}
  else{assert.deepEqual(doc.channel,before.channel.filter(channel=>channel!=='msmWeb'));assert.equal(doc.isPublished,before.isPublished);}
 }
 const updatedInventory=await inventory();
 for(const before of backup.inventory.filter(doc=>!ids.includes(doc._id))){
  const doc=updatedInventory.find(item=>item._id===before._id);
  assert(doc);assert.deepEqual(doc.channel,before.channel);assert.equal(doc.isPublished,before.isPublished);
 }
 assert(ids.every(id=>!visible(updatedInventory,'en').some(doc=>doc._id===id)&&!visible(updatedInventory,'de').some(doc=>doc._id===id)));
 for(const row of audit.matches.filter(row=>row.include)){
  assert(visible(updatedInventory,'en').some(doc=>doc._id===row.enId),'Keep every Yes case visible in English.');
  if(row.deId)assert(visible(updatedInventory,'de').some(doc=>doc._id===row.deId),'Keep existing German Yes cases visible.');
 }
 for(const extra of audit.extrasEn)assert(visible(updatedInventory,'en').some(doc=>doc._id===extra.id),'Keep extra cases unchanged.');
 assert.equal(visible(updatedInventory,'en').length,52);assert.equal(visible(updatedInventory,'de').length,46);
 writeFileSync(`${folder}/after.json`,JSON.stringify({documents:after,inventory:updatedInventory},null,2),{mode:0o600});
 const summary={mode:'applied',projectId,dataset,transactionId:receipt.transactionId,projects:noRows.length,variants:ids.length,patchedDocuments:after.length,visible:{en:52,de:46},draftsPatched:after.filter(doc=>doc._id.startsWith('drafts.')).length};
 writeFileSync(`${folder}/receipt.json`,JSON.stringify(summary,null,2),{mode:0o600});console.log(JSON.stringify(summary));
}else{
 const documents=(await client.getDocuments([...ids,...ids.map(id=>`drafts.${id}`)])).filter(Boolean);
 assert(ids.every(id=>documents.some(doc=>doc._id===id)));
 assert(documents.every(doc=>doc._type==='caseStudy'&&doc.channel?.includes('msmWeb')));
 const changes=documents.filter(doc=>doc.isPublished!==false).map(doc=>({id:doc._id,revision:doc._rev,mode:doc.channel.some(channel=>channel!=='msmWeb')?'shared':'msm-only',language:doc.language,title:doc.title}));
 const beforeInventory=await inventory();
 mkdirSync(folder,{recursive:true});
 writeFileSync(`${folder}/audit.json`,JSON.stringify(audit,null,2),{mode:0o600});
 const backup=`${folder}/before-${Date.now()}.json`;
 const text=JSON.stringify({documents,inventory:beforeInventory,rows:noRows},null,2);
 writeFileSync(backup,text,{mode:0o600});
 const backupSha256=createHash('sha256').update(text).digest('hex');
 writeFileSync(`${folder}/plan.json`,JSON.stringify({projectId,dataset,ids,backup,backupSha256,changes},null,2),{mode:0o600});
 console.log(JSON.stringify({mode:'dry-run',projectId,dataset,backup,projects:noRows.length,variants:ids.length,changes:changes.length,shared:changes.filter(change=>change.mode==='shared').length,drafts:changes.filter(change=>change.id.startsWith('drafts.')).length,before:{en:visible(beforeInventory,'en').length,de:visible(beforeInventory,'de').length},cases:noRows.map(row=>({nr:row.nr,client:row.client,title:row.title}))},null,2));
}
