"use client";
import React from "react";
import type { GalleryPeopleStep, CloudinaryAsset } from "@1sp/sanity-types";
import PeopleShowcaseHero from "../Fragments/pg-PeopleShowcaseHero";
import Badgemodule from "@msm/components/ui/Badgemodule";
import cards from "@msm/components/ui/SelectionCards.module.css";
import { useParams } from "next/navigation";
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
  const locale = useParams()?.locale || "en";
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
    <section id={sectionId} {...navPointDataAttr} className="relative z-0 py-[var(--msm-section-space)] font-aspekta">
      <div className="container mx-auto px-[var(--container-padding)]">
        <div className={cards.sectionLayout}>
          <Badgemodule text={locale === "de" ? "Unser Team" : "Our people"} subtitle="MSM.digital" />
          <div className={cards.sectionContent}>
            <header className="mb-12 md:mb-16">
              {hasVisibleText(header.superText) && (
                <p className="eyebrow text-msm-teal mb-4">{header.superText}</p>
              )}
              {hasVisibleText(header.mainHeadline) && (
                <h2 className="headline-display text-neutral-50">{header.mainHeadline}</h2>
              )}
              {(header.creativityTitle || header.uniquePeopleText) && (
                <div className="flex flex-col mt-6 text-lg sm:text-xl md:text-2xl">
                  {header.creativityTitle && <span className="text-neutral-50">{header.creativityTitle}</span>}
                  {header.uniquePeopleText && <span className="text-neutral-400">{header.uniquePeopleText}</span>}
                </div>
              )}
              {hasVisibleText(step.description) && (
                <p className="msm-copy mt-6 text-white/70">{step.description}</p>
              )}
            </header>
            <PeopleShowcaseHero members={mappedMembers} initialVisibleCount={Math.min(8, mappedMembers.length)} />
          </div>
        </div>
      </div>
    </section>
  );
}
