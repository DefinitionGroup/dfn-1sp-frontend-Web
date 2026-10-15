import assert from 'node:assert/strict';
import source from './data/renaissance-rewrite-v4.json';
import legacy from './data/renaissance-legacy-v4.json';

export const CHANNEL='renaissanceWeb';
export const PILOT='9d295e99-7801-42b8-96e7-a15afb267e72';
export const UNIT='cc6775b3-7157-48d1-be0f-a5843c3ba89c';
export const copy=(row:number)=>{ const value=source.rows.find(r=>r.row===row)?.rewrite; assert(value,`Missing F${row}`); return value; };
export const slugify=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const normalise=(value:string)=>slugify(value).replaceAll('-','');
export const ref=(id:string,type:string)=>({_type:'reference',_ref:id,_weak:true,_strengthenOnPublish:{type}});
export const pt=(text:string,key:string)=>({_key:key,_type:'block',style:'normal',markDefs:[],children:[{_key:`${key}-span`,_type:'span',marks:[],text}]});
export const cta=(text:string,url:string)=>({_type:'cta',text,variant:'black',link:{_type:'link',linkType:'external',externalUrl:url}});
export const section=(key:string,title:string,text:string,anchorId?:string)=>({_type:'contentSection',_key:key,title,content:[pt(text,key+'-text')],columnSpan:'10',paddingY:'16',...(anchorId?{anchorId}:{})});
export const intro=(key:string,headline:string,description:string,h1=false)=>({_type:'introBlockTypoSophisticated',_key:key,header:{_type:'peopleStepHeader',mainHeadline:headline},description,renaissanceHeadingTag:h1?'h1':'h2',renaissanceLayout:'compact'});
export const extract=(text:string)=>text.match(/^.*?[.!?](?=\s|$)/)?.[0] || text;
const aliases:Record<string,string>={'Curve Digital':'Curve Games','Daedalic':'Daedalic Entertainment','Daedelic Entertainment':'Daedalic Entertainment','Emberlab':'Ember Lab','Hyperluminal Games':'Hyper Luminal Games','Qooland':'Qooland Games','Revolution Software':'Revolution','Skybound':'Skybound Games','Team 17':'Team17'};
export const clientName=(name:string)=>aliases[name]||name;
export const campaigns=legacy.cases.map(item=>{
  const rows=source.rows.filter(r=>item.sourceRows.includes(r.row));
  const title=item.page.replace(/^CS: /,'');
  const brief=rows.find(r=>r.section==='Intro'&&r.block==='Paragraph'); assert(brief, title);
  const heading=rows.find(r=>r.block==='H2');
  const results=rows.find(r=>r.section==='Results');
  const quote=rows.find(r=>r.section==='Client Quote');
  const pilot=item.sourceRows.includes(91);
  const slug=pilot?'making-stalker-2-unmissableeverywhere-all-at-once':slugify(title);
  const text=brief.rewrite;
  const platforms=[['PC',/\bPC\b(?! Gamer)/i],['PlayStation 5',/\b(?:PS5|PlayStation 5)\b/i],['PlayStation 4',/\b(?:PS4|PlayStation 4)\b/i],['Xbox Series X|S',/\bXbox Series\b/i],['Nintendo Switch',/\b(?:Nintendo Switch|Switch)\b/i],['VR',/\bVR\b/i],['iOS',/\biOS\b/i],['Android',/\bAndroid\b/i]].filter(([,pattern])=>(pattern as RegExp).test(text)).map(([label])=>String(label));
  const genres=['RPG','action RPG','horror','survival','platformer','strategy','puzzle','simulation','shooter','rhythm','racing','adventure','roguelike','fighting'].filter(term=>new RegExp(`\\b${term}\\b`,'i').test(text));
  const body:any[]=[{_type:'headlineChallenge',_key:`rpr-v4-${brief.row}`,title:heading?.rewrite||'The brief',description:brief.rewrite}];
  if(results){ const block:any={_type:'resultsMetrics',_key:`rpr-v4-${results.row}`,title:'Results',description:results.rewrite,fullWidth:true,metrics:[]};
    if(quote){const match=quote.rewrite.match(/^"(.*)" - (.*)$/); assert(match);block.quote={text:match[1],attribution:match[2]};}body.push(block);
  }
  return {...item,id:pilot?PILOT:`case-renaissance-${slug}-en`,slug,title,description:brief.rewrite,summary:extract(brief.rewrite),body,discovery:{regions:item.regions,genres,platforms}};
});
export const redirects=[{source:'/about',destination:'/about-us'},{source:'/case-studies',destination:'/cases'},{source:'/register',destination:'/contact#registration'},...campaigns.map(c=>({source:c.legacyPath,destination:`/cases/${c.slug}`}))];

