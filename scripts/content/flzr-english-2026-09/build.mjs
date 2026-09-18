import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const source = JSON.parse(readFileSync(new URL('./sources.json', import.meta.url)));
const routes = {Home:'home',Agency:'agency',Trainings:'trainings',Promotion:'promotion','Video Consulting':'video-consulting','PoS Management':'pos-management','Sales Force':'sales-force','Go To Markets':'go-to-markets','Business Intelligence':'business-intelligence',References:'cases',Career:'careers'};
const ids = {Home:'page-flizr-home-v3-preview-en',Agency:'page-flizr-agency-v2-en',References:'page-flizr-cases-en',Career:'5c223244-45bc-47af-b006-e4ffb8a2ccdf'};
const existingCases = {0:'7dbf1a02-91d6-4e57-93d5-d378c7ec02f8',1:'case-flizr-o2-studio-en',4:'case-flizr-bose-q4-en'};
const targets = {Home:['/en/agency','/en/cases'],Agency:['/en/contact','/en/careers'],Trainings:['/en/cases?service=Trainings'],Promotion:['/en/contact'],'Video Consulting':['https://www.saturn.de/de/service/live-beratung'],'PoS Management':['/en/cases?service=PoS%20Management'],'Sales Force':['/en/contact'],'Go To Markets':['/en/contact'],'Business Intelligence':[null],Career:['https://1sp-agency.jobs.personio.de/','https://www.my-flzr.com/']};
const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const ref = (id,i) => ({_type:'reference',_key:`ref-${i}`, _ref:id});
const pt = (text,key='copy') => [{_type:'block',_key:key,style:'normal',markDefs:[],children:[{_type:'span',_key:`${key}-span`,marks:[],text}]}];
const band = (key,tone='fade') => ({_type:'flzrSectionBand',_key:`band-${key}`,mode:'section',surfaceTone:tone,showBadge:false});
const reset = {_type:'flzrSectionBand',_key:'reset',mode:'reset'};
const cta = (label,url) => ({_type:'cta',text:label,variant:'violet',...(url?{link:{_type:'link',linkType:'external',externalUrl:url}}:{})});
function services(record,i) {
 const tags=[]; const s=record.subtitle.toLowerCase();
 if (/training|learning/.test(s)) tags.push('trainings');
 if (/merchandising|pos management/.test(s)) tags.push('pos-management');
 if (/video/.test(s)) tags.push('live-video-consulting');
 if (/promotion|sampling|tasting|ambassador|expert advice/.test(s)) tags.push('promotion');
 if ([0,5,6,9].includes(i)) tags.push('sales-force');
 return [...new Set(tags)].map((s,i)=>ref(`service-flzr-${s}-en`,i));
}
export function build(snapshot) {
 const docs = new Map(snapshot.map(d=>[d._id,d]));
 const home = docs.get(ids.Home); assert(home?.channel==='flizrWeb');
 const oldHero = home.content.find(b=>b._type==='oneSPHeader');
 const proofMedia = home.content.find(b=>b._type==='flzrTwoThirdsContentSection')?.image
  ?? home.content.find(b=>b._type==='twoColContentSection')?.video;
 assert(proofMedia?.secure_url, 'Homepage proof media is required');
 const updates=[]; const caseIds=[];
 const homepageCaseIds = Object.values(existingCases);
 for (const [i,record] of source.references.records.entries()) {
  const id=existingCases[i] || `case-flzr-reference-${String(i+1).padStart(2,'0')}-en`;
  const old=docs.get(id); assert(!old || (old.language==='en' && old.channel.length===1 && old.channel[0]==='flizrWeb'));
  const media=docs.get(homepageCaseIds[i%3]);
  const slug=old?.slug?.current || `${slugify(record.title)}-${slugify(record.subtitle)}`;
  const set={title:record.title,subtitle:record.subtitle,description:record.paragraphs[0],
   casesPageBuilder:record.paragraphs.slice(1).map((p,j)=>({_type:'headlineChallenge',_key:`reference-${j}`,title:'',description:p,paddingY:'16'})),
   services:services(record,i),isPublished:true};
  assert.deepEqual([set.description,...set.casesPageBuilder.map(b=>b.description)],record.paragraphs);
  updates.push({_id:id,_type:'caseStudy',set,create:{language:'en',channel:['flizrWeb'],slug:{_type:'slug',current:slug},mainImage:media.mainImage,mainVideo:media.mainVideo,isVerticalVideo:false,publishedAt:`2026-09-16T00:00:${String(59-i).padStart(2,'0')}.000Z`}});
  caseIds.push(id);
 }
 let verifiedCells=0;
 for(const [name,slug] of Object.entries(routes)) {
  // Homepage restored at the user's request; keep it out of subsequent imports.
  if(name==='Home') continue;
  const id=ids[name]||`page-flzr-${slug}-en`;
  const old=docs.get(id); assert(!old || (old.channel==='flizrWeb' && old.language==='en'));
  const rows=source.spreadsheet.rows.filter(r=>r.page===name);
  let blocks=[];
  if(name==='References') {
   blocks=[{...oldHero,_key:'references-hero',headline:source.references.heading,seoTitle:source.references.heading,eyebrow:'',showEyebrow:false,paragraphs:[],cta:undefined},
    band('references'),{_type:'casesGalleryFilteredWithPagination',_key:'references-grid',showFilters:true,selectionMode:'manual',selectedCases:caseIds.map(ref),rowsPerPage:12,paddingY:'8'},reset];
  } else {
   const [hero,proof,ctaRow]=rows;
   const split=hero.text.indexOf('. '); assert(split>0);
   const headline=hero.text.slice(0,split+1),support=hero.text.slice(split+2);
   assert.equal(`${headline} ${support}`,hero.text); verifiedCells++;
   const labels=[...ctaRow.text.matchAll(/"([^"]+)"/g)].map(m=>m[1]);assert.equal(labels.length,targets[name].length);verifiedCells++;
   blocks=[{...oldHero,_key:'hero',headline,seoTitle:headline,paragraphs:pt(support),eyebrow:'',showEyebrow:false,rotatingText:[],highlight:'',mediaDarkening:45,cta:targets[name][0]?{...cta(labels[0],targets[name][0]),variant:'glass'}:undefined}];
   if(!['Go To Markets','Career'].includes(name)) {
    blocks.push(band('proof'),{_type:'twoColContentSection',_key:'proof',showTitle:false,title:'',content:pt(proof.text),contentSize:'lg',useVideo:true,video:proofMedia,mediaAlt:'',reverseColumns:name==='Agency',paddingY:'16',hideFromNav:true});
    assert.equal(blocks[2].content[0].children[0].text,proof.text); verifiedCells++;
   } else blocks.push(band('links','soft'));
   if(name==='Home') blocks.push({_type:'casesGalleryFiltered',_key:'home-cases',selectionMode:'manual',selectedCases:[caseIds[0],caseIds[1],caseIds[4]].map(ref),showFilters:false,paddingY:'16'});
   for(let i=1;i<labels.length;i++) blocks.push({_type:'intertitleCTA',_key:`cta-${i}`,title:'',subtitle:'',cta:cta(labels[i],targets[name][i]),alignment:'left',hideFromNav:true});
   if(name==='Business Intelligence') blocks.push({_type:'contentSection',_key:'pending-dashboard',content:pt(labels[0]),columnSpan:'12',paddingY:'8',hideFromNav:true});
   blocks.push(reset);
  }
  // Strip undefined before both API submission and exact verification.
  blocks=JSON.parse(JSON.stringify(blocks));
  updates.push({_id:id,_type:'page',set:{content:blocks},create:{channel:'flizrWeb',language:'en',title:name,slug:{_type:'slug',current:slug},isHomepage:false,navbarVariant:'light',metadata:{_type:'metadata',title:name,description:rows[0].text}}});
  const draft=docs.get(`drafts.${id}`);
  if(draft) {
   const draftBlocks=structuredClone(blocks);
   const draftHero=draft.content?.find(b=>b._type==='oneSPHeader');
   if(draftHero?.mediaDarkening!==undefined) draftBlocks[0].mediaDarkening=draftHero.mediaDarkening;
   updates.push({_id:draft._id,_type:'page',set:{content:draftBlocks}});
  }
 }
 assert.equal(verifiedCells,25);assert.equal(caseIds.length,33);
 return {updates,verification:{publicSpreadsheetCells:verifiedCells,pages:10,originalCases:caseIds.length,editorialCellsExcluded:['E24','E33'],pendingDashboard:true}};
}
