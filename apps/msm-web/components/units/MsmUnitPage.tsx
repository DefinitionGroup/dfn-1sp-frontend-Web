import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import Button2 from "@msm/components/ui/Button2";
import MsmLogoAnimated from "@msm/components/ui/MsmLogoAnimated";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import CaseGalleryComponent from "@msm/components/data/data-CaseGallery";
import type { MsmUnitDetail } from "./types";

function localizedPath(language: string, path: string) {
  return `${language === "en" ? "" : `/${language}`}/${path.replace(/^\//, "")}`;
}

export default function MsmUnitPage({ unit, language }: { unit: MsmUnitDetail; language: string }) {
  const leadership = (unit.leadership || []).filter((entry) => entry.person);
  const cases = unit.cases || [];

  return (
    <div className="bg-msm-paper text-msm-ink">
      <section className="relative min-h-[94svh] overflow-hidden border-b border-white/20">
        {unit.heroImageUrl ? (
          <Image
            src={unit.heroImageUrl}
            alt={unit.heroAlt || unit.name}
            fill
            priority
            sizes="100vw"
            className="object-cover hero-clip-reveal"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,13,0.68)_0%,rgba(10,12,13,0.38)_28%,rgba(10,12,13,0.48)_48%,rgba(10,12,13,0.98)_100%)]" />
        <div className="relative z-10 flex min-h-[94svh] flex-col justify-between px-[var(--container-padding)] pb-12 pt-28 md:pb-16 md:pt-36">
          <div className="flex items-center justify-between gap-6">
            <Link
              href={localizedPath(language, "units")}
              className="focus-ring text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
            >
              ← All Units
            </Link>
            {unit.unitMarkUrl ? (
              <img src={unit.unitMarkUrl} alt="" className="h-16 w-16 object-contain" />
            ) : (
              <MsmLogoAnimated size={68} />
            )}
          </div>

          <StaggeredSlideUp className="max-w-6xl" delay={0.12} staggerDelay={0.08} distance={18}>
            {unit.descriptor && unit.descriptor !== unit.claim ? (
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan">
                {unit.descriptor}
              </p>
            ) : null}
            <h1 className="headline-display max-w-5xl text-balance text-white">{unit.name}</h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/82 md:text-2xl">
              {unit.claim}
            </p>
          </StaggeredSlideUp>
        </div>
      </section>

      <section className="grid border-b border-white/20 px-[var(--container-padding)] py-20 md:grid-cols-12 md:gap-10 md:py-32">
        <div className="mb-10 md:col-span-4 md:mb-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan">{unit.name}</p>
          <h2 className="mt-4 max-w-[12ch] text-3xl font-semibold tracking-[-0.025em] text-white md:text-5xl">
            {unit.claim}
          </h2>
        </div>
        <div className="max-w-[72ch] space-y-6 text-base leading-[1.75] text-white/72 md:col-span-7 md:col-start-6 md:text-lg [&_p+p]:mt-6">
          {unit.body ? <PortableText value={unit.body} /> : null}
        </div>
      </section>

      <section className="border-b border-white/20 px-[var(--container-padding)] py-20 md:py-32">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="text-3xl font-semibold tracking-[-0.025em] text-white md:col-span-4 md:text-5xl">
            Capabilities
          </h2>
          <ol className="border-t border-white/20 md:col-span-7 md:col-start-6">
            {(unit.capabilities || []).map((capability, index) => (
              <li key={capability} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/20 py-5 text-white/78 md:py-6">
                <span className="font-mono text-[10px] text-msm-cyan">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-base md:text-lg">{capability}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {leadership.length > 0 ? (
        <section className="border-b border-white/20 px-[var(--container-padding)] py-20 md:py-32">
          <h2 className="mb-12 text-3xl font-semibold tracking-[-0.025em] text-white md:text-5xl">Leadership</h2>
          <div className="grid border-l border-t border-white/20 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map(({ person, isPrimary }) => person ? (
              <article key={person._id} className="border-b border-r border-white/20">
                {person.imageUrl ? (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={person.imageUrl}
                      alt={person.altText || person.fullname || person.name || ""}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-msm-surface"><MsmLogoAnimated size={88} /></div>
                )}
                <div className="p-6">
                  {isPrimary ? <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-msm-cyan">Primary contact</p> : null}
                  <h3 className="text-xl font-semibold text-white">{person.fullname || person.name}</h3>
                  {person.position ? <p className="mt-2 text-sm text-white/58">{person.position}</p> : null}
                  {person.email ? <a href={`mailto:${person.email}`} className="focus-ring mt-5 inline-block text-sm text-white/72 underline decoration-white/25 underline-offset-4 hover:text-white">{person.email}</a> : null}
                </div>
              </article>
            ) : null)}
          </div>
        </section>
      ) : null}

      {cases.length > 0 ? (
        <section className="border-b border-white/20 py-20 md:py-32">
          <div className="px-[var(--container-padding)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan">Selected work</p>
            <h2 className="mb-12 mt-4 text-3xl font-semibold tracking-[-0.025em] text-white md:text-5xl">Cases by {unit.name}</h2>
          </div>
          <div className="px-1 md:px-2">
            <CaseGalleryComponent caseStudies={cases} locale={language} filterAllText="All" />
          </div>
        </section>
      ) : null}

      <section className="grid min-h-[60svh] items-end gap-10 px-[var(--container-padding)] py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-msm-cyan">Work with {unit.name}</p>
          <h2 className="mt-5 max-w-[15ch] text-balance text-4xl font-semibold tracking-[-0.03em] text-white md:text-6xl">
            Let’s build what comes next.
          </h2>
        </div>
        <div className="md:col-span-3 md:col-start-10 md:justify-self-end">
          <Button2 text="Start a project" href={localizedPath(language, "contact")} variant="violet" />
        </div>
      </section>
    </div>
  );
}
