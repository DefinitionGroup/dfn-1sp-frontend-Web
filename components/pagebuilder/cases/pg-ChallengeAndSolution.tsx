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
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

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
  showContent?: boolean;
  challengeDescription?: string;
  challengeTitle?: string;
  challenges?: string[];
  services?: Service[];
  showCta?: boolean;
  ctaHeading?: string;
  ctaParagraph?: string;
  ctaButton?: CTA;
  showButton?: boolean;
  showSolution?: boolean;
  solutionHeadline?: string;
  solution?: PortableTextBlock[] | string;
  showGridBackground?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
  hideFromNav?: boolean;
}

// Helper to check if solution is Portable Text array
function isPortableText(value: unknown): value is PortableTextBlock[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && '_type' in value[0];
}

// Render solution content - handles both string and Portable Text
function SolutionContent({ solution }: { solution: PortableTextBlock[] | string }) {
  if (isPortableText(solution)) {
    return (
      <div className="text-sm sm:text-base text-gray-800 max-w-lg leading-relaxed prose prose-sm prose-gray">
        <PortableText value={solution} />
      </div>
    );
  }
  
  // Handle legacy string format - split by newlines and render as list if bullet points detected
  const lines = String(solution).split('\n').filter(line => line.trim());
  const hasBullets = lines.some(line => line.trim().startsWith('•'));
  
  if (hasBullets) {
    return (
      <ul className="text-sm sm:text-base text-gray-800 max-w-lg leading-relaxed space-y-2 list-disc list-inside">
        {lines.map((line, idx) => (
          <li key={idx}>{line.replace(/^•\s*/, '')}</li>
        ))}
      </ul>
    );
  }
  
  return (
    <p className="text-sm sm:text-base text-gray-800 max-w-lg leading-relaxed">
      {solution}
    </p>
  );
}

export default function ChallengeAndSolution({
  title,
  description,
  badgeText,
  badgeSubtitle,
  badgeNumber = "001",
  contentType = "challenges",
  showContent = true,
  challengeDescription,
  challengeTitle,
  challenges = [],
  services = [],
  showCta = true,
  ctaHeading,
  ctaParagraph,
  ctaButton,
  showButton = true,
  showSolution = true,
  solutionHeadline,
  solution,
  showGridBackground = true,
  backgroundColor = "bg-neutral-50",
  paddingY = "32",
  navPointName,
  hideFromNav = false,
}: ChallengeAndSolutionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const sectionId = t.ids.content;

  // Check if we have content to display
  const hasContentItems =
    (contentType === "services" && (services ?? []).length > 0) ||
    (contentType === "challenges" && (challenges ?? []).length > 0);

  // Determine if CTA section should be rendered
  const shouldShowCta = showCta && showContent && hasContentItems;

  // Determine if content list should be rendered
  const shouldShowContent = showContent && hasContentItems;

  // Determine list column classes based on whether CTA is shown
  const listColumnClasses = shouldShowCta
    ? "col-span-4 sm:col-span-6 md:col-span-5 md:col-start-5"
    : "col-span-4 sm:col-span-6 md:col-span-5 md:col-start-3";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <section className="relative overflow-hidden">
      <div
        id={sectionId}
        {...navPointDataAttr}
        className={`${backgroundColor} mt-8 relative font-aspekta`}
      >
        {showGridBackground && <GridBackground />}

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 py-16 sm:py-24 lg:py-${paddingY}`}>
            {/* Badge Module - Responsive sticky behavior */}
            <div className="col-span-4 sm:col-span-3 md:col-span-2 mb-6 md:mb-0 md:sticky md:top-24 self-start">
              <Badgemodule
                text={badgeText || t.badges.intro}
                subtitle={badgeSubtitle || t.badges.theGoal}
                numberEl={badgeNumber}
                variant="minimal"
                size="md"
              />
            </div>

            {/* Title and Description */}
            <div className="col-span-4 sm:col-span-6 md:col-span-10 md:col-start-3">
              <StaggeredSlideUp
                className="flex flex-col items-start justify-start gap-4"
                delay={0.1}
                staggerDelay={0.1}
                duration={0.5}
                distance={80}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 max-w-xl tracking-tight leading-[1.1] mb-4 md:mb-8">
                  {title}
                </h2>
                {description && (
                  <p className="text-base sm:text-lg text-gray-800 max-w-lg leading-relaxed">
                    {description}
                  </p>
                )}
              </StaggeredSlideUp>
            </div>

            {/* Challenge/Services and Solution section */}
            {shouldShowContent && (
              <>
                {/* CTA Mini - Responsive (only show if showCta is true) */}
                {shouldShowCta && (
                  <div className="col-span-4 sm:col-span-3 md:col-span-2 md:col-start-3 mt-6 md:mt-8">
                    <CtaMiniComponent
                      heading={
                        ctaHeading ||
                        (contentType === "challenges"
                          ? (challengeTitle || t.caseStudy.challenge)
                          : t.caseStudy.services)
                      }
                      paragraph={
                        ctaParagraph ||
                        (contentType === "challenges"
                          ? (challengeDescription || t.caseStudy.challengeDescription)
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
                )}

                {/* List Items - Responsive (adjusts width based on CTA visibility) */}
                <div className={`${listColumnClasses}   mt-6 md:mt-8 `}>
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

                  {/* Solution */}
                  {showSolution && solution && (
                    <StaggeredSlideUp
                      className="flex flex-col  mt-8 md:mt-10 items-start justify-start"
                      delay={0.7}
                      staggerDelay={0.1}
                      duration={0.5}
                      distance={80}
                    >
                      <h3 className="text-xl sm:text-2xl leading-tight text-gray-900 max-w-lg font-semibold tracking-tight mb-4 md:mb-6">
                        {solutionHeadline || t.caseStudy.solution}
                      </h3>
                      <SolutionContent solution={solution} />
                    </StaggeredSlideUp>
                  )}
                </div>
              </>
            )}

            {/* Solution only (when content is hidden but solution is enabled) */}
            {!shouldShowContent && showSolution && solution && (
              <div className="col-span-4 sm:col-span-6 md:col-span-10 md:col-start-3 mt-6 md:mt-8">
                <StaggeredSlideUp
                  className="flex flex-col items-start justify-start"
                  delay={0.3}
                  staggerDelay={0.1}
                  duration={0.5}
                  distance={80}
                >
                  <h3 className="text-xl sm:text-2xl leading-tight text-gray-900 max-w-lg font-semibold tracking-tight mb-4 md:mb-6">
                    {solutionHeadline || t.caseStudy.solution}
                  </h3>
                  <SolutionContent solution={solution} />
                </StaggeredSlideUp>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
