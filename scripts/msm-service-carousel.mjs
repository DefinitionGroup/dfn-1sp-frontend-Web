import assert from 'node:assert/strict';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

// Prepare a reviewable document backup + plan; apply that exact revision separately.
const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'raw'});
const target = 'msm-page-services-en';
const folder = 'EXPORT/msm-service-carousel';
const planPath = `${folder}/plan.json`;
const apply = process.env.MSM_SERVICE_CAROUSEL_APPLY === '1';
if (apply) {
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  assert.equal(plan.projectId, 'wu6i3y0h'); assert.equal(plan.dataset, 'production'); assert.equal(plan.id, target);
  const current = await client.getDocument(target);
  assert.equal(current._rev, plan.revision, 'Page changed since preparation. Prepare again.');
  assert.equal(current.channel, 'msmWeb'); assert.equal(current.language, 'en');
  assert.equal(await client.fetch('count(*[_id == $id])', {id: `drafts.${target}`}), 0, 'A draft needs reconciling first.');
  await client.patch(target).ifRevisionId(plan.revision).set({content: plan.content}).commit();
  const after = await client.getDocument(target);
  assert.deepEqual(after.content, plan.content);
  writeFileSync(`${folder}/after.json`, JSON.stringify(after, null, 2), {mode: 0o600});
  console.log(JSON.stringify({updated: target, revision: after._rev, blocks: after.content.map(b => b._type), backup: plan.backup}));
} else {
  const page = await client.getDocument(target);
  assert.equal(page.channel, 'msmWeb'); assert.equal(page.language, 'en');
  assert.equal(await client.fetch('count(*[_id == $id])', {id: `drafts.${target}`}), 0, 'A draft needs reconciling first.');
  const slugs = ['social-media', 'influencer-marketing', 'pos-marketing', 'experiential-marketing', 'augmented-and-virtual-reality', 'content-creation'].map(s => `services/${s}`);
  const pages = await client.fetch('*[_type=="page" && channel=="msmWeb" && language=="en" && msmPageKind=="service" && slug.current in $slugs]{title,slug,"service":services[0]->{_id,channel,language}}', {slugs});
  const selected = slugs.map(slug => {
    const matches = pages.filter(p => p.slug.current === slug);
    assert.equal(matches.length, 1, `Ambiguous service page: ${slug}`);
    const service = matches[0].service;
    assert(service && service.channel.includes('msmWeb') && service.language === 'en');
    return {_key: service._id, _type: 'reference', _ref: service._id};
  });
  const home = await client.getDocument('msm-page-home-en');
  const source = home.content.find(b => b._key === 'hero')?.media;
  assert.equal(source?.resource_type, 'video'); assert(source.secure_url);
  const asset = Object.fromEntries(['_type','public_id','secure_url','resource_type','format','width','height','version'].map(key => [key, source[key]]).filter(([, value]) => value !== undefined));
  const carousel = {_key: 'interactive-services', _type: 'interactiveServiceCarousel', title: 'Explore our services', selectedServices: selected};
  assert(page.content.some(b => b._key === 'directory')); assert(page.content.some(b => b._key === 'hero'));
  const content = page.content.filter(b => b._key !== carousel._key).flatMap(block => {
    if (block._key === 'hero') return [{...block, useVideo: true, backgroundVideo: {_type: 'cloudinaryImage', asset}}];
    return block._key === 'directory' ? [carousel, block] : [block];
  });
  mkdirSync(folder, {recursive: true});
  const backup = `${folder}/before-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(page, null, 2), {mode: 0o600});
  assert.deepEqual(JSON.parse(readFileSync(backup, 'utf8')), page);
  writeFileSync(planPath, JSON.stringify({projectId:'wu6i3y0h', dataset:'production', id:target, revision:page._rev, backup, content}, null, 2), {mode:0o600});
  console.log(JSON.stringify({mode:'dry-run', backup, planPath, services:pages.map(p => p.title), heroVideo:source.secure_url, blocks:content.map(b=>b._type)}));
}
