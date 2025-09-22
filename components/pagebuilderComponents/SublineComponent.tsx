"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";
import type { CTA } from "@/types/sanity.types";
import { ctaToButtonProps } from "@/utils/utils";
import Button2 from "../ui/Button2";

type SublineComponentData = {
  description?: string;
  showGridBackground?: boolean;
  additionalContent?: CTA[];
};

export default function SublineComponent({
  data,
}: {
  data: SublineComponentData;
}) {
  const {
    description,
    showGridBackground = true,
    additionalContent = [],
  } = data || {};

  const ctas = Array.isArray(additionalContent) ? additionalContent : [];

  if (!description && ctas.length === 0) return null;

  return (
    <section className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta">
      {showGridBackground && <GridBackground />}

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
                      variant={(btn.variant as any) || "limesmall"}
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
