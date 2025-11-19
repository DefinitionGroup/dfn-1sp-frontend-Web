"use client";

import { useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { getTranslations } from "@/lib/translations";
import { useParams } from "next/navigation";

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
          className={`z-1 grid gap-8 col-span-12 py-${paddingY} col-start-1 container mx-auto row-start-1 grid-cols-12`}
        >
          <div className="z-1 col-span-16 col-start-1">
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={100}
                className="max-w-2/4 py-32"
              >
                <h2 className="text-lg leading-none text-neutral-700 pb-3 font-aspekta ">
                  {headline}
                </h2>
                <h3 className="text-5xl text-neutral-700  leading-[60px] font-aspekta ">
                  {title}
                </h3>
                {description && (
                  <h2 className="text-5xl  text-neutral-300 pb-3  leading-[60px] [90px] font-aspekta ">
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
