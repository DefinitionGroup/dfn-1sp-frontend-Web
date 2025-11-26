"use client";

import { useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Badgemodule from "@/components/ui/Badgemodule";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import CtaMiniComponent from "@/components/pagebuilder/Fragments/pg-CtaMiniComponent";
import { getTranslations } from "@/lib/translations";
import { useParams } from "next/navigation";
import { resolveLink } from "@/utils/utils";
import type { CTA } from "@/types/sanity.types";

interface Service {
  _id: string;
  name: string;
}

interface ChallengeAndSolutionProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeSubtitle?: string;
  badgeNumber?: string;
  contentType?: "challenges" | "services";
  challenges?: string[];
  services?: Service[];
  ctaHeading?: string;
  ctaParagraph?: string;
  ctaButton?: CTA;
  showButton?: boolean;
  solution?: string;
  showGridBackground?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

export default function ChallengeAndSolution({
  title,
  description,
  badgeText,
  badgeSubtitle,
  badgeNumber = "001",
  contentType = "challenges",
  challenges = [],
  services = [],
  ctaHeading,
  ctaParagraph,
  ctaButton,
  showButton = true,
  solution,
  showGridBackground = true,
  backgroundColor = "bg-neutral-50",
  paddingY = "32",
  navPointName,
}: ChallengeAndSolutionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const sectionId = t.ids.content;

  return (
    <section className="relative overflow-hidden">
      <div
        id={sectionId}
        data-navpoint-name={navPointName}
        className={`grid grid-cols-12 z-1 mx-auto ${backgroundColor} mt-8 min-h-[90vh] relative font-aspekta`}
      >
        {showGridBackground && <GridBackground />}
        <div
          className={`z-1 grid col-span-12 py-${paddingY} col-start-1 container mx-auto row-start-1 grid-cols-12`}
        >
          <Badgemodule
            className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
            text={badgeText || t.badges.intro}
            subtitle={badgeSubtitle || t.badges.theGoal}
            numberEl={badgeNumber}
          />

          <div className="col-span-10 col-start-2 md:col-start-3 mt-12 md:mt-0">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-5xl text-gray-900 max-w-xl tracking-tight leading-tighter mb-8">
                {title}
              </h2>
              {description && (
                <p className="text-lg text-gray-900 font-medium max-w-lg mx-auto">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {/* Challenge and Solution section */}
          {((contentType === "services" && services.length > 0) ||
            (contentType === "challenges" && challenges.length > 0)) && (
            <>
              <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-900">
                <CtaMiniComponent
                  heading={
                    ctaHeading ||
                    (contentType === "challenges"
                      ? t.caseStudy.challenge
                      : t.caseStudy.services)
                  }
                  paragraph={
                    ctaParagraph ||
                    (contentType === "challenges"
                      ? t.caseStudy.challengeDescription
                      : `${t.caseStudy.servicesDescription} ${services?.map((s) => s.name).join(", ")}`)
                  }
                  buttonText={ctaButton?.text || ""}
                  buttonVariant={(ctaButton?.variant as any) || "limesmall"}
                  url={
                    ctaButton?.link ? resolveLink(ctaButton.link) : undefined
                  }
                  showButton={showButton}
                  align="left"
                />
              </div>
              <div className="col-span-5 col-start-5 mt-8">
                <ListContainerComponent>
                  {contentType === "challenges"
                    ? challenges.map((challenge, idx) => (
                        <ListItemComponent
                          key={idx}
                          size="small"
                          fontWeight="normal"
                          color="gray-700"
                        >
                          {challenge}
                        </ListItemComponent>
                      ))
                    : services.map((service) => (
                        <ListItemComponent
                          key={service._id}
                          size="small"
                          fontWeight="normal"
                          color="gray-700"
                        >
                          {service.name}
                        </ListItemComponent>
                      ))}
                </ListContainerComponent>
                {solution && (
                  <StaggeredSlideUp
                    className="flex flex-col mt-8 items-start justify-start"
                    delay={0.7}
                    staggerDelay={0.1}
                    duration={0.5}
                    distance={80}
                  >
                    <h2 className="text-2xl leading-compress text-gray-900 max-w-lg font-semibold tracking-tight leading-tighter mb-8">
                      {t.caseStudy.solution}
                    </h2>
                    <p className="text text-gray-900 mx-auto">{solution}</p>
                  </StaggeredSlideUp>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
