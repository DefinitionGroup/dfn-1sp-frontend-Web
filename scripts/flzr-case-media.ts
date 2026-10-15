import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

// Replaces rotated stand-in hero media on FLZR cases with the case's own image
// from flzr.com/references. Defaults to a dry run: downloads and measures the
// sources, writes EXPORT/flzr-case-media/plan.{json,md}, uploads and patches nothing.
//   pnpm exec sanity exec scripts/flzr-case-media.ts --with-user-token
//   FLZR_CASE_MEDIA_MODE=apply pnpm exec sanity exec scripts/flzr-case-media.ts --with-user-token

const MODE = process.env.FLZR_CASE_MEDIA_MODE === 'apply' ? 'apply' : 'dry-run';
const OUT = process.env.FLZR_CASE_MEDIA_OUT || 'EXPORT/flzr-case-media';
const WP = 'https://flzr.com/wp-content/uploads/';
const ASSET_FOLDER = '1sp/FLZR/Cases';

// Assets uploaded for one specific case. On any other case they are stand-ins.
const OWNERS: Record<string, string> = {
  sony_tvs_with_girl_lhfjxu: '7dbf1a02-91d6-4e57-93d5-d378c7ec02f8',
  'flzr/content-2026/bose-q4-in-store': 'case-flizr-bose-q4-en',
  'flzr/content-2026/bose-q4-results-poster-3s10': 'case-flizr-bose-q4-en',
  'flzr/content-2026/o2-studio-vr-loop': 'case-flizr-o2-studio-en',
  'flzr/content-2026/o2-studio-main-still': 'case-flizr-o2-studio-en',
};

// Relaunch videos on their own cases that editorial still wants replaced by the
// flzr.com reference image (they surface on the home case slider).
const RETIRE_OWN_VIDEO = new Set(['7dbf1a02-91d6-4e57-93d5-d378c7ec02f8', 'case-flizr-bose-q4-en', 'case-flizr-o2-studio-en']);

// Case → image FLZR shows for it on flzr.com/references (page order = reference number),
// plus other FLZR uploads of the same client for editorial review.
const SOURCES: Record<string, {primary: string; alternates?: string[]}> = {
  '7dbf1a02-91d6-4e57-93d5-d378c7ec02f8': {primary: '2024/02/referenzprojekt-sony.webp', alternates: ['2024/01/pos-management-sony.webp']},
  'case-flizr-o2-studio-en': {primary: '2024/01/referenzprojekt-o2-studio.webp', alternates: ['2025/10/o2-900x900-1.jpg']},
  'case-flzr-reference-03-en': {primary: '2024/01/referenzprojekt-it.webp'},
  'case-flzr-reference-04-en': {primary: '2024/01/referenzprojekt-olympus.webp'},
  'case-flizr-bose-q4-en': {primary: '2024/10/referenz-bose.webp'},
  'case-flzr-reference-06-en': {primary: '2024/01/referenzprojekt-microsoft.webp', alternates: ['2023/11/referenz-microsoft.webp', '2024/01/referenz-microsoft3.webp', '2024/01/pos-management-microsoft.webp']},
  'case-flzr-reference-07-en': {primary: '2024/01/referenzprojekt-telefonica.webp', alternates: ['2024/01/referenz-telefonica2.webp', '2023/11/referenz-telefonica.webp', '2023/11/referenz-telefonica_2.webp']},
  'case-flzr-reference-08-en': {primary: '2024/01/referenzprojekt-ledvance.webp', alternates: ['2024/01/trainings-ledvance.webp']},
  'case-flzr-reference-09-en': {primary: '2024/10/referenz-mediasaturn.webp', alternates: ['2024/01/referenz-videoberatung-saturn.webp']},
  'case-flzr-reference-10-en': {primary: '2024/01/referenzprojekt-intel.webp', alternates: ['2024/01/referenz-intel2.webp', '2023/11/referenz-intel.webp']},
  'case-flzr-reference-11-en': {primary: '2024/02/referenzprojekt-microsoft2.webp', alternates: ['2024/01/referenz-microsoft2.webp']},
  'case-flzr-reference-12-en': {primary: '2024/02/referenzprojekt-bosch-you.webp'},
  'case-flzr-reference-13-en': {primary: '2024/01/referenzprojekt-bauknecht2.webp'},
  'case-flzr-reference-14-en': {primary: '2024/01/referenzprojekt-krups.webp'},
  'case-flzr-reference-15-en': {primary: '2024/01/referenzprojekt-obi.webp', alternates: ['2023/11/referenz-obi.webp']},
  'case-flzr-reference-16-en': {primary: '2024/01/referenzprojekt-bauknecht3.webp'},
  'case-flzr-reference-17-en': {primary: '2024/01/referenzprojekt-toom.webp'},
  'case-flzr-reference-18-en': {primary: '2024/01/referenzprojekt-osram.webp'},
  'case-flzr-reference-19-en': {primary: '2024/01/referenzprojekt-tchibo.webp'},
  'case-flzr-reference-20-en': {primary: '2024/01/referenzprojekt-karslberg.webp'},
  'case-flzr-reference-21-en': {primary: '2024/01/referenzprojekt-spreequell.webp'},
  'case-flzr-reference-22-en': {primary: '2024/01/referenzprojekt-markisches-landbrot.webp', alternates: ['2023/11/referenz-maerkisches-landbrot.webp']},
  'case-flzr-reference-23-en': {primary: '2024/01/referenzprojekt-emmi.webp'},
  'case-flzr-reference-24-en': {primary: '2024/01/referenzprojekt-mueller.webp', alternates: ['2023/11/referenz-mueller-schaufenster.webp', '2024/01/pos-management-mueller-nivea.webp']},
  'case-flzr-reference-25-en': {primary: '2024/01/referenzprojekt-fjallraven.webp'},
  'case-flzr-reference-26-en': {primary: '2024/01/referenzprojekt-mueller-shiseido.webp'},
  'case-flzr-reference-27-en': {primary: '2024/01/referenzprojekt-lov.webp', alternates: ['2023/11/referenz-lov-cosmetics.webp']},
  'case-flzr-reference-28-en': {primary: '2024/01/referenzprojekt-leonardo.webp', alternates: ['2023/11/referenz-leonardo.webp', '2024/01/pos-management-leonardo.webp']},
  'case-flzr-reference-29-en': {primary: '2024/01/referenzprojekt-mueller-magix.webp'},
  'case-flzr-reference-30-en': {primary: '2024/01/referenzprojekt-mattel.webp', alternates: ['2024/01/pos-management-mattel.webp']},
  'case-flzr-reference-31-en': {primary: '2024/01/referenzprojekt-justdance.webp'},
  'case-flzr-reference-32-en': {primary: '2024/01/referenzprojekt-ubisoft.webp', alternates: ['2024/01/referenz-ubisoft.webp', '2024/01/pos-management-ubisoft.webp']},
  'case-flzr-reference-33-en': {primary: '2024/01/referenzprojekt-playstation.webp', alternates: ['2024/01/referenz-sony-playstation.webp', '2024/01/pos-management-playstation.webp']},
};

