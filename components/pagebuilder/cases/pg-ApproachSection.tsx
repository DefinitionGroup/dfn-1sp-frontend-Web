"use client";

import { useEffect } from "react";
import Badgemodule from "@/components/ui/Badgemodule";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import { getTranslations } from "@/lib/translations";
import { useParams } from "next/navigation";
import { assetUrl } from "@/utils/utils";

interface CloudinaryAsset {
  public_id?: string;
  resource_type?: string;
  format?: string;
  secure_url?: string;
}

interface ApproachSectionProps {
  mainHeadline: string;
  subHeadline?: string;
  description?: string;
  approachDetails?: string[];
  badgeText?: string;
  badgeSubtitle?: string;
  badgeNumber?: string;
  mediaType?: "image" | "video";
  backgroundImage?: CloudinaryAsset;
  backgroundVideo?: CloudinaryAsset;
  enableParallax?: boolean;
  paddingY?: string;
  navPointName?: string;
}

export default function ApproachSection({
  mainHeadline,
  subHeadline,
  description,
  approachDetails,
  badgeText,
  badgeSubtitle,
  badgeNumber = "002",
  mediaType = "image",
  backgroundImage,
  backgroundVideo,
  enableParallax = false,
  paddingY = "32",
  navPointName,
}: ApproachSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const sectionId = t.ids.approach;

  // Get the media URL
  const imageUrl = backgroundImage ? assetUrl(backgroundImage) : "";
  const videoUrl = backgroundVideo ? assetUrl(backgroundVideo) : "";

  return (
    <section className="relative overflow-hidden">
      <div
        id={sectionId}
        data-navpoint-name={navPointName}
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        {mediaType === "video" && videoUrl ? (
          <HeaderImageVideoComp2
            useVideo={true}
            videoSrc={videoUrl}
            enableParallax={enableParallax}
          />
        ) : (
          <HeaderImageVideoComp2
            useVideo={false}
            imageSrc={imageUrl}
            enableParallax={enableParallax}
          />
        )}

        <div
          className={`z-1 grid col-span-12 py-${paddingY} gap-8 col-start-1  container mx-auto row-start-1 grid-cols-12`}
        >
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={badgeText || t.caseStudy.approach}
            subtitle={badgeSubtitle || t.caseStudy.approachSubtitle}
            numberEl={badgeNumber}
          />

          <div className="col-span-10 col-start-3">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-9xl mb-2 text-gray-100 max-w-xl font-semibold tracking-tight leading-compress">
                {mainHeadline}
              </h2>
              {subHeadline && (
                <h2 className="text-5xl text-gray-100 max-w-xl font-semibold tracking-tight leading-compress mb-4">
                  {subHeadline}
                </h2>
              )}
              {description && (
                <p className="text-xl text-gray-100 max-w-2xs mx-auto">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {approachDetails && approachDetails.length > 0 && (
            <div className="col-span-5 col-start-3 mt-8 border-t border-white pt-4">
              <ListContainerComponent>
                {approachDetails.map((detail, idx) => (
                  <ListItemComponent key={idx} size="small" fontWeight="normal">
                    {detail}
                  </ListItemComponent>
                ))}
              </ListContainerComponent>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
