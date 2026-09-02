import type {
  PageBuilderBlock,
  RenaissanceSectionBand,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";

export type RenaissanceSectionBlock = {
  block: PageBuilderBlock;
  sourceIndex: number;
};

export type RenaissanceRenderUnit =
  | {
      kind: "block";
      key: string;
      block: PageBuilderBlock;
      sourceIndex: number;
    }
  | {
      kind: "section";
      key: string;
      marker: RenaissanceSectionBand;
      blocks: RenaissanceSectionBlock[];
    };

type OpenSection = Extract<RenaissanceRenderUnit, { kind: "section" }>;

const blockKey = (block: PageBuilderBlock, sourceIndex: number) =>
  block._key ?? `${block._type ?? "block"}-${sourceIndex}`;

const isSectionMarker = (
  block: PageBuilderBlock,
): block is PageBuilderBlock & RenaissanceSectionBand =>
  block._type === "renaissanceSectionBand";

const LEGACY_SECTION_STARTS: Record<
  string,
  { role: RenaissanceSectionRole; badgeLabel: string }
> = {
  "renaissance-stories-intro": { role: "stories", badgeLabel: "STORIES" },
  "renaissance-services-intro": { role: "services", badgeLabel: "SERVICES" },
  "renaissance-people-intro": {
    role: "people",
    badgeLabel: "PEOPLE POWERED",
  },
  "renaissance-origin": { role: "origins", badgeLabel: "ORIGINS" },
  "renaissance-global-reach": { role: "reach", badgeLabel: "REACH" },
  "renaissance-contact": { role: "joinUs", badgeLabel: "JOIN US" },
};

const LEGACY_SECTION_END_KEYS = new Set([
  "renaissance-family",
  "193b45cc9015",
]);

function legacyMarker(
  source: PageBuilderBlock,
  sourceIndex: number,
  role: RenaissanceSectionRole,
  badgeLabel: string,
): RenaissanceSectionBand {
  return {
    _type: "renaissanceSectionBand",
    _key: `legacy-${source._key ?? sourceIndex}-${role}`,
    mode: "section",
    sectionRole: role,
    badgeLabel,
  };
}

/**
 * Converts the flat Sanity array into Renaissance render units without moving
 * or replacing any stored PageBuilder blocks. The legacy inference keeps the
 * currently published homepage compatible until editors publish the explicit
 * section markers created by the migration.
 */
export function partitionRenaissanceSections(
  content: PageBuilderBlock[],
): RenaissanceRenderUnit[] {
  const hasExplicitMarkers = content.some(isSectionMarker);
  const units: RenaissanceRenderUnit[] = [];
  let openSection: OpenSection | null = null;
  const pendingLegacyServiceBlocks: RenaissanceSectionBlock[] = [];

  const closeSection = () => {
    if (openSection && openSection.blocks.length > 0) units.push(openSection);
    openSection = null;
  };

  content.forEach((block, sourceIndex) => {
    if (!block?._type) return;

    if (isSectionMarker(block)) {
      closeSection();
      if (block.mode !== "reset" && block.sectionRole) {
        openSection = {
          kind: "section",
          key: blockKey(block, sourceIndex),
          marker: block,
          blocks: [],
        };
      }
      return;
    }

    if (!hasExplicitMarkers && block._key) {
      if (block._key === "renaissance-client-logos") {
        pendingLegacyServiceBlocks.push({ block, sourceIndex });
        return;
      }

      const sectionStart = LEGACY_SECTION_STARTS[block._key];
      if (sectionStart) {
        closeSection();
        openSection = {
          kind: "section",
          key: `legacy-section-${sectionStart.role}`,
          marker: legacyMarker(
            block,
            sourceIndex,
            sectionStart.role,
            sectionStart.badgeLabel,
          ),
          blocks: [],
        };
      } else if (LEGACY_SECTION_END_KEYS.has(block._key)) {
        closeSection();
      }
    }

    if (
      !hasExplicitMarkers &&
      block._key === "renaissance-services" &&
      openSection?.marker.sectionRole === "services"
    ) {
      openSection.blocks.push({ block, sourceIndex });
      openSection.blocks.push(...pendingLegacyServiceBlocks.splice(0));
      return;
    }

    if (openSection) {
      openSection.blocks.push({ block, sourceIndex });
      return;
    }

    units.push({
      kind: "block",
      key: blockKey(block, sourceIndex),
      block,
      sourceIndex,
    });
  });

  closeSection();
  pendingLegacyServiceBlocks.forEach(({ block, sourceIndex }) => {
    units.push({
      kind: "block",
      key: blockKey(block, sourceIndex),
      block,
      sourceIndex,
    });
  });
  return units;
}
