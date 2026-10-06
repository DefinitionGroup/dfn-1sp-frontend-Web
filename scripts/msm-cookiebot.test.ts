import assert from 'node:assert/strict';
import test from 'node:test';
import {shouldLoadMsmCookiebot} from '../apps/msm-web/lib/cookiebot-deployment';
import {shouldLoadProductionTracking, shouldAllowIndexing} from '../packages/utils/src/deployment-tier';

const names = ['DEPLOYMENT_TIER', 'MONOREPO_TEST_PROJECT', 'MONOREPO_TEST_SITE', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL', 'NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET', 'NEXT_PUBLIC_CHANNEL', 'SANITY_VIEWER_TOKEN', 'NEXT_PUBLIC_SANITY_STUDIO_URL'];
function environment(values: Record<string, string>, run: () => void) {
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    Object.assign(process.env, values);
    run();
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
}

test('MSM beta enables Cookiebot while keeping analytics and indexing disabled', () => environment({DEPLOYMENT_TIER: 'beta', NEXT_PUBLIC_SITE_URL: 'https://msm-beta.vercel.app'}, () => {
  assert.equal(shouldLoadMsmCookiebot(), true);
  assert.equal(shouldLoadProductionTracking(), false);
  assert.equal(shouldAllowIndexing(), false);
}));

test('the dedicated MSM test lane keeps Cookiebot disabled', () => environment({DEPLOYMENT_TIER: 'test', MONOREPO_TEST_PROJECT: 'true', MONOREPO_TEST_SITE: 'msm', NEXT_PUBLIC_SITE_URL: 'https://msm-monorepo-test.vercel.app', NEXT_PUBLIC_SANITY_PROJECT_ID: 'wu6i3y0h', NEXT_PUBLIC_SANITY_DATASET: 'dev-dataset', NEXT_PUBLIC_CHANNEL: 'msmWeb', SANITY_VIEWER_TOKEN: 'fixture', NEXT_PUBLIC_SANITY_STUDIO_URL: 'https://1sp-monorepo-test.vercel.app/studio'}, () => {
  assert.equal(shouldLoadMsmCookiebot(), false);
}));

test('production consent remains enabled and invalid beta identity still fails closed', () => {
  environment({NEXT_PUBLIC_SITE_URL: 'https://www.msm.digital'}, () => assert.equal(shouldLoadMsmCookiebot(), true));
  environment({DEPLOYMENT_TIER: 'beta', NEXT_PUBLIC_SITE_URL: 'https://www.msm.digital'}, () => assert.throws(shouldLoadMsmCookiebot, /vercel\.app/));
});
