import {shouldLoadProductionTracking} from '@1sp/utils/deployment-tier';

/** Cookie consent is testable on MSM beta independently of production analytics. */
export function shouldLoadMsmCookiebot(): boolean {
  // Keep the shared deployment validation, including fail-closed test identity.
  const productionTracking = shouldLoadProductionTracking();
  return productionTracking || process.env.DEPLOYMENT_TIER?.trim().toLowerCase() === 'beta';
}
