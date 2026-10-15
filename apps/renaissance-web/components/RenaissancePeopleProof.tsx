import type {
  RenaissanceAwardLogoWall as RenaissanceAwardLogoWallData,
  RenaissancePortraitGrid as RenaissancePortraitGridData,
} from "@1sp/sanity-types";
import RenaissanceAwardLogoWall from "./pagebuilder/pg-RenaissanceAwardLogoWall";
import RenaissancePortraitGrid from "./pagebuilder/pg-RenaissancePortraitGrid";

import { legacyPortraits, legacyAwardWall } from "../data/legacyPeopleProof";

export default function RenaissancePeopleProof({
  portraits = legacyPortraits,
  awards = legacyAwardWall,
}: {
  portraits?: RenaissancePortraitGridData | null;
  awards?: RenaissanceAwardLogoWallData | null;
}) {
  return (
    <>
      {portraits ? <RenaissancePortraitGrid data={portraits} /> : null}
      {awards ? <RenaissanceAwardLogoWall data={awards} /> : null}
    </>
  );
}
