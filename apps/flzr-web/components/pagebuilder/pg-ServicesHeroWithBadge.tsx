"use client";

import { useParams } from "next/navigation";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import HeaderImageVideoComp2 from "@flzr/components/data/Fragments/data-HeaderImageVideoComp2";
import ListContainerComponent from "@flzr/components/ui/ListContainerComponent";
import ListItemComponent from "@flzr/components/ui/ListItemComponent";
import CtaMiniComponent from "@flzr/components/data/Fragments/data-CtaMiniComponent";
import { hasVisibleText } from "@1sp/utils/text-content";
import { getTranslations } from "@1sp/utils/translations";
import { getRenderableCtaMini } from "@1sp/utils/cta";


interface ServicesHeroWithBadgeProps {
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
  showCta?: boolean;
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
  useVideo = false,
  backgroundImage,
  backgroundVideo,
  enableParallax = false,
  title,
  titleTag = "h2",
  subtitle,
  showCta = true,
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
  const renderedCta = showCta ? getRenderableCtaMini(cta) : null;
  const ctaUrl = renderedCta?.href.startsWith("/") && !renderedCta.href.startsWith(`/${locale}`)
    ? `/${locale}${renderedCta.href}`
    : renderedCta?.href;
  const shouldShowCta = Boolean(renderedCta && ctaUrl);

  return (
    <section
      id={sectionId}
      data-navpoint-name={navPointName}
      className="relative font-flzr"
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
          <div className="col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 md:col-span-12">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start gap-4"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              {hasVisibleText(title) ? (
                <TitleTag className="text-display text-gray-100 max-w-2xl mb-2 md:mb-4">
                  {title}
                </TitleTag>
              ) : null}
              {subtitle && (
                <p className="text-section-body text-gray-200 max-w-[72ch]">
                  {subtitle}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {/* CTA Section - Improved responsive layout */}
          {shouldShowCta && renderedCta && ctaUrl && (
            <div className="col-span-4 sm:col-span-3 md:col-span-2 md:col-start-3 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 text-white mt-6 md:mt-8">
              <CtaMiniComponent
                heading={renderedCta.heading}
                paragraph={renderedCta.paragraph}
                buttonText={renderedCta.buttonText}
                buttonVariant={(renderedCta.variant as any) || "violetsmall"}
                url={ctaUrl}
                align={(renderedCta.alignment as any) || "left"}
              />
            </div>
          )}

          {/* List Items - Improved responsive layout */}
          {listItems && listItems.length > 0 && (
            <div className={`col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 ${shouldShowCta ? "md:col-span-4 md:col-start-5" : "md:col-span-8 md:col-start-3"} mt-6 md:mt-8`}>
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
