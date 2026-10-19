import { createHmac } from "node:crypto";

export type RevalidateTarget = {
  site: string;
  /** The site's existing webhook handler. */
  url: string;
  /** The dataset the deployment reads; only changes there refresh it. */
  dataset: string;
  /** Function env var holding that deployment's SANITY_REVALIDATE_SECRET. */
  secretEnv: string;
};

/**
 * Live sites refreshed on every publish, in place of one Sanity webhook per
 * site. A site is only called once its secret is set on the function:
 *
 *   sanity functions env add revalidate-sites REVALIDATE_SECRET_MSM <secret>
 *
 * so a target can be listed before its site launches. Beta, test and preview
 * deployments are not listed; they refresh on a one-hour timer instead.
 */
export const TARGETS: RevalidateTarget[] = [
  {
    site: "1sp",
    url: "https://www.1sp.agency/api/revalidate",
    // Live 1SP reads production since the 15 October 2026 switch
    // (docs/DEPLOYMENT.md). Until this function is deployed, the
    // "Revalidate Test" webhook keeps refreshing it.
    dataset: "production",
    secretEnv: "REVALIDATE_SECRET_1SP",
  },
  {
    site: "msm",
    url: "https://www.msm.digital/api/revalidate",
    dataset: "production",
    secretEnv: "REVALIDATE_SECRET_MSM",
  },
];

/**
 * Signs a body the way Sanity webhooks do, so the sites' `parseBody` from
 * `next-sanity/webhook` accepts it: `t=<ms>,v1=<base64url HMAC-SHA256>`
 * over `<ms>.<body>`.
 */
export function signatureHeader(body: string, secret: string, timestamp = Date.now()): string {
  const signature = createHmac("sha256", secret.trim())
    .update(`${timestamp}.${body}`)
    .digest("base64url");
  return `t=${timestamp},v1=${signature}`;
}

export type Delivery = {
  site: string;
  status: "sent" | "skipped" | "failed";
  detail: string;
};

type RevalidateSitesOptions = {
  dataset: string;
  payload: unknown;
  env: Record<string, string | undefined>;
  targets?: RevalidateTarget[];
  send?: typeof fetch;
  dryRun?: boolean;
};

/** Posts one signed change to every site that reads the changed dataset. */
export async function revalidateSites({
  dataset,
  payload,
  env,
  targets = TARGETS,
  send = fetch,
  dryRun = false,
}: RevalidateSitesOptions): Promise<Delivery[]> {
  const body = JSON.stringify(payload);

  return Promise.all(
    targets
      .filter((target) => target.dataset === dataset)
      .map(async ({ site, url, secretEnv }): Promise<Delivery> => {
        const secret = env[secretEnv]?.trim();
        if (!secret) return { site, status: "skipped", detail: `${secretEnv} is not set` };
        if (dryRun) return { site, status: "skipped", detail: `dry run, would POST ${url}` };

        try {
          const response = await send(url, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "sanity-webhook-signature": signatureHeader(body, secret),
            },
            body,
            // Sites wait ~3 s for Content Lake consistency before answering.
            signal: AbortSignal.timeout(20_000),
          });
          return response.ok
            ? { site, status: "sent", detail: `HTTP ${response.status}` }
            : { site, status: "failed", detail: `HTTP ${response.status}` };
        } catch (error) {
          return { site, status: "failed", detail: error instanceof Error ? error.message : String(error) };
        }
      }),
  );
}
