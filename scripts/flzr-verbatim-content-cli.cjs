// Run through `pnpm exec sanity exec scripts/flzr-verbatim-content-cli.cjs --with-user-token`.
// Read-only unless FLZR_APPLY_VERBATIM=1. All writes are revision guarded.
const {getCliClient}=require('sanity/cli');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const {build}=await import('./content/flzr-english-2026-09/build.mjs');
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
 const before=await client.fetch('*[_type in ["page","caseStudy"] && (channel == "flizrWeb" || "flizrWeb" in channel) && language == "en"]');
 const {updates,verification}=build(before);
 const byId=new Map(before.map(d=>[d._id,d]));
 const allIds=await client.fetch('*[_id in $ids]{_id}',{ids:updates.map(u=>u._id)});
 assert(allIds.every(d=>byId.has(d._id)),'An ID exists outside the authorized channel/language');
 const mutations=updates.map(u=>{
  const old=byId.get(u._id);
  return old?{patch:{id:u._id,ifRevisionID:old._rev,set:u.set}}:{create:{_id:u._id,_type:u._type,...u.create,...u.set}};
 });
 console.log(JSON.stringify({target:'wu6i3y0h/production/flizrWeb/en',...verification,existing:updates.filter(u=>byId.has(u._id)).length,created:updates.filter(u=>!byId.has(u._id)).length}));
 await client.mutate(mutations,{dryRun:true});
 console.log('Revision-guarded API dry-run passed.');
 if(process.env.FLZR_APPLY_VERBATIM!=='1') return;
 fs.mkdirSync('tmp/flzr-verbatim',{recursive:true});
 fs.writeFileSync('tmp/flzr-verbatim/before-apply.json',JSON.stringify(before,null,2));
 await client.mutate(mutations,{visibility:'sync'});
 const after=await client.fetch('*[_id in $ids]',{ids:updates.map(u=>u._id)});
 const afterById=new Map(after.map(d=>[d._id,d]));
 for(const u of updates) for(const [key,value]of Object.entries(u.set)) assert.deepEqual(afterById.get(u._id)?.[key],value,`${u._id}.${key}`);
 fs.writeFileSync('tmp/flzr-verbatim/verification.json',JSON.stringify({...verification,verifiedDocuments:after.length},null,2));
 console.log(`Applied and re-queried ${after.length} documents; every changed field matches the verified payload.`);
})().catch(e=>{console.error(e.message);process.exitCode=1});
