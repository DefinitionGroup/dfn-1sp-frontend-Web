"use client";

import React from "react";
import type { CtaSplitHeader as CtaSplitHeaderType } from "@/types/sanity.types";
import { resolveLink } from "@/utils/utils";
import CtaMiniComponent from "./pg-CtaMiniComponent";
import { hasVisibleText } from "@/lib/text-content";


function CtaSplitHeader({ data }: { data: CtaSplitHeaderType }) {
  const cta = data?.cta;
  const href = cta?.link ? resolveLink(cta.link) : undefined;

  return (
    <section className="grid grid-cols-12 container mx-auto gap-8 font-aspekta">
      {/* Left: CTA Mini */}
      {cta && (
        <div className="col-span-3 col-start-1">
          <CtaMiniComponent
            className="pt-32 max-w-1/2"
            heading={cta.heading || ""}
            paragraph={cta.paragraph || ""}
            buttonText={cta.buttonText || ""}
            buttonVariant={(cta.variant as any) || "limesmall"}
            align={(cta.alignment as any) || "left"}
            url={href}
          />
        </div>
      )}

      {/* Middle: small two-line heading/subheading */}
      {(hasVisibleText(data?.heading) || hasVisibleText(data?.subheading)) && (
        <header className="col-span-3 col-start-1 md:col-start-4">
          <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
            <div className="flex-1 flex flex-col min-w-0">
              {hasVisibleText(data.heading) && (
                <h2 className="text-3xl text-neutral-900 font-aspekta">
                  {data.heading}
                </h2>
              )}
              {data.subheading && (
                <h4 className="text-3xl text-neutral-900 font-aspekta">
                  <span className="text-neutral-200">{data.subheading}</span>
                </h4>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Right: paragraph */}
      {hasVisibleText(data?.paragraph) && (
        <header className="col-span-6 md:col-start-8">
          <h2 className="text-base text-neutral-900 font-aspekta">
            {data.paragraph}
          </h2>
        </header>
      )}
    </section>
  );
}

export default CtaSplitHeader;
