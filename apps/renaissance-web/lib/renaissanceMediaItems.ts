import type { RenaissanceMediaItem } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";

export type ResolvedRenaissanceMediaItem = {
  key: string;
  name: string;
  src: string;
};

export function resolveRenaissanceMediaItems(
  items?: RenaissanceMediaItem[],
): ResolvedRenaissanceMediaItem[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item, index) => {
    const src = assetUrl(item?.image) || item?.imageUrl?.trim();
    if (!src) return [];

    return [
      {
        key: item._key || `${src}-${index}`,
        name: item.name?.trim() || "",
        src,
      },
    ];
  });
}
