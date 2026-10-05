"use client";

import Image from "next/image";
import styles from "./CaseDetail.module.css";
import DeferredVideo from "@msm/components/ui/DeferredVideo";
import Button2 from "@msm/components/ui/Button2";
import CaseReveal from "./CaseReveal";
import { getTranslations } from "@1sp/utils/translations";
import type { CaseStudyData, CloudinaryAsset } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";

type CasePersonRelation = NonNullable<CaseStudyData["people"]>[number];
type CasePerson = NonNullable<CasePersonRelation["person"]>;

interface CasePoweredByContactProps {
  caseStudy: CaseStudyData;
  locale: string;
}

function isVideoMedia(url?: string, media?: CloudinaryAsset | null) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  return (
    lowered.endsWith(".mp4") ||
    lowered.endsWith(".webm") ||
    lowered.endsWith(".mov") ||
    lowered.endsWith(".ogg") ||
    lowered.includes("/video/") ||
    (media as any)?.resource_type === "video" ||
    media?.metadata?.resource_type === "video"
  );
}

function pickPrimaryPerson(people: CaseStudyData["people"]): CasePerson | null {
  if (!people || people.length === 0) return null;

  return (
    people.find((entry) => entry?.isPrimary && entry?.person)?.person ||
    people.find((entry) => entry?.person)?.person ||
    null
  );
}

export default function CasePoweredByContact({
  caseStudy,
  locale,
}: CasePoweredByContactProps) {
  const t = getTranslations(locale);
  const relatedPerson = pickPrimaryPerson(caseStudy.people);

  if (!relatedPerson) return null;

  const personName = relatedPerson?.fullname || relatedPerson?.name || "";
  const personMedia = relatedPerson?.video || relatedPerson?.image || null;
  const personMediaUrl = assetUrl(personMedia);
  const personLabel =
    relatedPerson?.altText || relatedPerson?.fullname || relatedPerson?.name || "Team member";
  const personIsVideo = isVideoMedia(personMediaUrl, personMedia);

  return (
    <section
      className={`${styles.darkSection} py-16 sm:py-20 lg:py-24 font-aspekta`}
      data-component="case-powered-by-contact"
    >
      <div className={styles.container}>
        {relatedPerson && (
          <div
            className="max-w-5xl mx-auto bg-msm-surface overflow-hidden border-t border-white/20 grid grid-cols-1 lg:grid-cols-12 items-end gap-8 lg:gap-10"
          >
            <CaseReveal content className="lg:col-span-7 p-8">
              <h3
                className="text-xl sm:text-xl lg:text-2xl tracking-tight leading-tight text-neutral-100"
              >
                {t.caseStudy.wantToKnowMore}
              </h3>


              <p
                className="mt-2 text-2xl sm:text-3xl lg:text-3xl tracking-tight leading-tight  text-msm-cyan"
              >
                {personName}
              </p>

              <div
                className=" flex flex-col gap-2 text-sm  text-neutral-300"
              >
                {relatedPerson.position && (
                  <p className=" text-sm tracking-tight leading-tight  text-neutral-300 mb-5 sm:mb-6 ">{relatedPerson.position}</p>
                )}
                {relatedPerson.email && (
                  <div data-case-reveal-target><Button2
                    variant="violetsmallrounded"
                    magnetic={false}
                    text={relatedPerson.email}
                    href={`mailto:${relatedPerson.email}`}
                  /></div>
                )}
                {relatedPerson.profileUrl && (
                  <div data-case-reveal-target><Button2 variant="violetsmallrounded"
                    magnetic={false}
                    text={t.caseStudy.linkedInProfile}
                    href={relatedPerson.profileUrl}
                  /></div>
                )}
              </div>
            </CaseReveal>

            <CaseReveal
              className="lg:col-span-5"
            >
              <div className="relative ml-auto w-full max-w-[440px] overflow-hidden  bg-msm-surface aspect-[5/4]">
                {personMediaUrl ? (
                  personIsVideo ? (
                    <DeferredVideo
                      src={personMediaUrl}
                      maxWidth={640}
                      mountDelay={300}
                      posterFrame="0"
                      className="h-full w-full object-cover object-bottom"
                    />
                  ) : (
                    <Image
                      src={personMediaUrl}
                      alt={personLabel}
                      fill
                      sizes="(max-width: 1024px) 100vw, 440px"
                      className="object-cover object-bottom"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-msm-surface text-neutral-300">
                    {personName || "Contact"}
                  </div>
                )}
              </div>
            </CaseReveal>
          </div>
        )}
      </div>
    </section>
  );
}
