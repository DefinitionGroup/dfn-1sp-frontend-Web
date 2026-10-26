import { getSiteConfig } from '@1sp/site-config';
import { getDeploymentHeaders, getRobotsMetadata, shouldAllowIndexing } from '@1sp/utils/deployment-tier';

// Studio CO2 stays out of search until site-config names a production domain.
export function isStudioco2Public() {
  return Boolean(getSiteConfig('studioco2Web').domains.production) && shouldAllowIndexing();
}

export function studioco2RobotsMetadata() {
  return isStudioco2Public() ? getRobotsMetadata() : { index: false, follow: false, noarchive: true };
}

// getDeploymentHeaders also validates the test-lane environment at build time.
export async function studioco2DeploymentHeaders() {
  const headers = getDeploymentHeaders('studioco2');
  if (isStudioco2Public() || headers.length) return headers;
  return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }];
}