// Same project on another site, confirmed editorially; its media wins over flzr.com.
// Other same-client hits are only reported (see plan.md) because they cover other projects.
const CROSS_SITE: Record<string, string> = {
  'case-flzr-reference-06-en': 'case-msm-microsoft-trainings-en',
};

type Asset = {public_id?: string; secure_url?: string; resource_type?: string} | null;
type Source = {path: string; url: string; bytes: number; width: number; height: number; format: string; sha256: string};

const publicIdOf = (a: Asset) => a?.public_id?.replace(/\.[a-z0-9]+$/i, '') ?? null;
const role = (a: Asset, caseId: string) => {
  const id = publicIdOf(a);
  if (!id) return 'none';
  const owner = OWNERS[id];
  if (owner === caseId && RETIRE_OWN_VIDEO.has(caseId)) return 'stand-in';
  return !owner || owner === caseId ? 'own' : 'stand-in';
};

function dimensions(buf: Buffer): {width: number; height: number; format: string} {
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return {width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3), format: 'webp'};
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return {width: 1 + (b & 0x3fff), height: 1 + ((b >> 14) & 0x3fff), format: 'webp'};
    }
    return {width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, format: 'webp'};
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i < buf.length;) {
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return {width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), format: 'jpg'};
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (buf.toString('ascii', 1, 4) === 'PNG') return {width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: 'png'};
  throw new Error('Unknown image format');
}

