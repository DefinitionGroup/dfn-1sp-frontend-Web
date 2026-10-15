"use client";
import React, { useLayoutEffect, useState, type CSSProperties } from "react";
import Button2 from "@msm/components/ui/Button2";
import CaseSection from "./cases/CaseSection";
import caseStyles from "./cases/CaseDetail.module.css";
import EditorialReveal from "@msm/components/ui/EditorialReveal";
import styles from "@msm/components/ui/EditorialBlocks.module.css";
import { resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import type { CTA } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

/* Brand accents that clear 3:1 on the MSM paper. Purple (2.55:1) and maroon
   (2.07:1) are deliberately left out — they read as dimmed, not accented. */
const CTA_ACCENTS = [
  "--color-msm-magenta",
  "--color-msm-cyan",
  "--color-msm-teal",
  "--color-msm-teal-deep",
  "--color-msm-orange",
  "--color-msm-amber",
  "--color-msm-red",
] as const;

/** A different accent each time the CTA mounts; magenta until hydration, so
    server and client markup agree. */
function useRandomAccent() {
  const [accent, setAccent] = useState<string>(CTA_ACCENTS[0]);
  useLayoutEffect(() => {
    setAccent(CTA_ACCENTS[Math.floor(Math.random() * CTA_ACCENTS.length)]);
  }, []);
  return `var(${accent})`;
}

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
  paddingBottom?: "0" | "12" | "24" | "48";
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
  paddingTop = "0",
  paddingBottom = "0",
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

  const ctaAccent = useRandomAccent();

  // Editor-controlled extra space, added to the block's own section padding.
  const extraSpace: Record<string, string> = { "12": "3rem", "24": "6rem", "48": "12rem" };
  const spacingStyle: CSSProperties = {
    ...(extraSpace[paddingTop] ? { paddingTop: `calc(var(--cta-pad, 0px) + ${extraSpace[paddingTop]})` } : {}),
    ...(extraSpace[paddingBottom] ? { paddingBottom: `calc(var(--cta-pad, 0px) + ${extraSpace[paddingBottom]})` } : {}),
    "--msm-cta-accent": ctaAccent,
  } as CSSProperties;

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  if (caseLayout) return (
    <section id={sectionId} {...navPointDataAttr} className={caseStyles.darkSection} style={spacingStyle}>
      <div className={caseStyles.container}>
        <CaseSection title={title}>
          {hasVisibleText(subtitle) && <p className={caseStyles.copy}>{subtitle}</p>}
          {buttonHref && buttonText && <div data-case-reveal-target><Button2 text={buttonText} variant={buttonVariant} href={buttonHref} /></div>}
        </CaseSection>
      </div>
    </section>
  );

  return (
    <section id={sectionId} {...navPointDataAttr} className={styles.cta} style={spacingStyle}>
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
