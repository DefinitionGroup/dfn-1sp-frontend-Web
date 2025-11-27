"use client";

import { useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import { getTranslations } from "@/lib/translations";
import { useParams } from "next/navigation";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

interface CasesIntroProps {
  title: string;
  subtitle?: string;
  showGridBackground?: boolean;
  showHamburgerMenu?: boolean;
  paddingY?: string;
  navPointName?: string;
}

function CasesIntro({
  title,
  subtitle,
  showGridBackground = true,
  showHamburgerMenu = true,
  paddingY = "16",
  navPointName,
}: CasesIntroProps) {
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
      {showHamburgerMenu && <HamburgerGradientMenu />}

      <div
        id={sectionId}
        data-navpoint-name={navPointName}
        className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta"
      >
        {showGridBackground && <GridBackground />}
        <div
          className={`z-1 grid col-span-12 py-${paddingY} col-start-1 container mx-auto row-start-1 grid-cols-12`}
        >
          <div className="z-1 col-span-16 col-start-1 mt-16">
            <div className="flex flex-col items-start gap-8 justify-center w-full px-4">
              <StaggeredSlideUp
                delay={0.19}
                staggerDelay={0.03}
                distance={100}
                className="md:max-w-2/4"
              >
                <h2 className="text-3xl md:text-5xl leading-none text-neutral-700 pb-3 font-aspekta font-medium">
                  {title}
                </h2>
                {subtitle && (
                  <h2 className="text-3xl  md:text-5xl leading-none text-neutral-400 pb-3 font-aspekta">
                    {subtitle}
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

export default withDebugBadge(CasesIntro, "pg-CasesIntro");
