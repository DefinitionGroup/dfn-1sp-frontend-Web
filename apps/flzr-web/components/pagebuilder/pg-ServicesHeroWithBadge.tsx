"use client";

import { useParams } from "next/navigation";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import Badgemodule from "@flzr/components/ui/Badgemodule";
import HeaderImageVideoComp2 from "@flzr/components/data/Fragments/data-HeaderImageVideoComp2";
import ListContainerComponent from "@flzr/components/ui/ListContainerComponent";
import ListItemComponent from "@flzr/components/ui/ListItemComponent";
import CtaMiniComponent from "@flzr/components/data/Fragments/data-CtaMiniComponent";
import { hasVisibleText } from "@1sp/utils/text-content";
import { getTranslations } from "@1sp/utils/translations";


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
  titleTag?: "h1" | "h2";
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
  titleTag = "h2",
  subtitle,
  cta,
  listItems = [],
  minHeight = "66vh",
  paddingY = "64",
  navPointName,
}: ServicesHeroWithBadgeProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.top;
  const TitleTag = titleTag === "h1" ? "h1" : "h2";

  return (
    <section
      id={sectionId}
      data-navpoint-name={navPointName}
      className="relative font-aspekta"
      style={{ minHeight }}
    >
      <HeaderImageVideoComp2
        useVideo={useVideo}
        imageSrc={!useVideo ? backgroundImage?.asset?.secure_url : undefined}
        videoSrc={useVideo ? backgroundVideo?.asset?.secure_url : undefined}
        enableParallax={enableParallax}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 lg:py-40">
        <div
          className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 py-16 sm:py-24 lg:py-${paddingY}`}
        >
          {/* Badge Module - Responsive positioning */}
          {badgeText && (
            <div className="hidden md:block md:col-span-2 md:mb-0 md:sticky md:top-24 self-start iphone-landscape:!hidden">
              <Badgemodule
                text={badgeText}
                subtitle={badgeSubtitle || ""}
                numberEl={badgeNumber}
                variant="glass"
                size="md"
              />
            </div>
          )}

          {/* Title and Subtitle */}
          <div className={`col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 ${badgeText ? "md:col-span-10 md:col-start-3" : "md:col-span-12"}`}>
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start gap-4"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              {hasVisibleText(title) ? (
                <TitleTag className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-100 max-w-2xl tracking-tighter leading-[0.9] mb-2 md:mb-4">
                  {title}
                </TitleTag>
              ) : null}
              {subtitle && (
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-snug max-w-md">
                  {subtitle}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {/* CTA Section - Improved responsive layout */}
          {cta && (
            <div className="col-span-4 sm:col-span-3 md:col-span-2 md:col-start-3 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 text-white mt-6 md:mt-8">
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

          {/* List Items - Improved responsive layout */}
          {listItems && listItems.length > 0 && (
            <div className={`col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 ${cta ? "md:col-span-4 md:col-start-5" : "md:col-span-8 md:col-start-3"} mt-6 md:mt-8`}>
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
    </section>
  );
}

export default ServicesHeroWithBadge;
