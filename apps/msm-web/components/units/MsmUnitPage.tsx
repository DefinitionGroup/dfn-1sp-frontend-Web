import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Button2 from "@msm/components/ui/Button2";
import Badgemodule from "@msm/components/ui/Badgemodule";
import MsmLogoAnimated from "@msm/components/ui/MsmLogoAnimated";
import CornerMarkers from "@msm/components/ui/CornerMarkers";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import CaseGalleryComponent from "@msm/components/data/data-CaseGallery";
import cards from "@msm/components/ui/SelectionCards.module.css";
import type { MsmUnitDetail, MsmUnitSummary } from "./types";

function localizedPath(language: string, path: string) {
  return `${language === "en" ? "" : `/${language}`}/${path.replace(/^\//, "")}`;
}

export default function MsmUnitPage({ unit, language, units = [] }: { unit: MsmUnitDetail; language: string; units?: MsmUnitSummary[] }) {
  const leadership = (unit.leadership || []).filter((entry) => entry.person);
  const cases = unit.cases || [];
  const related = units.filter((other) => other._id !== unit._id);
  const german = language === "de";

  return (
    <div className="bg-msm-paper text-msm-ink">
      <section className="relative min-h-[88svh] overflow-hidden border-b border-white/20">
        {unit.heroImageUrl ? <Image src={unit.heroImageUrl} alt={unit.heroAlt || unit.name} fill priority sizes="100vw" className="object-cover hero-clip-reveal" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,13,0.82),rgba(10,12,13,0.12)),linear-gradient(0deg,rgba(10,12,13,0.9),transparent_80%)]" />
        <div className="container mx-auto relative flex min-h-[88svh] flex-col justify-between gap-20 px-[var(--container-padding)] pb-14 pt-32 md:pb-20 md:pt-36">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href={localizedPath(language, "units")} className="inline-flex min-h-11 items-center gap-3 text-sm text-white/80 hover:text-white">
              <ArrowLeft size={18} aria-hidden="true" /> {german ? "Alle Units" : "All units"}
            </Link>
            <Link href={localizedPath(language, "")} className="flex items-center gap-3 text-xl tracking-tight" aria-label="MSM.digital home">
              <MsmLogoAnimated size={36} />MSM.digital
            </Link>
          </div>
          <div className="relative max-w-5xl py-7">
            <CornerMarkers inset="-0.25rem" className="text-msm-cyan text-base" />
            <StaggeredSlideUp delay={0.1} staggerDelay={0.08} distance={12}>
              <h1 className="headline-display max-w-[18ch]">{unit.name}</h1>
              <p className="mt-6 max-w-[40ch] text-xl leading-relaxed text-white/85 md:text-2xl">{unit.claim}</p>
              {unit.descriptor && unit.descriptor !== unit.claim ? <p className="msm-label mt-4 text-msm-cyan">{unit.descriptor}</p> : null}
            </StaggeredSlideUp>
          </div>
        </div>
      </section>

      <div className="container mx-auto">
      {unit.body?.length ? (
        <section className={`msm-section border-b border-white/20 ${cards.sectionLayout}`}>
          <Badgemodule text={unit.name} subtitle="MSM.digital" />
          <div className={cards.sectionContent}>
            <h2 className="msm-title mb-8">{german ? "Unser Ansatz." : "Our approach."}</h2>
            <div className="msm-copy space-y-6 text-white/75 [&_p+p]:mt-6"><PortableText value={unit.body} /></div>
          </div>
        </section>
      ) : null}

      {cases.length > 0 ? (
        <section className="msm-section border-b border-white/20">
          <h2 className="headline-display mb-12">{german ? "Unsere Arbeit." : "Work in action."}</h2>
          <CaseGalleryComponent caseStudies={cases} locale={language} filterAllText={german ? "Alle" : "All"} />
        </section>
      ) : null}

      {unit.capabilities?.length ? (
        <section className={`msm-section border-b border-white/20 ${cards.sectionLayout}`}>
          <Badgemodule text={german ? "Was wir können" : "What we do"} subtitle={german ? "Unsere Expertise" : "Our expertise"} />
          <div className={cards.sectionContent}>
            <h2 className="msm-title mb-10">{german ? "Was wir können." : "What we do."}</h2>
            <ul className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
              {unit.capabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-4 text-lg leading-relaxed text-white/80 md:text-xl">
                  <span aria-hidden="true" className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-msm-cyan/50" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {leadership.length > 0 ? (
        <section className="msm-section border-b border-white/20">
          <h2 className="headline-display mb-12">{german ? "Die Menschen dahinter." : "People behind the work."}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map(({ person, isPrimary }) => person ? (
              <article key={person._id}>
                {person.imageUrl ? <div className="relative aspect-[4/5] overflow-hidden"><Image src={person.imageUrl} alt={person.altText || person.fullname || person.name || ""} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div> : null}
                <div className="border-t border-white/25 py-6">
                  <h3 className="text-2xl">{person.fullname || person.name}</h3>
                  {person.position ? <p className="mt-2 text-white/70">{person.position}</p> : null}
                  {isPrimary ? <p className="msm-label mt-4 text-msm-cyan">{german ? "Kontakt" : "Your contact"}</p> : null}
                  {person.email ? <a href={`mailto:${person.email}`} className="mt-4 inline-block break-all text-white/80 underline underline-offset-4">{person.email}</a> : null}
                </div>
              </article>
            ) : null)}
          </div>
        </section>
      ) : null}

      <section className="msm-section grid items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <h2 className="headline-display max-w-[17ch]">{german ? "Was kommt als Nächstes?" : "Let’s build what comes next."}</h2>
          <p className="msm-copy mt-6 text-white/70">{german ? "Dein Projekt. Unsere Expertise." : "Your next project. Our shared expertise."}</p>
        </div>
        <div className="md:col-span-4 md:justify-self-end"><Button2 text={german ? "Projekt starten" : "Start a project"} href={localizedPath(language, "contact")} variant="violet" /></div>
      </section>

      {related.length ? (
        <nav aria-label={german ? "Weitere MSM Units" : "More MSM units"} className="border-t border-white/25 px-[var(--container-padding)] pb-12">
          <p className="msm-label py-7 text-white/65">{german ? "Weitere Units entdecken" : "Explore the other units"}</p>
          <div className="grid gap-x-10 md:grid-cols-3">
            {related.map((other) => <Link key={other._id} href={localizedPath(language, `units/${other.slug.current}`)} className="group flex min-h-20 items-center justify-between gap-4 border-t border-white/20 py-5 text-xl"><span>{other.name}</span><ArrowUpRight size={22} aria-hidden="true" className="shrink-0 text-msm-cyan transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" /></Link>)}
          </div>
        </nav>
      ) : null}
      </div>
    </div>
  );
}
