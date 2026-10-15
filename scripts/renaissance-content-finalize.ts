import {getCliClient} from 'sanity/cli';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {campaigns,PILOT,redirects,copy} from './renaissance-content-model';
const ROOT='EXPORT/renaissance-rewrite-v4/content';
async function main(){
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});
 assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
 const ids=campaigns.filter(c=>c.id!==PILOT).map(c=>`drafts.${c.id}`);
 const docs=await client.fetch<any[]>('*[_id in $ids]',{ids});assert.equal(docs.length,65);
 const changes=docs.filter(d=>d.description!==campaigns.find(c=>`drafts.${c.id}`===d._id)!.summary);
 if(changes.length){
  writeFileSync(`${ROOT}/before-summary-refinement.json`,JSON.stringify(changes,null,2),{mode:0o600});
  const tx=client.transaction();for(const d of changes){const campaign=campaigns.find(c=>`drafts.${c.id}`===d._id)!;assert.equal(d.description,campaign.description);tx.patch(d._id,p=>p.ifRevisionId(d._rev).set({description:campaign.summary}));}await tx.commit();
  const after=await client.fetch<any[]>('*[_id in $ids]',{ids});for(const d of after)assert.equal(d.description,campaigns.find(c=>`drafts.${c.id}`===d._id)!.summary);
 }
 writeFileSync('apps/renaissance-web/data/legacyRedirects.json',JSON.stringify(redirects,null,2)+'\n');
 const current=await client.fetch<any[]>('*[(_type=="page" || _type=="renaissanceSharedPortraits" || _type=="renaissanceSharedAwards" || _type=="renaissanceClientCollection") && channel=="renaissanceWeb" && language=="en"]',{}, {perspective:'drafts'});
 const home=current.find(d=>d._id==='page-renaissance-home-en');assert(home);
 const portraits=current.find(d=>d._type==='renaissanceSharedPortraits').content;
 const awards=current.find(d=>d._type==='renaissanceSharedAwards').content;
 const collection=current.find(d=>d._id==='renaissance-clients-home-v4-en');
 const content=home.content.flatMap((b:any)=>b._key==='renaissance-people-intro'?[b,{...portraits,_key:'renaissance-people-portraits'},{...awards,_key:'renaissance-award-wall'}]:b._type==='clientLogoCarousel'?[{...b,collectionClients:collection.items.map((i:any)=>({_id:i.client._ref,name:i.displayName,logo:i.logoOverride,altText:i.altText}))}]:[b]);
 writeFileSync('apps/renaissance-web/data/homepageFallback.v4.json',JSON.stringify(content,null,2)+'\n');
 writeFileSync('apps/renaissance-web/data/homepageFallback.ts',`import type { PageBuilderBlock } from "@1sp/sanity-types";\nimport content from "./homepageFallback.v4.json";\n\n// Snapshot of the approved v4 composition. Sanity remains authoritative.\nexport const RENAISSANCE_HOME_TITLE = ${JSON.stringify(copy(2))};\nexport const RENAISSANCE_HOME_DESCRIPTION = ${JSON.stringify(copy(3))};\nexport const RENAISSANCE_HOMEPAGE_FALLBACK = content as unknown as PageBuilderBlock[];\n`);
 const contact=current.find(d=>d._id==='page-renaissance-contact-en');assert(contact);
 writeFileSync('apps/renaissance-web/data/contactPageFallback.ts',`import type { PageBuilderBlock } from "@1sp/sanity-types";\n\nexport const RENAISSANCE_CONTACT_TITLE = "Contact Renaissance";\nexport const RENAISSANCE_CONTACT_DESCRIPTION = ${JSON.stringify(copy(32))};\nexport const RENAISSANCE_CONTACT_CONTENT = ${JSON.stringify(contact.content,null,2)} as unknown as PageBuilderBlock[];\nexport const RENAISSANCE_CONTACT_FALLBACK = {\n_id: "fallback-renaissance-contact-en", _type: "page", title: RENAISSANCE_CONTACT_TITLE, slug: {current: "contact"}, language:"en", channel:"renaissanceWeb", navbarVariant:"light" as const, content: RENAISSANCE_CONTACT_CONTENT, metadata: {title:RENAISSANCE_CONTACT_TITLE,description:RENAISSANCE_CONTACT_DESCRIPTION}, contactForm: ${JSON.stringify(contact.contactForm)}\n};\n`);
 console.log(JSON.stringify({summariesRefined:changes.length,redirects:redirects.length,fallbacks:2}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
