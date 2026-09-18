const {getCliClient}=require('sanity/cli');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
 const ids=['page-flizr-home-v3-preview-en','drafts.page-flizr-home-v3-preview-en'];
 const snapshot=JSON.parse(fs.readFileSync('tmp/flzr-verbatim/current.json'));
 const current=await client.fetch('*[_id in $ids]',{ids});
 assert.equal(current.length,2);
 const mutations=current.map(d=>{
  assert.equal(d.channel,'flizrWeb');assert.equal(d.language,'en');
  const original=snapshot.find(s=>s._id===d._id);assert.equal(original.content.length,19);
  return {patch:{id:d._id,ifRevisionID:d._rev,set:{content:original.content}}};
 });
 await client.mutate(mutations,{dryRun:true});
 await client.mutate(mutations,{visibility:'sync'});
 const restored=await client.fetch('*[_id in $ids]',{ids});
 for(const d of restored) assert.deepEqual(d.content,snapshot.find(s=>s._id===d._id).content);
 console.log('Restored and verified original 19-block homepage content, published and draft. No other documents changed.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
