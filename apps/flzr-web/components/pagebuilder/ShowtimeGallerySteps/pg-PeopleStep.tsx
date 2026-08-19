"use client";
import React from "react";
import type { GalleryPeopleStep, CloudinaryAsset } from "@1sp/sanity-types";
import PeopleShowcaseHero from "../Fragments/pg-PeopleShowcaseHero";
import PeopleIntroLayout from "../Fragments/PeopleIntroLayout";

type Member = {
  _id?: string;
  name?: string;
  image?: CloudinaryAsset | null;
  video?: CloudinaryAsset | null;
  media?: CloudinaryAsset | null;
  altText?: string;
  fullname?: string;
  position?: string;
  email?: string;
  profileUrl?: string;
  tagline?: string;
  channel?: string[];
  unit?: {
    _id?: string;
    name?: string;
    logoSignet?: CloudinaryAsset | null;
  } | null;
};

type PeopleHeader = {
  superText?: string;
  mainHeadline?: string;
  creativityTitle?: string;
  uniquePeopleText?: string;
};

export default function PeopleStep({
  step,
}: {
  // Extend your base type with the exact fields from the schema to avoid TS errors
  step: GalleryPeopleStep & {
    header?: PeopleHeader;
    description?: string;
    teamMembers?: Member[];
    media?: CloudinaryAsset;
  };
}) {
  const members = step.teamMembers ?? [];
  const header = step.header ?? {};

  // Map person schema fields to MemberItem format expected by PeopleShowcaseHero
  const mappedMembers = members.map((member) => ({
    ...member,
    // Use video if available, otherwise use image, or fallback to media
    media: member.video || member.image || member.media,
  }));

  const sectionId = header.mainHeadline
      ? header.mainHeadline
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
      : "gallery-people";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="relative grid grid-cols-12 z-0  font-flzr"
    >

      <div className="relative z-2 col-span-12 col-start-1 row-start-1 w-full">
        <div className="container mx-auto ">
          <div className="grid grid-cols-4 iphone-landscape:grid-cols-12 sm:grid-cols-6 md:grid-cols-12 lg:gap-8">

            <div className="col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 md:col-span-12">

              <PeopleIntroLayout
                header={header}
                description={step.description}
                presentation="gallery"
              />

              {/* People Grid */}
              <div className="mt-8 sm:mt-10 md:mt-12">
                <PeopleShowcaseHero
                  members={mappedMembers}
                  initialVisibleCount={Math.min(8, mappedMembers.length)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
