import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildContentPlan,campaigns,CHANNEL,PILOT,redirects,copy} from './renaissance-content-model';
import legacy from './data/renaissance-legacy-v4.json';
import {CASE_STUDIES_QUERY,CASE_STUDY_BY_SLUG_QUERY,PAGE_QUERY,HOME_PAGE_QUERY} from '../packages/sanity-queries/src/groq';
const ROOT='EXPORT/renaissance-rewrite-v4/content';
const APPLY=process.env.RENAISSANCE_CONTENT_APPLY==='1';
const save=(name:string,data:unknown)=>writeFileSync(`${ROOT}/${name}.json`,JSON.stringify(data,null,2)+'\n',{mode:0o600});
const clean=(d:any)=>{const {_rev,_createdAt,_updatedAt,_system,...body}=d;return body;};
const snapshotQuery='*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
async function upload(url:string){
 const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;assert(cloud&&key&&secret,'Missing Cloudinary credentials');
 const hash=createHash('sha256').update(url).digest('hex');
 const params={asset_folder:'1sp/RENAISSANCE/Rewrite-v4',display_name:new URL(url).pathname.split('/').pop()!.slice(0,100),overwrite:'false',public_id:`renaissance/rewrite-v4/${hash.slice(0,24)}`,timestamp:String(Math.floor(Date.now()/1000)),unique_filename:'false'};
 const signature=createHash('sha1').update(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&')+secret).digest('hex');
 const form=new FormData();Object.entries(params).forEach(([k,v])=>form.append(k,v));form.append('api_key',key);form.append('signature',signature);form.append('file',url);
 const response=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`,{method:'POST',body:form});const body=await response.json();assert(response.ok,`Asset upload failed (${response.status}): ${url}`);
 assert(body.secure_url&&body.width&&body.height,'Upload returned incomplete asset');
 return {_type:'cloudinary.asset',id:body.asset_id,public_id:body.public_id,secure_url:body.secure_url,width:body.width,height:body.height,format:body.format,resource_type:body.resource_type,type:body.type,version:body.version};
}
async function main(){
 assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',useCdn:false,perspective:'raw'});assert(client.config().token,'Use sanity exec --with-user-token');
 mkdirSync(ROOT,{recursive:true,mode:0o700});
 if(existsSync(`${ROOT}/verification.json`)){console.log('Content migration already completed; preserving editorial changes.');return;}
 const all=await client.fetch<any[]>(snapshotQuery);
 const needed=new Set<string>();
 const plan=buildContentPlan(all,url=>{needed.add(url);return {_type:'cloudinary.asset',secure_url:url};});
 const sources=[...needed];
 const summary={mode:APPLY?'apply':'dry-run',projectId:'wu6i3y0h',dataset:'production',channel:CHANNEL,language:'en',drafts:plan.changes.length,newDrafts:plan.changes.filter(c=>!all.some(d=>d._id===`drafts.${c.id}`)).length,assets:sources.length,cases:campaigns.length,people:plan.portraits.length,sourceRows:169,publish:false};
 save('plan',{...summary,changes:plan.changes,identities:plan.identities,assetSources:sources,redirects});console.log(JSON.stringify(summary));
 if(!APPLY)return;
 assert.equal(createHash('sha256').update(readFileSync('EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz')).digest('hex'),'4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18');
 const stamp=new Date().toISOString().replaceAll(':','-');save(`before-${stamp}`,all);
 const assets:Record<string,any>=existsSync(`${ROOT}/assets.json`)?JSON.parse(readFileSync(`${ROOT}/assets.json`,'utf8')):{};
 for(let i=0;i<sources.length;i+=3){await Promise.all(sources.slice(i,i+3).map(async url=>{if(!assets[url])assets[url]=await upload(url);}));save('assets',assets);if(i%12===0)console.log(`Assets ready: ${Math.min(i+3,sources.length)}/${sources.length}`);}
 const final=buildContentPlan(all,url=>{assert(assets[url]);return assets[url];});
 const fresh=await client.fetch<any[]>(snapshotQuery);
 const affected=new Set(final.changes.flatMap(c=>[c.id,`drafts.${c.id}`]));
 for(const id of affected)assert.equal(fresh.find(d=>d._id===id)?._rev,all.find(d=>d._id===id)?._rev,`Document changed during preparation: ${id}`);
 const tx=client.transaction(); const mutations:any[]=[];
 for(const change of final.changes){
  const draft=all.find(d=>d._id===`drafts.${change.id}`),published=all.find(d=>d._id===change.id);
  const body={...clean(draft||published||{_type:change.type}),...change.fields,_id:`drafts.${change.id}`};
  if(draft)tx.patch(draft._id,p=>p.ifRevisionId(draft._rev).set(change.fields));else tx.create(body);
  mutations.push(body);
 }
 save(`mutations-${stamp}`,mutations);save('applied-plan',{summary,identities:final.identities,mutations});
 await tx.commit();
 const after=await client.fetch<any[]>(snapshotQuery);
 const written=new Set(mutations.map(d=>d._id));
 for(const d of all.filter(d=>!written.has(d._id)))assert.deepEqual(after.find(a=>a._id===d._id),d,`Unrelated document changed: ${d._id}`);
 for(const expected of mutations){const actual=after.find(d=>d._id===expected._id);assert(actual,`Missing draft ${expected._id}`);assert.deepEqual(clean(actual),expected);}
 const params={channel:CHANNEL,language:'en'};
 const cases=await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'drafts'});assert.equal(cases.length,66);
 for(const c of campaigns){const resolved=await client.fetch<any>(CASE_STUDY_BY_SLUG_QUERY,{...params,slug:c.slug},{perspective:'drafts'});assert(resolved);assert.deepEqual(resolved.casesPageBuilder.map((b:any)=>b.description),c.body.map(b=>b.description));assert.deepEqual(resolved.discovery,c.discovery);}
 for(const slug of ['services','about-us','clients','contact','cases'])assert(await client.fetch(PAGE_QUERY,{...params,slug},{perspective:'drafts'}));
 const home=await client.fetch<any>(HOME_PAGE_QUERY,params,{perspective:'drafts'});assert.equal(home.content[0].heading,copy(4));
 assert.equal((await client.fetch<any[]>(CASE_STUDIES_QUERY,params,{perspective:'published'})).length,0);
 const verification={...summary,draftsWritten:mutations.length,assets:sources.length,allOtherDocumentsUnchanged:true,publishedDocumentsUnchanged:all.filter(d=>!d._id.startsWith('drafts.')).length,caseDetailQueriesVerified:66,caseIndexCount:cases.length,team:final.portraits.length,awards:legacy.awards.length,enquiryEmail:after.find(d=>d._id==='drafts.site-settings-renaissanceWeb-en')?.renaissanceEnquiryEmail,completedAt:new Date().toISOString()};
 save('verification',verification);console.log(JSON.stringify(verification));
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
