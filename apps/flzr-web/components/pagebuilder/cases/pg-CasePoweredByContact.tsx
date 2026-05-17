"use client";

import Image from "next/image";
import DeferredVideo from "@flzr/components/ui/DeferredVideo";
import Button2 from "@flzr/components/ui/Button2";
import { motion } from "motion/react";
import { getTranslations } from "@1sp/utils/translations";
import type { CaseStudyData, CloudinaryAsset } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";

type CaseUnit = NonNullable<CaseStudyData["units"]>[number];
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

function getUnitLogoUrl(unit: CaseUnit): string | undefined {
  return (
    assetUrl(unit.logoColor) ||
    assetUrl(unit.logo) ||
    assetUrl(unit.logoSignet) ||
    unit.logoUrl
  );
}

export default function CasePoweredByContact({
  caseStudy,
  locale,
}: CasePoweredByContactProps) {
  const t = getTranslations(locale);
  const units = caseStudy.units || [];
  const relatedPerson = pickPrimaryPerson(caseStudy.people);

  const unitLogos = units
    .map((unit) => ({
      unit,
      logoUrl: getUnitLogoUrl(unit),
    }))
    .filter((entry): entry is { unit: CaseUnit; logoUrl: string } =>
      Boolean(entry.logoUrl)
    );

  if (unitLogos.length === 0 && !relatedPerson) {
    return null;
  }

  const personName = relatedPerson?.fullname || relatedPerson?.name || "";
  const personUnit = relatedPerson?.unit?.name || units[0]?.name || "";
  const personMedia = relatedPerson?.video || relatedPerson?.image || null;
  const personMediaUrl = assetUrl(personMedia);
  const personLabel =
    relatedPerson?.altText || relatedPerson?.fullname || relatedPerson?.name || "Team member";
  const personIsVideo = isVideoMedia(personMediaUrl, personMedia);

  return (
    <section
      className="relative bg-neutral-100 py-16 sm:py-20 lg:py-24 font-aspekta"
      data-component="case-powered-by-contact"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {unitLogos.length > 0 && (
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-center text-2xl sm:text-3xl tracking-tight text-neutral-900">
              {t.caseStudy.poweredBy}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {unitLogos.map(({ unit, logoUrl }) => (
                <div
                  key={unit._id}
                  className="relative aspect-[3/2] w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.667rem)] "
                >
                  <Image
                    src={logoUrl}
                    alt={unit.name || "Unit logo"}
                    fill
                    sizes="(max-width: 640px) 50vw, 240px"
                    className="object-contain p-5 sm:p-6"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedPerson && (
          <div
            className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 items-end gap-8 lg:gap-10"
          >
            <div className="lg:col-span-7 p-8">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className=" text-sm tracking-tight leading-tight  text-neutral-500 "
              >
                {`${t.caseStudy.contactPrefix}`}
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                className="text-xl sm:text-xl lg:text-2xl tracking-tight leading-tight text-neutral-700"
              >
                {t.caseStudy.wantToKnowMore}
              </motion.h3>


              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="mt-2 text-2xl sm:text-3xl lg:text-3xl tracking-tight leading-tight  text-lime-500"
              >
                {`${personName}${personUnit ? ` @ ${personUnit}` : ""}`}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                className=" flex flex-col gap-2 text-sm  text-neutral-300"
              >
                {relatedPerson.position && (
                  <p className=" text-sm tracking-tight leading-tight  text-neutral-500 mb-5 sm:mb-6 ">{relatedPerson.position}</p>
                )}
                {relatedPerson.email && (
                  <Button2
                    variant="limesmallrounded"
                    magnetic={false}
                    text={relatedPerson.email}
                    href={`mailto:${relatedPerson.email}`}
                  />
                )}
                {relatedPerson.profileUrl && (
                  <Button2 variant="limesmallrounded"
                    magnetic={false}
                    text={t.caseStudy.linkedInProfile}
                    href={relatedPerson.profileUrl}
                  />
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <div className="relative ml-auto w-full max-w-[440px] overflow-hidden rounded-sm bg-neutral-200 aspect-[5/4]">
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
                  <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-500">
                    {personName || "Contact"}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
