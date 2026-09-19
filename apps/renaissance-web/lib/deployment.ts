import { getSiteConfig } from '@1sp/site-config';
import { shouldAllowIndexing, getRobotsMetadata, getDeploymentHeaders } from '@1sp/utils/deployment-tier';

// Selecting the production dataset does not launch the Renaissance website.
// Its public-domain boundary must be configured separately before indexing.
export function isRenaissancePublic() {
  return Boolean(getSiteConfig('renaissanceWeb').domains.production) && shouldAllowIndexing();
}

export function renaissanceRobotsMetadata() {
  return isRenaissancePublic() ? getRobotsMetadata() : { index: false, follow: false, noarchive: true };
}

export function renaissanceDeploymentHeaders() {
  const headers = getDeploymentHeaders('renaissance');
  if (isRenaissancePublic() || headers.length) return headers;
  return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }];
}
