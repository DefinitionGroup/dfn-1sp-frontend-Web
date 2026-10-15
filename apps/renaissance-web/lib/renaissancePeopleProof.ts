import type { PageBuilderBlock, RenaissanceSectionBand, RenaissancePortraitGrid, RenaissanceAwardLogoWall } from '@1sp/sanity-types';

export type PeopleProof = {
  portraits?: RenaissancePortraitGrid | null;
  awards?: RenaissanceAwardLogoWall | null;
};

/** undefined keeps legacy compatibility; null deliberately renders nothing. */
export function resolvePeopleProof(marker: RenaissanceSectionBand, blocks: PageBuilderBlock[]): PeopleProof {
  const has = (local: string, shared: string) => blocks.some(block =>
    block._type === local || (block._type === 'renaissanceSharedContentReference' && block.sharedContent?._type === shared));
  return {
    portraits: has('renaissancePortraitGrid', 'renaissanceSharedPortraits') ? null
      : marker.sharedDefaults?.portraitsConfigured ? marker.sharedDefaults.portraits?.content ?? null : undefined,
    awards: has('renaissanceAwardLogoWall', 'renaissanceSharedAwards') ? null
      : marker.sharedDefaults?.awardsConfigured ? marker.sharedDefaults.awards?.content ?? null : undefined,
  };
}
