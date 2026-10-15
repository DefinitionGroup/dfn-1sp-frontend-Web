"use client";

import CaseSection from "./CaseSection";
import Button2 from "@msm/components/ui/Button2";
import styles from "./CaseDetail.module.css";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { resolveLink } from "@1sp/utils/cloudinary";
import type { CTA } from "@1sp/sanity-types";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { hasVisibleText } from "@1sp/utils/text-content";

interface Service {
  _id: string;
  name: string;
}

interface ChallengeAndSolutionProps {
  title: string;
  badgeText?: string;
  badgeSubtitle?: string;
  description?: string;
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
      <div className={`${styles.copy} prose prose-invert`}>
        <PortableText value={solution} />
      </div>
    );
  }
  
  // Handle legacy string format - split by newlines and render as list if bullet points detected
  const lines = String(solution).split('\n').filter(line => line.trim());
  const hasBullets = lines.some(line => line.trim().startsWith('•'));
  
  if (hasBullets) {
    return (
      <ul className={`${styles.copy} space-y-2 list-disc list-outside`}>
        {lines.map((line, idx) => (
          <li key={idx}>{line.replace(/^•\s*/, '')}</li>
        ))}
      </ul>
    );
  }
  
  return (
    <p className={`${styles.copy}`}>
      {solution}
    </p>
  );
}

export default function ChallengeAndSolution({
  title,
  badgeText,
  badgeSubtitle,
  description,
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
  navPointName,
  hideFromNav = false,
}: ChallengeAndSolutionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.content;

  // Sanity returns null (not undefined) for unset fields — default params won't catch it
  const effectiveContentType = contentType ?? "challenges";

  // Check if we have content to display
  const hasContentItems =
    (effectiveContentType === "services" && (services ?? []).length > 0) ||
    (effectiveContentType === "challenges" && (challenges ?? []).length > 0);

  // Determine if CTA section should be rendered
  const shouldShowCta = showCta && showContent && hasContentItems;

  // Determine if content list should be rendered
  const shouldShowContent = showContent && hasContentItems;

  return (
    <section id={sectionId} data-navpoint-name={navPointName || title || sectionId}
      data-nav-hidden={hideFromNav || undefined} className={styles.darkSection}>
      <div className={styles.container}>
        <CaseSection title={title} badgeText={badgeText} badgeSubtitle={badgeSubtitle}>
          {hasVisibleText(description) && <p className={styles.copy}>{description}</p>}
          {shouldShowContent && <ul className={styles.detailList}>
            {effectiveContentType === "challenges"
              ? (challenges ?? []).map((challenge, index) => <li key={index}>{challenge}</li>)
              : (services ?? []).map((service) => <li key={service._id}>{service.name}</li>)}
          </ul>}
          {shouldShowCta && <div className={styles.detailCta}>
            <h3 className={styles.subheading}>{ctaHeading || (effectiveContentType === "challenges"
              ? (challengeTitle || t.caseStudy.challenge) : t.caseStudy.services)}</h3>
            <p className={styles.copy}>{ctaParagraph || (effectiveContentType === "challenges"
              ? (challengeDescription || t.caseStudy.challengeDescription)
              : `${t.caseStudy.servicesDescription} ${(services ?? []).map((s) => s.name).join(", ")}`)}</p>
            {showButton && ctaButton?.text && ctaButton.link && <div data-case-reveal-target><Button2
              text={ctaButton.text} href={resolveLink(ctaButton.link)} variant="violetsmall" /></div>}
          </div>}
        </CaseSection>
        {showSolution && solution && <CaseSection title={solutionHeadline || t.caseStudy.solution}>
          <SolutionContent solution={solution} />
        </CaseSection>}
      </div>
    </section>
  );
}
