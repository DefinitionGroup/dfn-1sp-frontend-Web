"use client";

import { useEffect } from "react";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import ListContainerComponent from "@flzr/components/ui/ListContainerComponent";
import ListItemComponent from "@flzr/components/ui/ListItemComponent";
import HeaderImageVideoComp2 from "@flzr/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { assetUrl } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

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
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-flzr"
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
          <div className="col-span-12 col-start-1 iphone-landscape:!col-span-12 px-4 md-px0 iphone-landscape:!col-start-1 mt-12 md:mt-0">
            <StaggeredSlideUp
              className="flex flex-col items-start gap-4 justify-start"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              {hasVisibleText(mainHeadline) ? (
                <h2 className="text-section-title mb-2 pb-2 text-gray-100 max-w-2xl">
                  {mainHeadline}
                </h2>
              ) : null}
              {hasVisibleText(subHeadline) && (
                <h2 className="text-title text-gray-100 max-w-2xl mb-2 pb-2">
                  {subHeadline}
                </h2>
              )}
              {description && (
                <p className="text-section-body text-gray-100 max-w-[72ch]">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {approachDetails && approachDetails.length > 0 && (
            <div className="col-span-12 col-start-1 iphone-landscape:!col-span-12 px-4 md:px-0 iphone-landscape:!col-start-1 md:col-span-8 mt-8 border-t border-white pt-4">
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
