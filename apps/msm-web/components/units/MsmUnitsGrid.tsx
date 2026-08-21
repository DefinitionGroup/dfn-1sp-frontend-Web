"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import MsmLogoAnimated from "@msm/components/ui/MsmLogoAnimated";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import type { MsmUnitSummary } from "./types";

const ACCENTS = ["#03b8d4", "#d10dab", "#ed4033", "#f5991c"];

function unitHref(language: string, slug: string) {
  return `${language === "en" ? "" : `/${language}`}/units/${slug}`;
}

export default function MsmUnitsGrid({
  eyebrow,
  headline,
  intro,
  language,
  units,
}: {
  eyebrow: string;
  headline: string;
  intro: string;
  language: string;
  units: MsmUnitSummary[];
}) {
  const reduceMotion = useReducedMotion();
  const heroImage = units[0]?.heroImageUrl;

  return (
    <section id="units" className="bg-msm-paper text-msm-ink">
      <div className="relative min-h-[88svh] overflow-hidden border-b border-white/20">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover hero-clip-reveal"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,13,0.3)_0%,rgba(10,12,13,0.45)_42%,rgba(10,12,13,0.96)_100%)]" />

        <div className="relative z-10 flex min-h-[88svh] flex-col justify-between px-[var(--container-padding)] pb-12 pt-28 md:pb-16 md:pt-36">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
            <MsmLogoAnimated size={58} />
            <span>MSM* / Units</span>
          </div>

          <StaggeredSlideUp className="max-w-6xl" delay={0.15} staggerDelay={0.08} distance={18}>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan">
              {eyebrow}
            </p>
            <h1 className="headline-display max-w-5xl text-balance text-white">{headline}</h1>
            {intro ? (
              <p className="mt-7 max-w-[68ch] text-base leading-relaxed text-white/78 md:text-xl">
                {intro}
              </p>
            ) : null}
          </StaggeredSlideUp>
        </div>
      </div>

      {units.length > 0 ? (
        <div className="grid border-b border-white/20 md:grid-cols-2">
          {units.map((unit, index) => (
            <motion.article
              key={unit._id}
              initial={reduceMotion ? false : { opacity: 0.75, clipPath: "inset(7% 0 0 0)" }}
              whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="group relative min-h-[72svh] overflow-hidden border-t border-white/20 odd:md:border-r"
            >
              <Link
                href={unitHref(language, unit.slug.current)}
                className="focus-ring grid h-full min-h-[72svh] grid-rows-[1fr_auto] bg-msm-surface"
                aria-label={`Explore ${unit.name}`}
              >
                <div className="relative min-h-[42svh] overflow-hidden bg-black">
                  {unit.heroImageUrl ? (
                    <motion.div
                      className="absolute inset-0"
                      whileHover={reduceMotion ? undefined : { scale: 1.025 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Image
                        src={unit.heroImageUrl}
                        alt={unit.heroAlt || ""}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-72 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </motion.div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MsmLogoAnimated size={120} className="opacity-70" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ backgroundColor: ACCENTS[index % ACCENTS.length] }} />
                  <div className="absolute left-6 top-6 md:left-8 md:top-8">
                    {unit.unitMarkUrl ? (
                      <img src={unit.unitMarkUrl} alt="" className="h-14 w-14 object-contain" />
                    ) : (
                      <MsmLogoAnimated size={54} />
                    )}
                  </div>
                </div>

                <div className="grid gap-7 border-t border-white/20 p-6 md:grid-cols-[1fr_auto] md:p-8">
                  <div>
                    {unit.descriptor && unit.descriptor !== unit.claim ? (
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white/48">
                        {unit.descriptor}
                      </p>
                    ) : null}
                    <h2 className="text-3xl font-semibold tracking-[-0.025em] text-white md:text-5xl">
                      {unit.name}
                    </h2>
                    <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-white/66 md:text-base">
                      {unit.claim}
                    </p>
                  </div>
                  <span className="self-end text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan transition-transform duration-300 group-hover:translate-x-1">
                    Explore ↗
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="px-[var(--container-padding)] py-24 text-white/60">
          Units will appear here once they are published.
        </div>
      )}
    </section>
  );
}
