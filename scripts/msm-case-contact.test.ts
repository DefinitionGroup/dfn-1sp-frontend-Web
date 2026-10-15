import assert from 'node:assert/strict';
import test from 'node:test';
import {isCaseContactCta} from '../apps/msm-web/lib/case-contact';

test('replace legacy contact CTAs while preserving project actions', () => {
  const cta = (target: string) => ({cta: {link: {externalUrl: target}}});
  for (const target of ['mailto:old-contact@example.com', '/contact', '/de/contact/', '/en/contact?case=test']) {
    assert.equal(isCaseContactCta(cta(target)), true, target);
  }
  for (const target of ['/downloads/report.pdf', 'https://example.com/campaign', '#results', '/contact-campaign']) {
    assert.equal(isCaseContactCta(cta(target)), false, target);
  }
  assert.equal(isCaseContactCta({}), false);
});