export function buildContentPlan(all:any[],asset:(url:string)=>any){
  const canonical=new Map<string,any>();
  for(const d of all){const id=d._id.replace(/^drafts\./,'');if(!canonical.has(id)||d._id.startsWith('drafts.'))canonical.set(id,d);}
  const changes=new Map<string,{id:string;type:string;fields:any}>();
  const stage=(id:string,type:string,fields:any)=>changes.set(id,{id,type,fields:{...(changes.get(id)?.fields||{}),...fields}});
  const assign=(doc:any)=>{const id=doc._id.replace(/^drafts\./,'');if(!doc.channel?.includes(CHANNEL))stage(id,doc._type,{channel:[...(doc.channel||[]),CHANNEL]});return id;};
  const identities:any[]=[];
  for(const campaign of campaigns){
    const targetName=clientName(campaign.client);
    const matches=[...canonical.values()].filter(d=>d._type==='client'&&d.language==='en'&&normalise(d.name)===normalise(targetName));assert(matches.length<2,`Ambiguous client ${targetName}`);
    const existing=matches[0];
    const clientId=existing?assign(existing):`client-renaissance-${slugify(targetName)}-en`;
    if(!existing)stage(clientId,'client',{name:targetName,slug:{_type:'slug',current:slugify(targetName)},language:'en',channel:[CHANNEL]});
    identities.push({campaign:campaign.page,clientSource:campaign.client,clientName:targetName,clientId});
    if(campaign.id===PILOT){const current=canonical.get(PILOT);assert(current?.siteContent?.some((e:any)=>e.channel===CHANNEL));stage(PILOT,'caseStudy',{siteContent:current.siteContent.map((e:any)=>e.channel===CHANNEL?{...e,discovery:campaign.discovery}:e)});continue;}
    const collision=[...canonical.values()].find(d=>d._type==='caseStudy'&&d.language==='en'&&d._id!==`drafts.${campaign.id}`&&(normalise(d.title||'')===normalise(campaign.title)||d.slug?.current===campaign.slug));assert(!collision,`Campaign identity needs reconciliation: ${campaign.title}`);
    stage(campaign.id,'caseStudy',{title:campaign.title,slug:{_type:'slug',current:campaign.slug},description:campaign.summary,seo:{title:campaign.title,description:campaign.summary},language:'en',channel:[CHANNEL],isPublished:true,publishedAt:campaign.date,mainImage:asset(campaign.heroUrl),client:ref(clientId,'client'),units:[{_key:'renaissance',...ref(UNIT,'unit')}],discovery:campaign.discovery,casesPageBuilder:campaign.body});
  }
  const portraits=legacy.team.map(person=>{
    const matches=[...canonical.values()].filter(d=>d._type==='person'&&d.language==='en'&&[d.name,d.fullname].some(n=>n&&normalise(n)===normalise(person.name)));assert(matches.length<2,`Ambiguous person ${person.name}`);
    const existing=matches[0],id=existing?assign(existing):`person-renaissance-${slugify(person.name)}-en`;
    if(!existing)stage(id,'person',{name:person.name,fullname:person.name,slug:{_type:'slug',current:slugify(person.name)},language:'en',channel:[CHANNEL],unit:ref(UNIT,'unit'),image:asset(person.imageUrl),...(person.position?{position:person.position}:{})});
    return {_key:slugify(person.name),_type:'renaissancePortrait',person:ref(id,'person'),name:person.name,image:asset(person.imageUrl),...(person.position?{position:person.position}:{})};
  });
  const awards={...canonical.get('renaissance-shared-awards-en').content,headline:'Awards & recognition',description:copy(12),logos:legacy.awards.map(a=>({_key:slugify(a.name),_type:'renaissanceAwardLogo',name:a.name,image:asset(a.imageUrl)}))};
  stage('renaissance-shared-awards-en','renaissanceSharedAwards',{content:awards});
  // Named global references also repair repeated/anonymous homepage portraits.
  const selectedNames=['Stefano Petrullo','Emily Britt','Greg Jones','Aaron Cooper','Jessica Timms'];
  stage('renaissance-shared-portraits-en','renaissanceSharedPortraits',{content:{_type:'renaissancePortraitGrid',displayMode:'selection',portraits:selectedNames.map(name=>portraits.find(p=>p.name===name))}});
  const home=canonical.get('page-renaissance-home-en');assert(home?.content?.length);
  const homeContent=structuredClone(home.content).map((b:any)=>{
    switch(b._key){
      case 'renaissance-home-hero':return {...b,heading:copy(4),headingTag:'h1',subheading:'',paragraphs:[]};
      case 'renaissance-stories-intro':return {...b,...intro(b._key,copy(5),copy(6))};
      case 'renaissance-services-intro':return {...b,...intro(b._key,copy(7),'')};
      case 'renaissance-services':return {...b,columns:2,cards:[8,9,10,11].map((row,i)=>{const [headline,...rest]=copy(row).split(' - ');return {_type:'cardInsideComponent',_key:`rpr-v4-${row}`,headline,text:rest.join(' - '),...(i<2?{media:b.cards[i].media}:{})};})};
      case 'renaissance-people-intro':return {...b,...intro(b._key,copy(25),copy(26))};
      case 'renaissance-origin':return {...b,title:'Since 2015'};
      case 'renaissance-register':return {...b,headline:copy(13),description:copy(14),cards:b.cards.map((c:any)=>({...c,link:{...c.link,externalUrl:'/contact#registration'}}))};
      case 'renaissance-stories':return {...b,items:b.items.map((item:any,i:number)=>{const c=campaigns.find(c=>c.sourceRows.includes(i===0?55:61));assert(c);return {...item,title:c.title,subtitle:i===0?'Global launch campaign · 2026':'Launch campaign',description:c.summary,cta:cta('Read the case study',`/cases/${c.slug}`)};})};
      default:return b;
    }
  });
  stage('page-renaissance-home-en','page',{metadata:{...home.metadata,title:copy(2),description:copy(3)},content:homeContent});
  const baseHero=home.content[0];
  const hero=(key:string,h:number,p:number)=>({...baseHero,_key:key,heading:copy(h),headingTag:'h1',subheading:'',paragraphs:[copy(p)],additionalContent:[],navPointName:undefined});
  const page=(slug:string,title:string,content:any[],description:string)=>stage(`page-renaissance-${slug}-en`,'page',{title,slug:{_type:'slug',current:slug},channel:CHANNEL,language:'en',isHomepage:false,navbarVariant:'light',metadata:{_type:'metadata',title:`${title} | Renaissance PR`,description},content});
  page('services','Services',[hero('rpr-v4-services-hero',16,17),...[18,19,20,21].map(row=>{const [title,...rest]=copy(row).split(':');return section(`rpr-v4-${row}`,title,rest.join(':').trim(),slugify(title));}),section('rpr-v4-23',copy(22),copy(23)),section('rpr-v4-24','Events',copy(24))],copy(17));
  page('about-us','About us',[hero('rpr-v4-about-hero',25,26),{_key:'rpr-v4-team',_type:'renaissancePortraitGrid',displayMode:'directory',portraits},section('rpr-v4-28','How we work',copy(28)),{_key:'rpr-v4-about-awards',_type:'renaissanceSharedContentReference',sharedContent:ref('renaissance-shared-awards-en','renaissanceSharedAwards')}],copy(26));
  const clients=canonical.get('page-renaissance-clients-en');
  stage('page-renaissance-clients-en','page',{metadata:{_type:'metadata',title:'Clients | Renaissance PR',description:copy(30)},content:clients.content.map((b:any)=>b._type==='heroShowTime'?{...b,useVideo:baseHero.useVideo,backgroundImage:baseHero.backgroundImage,backgroundVideo:baseHero.backgroundVideo,additionalContent:[{_key:'case-studies',...cta('Explore the case studies','/cases')}]}:b)});
  const contact=canonical.get('page-renaissance-contact-en');assert(contact);
  const registration=section('rpr-v4-registration',copy(34),copy(35),'registration');
  registration.content=[pt(copy(35),'rpr-v4-35'),{...pt('Register as a content creator','rpr-v4-creator-link'),markDefs:[{_key:'form',_type:'link',href:legacy.registrationUrls[0],blank:true}],children:[{_key:'link',_type:'span',marks:['form'],text:'Register as a content creator'}]},pt(copy(36),'rpr-v4-36'),{...pt('Register as media','rpr-v4-media-link'),markDefs:[{_key:'form',_type:'link',href:legacy.registrationUrls[1],blank:true}],children:[{_key:'link',_type:'span',marks:['form'],text:'Register as media'}]}] as any;
  page('contact','Contact', [intro('rpr-v4-contact-intro',copy(31),copy(32),true),section('rpr-v4-33','Contact details',copy(33)),registration],copy(32));
  stage('page-renaissance-contact-en','page',{contactForm:{...contact.contactForm,headline:'Tell us about your game',subheadline:'',description:'',submitLabel:'Open email app'}});
  page('cases','Case studies',[hero('rpr-v4-cases-hero',37,38),{_type:'casesGalleryFilteredWithPagination',_key:'rpr-v4-cases',selectionMode:'auto',showFilters:true,rowsPerPage:12}],copy(38));
  stage('menu-renaissance-navbar-en','menu',{title:'Navigation',menuType:'Navbar',channel:CHANNEL,language:'en',imageCloud:canonical.get('menu-renaissance-footer-en').imageCloud,menuItems:['services','cases','about-us','clients','contact'].map((slug,i)=>({_type:'object',_key:slug,page:ref(`page-renaissance-${slug}-en`,'page'),displayName:['Services','Cases','About','Clients','Contact'][i]}))});
  stage('menu-renaissance-footer-en','menu',{renaissanceLegalText:copy(15)});
  stage('site-settings-renaissanceWeb-en','siteSettings',{renaissanceEnquiryEmail:'martin@definition.studio'});
  const plan={changes:[...changes.values()],identities,homeContent,awards,portraits};
  return JSON.parse(JSON.stringify(plan)) as typeof plan;
}