async function fetchSource(path: string): Promise<Source> {
  const file = `${OUT}/sources/${path.replaceAll('/', '_')}`;
  const url = WP + path;
  if (!existsSync(file)) {
    const res = await fetch(url, {headers: {'user-agent': 'Mozilla/5.0 (1SP media migration)'}, signal: AbortSignal.timeout(60000)});
    assert(res.ok, `HTTP ${res.status} for ${url}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const buf = readFileSync(file);
  return {path, url, bytes: buf.length, ...dimensions(buf), sha256: createHash('sha256').update(buf).digest('hex')};
}

async function upload(caseSlug: string, source: Source) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  assert(cloud && key && secret, 'Cloudinary credentials unavailable');
  const params = {asset_folder: ASSET_FOLDER, display_name: caseSlug, overwrite: 'false', public_id: `flzr/cases/${caseSlug}`, timestamp: String(Math.floor(Date.now() / 1000)), unique_filename: 'false'};
  const signature = createHash('sha1').update(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&') + secret).digest('hex');
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, v));
  form.append('api_key', key);
  form.append('signature', signature);
  form.append('file', source.url);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {method: 'POST', body: form, signal: AbortSignal.timeout(120000)});
  const body = await res.json();
  assert(res.ok, `Cloudinary ${res.status}: ${body.error?.message || 'upload failed'}`);
  return {_type: 'cloudinary.asset', display_name: body.display_name, format: body.format, height: body.height, public_id: body.public_id, resource_type: body.resource_type, secure_url: body.secure_url, type: body.type, url: body.url, version: body.version, width: body.width};
}

async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, 'production');
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId: 'wu6i3y0h', dataset: 'production', perspective: 'raw', useCdn: false});
  assert(client.config().token, 'Run with sanity exec --with-user-token');
  mkdirSync(`${OUT}/sources`, {recursive: true, mode: 0o700});

  const cases = await client.fetch<any[]>(`*[_type == "caseStudy" && "flizrWeb" in channel]{
    _id, _rev, title, language, channel, "slug": slug.current, "client": client->name,
    mainImage, mainVideo, isVerticalVideo, "flzrEdition": siteContent[channel == "flizrWeb"][0]{mediaMode}
  } | order(_id asc)`);
  const others = await client.fetch<any[]>(`*[_type == "caseStudy" && !("flizrWeb" in channel) && !(_id in path("drafts.**"))]{
    _id, title, channel, "slug": slug.current, "client": client->name,
    "image": coalesce(mainImage.secure_url, mainImage.url), "video": coalesce(mainVideo.secure_url, mainVideo.url)
  }`);
  assert(!cases.some(c => c._id.startsWith('drafts.')), 'FLZR case drafts exist; reconcile them first');

  const crossSite = await client.fetch<any[]>('*[_id in $ids]{_id, title, mainImage, mainVideo, isVerticalVideo}', {ids: Object.values(CROSS_SITE)});
  const rows = [];
  for (const c of cases) {
    const image = role(c.mainImage, c._id), video = role(c.mainVideo, c._id);
    const shared = c.channel.length > 1;
    const clientKey = (c.client || c.title).split(/[\s/]+/)[0].toLowerCase();
    const sameClient = others.filter(o => (o.client || '').toLowerCase().split(/[\s/|]+/).includes(clientKey)).map(o => ({id: o._id, title: o.title, channel: o.channel, image: Boolean(o.image), video: Boolean(o.video)}));
    const plan = SOURCES[c._id];
    let action: string, reason: string;
    const donor = crossSite.find(d => d._id === CROSS_SITE[c._id]);
    if (donor && c.mainImage?.public_id === donor.mainImage?.public_id && video === 'none') {action = 'keep'; reason = `already uses ${donor._id} media`;}
    else if (CROSS_SITE[c._id]) {
      assert(donor?.mainImage?.secure_url, `Cross-site source has no image: ${CROSS_SITE[c._id]}`);
      action = 'reuse-cross-site'; reason = `same project as ${donor.title} (${donor._id})`;
    }
    else if (shared) {action = 'keep'; reason = `shared with ${c.channel.filter((ch: string) => ch !== 'flizrWeb').join(', ')}; already carries that case's media`;}
    else if (!plan) {action = 'review'; reason = 'no FLZR source mapped';}
    else if (image === 'own' && video !== 'stand-in') {action = 'keep'; reason = 'own media already set';}
    else {action = 'replace'; reason = [image === 'stand-in' && 'image is a stand-in', image === 'none' && 'no image', video === 'stand-in' && 'video is a stand-in'].filter(Boolean).join(', ');}

    const primary = plan && action === 'replace' ? await fetchSource(plan.primary) : null;
    const alternates = plan?.alternates ? await Promise.all(plan.alternates.map(p => fetchSource(p).catch(e => ({path: p, error: String(e.message)})))) : [];
    rows.push({
      id: c._id, rev: c._rev, slug: c.slug, title: c.title, language: c.language, channel: c.channel, action, reason,
      current: {image: c.mainImage?.secure_url ?? null, imageRole: image, video: c.mainVideo?.secure_url ?? null, videoRole: video, flzrMediaMode: c.flzrEdition?.mediaMode ?? null},
      patch: action === 'replace' ? {
        set: {mainImage: `cloudinary upload of ${plan!.primary} → flzr/cases/${c.slug}`, isVerticalVideo: false},
        unset: video === 'stand-in' ? ['mainVideo'] : [],
      } : action === 'reuse-cross-site' ? {
        set: {mainImage: donor.mainImage.secure_url, ...(donor.mainVideo ? {mainVideo: donor.mainVideo.secure_url} : {}), isVerticalVideo: Boolean(donor.isVerticalVideo)},
        unset: !donor.mainVideo && video !== 'none' ? ['mainVideo'] : [],
      } : null,
      source: primary, donor: donor ? {id: donor._id, mainImage: donor.mainImage, mainVideo: donor.mainVideo ?? null, isVerticalVideo: Boolean(donor.isVerticalVideo)} : null,
      alternates, sameClientElsewhere: sameClient,
    });
  }

  const replace = rows.filter(r => r.action === 'replace');
  const summary = {
    mode: MODE, projectId: 'wu6i3y0h', dataset: 'production', assetFolder: ASSET_FOLDER,
    cases: rows.length, replace: replace.length, keep: rows.filter(r => r.action === 'keep').length,
    review: rows.filter(r => r.action === 'review').length, reuseCrossSite: rows.filter(r => r.action === 'reuse-cross-site').length,
    standInVideosRemoved: rows.filter(r => r.patch?.unset.length).length,
    uploads: replace.length, uploadBytes: replace.reduce((n, r) => n + (r.source?.bytes ?? 0), 0),
    smallestSource: replace.map(r => r.source!).sort((a, b) => a.width - b.width)[0] ?? null,
    publishedDocumentsWillChange: MODE === 'apply' ? rows.filter(r => r.patch).length : 0,
  };
  writeFileSync(`${OUT}/plan.json`, JSON.stringify({summary, rows}, null, 2) + '\n', {mode: 0o600});
  writeFileSync(`${OUT}/plan.md`, report(summary, rows));
  console.log(JSON.stringify(summary, null, 2));
  if (MODE !== 'apply') return;

  assert(!existsSync(`${OUT}/before.json`), 'Recovery snapshot already exists; move it before re-applying');
  const changing = rows.filter(r => r.patch);
  const before = await client.fetch<any[]>('*[_id in $ids]', {ids: changing.map(r => r.id)});
  writeFileSync(`${OUT}/before.json`, JSON.stringify(before, null, 2) + '\n', {mode: 0o600});
  const uploaded: Record<string, any> = {};
  for (const r of replace) uploaded[r.id] = await upload(r.slug, r.source!);
  writeFileSync(`${OUT}/uploads.json`, JSON.stringify(uploaded, null, 2) + '\n', {mode: 0o600});
  const next = (r: any) => r.action === 'replace'
    ? {mainImage: uploaded[r.id], isVerticalVideo: false}
    : {mainImage: r.donor.mainImage, ...(r.donor.mainVideo ? {mainVideo: r.donor.mainVideo} : {}), isVerticalVideo: r.donor.isVerticalVideo};
  const tx = client.transaction();
  for (const r of changing) tx.patch(r.id, p => {
    p.ifRevisionId(r.rev).set(next(r));
    return r.patch!.unset.length ? p.unset(r.patch!.unset) : p;
  });
  await tx.commit();
  const after = await client.fetch<any[]>(`*[_id in $ids]{_id, "image": mainImage.public_id, "video": mainVideo.public_id}`, {ids: changing.map(r => r.id)});
  for (const r of changing) {
    const a = after.find(d => d._id === r.id);
    assert.equal(a?.image, next(r).mainImage.public_id, `Image not set: ${r.id}`);
    if (r.patch!.unset.length) assert.equal(a?.video, null, `Stand-in video still set: ${r.id}`);
  }
  writeFileSync(`${OUT}/verification.json`, JSON.stringify({completedAt: new Date().toISOString(), patched: changing.length, after}, null, 2) + '\n');
  console.log(`Patched ${changing.length} FLZR cases.`);
}

function report(summary: any, rows: any[]) {
  const short = (u: string | null) => (u ? u.split('/').pop() : '—');
  const lines = [
    `# FLZR case media — ${summary.mode}`, '',
    `${summary.cases} cases · ${summary.replace} replace · ${summary.keep} keep · ${summary.review} review · ${summary.standInVideosRemoved} stand-in videos removed`, '',
    '| Case | Action | Current image / video | New image (px) | Alternates | Same client elsewhere |',
    '|---|---|---|---|---|---|',
    ...rows.map(r => `| ${r.title} (${r.language}) \`${r.slug}\` | **${r.action}** — ${r.reason} | ${short(r.current.image)} (${r.current.imageRole}) / ${short(r.current.video)} (${r.current.videoRole}) | ${r.source ? `${short(r.source.path)} ${r.source.width}×${r.source.height}` : '—'} | ${r.alternates.map((a: any) => a.error ? `${short(a.path)} ✗` : `${short(a.path)} ${a.width}×${a.height}`).join('<br>') || '—'} | ${r.sameClientElsewhere.map((o: any) => `${o.title} [${o.channel.join(',')}]`).join('<br>') || '—'} |`),
  ];
  return lines.join('\n') + '\n';
}

main().catch(e => {console.error(e.message); process.exitCode = 1;});
