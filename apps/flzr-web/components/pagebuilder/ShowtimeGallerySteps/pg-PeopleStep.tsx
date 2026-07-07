"use client";
import React from "react";
import type { GalleryPeopleStep, CloudinaryAsset } from "@1sp/sanity-types";
import PeopleShowcaseHero from "../Fragments/pg-PeopleShowcaseHero";
import { hasVisibleText } from "@1sp/utils/text-content";

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
      className="relative grid grid-cols-12 z-0  font-aspekta"
    >

      <div className="relative z-2 col-span-12 col-start-1 row-start-1 w-full">
        <div className="container mx-auto ">
          <div className="grid grid-cols-4 iphone-landscape:grid-cols-12 sm:grid-cols-6 md:grid-cols-12 lg:gap-8 py-16 sm:py-24 lg:py-32">

            <div className="col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 md:col-span-12">

              {/* Header Section */}
              <header className="border-t border-gray-200 pt-4 sm:pt-6 mb-8 md:mb-12">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 iphone-landscape:grid-cols-4 gap-4 sm:gap-6">
                  {/* Left: Titles */}
                  <div className="col-span-4 sm:col-span-3 md:col-span-4 iphone-landscape:col-span-4">
                    <div className="flex flex-col gap-2 sm:gap-4">
                      {hasVisibleText(header.superText) && (
                        <h2 className="text-xs sm:text-sm text-neutral-700 font-semibold tracking-tight">
                          {header.superText}
                        </h2>
                      )}
                      {hasVisibleText(header.mainHeadline) && (
                        <h3 className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl tracking-tighter leading-[1.1]">
                          {header.mainHeadline}
                        </h3>
                      )}

                      {(header.creativityTitle || header.uniquePeopleText) && (
                        <div className="flex flex-col mt-2">
                          {header.creativityTitle && (
                            <span className="text-lg sm:text-xl md:text-2xl text-neutral-900">
                              {header.creativityTitle}
                            </span>
                          )}
                          {header.uniquePeopleText && (
                            <span className="text-lg sm:text-xl md:text-2xl text-neutral-400">
                              {header.uniquePeopleText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Description */}
                  {step.description && step.description.trim().length > 0 && (
                    <div className="col-span-4 sm:col-span-3 md:col-span-5 md:col-start-6 iphone-landscape:col-span-4 iphone-landscape:col-start-1 mt-4 sm:mt-0 iphone-landscape:mt-4">
                      <div className="border-t border-gray-200 pt-4 sm:pt-6 md:border-t-0 md:pt-0">
                        <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </header>

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
