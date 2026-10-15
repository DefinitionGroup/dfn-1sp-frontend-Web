const {getCliClient}=require('sanity/cli');const assert=require('node:assert/strict');
(async()=>{
const c=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
const docs=await c.fetch('*[_type=="page" && channel=="flizrWeb" && language=="en" && slug.current in ["home","services"]]');
const source=docs.find(d=>d._id==='page-flizr-home-v3-preview-en').content.find(b=>b._type==='flzrTwoThirdsContentSection');
const patches=docs.filter(d=>d.slug.current==='services').map(d=>{
 const old=d.content.find(b=>b._key==='services-v2-contact');assert.equal(old._type,'intertitleCTA');
 const split=old.subtitle.indexOf('. ');assert(split>0);
 const subheadline=old.subtitle.slice(0,split+1),bodyText=old.subtitle.slice(split+2);
 assert.equal(subheadline+' '+bodyText,old.subtitle);
 const replacement={...source,_key:old._key,headline:old.title,subheadline,body:[{_type:'block',_key:'contact-body',style:'normal',markDefs:[],children:[{_type:'span',_key:'contact-span',marks:[],text:bodyText}]}],cta:old.cta,navPointName:old.navPointName,hideFromNav:old.hideFromNav};
 return {patch:{id:d._id,ifRevisionID:d._rev,set:{content:d.content.map(b=>b._key===old._key?replacement:b)}}};
});
await c.mutate(patches,{dryRun:true});await c.mutate(patches,{visibility:'sync'});
for(const {patch}of patches){const after=await c.getDocument(patch.id);assert.deepEqual(after.content,patch.set.content)}
console.log('Services contact now uses homepage Careers component and media; contact wording, CTA and badge preserved. Re-query verified.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
