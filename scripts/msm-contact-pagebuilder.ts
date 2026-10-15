// Dry run: pnpm exec sanity exec scripts/msm-contact-pagebuilder.ts --with-user-token
// Apply: MSM_CONTACT_APPLY=1 pnpm exec sanity exec scripts/msm-contact-pagebuilder.ts --with-user-token
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

async function main() {
  const projectId = 'wu6i3y0h';
  const dataset = 'production'; // MSM staging; live 1SP uses dev-dataset.
  const folder = 'EXPORT/msm-contact-pagebuilder-2026-10-05';
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId, dataset, useCdn: false, perspective: 'raw'});
  const ids = ['msm-page-contact-en', 'msm-page-contact-de'].flatMap(id => [id, `drafts.${id}`]);
  const pages = await client.fetch<any[]>('*[_id in $ids]', {ids});
  assert(pages.some(page => page._id === 'msm-page-contact-en') && pages.some(page => page._id === 'msm-page-contact-de'));
  assert(pages.every(page => page._type === 'page' && page.channel === 'msmWeb' && ['en', 'de'].includes(page.language) && page.slug?.current === 'contact'));
  mkdirSync(folder, {recursive: true});
  const save = (name: string, value: unknown) => writeFileSync(`${folder}/${name}.json`, JSON.stringify(value, null, 2), {mode: 0o600});

  if (process.env.MSM_CONTACT_APPLY === '1') {
    const plan = JSON.parse(readFileSync(`${folder}/standard-plan.json`, 'utf8'));
    assert.equal(plan.projectId, projectId);
    assert.equal(plan.dataset, dataset);
    assert.deepEqual(pages.map(page => page._id).sort(), plan.pages.map((page: any) => page.before._id).sort(), 'Page/draft inventory changed.');
    let transaction = client.transaction();
    for (const row of plan.pages) {
      assert.deepEqual(pages.find(page => page._id === row.before._id), row.before, 'Page changed since dry run.');
      transaction = transaction.patch(row.before._id, patch => patch.ifRevisionId(row.before._rev).set({content: row.content}));
    }
    const receipt = await transaction.commit();
    const after = await client.fetch<any[]>('*[_id in $ids]', {ids});
    for (const row of plan.pages) {
      const updated = after.find(page => page._id === row.before._id);
      assert.deepEqual(updated?.content, row.content);
      for (const [key, value] of Object.entries(row.before)) {
        if (!['content', '_rev', '_updatedAt'].includes(key)) assert.deepEqual(updated?.[key], value, `Unexpected change to ${key}`);
      }
    }
    save('standard-after', after);
    save('standard-receipt', {projectId, dataset, transactionId: receipt.transactionId, ids: after.map(page => page._id)});
    console.log(JSON.stringify({mode: 'applied', pages: after.map(page => ({id: page._id, blocks: page.content.map((block: any) => block._type)}))}));
    return;
  }

  const rows = pages.map(page => {
    const details = page.content.find((block: any) => block._type === 'msmContactDetails');
    const people = page.content.find((block: any) => block._type === 'msmContactPeople');
    const hero = page.content.find((block: any) => ['oneSPHeader', 'servicesHeroWithBadge'].includes(block._type));
    assert(details && people && hero, 'Expected backed-up contact composition; refusing to overwrite an already converted page.');
    const content = [hero,
      {_type: 'contentSection', _key: 'contact-details', title: details.title, contentSize: 'base',
        content: details.companies.flatMap((company: any) => [
          {_type: 'block', _key: `${company._key}-name`, style: 'h3', markDefs: [], children: [{_type: 'span', _key: 'name', marks: [], text: company.name}]},
          ...company.details,
        ])},
      {_type: 'contentSection', _key: 'contact-channels', title: page.language === 'de' ? 'Weitere Kontaktwege' : 'More ways to connect', contentSize: 'base',
        content: details.channels.map((channel: any) => ({_type: 'block', _key: channel._key, style: 'normal', markDefs: [{_type: 'link', _key: 'link', href: channel.href, blank: true}], children: [{_type: 'span', _key: 'text', text: channel.label, marks: ['link']}]}))},
      {_type: 'galleryPeopleStep', _key: 'contact-people', badge: people.badge,
        header: {_type: 'peopleStepHeader', mainHeadline: people.title},
        teamMembers: people.people.map((person: any) => ({_type: 'reference', _key: person._key, _ref: person._key}))},
      ...page.content.filter((block: any) => !['oneSPHeader', 'servicesHeroWithBadge', 'msmContactDetails', 'msmContactPeople'].includes(block._type))];
    return {before: page, content};
  });
  const personIds = [...new Set(rows.flatMap(row => row.content.find(block => block._type === 'galleryPeopleStep').teamMembers.map((person: any) => person._ref)))];
  const existingPersonIds = await client.fetch<string[]>('*[_type == "person" && _id in $ids]._id', {ids: personIds});
  assert.deepEqual(existingPersonIds.sort(), personIds.sort(), 'Missing global person reference.');
  for (const row of rows) {
    for (const block of row.content) {
      const keys = (block.content || []).map((item: any) => item._key);
      assert.equal(new Set(keys).size, keys.length, 'Duplicate rich-text keys.');
    }
  }
  save('standard-before', pages);
  save('standard-plan', {projectId, dataset, pages: rows});
  console.log(JSON.stringify({mode: 'dry-run', pages: rows.map(row => ({id: row.before._id, blocks: row.content.map(block => block._type)}))}));
}

main().catch(error => {console.error(error); process.exitCode = 1;});
