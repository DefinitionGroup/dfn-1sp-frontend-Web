const {getCliClient} = require('sanity/cli');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const normalize = ({_rev, _createdAt, _updatedAt, ...doc}) => doc;
const sorted = x => Array.isArray(x) ? x.map(sorted) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k=>[k, sorted(x[k])])) : x;
const canonical = d => JSON.stringify(sorted(normalize(d)));
async function main() {
  const source = JSON.parse(execFileSync('python3', ['-c', `import tarfile,json
with tarfile.open('/Users/martin/Downloads/dev-dataset-backup-2026-09-16.tar.gz') as t:
 m=[m for m in t.getmembers() if m.name.endswith('data.ndjson')]
 assert len(m)==1
 print(json.dumps([json.loads(l) for l in t.extractfile(m[0]) if l.strip()]))`], {maxBuffer:10*1024*1024}).toString());
  if(source.length !== 265 || new Set(source.map(d=>d._id)).size !== 265 || source.some(d=>d._id.startsWith('_'))) throw new Error('Unexpected archive contents');
  const client = getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
  const existing = await client.fetch('*[!(_id in path("_.**"))]{_id,_rev,_type}');
  const sourceIds = new Set(source.map(d=>d._id));
  const extra = existing.filter(d=>!sourceIds.has(d._id));
  if(existing.some(d=>d._id.startsWith('_'))) throw new Error('Internal documents unexpectedly included');
  const mutations = [
    ...existing.map(d=>({patch:{id:d._id,ifRevisionID:d._rev,set:{_type:d._type}}})),
    ...source.map(d=>({createOrReplace:normalize(d)})),
    ...extra.map(d=>({createOrReplace:{_id:d._id,_type:d._type}}))
  ];
  console.log(JSON.stringify({project:'wu6i3y0h',dataset:'production',archiveDocuments:source.length,existingContent:existing.length,replace:existing.filter(d=>sourceIds.has(d._id)).length,add:source.filter(d=>!existing.some(e=>e._id===d._id)).length,delete:extra.length}));
  await client.request({uri:'/data/mutate/production',method:'POST',query:{dryRun:true,returnIds:true},body:{mutations}});
  console.log('Replacement dry run passed. Applying revision-guarded replacement.');
  const result = await client.request({uri:'/data/mutate/production',method:'POST',query:{returnIds:true,visibility:'sync'},body:{mutations}});
  console.log(JSON.stringify({transactionId:result.transactionId}));
  if(extra.length) {
    const currentExtras = await client.fetch('*[_id in $ids]{_id,_rev,_type}', {ids:extra.map(d=>d._id)});
    const removals = [...currentExtras.map(d=>({patch:{id:d._id,ifRevisionID:d._rev,set:{_type:d._type}}})),...currentExtras.map(d=>({delete:{id:d._id}}))];
    await client.request({uri:'/data/mutate/production',method:'POST',query:{dryRun:true},body:{mutations:removals}});
    console.log('Deletion dry run passed. Removing production-only documents.');
    const deleted = await client.request({uri:'/data/mutate/production',method:'POST',query:{returnIds:true,visibility:'sync'},body:{mutations:removals}});
    console.log(JSON.stringify({deletionTransactionId:deleted.transactionId,deleted:currentExtras.length}));
  }
  const actual = await client.fetch('*[!(_id in path("_.**"))]');
  const byId = new Map(actual.map(d=>[d._id,d]));
  const missing = source.filter(d=>!byId.has(d._id)).map(d=>d._id);
  const unexpected = actual.filter(d=>!sourceIds.has(d._id)).map(d=>d._id);
  const differing = source.filter(d=>byId.has(d._id)&&canonical(d)!==canonical(byId.get(d._id))).map(d=>d._id);
  console.log(JSON.stringify({verifiedDocuments:actual.length,missing,unexpected,differing}));
  if(missing.length||unexpected.length||differing.length) throw new Error('Verification mismatch');
  console.log('VERIFIED: Production content exactly matches the archive, excluding Sanity-managed revision and timestamp metadata.');
}
main().catch(e=>{console.error(JSON.stringify({status:e.statusCode,message:e.message}));process.exitCode=1;});
