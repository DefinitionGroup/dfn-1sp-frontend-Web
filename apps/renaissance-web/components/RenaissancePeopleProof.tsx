import type {
  RenaissanceAwardLogoWall as RenaissanceAwardLogoWallData,
  RenaissancePortraitGrid as RenaissancePortraitGridData,
} from "@1sp/sanity-types";
import RenaissanceAwardLogoWall from "./pagebuilder/pg-RenaissanceAwardLogoWall";
import RenaissancePortraitGrid from "./pagebuilder/pg-RenaissancePortraitGrid";

const portraits: RenaissancePortraitGridData = {
  _type: "renaissancePortraitGrid",
  portraits: [
    { _key: "team-01", imageUrl: "/renaissance/figma/team-01.jpg", name: "Stefano Petrullo" },
    { _key: "team-02", imageUrl: "/renaissance/figma/team-02.jpg", name: "Renaissance team member" },
    { _key: "team-03", imageUrl: "/renaissance/figma/team-03.jpg", name: "Renaissance team member" },
    { _key: "team-04", imageUrl: "/renaissance/figma/team-04.jpg", name: "Renaissance team member" },
    { _key: "team-05", imageUrl: "/renaissance/figma/team-01.jpg", name: "" },
  ],
};

const awardWall: RenaissanceAwardLogoWallData = {
  _type: "renaissanceAwardLogoWall",
  headline: "Award-winning people. Leading by example.",
  logos: [
    { _key: "award-01", imageUrl: "/renaissance/figma/award-01.png", name: "Industry award" },
    { _key: "award-02", imageUrl: "/renaissance/figma/award-02.png", name: "Industry award" },
    { _key: "award-03", imageUrl: "/renaissance/figma/award-03.png", name: "Industry award" },
    { _key: "award-04", imageUrl: "/renaissance/figma/award-04.png", name: "Industry award" },
    { _key: "award-05", imageUrl: "/renaissance/figma/award-05.png", name: "Industry award" },
    { _key: "award-06", imageUrl: "/renaissance/figma/award-01.png", name: "Industry award" },
    { _key: "award-07", imageUrl: "/renaissance/figma/award-02.png", name: "Industry award" },
    { _key: "award-08", imageUrl: "/renaissance/figma/award-03.png", name: "Industry award" },
  ],
};

export default function RenaissancePeopleProof() {
  return (
    <>
      <RenaissancePortraitGrid data={portraits} />
      <RenaissanceAwardLogoWall data={awardWall} />
    </>
  );
}
