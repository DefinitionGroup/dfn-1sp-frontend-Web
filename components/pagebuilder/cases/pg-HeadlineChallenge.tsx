"use client";

import { useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { hasVisibleText } from "@1sp/utils/text-content";

interface HeadlineChallengeProps {
  title: string;
  headline?: string;
  description?: string;
  showGridBackground?: boolean;
  paddingY?: string;
  navPointName?: string;
}

export default function HeadlineChallenge({
  title,
  headline,
  description,
  showGridBackground = true,
  paddingY = "16",
  navPointName,
}: HeadlineChallengeProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const sectionId = t.ids.intro;

  return (
    <section className="relative overflow-hidden">
      <div
        id={sectionId}
        data-navpoint-name={navPointName}
        className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta"
      >
        {showGridBackground && <GridBackground />}
        <div
          className={`z-1 grid gap-4 sm:gap-6 lg:gap-8 col-span-12 py-12 sm:py-16 lg:py-${paddingY} col-start-1 container mx-auto row-start-1 grid-cols-12 px-4 sm:px-6 lg:px-0`}
        >
          <div className="z-1 col-span-12 md:col-span-10 lg:col-span-8 col-start-1">
            <div className="flex flex-col items-start  gap-4 sm:gap-6 lg:gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={12}
                className="max-w-full md:max-w-2/3  lg:max-w-3/4 py-16 "
              >
                {hasVisibleText(headline) ? (
                  <h2 className="text-sm sm:text-base lg:text-lg tracking-tight leading-tighter text-neutral-400  font-medium font-aspekta">
                    {headline}
                  </h2>
                ) : null}
                {hasVisibleText(title) ? (
                  <h3 className="text-4xl md:text-4xl tracking-tight leading-tight lg:text-5xl text-neutral-700   font-aspekta">
                    {title}
                  </h3>
                ) : null}
                {hasVisibleText(description) && (
                  <h2 className="text-4xl md:text-4xl lg:text-5xl tracking-tight leading-tighter text-neutral-300 pb-2 sm:pb-3 leading-none font-aspekta">
                    {description}
                  </h2>
                )}
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
