import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { getCliClient } from 'sanity/cli';
import { HOME_PAGE_QUERY, PAGE_QUERY } from '../packages/sanity-queries/src/groq';

const APPLY = process.env.RENAISSANCE_LOGOS_APPLY === '1';
const ROOT = 'EXPORT/renaissance-rewrite-v4/logos';
const CHANNEL = 'renaissanceWeb';
const HELD: Record<string, string> = {
  'Amazon_Kids.jpg': 'Confirm sub-brand identity versus the existing Amazon client.',
  'Tencent_Games.jpg': 'Confirm games-brand identity versus the existing Tencent client.',
  'Wired.jpg': 'Supplied artwork is a photograph/graphic; verify intended logo.',
  'Limit_Break.jpg': 'Artwork names Limit Break Mentorship; verify intended identity.',
};
const names: Record<string, string> = { '3d Clouds': '3DClouds', Futurlab: 'FuturLab', Pqube: 'PQube', Netease: 'NetEase', 'My Games': 'MY.GAMES', Timi: 'TiMi', Hook: 'HOOK' };
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (d: any) => { const { _rev, _createdAt, _updatedAt, ...body } = d; return body; };
const ref = (id: string, type: string) => ({ _type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: { type } });
const save = (name: string, data: unknown) => writeFileSync(`${ROOT}/${name}.json`, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });

async function upload(file: any) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  assert(cloud && key && secret, 'Cloudinary configuration missing');
  const publicId = `renaissance/clients/v4/${slugify(file.displayName)}-${file.sha256.slice(0,12)}`;
  // Deterministic public ID and overwrite=false make retries safe, even after a partial import.
  const params = { asset_folder: '1sp/Logos/RENAISSANCE/Clients', display_name: file.displayName, overwrite: 'false', public_id: publicId, timestamp: String(Math.floor(Date.now()/1000)), unique_filename: 'false' };
  const signature = createHash('sha1').update(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&') + secret).digest('hex');
  const form = new FormData();
  for (const [k,v] of Object.entries(params)) form.append(k,v);
  form.append('api_key', key); form.append('signature', signature);
  form.append('file', new Blob([readFileSync(`${ROOT}/originals/${file.filename}`)], { type: 'image/jpeg' }), file.filename);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  const body = await response.json();
  assert(response.ok, `Logo upload failed (${response.status}): ${file.filename}`);
  return { _type: 'cloudinary.asset', id: body.asset_id, public_id: body.public_id, secure_url: body.secure_url, width: body.width, height: body.height, format: body.format, resource_type: body.resource_type, type: body.type, version: body.version };
}

