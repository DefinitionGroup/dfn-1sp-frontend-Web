"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import Button2 from "@msm/components/ui/Button2";
import SelectionFrame from "@msm/components/ui/SelectionFrame";
import type { GlobeConfig } from "@msm/components/ui/globe";
import { resolveLink } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";
import type { GlobeComponent as GlobeComponentType } from "@1sp/sanity-types";
import styles from "./MsmGlobe.module.css";

const World = dynamic(() => import("@msm/components/ui/globe").then((m) => m.World), { ssr: false });

/* Same sequence as the media feature (hashtaglove): the selection frame draws
   itself, the globe fades into the completed frame, then the copy, the
   location list and the CTA rise one after another. Motion off: all static. */
const COPY_DELAY = 0.95;
const sequence: Variants = { hidden: {}, visible: { transition: { delayChildren: COPY_DELAY, staggerChildren: 0.09 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, visualDuration: 0.4 } },
};
const list: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

/* Cube signals for location data only; the globe itself stays tonal. */
const ARC_COLORS = ["#03b8d4", "#02a8b2"];

const GLOBE_CONFIG: GlobeConfig = {
  pointSize: 1,
  pointRadius: 0.7,
  globeColor: "#14181a",
  showAtmosphere: false,
  atmosphereColor: "#f4f4f4",
  atmosphereAltitude: 0.1,
  emissive: "#0a0c0d",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  /* Small grey land dots: same count, wide gaps (dot = 22.5% of each cell). */
  polygonColor: "rgba(244,244,244,0.7)",
  hexUseDots: true,
  hexMargin: 0.775,
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1800,
  arcLength: 0.9,
  rings: 1,
  maxRings: 2,
};

type Props = { data: GlobeComponentType; language?: string };

export default function GlobeComponent({ data, language = "en" }: Props) {
  const { sectionTitle, sectionSubtitle, ctaLabel, cta, navPointName, hideFromNav } = data || {};
  const locations = useMemo(() => (data?.locations ?? []).filter((l) => Number.isFinite(l.coordinateLat) && Number.isFinite(l.coordinateLon)), [data?.locations]);

  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const entered = useInView(sectionRef, { once: true, amount: 0.15 });
  const nearViewport = useInView(sectionRef, { once: true, margin: "200px 0px" });
  const stageVisible = useInView(stageRef);
  const [mountGlobe, setMountGlobe] = useState(false);

  // Mount WebGL just before the section arrives, after other entrances settle.
  useEffect(() => {
    if (!nearViewport) return;
    const timer = setTimeout(() => setMountGlobe(true), 100);
    return () => clearTimeout(timer);
  }, [nearViewport]);

  // Each location connects to the previous one, closing the loop.
  const arcs = useMemo(
    () =>
      locations.map((location, index) => {
        const prev = locations[(index - 1 + locations.length) % locations.length];
        return {
          order: Math.floor(index / 3) + 1,
          startLat: prev.coordinateLat,
          startLng: prev.coordinateLon,
          endLat: location.coordinateLat,
          endLng: location.coordinateLon,
          arcAlt: 0.15 + (index % 3) * 0.08,
          color: ARC_COLORS[index % ARC_COLORS.length],
          label: location.name,
        };
      }),
    [locations],
  );

  const globeConfig = useMemo<GlobeConfig>(() => {
    const lngs = locations.map((l) => l.coordinateLon);
    const lats = locations.map((l) => l.coordinateLat);
    const mid = (values: number[]) => (Math.min(...values) + Math.max(...values)) / 2;
    return { ...GLOBE_CONFIG, initialPosition: { lat: mid(lats), lng: mid(lngs) } };
  }, [locations]);

  if (locations.length === 0) return null;

  let href = cta?.link ? resolveLink(cta.link) : undefined;
  if (language !== "en" && href && href.startsWith("/") && !href.startsWith(`/${language}`)) href = `/${language}${href}`;
  const sectionId = (sectionTitle || "globe-component").replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase();

  return (
    <section ref={sectionRef} id={sectionId} data-navpoint-name={navPointName} data-nav-hidden={hideFromNav ? "true" : undefined} className={styles.section}>
      <div className={styles.inner}>
        <SelectionFrame className={styles.frame} transientCrosses>
          <div className={styles.panel}>
            <div ref={stageRef} className={styles.stage} aria-hidden="true">
              {mountGlobe && (
                <motion.div
                  className={styles.canvas}
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={entered || reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
                  transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.75 }}
                >
                  <World data={arcs} globeConfig={globeConfig} rotateSpeed={0.4} distance={1.3} paused={!stageVisible} reducedMotion={reduced} />
                </motion.div>
              )}
            </div>
            <motion.div className={styles.copy} variants={sequence} initial={reduced ? "visible" : "hidden"} animate={entered || reduced ? "visible" : "hidden"}>
              {hasVisibleText(sectionTitle) && <motion.h2 variants={rise} className={styles.headline}>{sectionTitle}</motion.h2>}
              {hasVisibleText(sectionSubtitle) && <motion.p variants={rise} className={styles.text}>{sectionSubtitle}</motion.p>}
              <motion.ul variants={list} className={styles.locations}>
                {locations.map((location, index) => (
                  <motion.li key={location._key ?? `${location.name}-${index}`} variants={rise} className={styles.location}>
                    <span className={styles.locationName}>{location.name}</span>
                    {hasVisibleText(location.subtitle) && <span className={styles.locationMeta}>{location.subtitle}</span>}
                  </motion.li>
                ))}
              </motion.ul>
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
