"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import Button2 from "@msm/components/ui/Button2";
import DeferredVideo from "@msm/components/ui/DeferredVideo";
import SelectionFrame from "@msm/components/ui/SelectionFrame";
import { resolveLink } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";
import type { MsmMediaFeatureComponent } from "@1sp/sanity-types";
import styles from "./MsmMediaFeature.module.css";

/* Sequence on entering the viewport (one trigger, shared with the frame):
   1. the selection frame draws itself (case tile signature, ~0.7s),
   2. the frame content — the video and its scrim — fades in,
   3. the copy rises one line at a time. Motion off: everything is simply there. */
const COPY_DELAY = 0.95;
const sequence: Variants = { hidden: {}, visible: { transition: { delayChildren: COPY_DELAY, staggerChildren: 0.09 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, visualDuration: 0.4 } },
};

type Props = MsmMediaFeatureComponent & { language?: string };

export default function MsmMediaFeature({ eyebrow, headline, text, video, poster, brightness, ctaLabel, cta, navPointName, hideFromNav, language = "en" }: Props) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const entered = useInView(sectionRef, { once: true, amount: 0.15 });

  let href = cta?.link ? resolveLink(cta.link) : undefined;
  if (language !== "en" && href && href.startsWith("/") && !href.startsWith(`/${language}`)) href = `/${language}${href}`;
  const videoUrl = video?.secure_url;
  const posterUrl = poster?.secure_url;
  const level = Math.min(100, Math.max(10, brightness ?? 55));
  const shade = (1 - level / 100).toFixed(2);
  const sectionId = (headline || "media-feature").replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase();

  return (
    <section ref={sectionRef} id={sectionId} data-navpoint-name={navPointName} data-nav-hidden={hideFromNav ? "true" : undefined} className={styles.section}>
      <div className={styles.inner}>
        <SelectionFrame className={styles.frame} transientCrosses>
          <div className={styles.panel} style={{ "--msm-feature-shade": shade } as CSSProperties}>
            <div className={styles.media} aria-hidden="true">
              {videoUrl && (
                <DeferredVideo src={videoUrl} maxWidth={1920} posterUrl={posterUrl} autoPlay={!reduced} mountDelay={400} className="h-full w-full object-cover" />
              )}
            </div>
            <div className={styles.scrim} aria-hidden="true" />
            <motion.div className={styles.copy} variants={sequence} initial={reduced ? "visible" : "hidden"} animate={entered || reduced ? "visible" : "hidden"}>
              {hasVisibleText(eyebrow) && <motion.p variants={rise} className={styles.eyebrow}>{eyebrow}</motion.p>}
              {hasVisibleText(headline) && <motion.h2 variants={rise} className={styles.headline}>{headline}</motion.h2>}
              {hasVisibleText(text) && <motion.p variants={rise} className={styles.text}>{text}</motion.p>}
              {href && hasVisibleText(cta?.text) && (
                <motion.div variants={rise} className={styles.action}>
                  <Button2 text={cta!.text} eyebrow={ctaLabel} href={href} variant="violet" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </SelectionFrame>
      </div>
    </section>
  );
}
