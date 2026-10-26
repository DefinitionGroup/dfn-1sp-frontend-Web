import type { RenaissanceMediaItem, RenaissancePortraitGrid } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";

export type ResolvedRenaissanceMediaItem = {
  key: string;
  name: string;
  src: string;
  position?: string;
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
        position: item.position,
      },
    ];
  });
}

/**
 * The listed portraits lead in their editor order (with their image and role
 * overrides), followed by every other person assigned to the site.
 */
export function resolveRenaissanceTeam(
  grid: RenaissancePortraitGrid,
): ResolvedRenaissanceMediaItem[] {
  const portraits = grid.portraits ?? [];
  const listed = new Set(portraits.map((item) => item?.person?._ref).filter(Boolean));
  const others = (grid.teamPeople ?? [])
    .filter((person) => !listed.has(person._id))
    .map((person) => ({
      _key: person._id,
      name: person.name,
      position: person.position,
      image: person.image,
    }));

  return resolveRenaissanceMediaItems([...portraits, ...others]);
}
