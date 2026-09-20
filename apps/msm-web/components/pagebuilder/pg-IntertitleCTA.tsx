"use client";
import React from "react";
import Button2 from "@msm/components/ui/Button2";
import CaseSection from "./cases/CaseSection";
import caseStyles from "./cases/CaseDetail.module.css";
import EditorialReveal from "@msm/components/ui/EditorialReveal";
import styles from "@msm/components/ui/EditorialBlocks.module.css";
import { resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import type { CTA } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

interface StaggeredSlideUpProps {
  className?: string;
  delay?: number;
  debug?: boolean;
  easing?: "smooth" | "spring" | "ease-out" | "bounce";
  staggerDelay?: number;
  duration?: number;
  distance?: number;
}

interface IntertitleCTAProps {
  caseLayout?: boolean;
  title: string;
  subtitle: string;
  cta?: CTA;
  staggeredProps?: Partial<StaggeredSlideUpProps>;
  containerClassName?: string;
  alignment?: "center" | "left";
  paddingTop?: "0" | "12" | "24" | "48";
  navPointName?: string;
  hideFromNav?: boolean;
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  caseLayout = false,
  subtitle,
  cta,
  navPointName,
  hideFromNav = false,
}) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  // Resolve CTA link and props
  let buttonHref = cta?.link ? resolveLink(cta.link) : undefined;
  // Fix URL to include locale if it's an internal link
  if (
    locale !== "en" && buttonHref &&
    buttonHref.startsWith("/") &&
    !buttonHref.startsWith(`/${locale}`)
  ) {
    buttonHref = `/${locale}${buttonHref}`;
  }
  const buttonText = cta?.text;
  const buttonVariant =
    (cta?.variant as "default" | "black" | "violet" | "violetsmall") || "violet";

  // Generate section ID from title
  const sectionId = title
    ? title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "intertitle-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  if (caseLayout) return (
    <section id={sectionId} {...navPointDataAttr} className={caseStyles.darkSection}>
      <div className={caseStyles.container}>
        <CaseSection title={title}>
          {hasVisibleText(subtitle) && <p className={caseStyles.copy}>{subtitle}</p>}
          {buttonHref && buttonText && <Button2 text={buttonText} variant={buttonVariant} href={buttonHref} />}
        </CaseSection>
      </div>
    </section>
  );

  return (
    <section id={sectionId} {...navPointDataAttr} className={styles.cta}>
      <div className={styles.inner}>
        <EditorialReveal className={styles.ctaInner}>
          <div className={styles.ctaCopy}>
            {hasVisibleText(title) && <h3 className={styles.heading}>{title}</h3>}
            {hasVisibleText(subtitle) && <p>{subtitle}</p>}
          </div>
          {buttonHref && buttonText && <div className={styles.ctaAction}>
            <Button2 text={buttonText} variant={buttonVariant} href={buttonHref} />
          </div>}
        </EditorialReveal>
      </div>
    </section>
  );
};

export default IntertitleCTA;
