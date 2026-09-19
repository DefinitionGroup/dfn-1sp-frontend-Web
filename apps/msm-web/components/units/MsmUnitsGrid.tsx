"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import MsmLogoAnimated from "@msm/components/ui/MsmLogoAnimated";
import Badgemodule from "@msm/components/ui/Badgemodule";
import SelectionFrame, { SelectionSequence } from "@msm/components/ui/SelectionFrame";
import type { MsmUnitSummary } from "./types";
import styles from "./units.module.css";
import cards from "@msm/components/ui/SelectionCards.module.css";

export default function MsmUnitsGrid({ eyebrow, headline, intro, language, units, embedded = false }: {
  eyebrow: string;
  headline: string;
  intro: string;
  language: string;
  units: MsmUnitSummary[];
  embedded?: boolean;
}) {
  const Heading = embedded ? "h2" : "h1";
  const UnitHeading = embedded ? "h3" : "h2";
  const prefix = language === "en" ? "" : `/${language}`;
  if (!units.length) return null;

  return (
    <section id="msm-units" data-navpoint-name="MSM Units" className={styles.units} data-embedded={embedded}>
      <div className="container mx-auto px-[var(--container-padding)]">
      <SelectionSequence className={cards.sectionLayout}>
        <Badgemodule text={eyebrow || (language === "de" ? "Unsere Units" : "Our units")} subtitle="MSM.digital" />
        <div className={cards.sectionContent}>
      <header className={styles.header}>
          <Heading className="headline-display">{headline}</Heading>
          {intro ? <p className="msm-copy mt-6 text-white/70">{intro}</p> : null}
      </header>
      <div className={cards.grid}>
        {units.map((unit, index) => (
          <SelectionFrame key={unit._id} className={cards.card} contentClassName={cards.cardContent} sequenceIndex={index + 1}>
            <Link href={`${prefix}/units/${unit.slug.current}`} className={cards.link}>
              <div className={cards.media}>
                {unit.heroImageUrl ? <Image src={unit.heroImageUrl} alt={unit.heroAlt || unit.name} fill sizes="(min-width: 768px) 50vw, 100vw" priority={!embedded && index < 2} className={cards.image} /> : <MsmLogoAnimated size={72} />}
              </div>
              <div className={cards.copy}>
                <div className={cards.titleRow}>
                  <UnitHeading className={cards.title}>{unit.name}</UnitHeading>
                  <ArrowUpRight size={24} aria-hidden="true" className={cards.arrow} />
                </div>
                <p className={cards.claim}>{unit.claim}</p>
                <span className={cards.action}>{unit.linkLabel || (language === "de" ? "Unit entdecken" : "Explore unit")}</span>
              </div>
            </Link>
          </SelectionFrame>
        ))}
      </div>
        </div>
      </SelectionSequence>
      </div>
    </section>
  );
}
