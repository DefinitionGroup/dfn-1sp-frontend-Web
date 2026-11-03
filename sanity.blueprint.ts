import { defineBlueprint, defineDocumentFunction } from "@sanity/blueprints";
import { TARGETS, eventFilter } from "./functions/revalidate-sites/fan-out";

// Only datasets a live site reads trigger the function; imports into any
// other dataset never invoke it.
const LIVE_DATASETS = [...new Set(TARGETS.map((target) => target.dataset))];

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: "revalidate-sites",
      displayName: "Revalidate live sites",
      // Sites wait ~3 s for Content Lake consistency before they answer.
      timeout: 30,
      event: {
        on: ["create", "update", "delete"],
        // Assets, form submissions, preview secrets and system documents
        // do not change rendered pages.
        filter: eventFilter(LIVE_DATASETS),
        projection: "{_id, _type, slug, language, channel}",
      },
    }),
  ],
});
