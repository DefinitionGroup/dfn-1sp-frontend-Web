import assert from 'node:assert/strict';
import {test} from 'node:test';
import type {PortableTextBlock} from '@portabletext/types';
import {contactEmail, getContactCompanies, getContactChannels} from '../apps/msm-web/lib/contact-content';

const paragraph = (text: string, key: string): PortableTextBlock => ({_type: 'block', _key: key, style: 'normal', children: [{_type: 'span', _key: 'text', text, marks: []}], markDefs: []});

test('company extraction handles imported and compact details without copying legal prose', () => {
  const lines = ['MSM.digital Communications GmbH', 'Hamburger Straße 11', '22083 Hamburg', 'Telephone: +49 (451) 160 83 500', 'Mail: info@msm.digital', 'VAT No.: DE 315628138'];
  const legacy = getContactCompanies([{_type: 'contentSection', content: [...lines.map((text, index) => paragraph(text, String(index))), paragraph('Copyright and legal notice', 'notice')]}]);
  const compact = getContactCompanies([{_type: 'contentSection', content: [paragraph(lines.join('\n'), 'compact')]}]);
  assert.equal(legacy.length, 1); assert.equal(compact.length, 1);
  assert.equal(compact[0].name, lines[0]);
  assert.deepEqual(compact[0].details.map(block => block.children.map(child => child.text).join('')), lines.slice(1));
  assert.deepEqual(legacy[0].details.map(block => block.children.map(child => child.text).join('')), lines.slice(1));
  assert.equal(compact[0].details[2].markDefs?.[0].href, 'tel:+4945116083500');
  assert.equal(compact[0].details[3].markDefs?.[0].href, 'mailto:info@msm.digital');
});

test('links belonging to another line cannot override the main contact email', () => {
  const block = paragraph('MSM.digital AB\nMail: info@msm.digital\n', 'company');
  block.children.push({_type: 'span', _key: 'label', text: 'Data protection: ', marks: []}, {_type: 'span', _key: 'email', text: 'datenschutz@msm.digital', marks: ['privacy']}, {_type: 'span', _key: 'end', text: '\nVAT No.: SE 559185680101', marks: []});
  block.markDefs = [{_type: 'link', _key: 'privacy', href: 'mailto:datenschutz@msm.digital'}];
  const company = getContactCompanies([{_type: 'contentSection', content: [block]}])[0];
  assert.equal(company.details[0].markDefs?.[0].href, 'mailto:info@msm.digital');
  assert.equal(company.details[1].markDefs?.[0].href, 'mailto:datenschutz@msm.digital');
  assert.deepEqual(company.details[1].children.find(child => child._key?.startsWith('email'))?.marks, ['privacy']);
});

test('email links clean imported space escapes and reject invalid values', () => {
  assert.equal(contactEmail('%20nathalia.traxel@msm.digital'), 'nathalia.traxel@msm.digital');
  assert.equal(contactEmail(' tobias.schnoor@msm.digital '), 'tobias.schnoor@msm.digital');
  assert.equal(contactEmail('invalid%'), undefined);
  assert.equal(contactEmail('hello@example.com\nBCC:someone@example.com'), undefined);
});

test('existing channel destinations are deduplicated and labelled', () => {
  const block = paragraph('WhatsApp', 'channel');
  block.markDefs = [{_key: 'one', _type: 'link', href: 'https://wa.me/491729110086'}, {_key: 'two', _type: 'link', href: 'https://wa.me/491729110086'}, {_key: 'mail', _type: 'link', href: 'mailto:info@msm.digital'}];
  assert.deepEqual(getContactChannels([{_type: 'contentSection', content: [block]}]), [{href: 'https://wa.me/491729110086', label: 'WhatsApp'}]);
});
