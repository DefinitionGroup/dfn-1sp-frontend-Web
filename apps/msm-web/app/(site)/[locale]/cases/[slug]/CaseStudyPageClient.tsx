"use client";
import { useEffect, useRef } from "react";
import HeaderImageVideoComp from "@msm/components/data/Fragments/data-HeaderImageVideoComp";
import CaseReveal from "@msm/components/pagebuilder/cases/CaseReveal";
import DecryptRotator from "@msm/components/ui/DecryptRotator";
import Badgemodule from "@msm/components/ui/Badgemodule";
import styles from "@msm/components/pagebuilder/cases/CaseDetail.module.css";
import { CasePageBuilder } from "@msm/components/CasePageBuilder";
import CasePoweredByContact from "@msm/components/pagebuilder/cases/pg-CasePoweredByContact";
import { getTranslations } from "@1sp/utils/translations";
import type { CaseStudyData } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

type MsmAttributedUnit = {
  _id: string;
  name: string;
  slug?: { current?: string };
};

interface CaseStudyPageClientProps {
  caseStudy: CaseStudyData & { msmUnits?: MsmAttributedUnit[] };
  locale: string;
}

export default function CaseStudyPageClient({
  caseStudy,
  locale,
}: CaseStudyPageClientProps) {
  const t = getTranslations(locale);
  const pageRef = useRef<HTMLDivElement>(null);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // Normalize main image / video URLs
  const mainVideoUrl =
    (caseStudy.mainVideo &&
      (caseStudy.mainVideo.secure_url || caseStudy.mainVideo.url)) ||
    (caseStudy.mainVideoUrl as string | undefined) ||
    null;

  const mainImageUrl =
    (caseStudy.mainImage &&
      (caseStudy.mainImage.secure_url || caseStudy.mainImage.url)) ||
    (caseStudy.mainImageUrl as string | undefined) ||
    "/placeholder.jpg";

  return (
    <div ref={pageRef}>
      <section id={t.ids.top} data-navpoint-name={t.ids.top} className={styles.hero}>

        {/* Background Image with Overlay */}
        {mainVideoUrl ? (
          <HeaderImageVideoComp
            useVideo={true} className="z-1  overflow-hidden "
            videoSrc={mainVideoUrl}
            imageSrc={mainImageUrl}
            opacity="opacity-70"
            enableVertical={caseStudy.isVerticalVideo}
          />
        ) : (
          <HeaderImageVideoComp
            useVideo={false}
            imageSrc={mainImageUrl}
            opacity="opacity-50"
          />
        )}


        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroGrid}>
            <CaseReveal className={styles.heroCopy}>
              {hasVisibleText(caseStudy.subtitle) && (
                <p className={styles.heroSubtitle}>{caseStudy.subtitle}</p>
              )}
              <DecryptRotator text={[caseStudy.title]} variant="headline" className={styles.heroTitle} revealDurationMs={700} delayMs={60} />
              {hasVisibleText(caseStudy.description) && (
                <p className={styles.heroDescription}>{caseStudy.description}</p>
              )}
            </CaseReveal>
            {(caseStudy.msmUnits || []).some((unit) => hasVisibleText(unit.name)) && (
              <div className={styles.badges}>
                {(caseStudy.msmUnits || []).map((unit) => hasVisibleText(unit.name) ? (
                  <Badgemodule key={unit._id} text={unit.name} subtitle="" size="sm" className={styles.unitBadge} />
                ) : null)}
              </div>
            )}
          </div>
        </div>

        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium -rotate-90 origin-bottom-left">
          MSM*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / MSM
        </div>
      </section>

      {/* Case Page Builder - Modular case study sections */}
      {caseStudy.casesPageBuilder &&
        Array.isArray(caseStudy.casesPageBuilder) &&
        caseStudy.casesPageBuilder.length > 0 && (
          <CasePageBuilder content={caseStudy.casesPageBuilder} />
        )}

      <CasePoweredByContact caseStudy={caseStudy} locale={locale} />
    </div>
  );
}
