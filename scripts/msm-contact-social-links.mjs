// Dry run: pnpm exec sanity exec scripts/msm-contact-social-links.mjs --with-user-token
// Apply the reviewed plan: add -- --apply. --verify is read-only.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {getCliClient} from 'sanity/cli';

const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
const dir='EXPORT/msm-contact-social-links-2026-10-05';
const ids=['msm-page-contact-en','msm-page-contact-de'].flatMap(id=>[id,`drafts.${id}`]);
const path='content[_key=="contact-channels"]';
const services=new Map(['Messenger','WhatsApp','Facebook','Instagram','LinkedIn'].map(label=>[label,label.toLowerCase()]));
const hash=value=>createHash('sha256').update(value).digest('hex');
const save=(file,data)=>fs.writeFile(`${dir}/${file}`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
const strip=doc=>Object.fromEntries(Object.entries(doc).filter(([key])=>!['_rev','_updatedAt','_createdAt'].includes(key)));
const getPages=()=>client.fetch('*[_id in $ids]',{ids});

await fs.mkdir(dir,{recursive:true});
if(!process.argv.includes('--apply')&&!process.argv.includes('--verify')){
  const pages=await getPages();
  assert(pages.some(p=>p._id==='msm-page-contact-en')&&pages.some(p=>p._id==='msm-page-contact-de'));
  const changes=['msm-page-contact-en','msm-page-contact-de'].map(publishedId=>{
    const draftId=`drafts.${publishedId}`;
    const draft=pages.find(page=>page._id===draftId);
    const page=draft||pages.find(page=>page._id===publishedId);
    assert.equal(page.channel,'msmWeb');assert.equal(page.slug.current,'contact');
    const original=page.content.filter(block=>block._key==='contact-channels');
    assert.equal(original.length,1);const old=original[0];assert.equal(old._type,'contentSection');
    const links=old.content.map(block=>{
      const spans=block.children.filter(child=>child._type==='span');
      const label=spans.map(span=>span.text).join('');
      const platform=services.get(label);assert(platform,`Unknown platform label: ${label}`);
      const definitions=block.markDefs.filter(def=>def._type==='link');assert.equal(definitions.length,1);
      const definition=definitions[0];assert(spans.every(span=>span.marks.includes(definition._key)));
      assert(/^https?:\/\//i.test(definition.href));
      return {_type:'msmSocialLink',_key:block._key,platform,label,url:definition.href,openInNewTab:definition.blank===true};
    });
    assert.equal(links.length,5);assert.equal(new Set(links.map(link=>link.platform)).size,5);
    const block={_type:'msmSocialLinks',_key:old._key,title:old.title,links,
      ...(old.navPointName?{navPointName:old.navPointName}:{}),...(old.hideFromNav!==undefined?{hideFromNav:old.hideFromNav}:{})};
    return {id:draftId,publishedId,sourceId:page._id,revision:page._rev,draftExists:!!draft,original:old,block};
  });
  const backup=JSON.stringify(pages,null,2)+'\n';await fs.writeFile(`${dir}/before.json`,backup,{mode:0o600});
  await save('plan.json',{projectId:'wu6i3y0h',dataset:'production',createdAt:new Date().toISOString(),backupSha256:hash(backup),changes});
  console.log(JSON.stringify({mode:'dry-run',documents:changes.map(c=>({id:c.id,heading:c.block.title,links:c.block.links}))}));
}else{
  const plan=JSON.parse(await fs.readFile(`${dir}/plan.json`,'utf8'));
  assert.equal(plan.projectId,'wu6i3y0h');assert.equal(plan.dataset,'production');
  const backup=await fs.readFile(`${dir}/before.json`,'utf8');assert.equal(hash(backup),plan.backupSha256);
  const before=JSON.parse(backup);let receipt;
  if(process.argv.includes('--apply')){
    const pages=await getPages();assert.deepEqual(pages.map(p=>p._id).sort(),before.map(p=>p._id).sort(),'Draft inventory changed; re-plan');
    for(const c of plan.changes)assert.equal(pages.find(p=>p._id===c.sourceId)._rev,c.revision,`Source page changed; re-plan: ${c.sourceId}`);
    receipt=await client.action(plan.changes.map(c=>({actionType:'sanity.action.document.edit',publishedId:c.publishedId,draftId:c.id,
      patch:{...(c.draftExists?{ifRevisionID:c.revision}:{}),set:{[path]:c.block}}})));
    await save('receipt.json',{appliedAt:new Date().toISOString(),...receipt});
  }else receipt=JSON.parse(await fs.readFile(`${dir}/receipt.json`,'utf8'));
  const after=await getPages();
  for(const c of plan.changes){
    const original=before.find(p=>p._id===c.sourceId),actual=after.find(p=>p._id===c.id);
    const actualBlock=actual.content.find(block=>block._key===c.block._key);
    // The follow-up palette request permits only the explicit White baseline.
    assert.equal(actualBlock.color??'white','white');
    const expectedBlock={...c.block,...(actualBlock.color!==undefined?{color:'white'}:{})};
    const expected={...original,_id:c.id,content:original.content.map(block=>block._key===c.block._key?expectedBlock:block)};
    if(!c.draftExists)expected._system={...original._system,base:{id:c.publishedId,rev:original._rev}};
    assert.deepEqual(strip(actual),strip(expected),`Unexpected page changes: ${c.id}`);
    assert.deepEqual(actual.content.find(block=>block._key===c.block._key).links.map(link=>link.url),c.original.content.map(block=>block.markDefs.find(def=>def._type==='link').href));
  }
  for(const published of before.filter(page=>!page._id.startsWith('drafts.')))assert.deepEqual(after.find(page=>page._id===published._id),published,'Published page changed');
  await save('after.json',after);
  const verification={verifiedAt:new Date().toISOString(),transactionId:receipt.transactionId,updatedDrafts:plan.changes.map(c=>c.id),linksPerDocument:5,baselineColor:'white',originalUrlsPreserved:true,unrelatedContentPreserved:true,publishedPagesUnchanged:true};
  await save('verification.json',verification);console.log(JSON.stringify(verification));
}
