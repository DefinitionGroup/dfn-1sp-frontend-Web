import { documentEventHandler } from "@sanity/functions";
import { revalidateSites } from "./fan-out";

type ChangedDocument = {
  _id: string;
  _type: string;
  slug?: { current?: string };
  language?: string;
  channel?: string | string[];
};

/**
 * Refreshes every live site's page cache when a document is published,
 * changed or deleted. Each site's `/api/revalidate` handles the payload
 * exactly as it would a Sanity webhook.
 */
export const handler = documentEventHandler<ChangedDocument>(async ({ context, event }) => {
  // A deployed function cannot be switched off in Manage. Set this env var
  // during bulk imports so each imported document does not call every site.
  if (process.env.REVALIDATE_SITES_PAUSED === "true") {
    console.log(`[revalidate-sites] paused, skipping ${event.data._id}`);
    return;
  }

  const dataset = context.clientOptions.dataset ?? context.eventResourceId.split(".").slice(1).join(".");
  const deliveries = await revalidateSites({
    dataset,
    payload: event.data,
    env: process.env,
    dryRun: context.local === true,
  });

  for (const { site, status, detail } of deliveries) {
    console.log(`[revalidate-sites] ${event.data._type} ${event.data._id} → ${site}: ${status} (${detail})`);
  }

  const failed = deliveries.filter((delivery) => delivery.status === "failed");
  if (failed.length > 0) {
    throw new Error(`Revalidation failed for ${failed.map((delivery) => delivery.site).join(", ")}`);
  }
});
