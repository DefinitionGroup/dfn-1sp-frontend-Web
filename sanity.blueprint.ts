import { defineBlueprint, defineDocumentFunction } from "@sanity/blueprints";
import { TARGETS } from "./functions/revalidate-sites/fan-out";

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
        // Asset uploads do not change rendered pages.
        filter: `!(_type in ["sanity.imageAsset", "sanity.fileAsset"]) && sanity::dataset() in ${JSON.stringify(LIVE_DATASETS)}`,
        projection: "{_id, _type, slug, language, channel}",
      },
    }),
  ],
});
