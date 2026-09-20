import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {compactCloudinaryStorage, cloudinaryBookkeepingPaths, CLOUDINARY_BOOKKEEPING_FIELDS} from '../packages/utils/src/cloudinary-storage';
import {attributeCount} from './msm-attributes';

const root='EXPORT/media-storage-stage1-20260920';
const backup='EXPORT/production-before-media-stage1-20260920.tar.gz';
const query='*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
const body=(d:any)=>{const {_rev,_updatedAt,...rest}=d;return rest;};
const save=(name:string,data:unknown)=>writeFileSync(`${root}/${name}.json`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
async function main(){
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
  const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
  assert(client.config().token,'Run with --with-user-token');
  mkdirSync(root,{recursive:true,mode:0o700});
  assert.equal(createHash('sha256').update(readFileSync(backup)).digest('hex'),readFileSync(backup+'.sha256','utf8').split(' ')[0]);
  const entry=execFileSync('tar',['-tzf',backup],{encoding:'utf8'}).split('\n').find(p=>p.endsWith('/data.ndjson'));
  assert(entry,'Backup contains no documents');
  const baseline=execFileSync('tar',['-xOzf',backup,entry],{encoding:'utf8',maxBuffer:20_000_000}).trim().split('\n').map(l=>JSON.parse(l));
  const before=await client.fetch<any[]>(query);
  const stats=await client.request<any>({uri:'/data/stats/production'});
  const changes=before.map(d=>({id:d._id,rev:d._rev,paths:cloudinaryBookkeepingPaths(d)})).filter(c=>c.paths.length);
  const projected=before.map(d=>compactCloudinaryStorage(d));
  const estimatedReduction=attributeCount(before)-attributeCount(projected);
  const summary={projectId:'wu6i3y0h',dataset:'production',fields:CLOUDINARY_BOOKKEEPING_FIELDS,backup,
    apply:process.env.CLOUDINARY_STORAGE_APPLY==='1',documents:changes.length,
    published:changes.filter(c=>!c.id.startsWith('drafts.')).length,drafts:changes.filter(c=>c.id.startsWith('drafts.')).length,
    fieldsRemoved:changes.reduce((n,c)=>n+c.paths.length,0),estimatedReduction,officialBefore:stats.fields.count};
  save('plan',{...summary,changes});console.log(JSON.stringify(summary,null,2));
  if(!summary.apply || !changes.length)return;
  for(const c of changes)assert.equal(baseline.find(d=>d._id===c.id)?._rev,c.rev,`Changed since backup: ${c.id}`);
  save('before',before);
  const transaction=client.transaction();
  for(const c of changes)transaction.patch(c.id,p=>p.ifRevisionId(c.rev).unset(c.paths));
  await transaction.commit();
  const after=await client.fetch<any[]>(query);assert.equal(after.length,before.length);
  for(const original of before){
    const current=after.find(d=>d._id===original._id);assert(current,`Missing: ${original._id}`);
    assert.deepEqual(body(current),body(compactCloudinaryStorage(original)),`Unexpected change: ${original._id}`);
    if(!changes.some(c=>c.id===original._id))assert.deepEqual(current,original);
    assert.equal(cloudinaryBookkeepingPaths(current).length,0);
  }
  save('after',after);
  const officialAfter=(await client.request<any>({uri:'/data/stats/production'})).fields.count;
  const result={...summary,completedAt:new Date().toISOString(),officialAfter,allOtherFieldsPreserved:true,
    unrelatedDocumentsUnchanged:true,documentsPublished:0,remainingBookkeepingFields:0};
  save('verification',result);console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
