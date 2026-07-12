export const ONE_SP_REUSABLE_COMPONENT_TYPES = [
  "headlineChallenge",
  "heroShowTime",
  "sublineComponent",
  "oneSPHeader",
  "contentSection",
  "twoColContentSection",
  "tabbedContentSection",
  "casesIntro",
  "casesGalleryFiltered",
  "casesGalleryFilteredWithPagination",
  "servicesGalleryFiltered",
  "servicesHeroWithBadge",
  "intertitleCTA",
  "galleryHeroStep",
  "galleryCardsStep",
  "galleryListStep",
  "galleryPeopleStep",
  "galleryScrollHighlightStep",
  "galleryRevealStep",
  "galleryOverview",
  "carousel",
  "smartCarousel",
  "smartPeople",
  "smartUnitsGallery",
  "smartUnitsGlobe",
  "globeComponent",
  "unitLogoGrid",
  "pageBuilderLogoFloat",
  "pageBuilderPersonioJobs",
] as const;

export type OneSpReusableComponentType =
  (typeof ONE_SP_REUSABLE_COMPONENT_TYPES)[number];

const ONE_SP_REUSABLE_COMPONENT_TYPE_SET = new Set<string>(
  ONE_SP_REUSABLE_COMPONENT_TYPES,
);

export function isOneSpReusableComponentType(
  value: unknown,
): value is OneSpReusableComponentType {
  return (
    typeof value === "string" && ONE_SP_REUSABLE_COMPONENT_TYPE_SET.has(value)
  );
}

export type PageBuilderBlock = {
  _key?: string;
  _type?: string;
  [key: string]: unknown;
};

export type ImportCandidate = {
  selectionKey: string;
  block: PageBuilderBlock;
};

export function collectImportCandidates(sourceBlocks: PageBuilderBlock[]): {
  candidates: ImportCandidate[];
  unsupportedCount: number;
} {
  const supportedBlocks = sourceBlocks.filter((block) =>
    isOneSpReusableComponentType(block?._type),
  );

  return {
    candidates: supportedBlocks.map((block, index) => ({
      selectionKey: block._key || `${block._type || "component"}-${index}`,
      block,
    })),
    unsupportedCount: sourceBlocks.length - supportedBlocks.length,
  };
}

export function copyBlocksForImport(
  blocks: PageBuilderBlock[],
  createKey: () => string,
): Array<PageBuilderBlock & { _key: string }> {
  return blocks.map((block) => ({
    ...structuredClone(block),
    _key: createKey(),
  }));
}
