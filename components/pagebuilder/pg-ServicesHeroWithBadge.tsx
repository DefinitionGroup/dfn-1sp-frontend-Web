"use client";

import { useParams } from "next/navigation";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Badgemodule from "@/components/ui/Badgemodule";
import HeaderImageVideoComp2 from "@/components/data/Fragments/data-HeaderImageVideoComp2";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import CtaMiniComponent from "@/components/data/Fragments/data-CtaMiniComponent";
import { getTranslations } from "@/lib/translations";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

interface ServicesHeroWithBadgeProps {
  badgeText?: string;
  badgeSubtitle?: string;
  badgeNumber?: string;
  useVideo?: boolean;
  backgroundImage?: {
    asset?: {
      secure_url?: string;
      resource_type?: string;
      public_id?: string;
    };
    alt?: string;
  };
  backgroundVideo?: {
    asset?: {
      secure_url?: string;
      resource_type?: string;
      public_id?: string;
    };
    alt?: string;
  };
  enableParallax?: boolean;
  title: string;
  subtitle?: string;
  cta?: {
    heading: string;
    paragraph?: string;
    buttonText: string;
    link?: {
      linkType?: string;
      externalUrl?: string;
      page?: {
        slug?: { current: string };
      };
    };
    variant?: string;
    alignment?: string;
  };
  listItems?: Array<{
    text: string;
    size?: string;
    fontWeight?: string;
    color?: string;
  }>;
  minHeight?: string;
  paddingY?: string;
  navPointName?: string;
}

function ServicesHeroWithBadge({
  badgeText,
  badgeSubtitle,
  badgeNumber = "001",
  useVideo = false,
  backgroundImage,
  backgroundVideo,
  enableParallax = false,
  title,
  subtitle,
  cta,
  listItems = [],
  minHeight = "66vh",
  paddingY = "32",
  navPointName,
}: ServicesHeroWithBadgeProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.top;

  return (
    <div
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`grid grid-cols-12 z-1 mx-auto min-h-[${minHeight}] relative font-aspekta`}
    >
      <HeaderImageVideoComp2
        useVideo={useVideo}
        imageSrc={!useVideo ? backgroundImage?.asset?.secure_url : undefined}
        videoSrc={useVideo ? backgroundVideo?.asset?.secure_url : undefined}
        enableParallax={enableParallax}
      />

      <div
        className={`z-1 grid col-span-12 py-${paddingY} gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12`}
      >
        {/* Badge Module */}
        {badgeText && (
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={badgeText}
            subtitle={badgeSubtitle || ""}
            numberEl={badgeNumber}
          />
        )}

        {/* Title and Subtitle */}
        <div className="col-span-10 col-start-3">
          <StaggeredSlideUp
            className="flex flex-col items-start justify-start"
            delay={0.0}
            staggerDelay={0.1}
            duration={0.5}
            distance={80}
          >
            <h2 className="text-7xl text-gray-100 max-w-xl  tracking-tighter leading-compress mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-2xl text-gray-100  leading-none max-w-xs mx-auto">
                {subtitle}
              </p>
            )}
          </StaggeredSlideUp>
        </div>

        {/* CTA Section */}
        {cta && (
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100">
            <CtaMiniComponent
              heading={cta.heading}
              paragraph={cta.paragraph || ""}
              buttonText={cta.buttonText}
              buttonVariant={(cta.variant as any) || "limesmall"}
              url={
                cta.link?.linkType === "internal"
                  ? `/${locale}/${cta.link.page?.slug?.current || ""}`
                  : cta.link?.externalUrl || "/contact"
              }
              align={(cta.alignment as any) || "left"}
            />
          </div>
        )}

        {/* List Items */}
        {listItems && listItems.length > 0 && (
          <div className="col-span-5 col-start-5 mt-8">
            <ListContainerComponent>
              {listItems.map((item, index) => (
                <ListItemComponent
                  key={index}
                  size={(item.size as any) || "small"}
                  fontWeight={(item.fontWeight as any) || "normal"}
                  color={item.color as any}
                >
                  {item.text}
                </ListItemComponent>
              ))}
            </ListContainerComponent>
          </div>
        )}
      </div>
    </div>
  );
}

export default withDebugBadge(
  ServicesHeroWithBadge,
  "pg-ServicesHeroWithBadge"
);
