"use client";
import React from "react";
import type { CTA } from "@1sp/sanity-types";
import { ctaToButtonProps } from "@1sp/utils/cloudinary";
import Button2 from "@flzr/components/ui/Button2";


type SublineComponentData = {
  description?: string;
  additionalContent?: CTA[];
  sectionTitle?: string;
  navPointName?: string;
};

function SublineComponent({
  data,
}: {
  data: SublineComponentData;
}) {
  const {
    description,
    additionalContent = [],
    sectionTitle,
    navPointName,
  } = data || {};

  const ctas = Array.isArray(additionalContent) ? additionalContent : [];

  if (!description && ctas.length === 0) return null;

  // Generate section ID from description or default
  const sectionId = sectionTitle
    ? sectionTitle
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : description
      ? description
          .substring(0, 30)
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()
      : "subline-section";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta"
    >

      <div className="z-1 grid gap-8 col-span-12 py-4 col-start-1 container mx-auto row-start-1 grid-cols-12">
        <div className="z-1 col-span-12 md:col-span-3 md:col-start-10">
          {/* Description + CTAs */}
          <div className="flex flex-col items-start gap-8 justify-center w-full">
            {description && (
              <p className="text-xs leading-normal text-neutral-800 font-aspekta font-normal">
                {description}
              </p>
            )}

            {ctas.length > 0 && (
              <div className="flex flex-col gap-4">
                {ctas.map((cta, idx) => {
                  const btn = ctaToButtonProps(cta);
                  if (!btn?.text) return null;
                  return (
                    <Button2
                      key={`subline-cta-${idx}`}
                      variant={(btn.variant as any) || "violetsmall"}
                      text={btn.text}
                      href={btn.href}
                      className="w-fit"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SublineComponent;