async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, 'production');
  const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({ projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'raw' });
  assert(client.config().token, 'Use sanity exec --with-user-token');
  mkdirSync(`${ROOT}/originals`, { recursive: true, mode: 0o700 });
  const all = await client.fetch<any[]>('*[_type == "client" || (_type == "page" && channel == $channel && language == "en") || (_type == "renaissanceClientCollection" && channel == $channel)]', { channel: CHANNEL });
  const clients = all.filter(d => d._type === 'client' && d.language === 'en');
  const canonical = new Map<string, any>();
  for (const d of clients) { const id = d._id.replace(/^drafts\./,''); if (!canonical.has(id) || d._id.startsWith('drafts.')) canonical.set(id,d); }
  if (existsSync(`${ROOT}/verification.json`) && all.some(d=>d._id==='drafts.page-renaissance-clients-en')) {
    const page = all.find(d=>d._id==='drafts.page-renaissance-clients-en');
    const hero = page?.content?.find((b:any)=>b._key==='rpr-v4-clients-hero');
    if(APPLY && hero && hero.subheading === undefined) {
      save(`before-clients-subheading-${new Date().toISOString().replaceAll(':','-')}`,page);
      await client.patch(page._id).ifRevisionId(page._rev).set({'content[_key=="rpr-v4-clients-hero"].subheading':''}).commit();
    }
    console.log('Logo import already completed. Existing editorial changes are preserved; no assets or clients are recreated.');
    return;
  }
  const inventory = JSON.parse(readFileSync('scripts/data/renaissance-logo-inventory.json','utf8'));
  const items = inventory.map((f: any) => {
    const bytes = readFileSync(`/Users/martin/Downloads/Logos/${f.filename}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256, `Source changed: ${f.filename}`);
    copyFileSync(`/Users/martin/Downloads/Logos/${f.filename}`, `${ROOT}/originals/${f.filename}`);
    const displayName = names[f.displayName] || f.displayName;
    const matches = [...canonical.values()].filter(d=>[d.name,d.slug?.current].some(n=>n && normalise(n)===normalise(displayName)));
    assert(matches.length < 2, `Ambiguous client identity: ${displayName}`);
    const existing = matches[0];
    return { ...f, displayName, status: HELD[f.filename] ? 'held' : existing ? 'reuse' : 'new', reason: HELD[f.filename], clientId: existing?._id.replace(/^drafts\./,'') || `client-renaissance-${slugify(displayName)}-en`, collectionId: 'renaissance-clients-v4-en' };
  });
  save('plan', { projectId:'wu6i3y0h', dataset:'production', mode: APPLY?'apply':'dry-run', items });
  console.log(JSON.stringify({ mode: APPLY?'apply':'dry-run', total:items.length, held:items.filter((x:any)=>x.status==='held').map((x:any)=>x.filename), reuse:items.filter((x:any)=>x.status==='reuse').map((x:any)=>({name:x.displayName,id:x.clientId})), create:items.filter((x:any)=>x.status==='new').length }));
  if (!APPLY) return;
  assert.equal(createHash('sha256').update(readFileSync('EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz')).digest('hex'),'4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18');
  const stamp = new Date().toISOString().replaceAll(':','-');
  save(`before-${stamp}`, all);
  const publishedBefore = all.filter(d=>!d._id.startsWith('drafts.'));
  const assets: any[] = [];
  for (const item of items) {
    if(item.status==='held') { assets.push(item); continue; }
    const asset = await upload(item); assets.push({...item, asset});
    save('manifest', assets);
    if(assets.length%10===0) console.log(`${assets.length}/${items.length} logo files accounted for`);
  }
  const tx = client.transaction();
  const changes: any[] = [];
  async function stage(id: string, type: string, fields: any) {
    const published = all.find(d=>d._id===id), draft = all.find(d=>d._id===`drafts.${id}`);
    const body = { ...clean(draft || published || {_type:type}), ...fields, _id:`drafts.${id}` };
    if(draft) tx.patch(draft._id,p=>p.ifRevisionId(draft._rev).set(fields));
    else {
      if(published) assert.equal((await client.getDocument(id))?._rev, published._rev, `Source changed: ${id}`);
      tx.create(body);
    }
    changes.push(body);
  }
  for (const item of assets.filter(x=>x.asset)) {
    const existing = canonical.get(item.clientId);
    if(existing) {
      if(!existing.channel?.includes(CHANNEL)) await stage(item.clientId,'client',{channel:[...(existing.channel||[]),CHANNEL]});
    } else await stage(item.clientId,'client',{ name:item.displayName, slug:{_type:'slug',current:slugify(item.displayName)}, language:'en',channel:[CHANNEL], logo:item.asset });
  }
  const usable = assets.filter(x=>x.asset).sort((a,b)=>a.displayName.localeCompare(b.displayName));
  const entries = usable.map(item=>({_type:'renaissanceClientItem',_key:item.sha256.slice(0,16),client:ref(item.clientId,'client'),logoOverride:item.asset,displayName:item.displayName,altText:item.displayName}));
  const curated = new Set(['GSC Game World','Funcom','Mob Entertainment','Curve Games','Team17','Atari','Revolution','Private Division','505 Games','Grasshopper Manufacture','IIDEA','Ember Lab']);
  await stage('renaissance-clients-v4-en','renaissanceClientCollection',{title:'Clients — supplied v4 roster',channel:CHANNEL,language:'en',items:entries});
  await stage('renaissance-clients-home-v4-en','renaissanceClientCollection',{title:'Homepage — selected Renaissance clients',channel:CHANNEL,language:'en',items:entries.filter(e=>curated.has(e.displayName))});
  const homepage = all.find(d=>d._id==='drafts.page-renaissance-home-en') || all.find(d=>d._id==='page-renaissance-home-en');
  assert(homepage?.content?.some((b:any)=>b._key==='renaissance-client-logos'));
  await stage('page-renaissance-home-en','page',{content:homepage.content.map((b:any)=>b._key==='renaissance-client-logos'?{...b,selectionMode:'collection',collection:ref('renaissance-clients-home-v4-en','renaissanceClientCollection'),grayscale:false}:b)});
  const rows=JSON.parse(readFileSync('scripts/data/renaissance-rewrite-v4.json','utf8')).rows;
  const copy=(n:number)=>rows.find((r:any)=>r.row===n).rewrite;
  const clientsPage = all.find(d=>d._id==='drafts.page-renaissance-clients-en') || all.find(d=>d._id==='page-renaissance-clients-en');
  assert(!clientsPage,'Reconcile the existing Clients page before rerunning this first import');
  await stage('page-renaissance-clients-en','page',{title:'Clients',slug:{_type:'slug',current:'clients'},channel:CHANNEL,language:'en',isHomepage:false,content:[
    {_type:'heroShowTime',_key:'rpr-v4-clients-hero',heading:copy(29),headingTag:'h1',subheading:'',paragraphs:[copy(30)],fullWidth:true},
    {_type:'clientLogoCarousel',_key:'rpr-v4-clients-grid',selectionMode:'collection',collection:ref('renaissance-clients-v4-en','renaissanceClientCollection'),displayMode:'grid',grayscale:false},
  ]});
  save(`mutations-${stamp}`,changes);
  await tx.commit();
  const afterPublished = await client.fetch('*[_id in $ids]',{ids:publishedBefore.map(d=>d._id)});
  assert.deepEqual(afterPublished.sort((a:any,b:any)=>a._id.localeCompare(b._id)),publishedBefore.sort((a,b)=>a._id.localeCompare(b._id)),'Published documents changed');
  const params = {channel:CHANNEL,language:'en',slug:'clients'};
  const page:any = await client.fetch(PAGE_QUERY,params,{perspective:'drafts'});
  assert.equal(page.content[1].collectionClients.length,usable.length);
  const home:any = await client.fetch(HOME_PAGE_QUERY,params,{perspective:'drafts'});
  assert.equal(home.content.find((b:any)=>b._key==='renaissance-client-logos').collectionClients.length,curated.size);
  assert.equal(await client.fetch(PAGE_QUERY,params,{perspective:'published'}),null);
  save('verification',{draftsWritten:changes.length,logos:usable.length,held:items.length-usable.length,homeLogos:curated.size,publishedUnchanged:true,clientsPagePublished:false});
  console.log(JSON.stringify({draftsWritten:changes.length,logos:usable.length,homeLogos:curated.size,published:false}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
