// components/showtimeGallery/steps/PeopleStep.tsx
"use client";
import React from "react";
import Badgemodule from "@/components/Badgemodule";
import type { GalleryPeopleStep, CloudinaryAsset } from "@/types/sanity.types";
import PeopleShowcaseHero from "../subComponents/PeopleShowcaseHero";

type Member = {
  name?: string;
  media?: CloudinaryAsset | null;
  altText?: string;
};

type PeopleHeader = {
  superText?: string;
  mainHeadline?: string;
  creativityTitle?: string; // from schema
  uniquePeopleText?: string; // from schema
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

  return (
    <section className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta gap-4">
      {/* Badge */}
      {step.badge && (
        <div className="z-1 flex flex-col col-span-2 pt-32 justify-start items-start col-start-1 mx-auto row-start-1">
          <Badgemodule
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        </div>
      )}

      {/* Header + description + people */}
      <div className="col-span-12 container col-start-3 row-start-1 grid grid-cols-10 pt-32">
        {/* Left header block */}
        <header className="col-span-2 col-start-1 border-t p-4">
          <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
            <div className="flex-1 flex gap-4 flex-col min-w-0">
              {header.superText && (
                <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                  {header.superText}
                </h2>
              )}
              {header.mainHeadline && (
                <h4 className="text-5xl text-neutral-900 font-semibold leading-compress font-aspekta">
                  {header.mainHeadline}
                </h4>
              )}

              {(header.creativityTitle || header.uniquePeopleText) && (
                <div className="flex flex-col items-start justify-start w-full">
                  {header.creativityTitle && (
                    <h2 className="text-2xl text-neutral-900 font-aspekta">
                      {header.creativityTitle}
                    </h2>
                  )}
                  {header.uniquePeopleText && (
                    <h4 className="text-2xl text-neutral-900 font-aspekta">
                      <span className="text-neutral-200">
                        {header.uniquePeopleText}
                      </span>
                    </h4>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Description row (matches original layout) */}
        {step.description && step.description.trim().length > 0 && (
          <div className="col-span-8 grid grid-cols-12 col-start-3 gap-8 border-t pt-8">
            <header className="col-span-5 col-start-1">
              <h2 className="text-lg text-neutral-500 font-aspekta">
                {step.description}
              </h2>
            </header>
          </div>
        )}

        {/* People grid */}
        <div className="col-span-8 row-start-2 col-start-3">
          <PeopleShowcaseHero members={members} />
        </div>
      </div>
    </section>
  );
}
