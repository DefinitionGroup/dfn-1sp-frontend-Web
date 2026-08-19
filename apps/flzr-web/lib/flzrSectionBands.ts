import type {
  FlzrSectionBand,
  PageBuilderBlock,
} from "@1sp/sanity-types";

export type FlzrSectionBlock = {
  block: PageBuilderBlock;
  sourceIndex: number;
};

export type FlzrRenderUnit =
  | {
      kind: "block";
      key: string;
      block: PageBuilderBlock;
      sourceIndex: number;
    }
  | {
      kind: "section";
      key: string;
      marker: FlzrSectionBand;
      blocks: FlzrSectionBlock[];
    };

type OpenSection = Extract<FlzrRenderUnit, { kind: "section" }>;

const blockKey = (block: PageBuilderBlock, sourceIndex: number) =>
  block._key ?? `${block._type ?? "block"}-${sourceIndex}`;

const isSectionMarker = (
  block: PageBuilderBlock,
): block is PageBuilderBlock & FlzrSectionBand =>
  block._type === "flzrSectionBand";

/**
 * Converts FLZR's flat Sanity content array into render units without moving or
 * cloning stored blocks. A section marker owns every following block until the
 * next marker; reset markers return subsequent blocks to normal rendering.
 */
export function partitionFlzrSectionBands(
  content: PageBuilderBlock[],
): FlzrRenderUnit[] {
  const units: FlzrRenderUnit[] = [];
  let openSection: OpenSection | null = null;

  const closeSection = () => {
    if (openSection && openSection.blocks.length > 0) {
      units.push(openSection);
    }
    openSection = null;
  };

  content.forEach((block, sourceIndex) => {
    if (!block?._type) return;

    if (isSectionMarker(block)) {
      closeSection();

      if (block.mode !== "reset") {
        openSection = {
          kind: "section",
          key: blockKey(block, sourceIndex),
          marker: block,
          blocks: [],
        };
      }

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

  return units;
}
