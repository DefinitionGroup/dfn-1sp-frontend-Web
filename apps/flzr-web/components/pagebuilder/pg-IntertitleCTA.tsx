"use client";
import React from "react";
import Button2 from "@flzr/components/ui/Button2";
import { resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import type { CTA } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

interface IntertitleCTAProps {
  title: string;
  subline?: string;
  subtitle: string;
  cta?: CTA;
  containerClassName?: string;
  alignment?: "center" | "left";
  paddingTop?: "0" | "12" | "24" | "48";
  navPointName?: string;
  hideFromNav?: boolean;
  inheritSectionSurface?: boolean;
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  subline,
  subtitle,
  cta,
  containerClassName,
  alignment = "center",
  paddingTop = "0",
  navPointName,
  hideFromNav = false,
  inheritSectionSurface = false,
}) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isLeftAligned = alignment === "left";

  // Padding top classes
  const paddingTopMap: Record<string, string> = {
    "0": "",
    "12": "pt-12",
    "24": "pt-24",
    "48": "pt-48",
  };
  const paddingTopClass = inheritSectionSurface && paddingTop === "0"
    ? "pt-5 sm:pt-7"
    : paddingTopMap[paddingTop] || "";
  const hasSubline = hasVisibleText(subline);
  const resolvedContainerClassName = containerClassName ?? (
    inheritSectionSurface
      ? "w-full"
      : "container mx-auto w-[calc(100%-0.5rem)] md:px-7"
  );

  const titleClass = `max-w-4xl text-balance ${inheritSectionSurface ? "text-title" : "text-[clamp(2.25rem,3.2vw,4.25rem)]"} font-semibold leading-[0.98] text-flzr-violet ${isLeftAligned ? "text-left" : "text-center"}`;
  const sublineClass = `mt-6 max-w-3xl text-balance text-[clamp(1.35rem,2.25vw,2.25rem)] font-regular leading-[1.15] text-neutral-500 sm:mt-8 ${isLeftAligned ? "text-left" : "text-center"}`;
  const subtitleClass = `${hasSubline ? "mt-6 sm:mt-8" : "mt-8 sm:mt-10"} max-w-3xl text-pretty text-base leading-[1.55] text-neutral-800 sm:text-lg lg:text-xl ${isLeftAligned ? "text-left" : "text-center"}`;
  const buttonContainerClass = `${inheritSectionSurface ? "mt-6" : "mt-10 sm:mt-12"} block w-fit ${isLeftAligned ? "self-start" : "mx-auto"}`;

  // Resolve CTA link and props
  let buttonHref = cta?.link ? resolveLink(cta.link) : undefined;
  // Fix URL to include locale if it's an internal link
  if (
    buttonHref &&
    buttonHref.startsWith("/") &&
    !buttonHref.startsWith(`/${locale}`)
  ) {
    buttonHref = `/${locale}${buttonHref}`;
  }
  const buttonText = cta?.text;
  const buttonVariant = inheritSectionSurface
    ? "ghostLight"
    : cta?.variant || "violet";

  // Generate section ID from title
  const sectionId = title
    ? title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "intertitle-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className={`relative overflow-hidden ${resolvedContainerClassName}`}
      data-section-footer={inheritSectionSurface ? "true" : undefined}
    >
      <div
        className={`relative mx-auto w-full max-w-[1480px] font-flzr ${inheritSectionSurface ? "px-0" : "px-4 sm:px-6 lg:px-8"} ${paddingTopClass}`}
      >
        <div
          className={`flex w-full flex-col ${isLeftAligned ? "items-start" : "items-center"}`}
        >
          {hasVisibleText(title) ? <h3 className={titleClass}>{title}</h3> : null}
          {hasSubline ? <p className={sublineClass}>{subline}</p> : null}
          {hasVisibleText(subtitle) ? (
            <p className={subtitleClass}>{subtitle}</p>
          ) : null}
        </div>
        {buttonHref && buttonText && (
          <div className={buttonContainerClass}>
            <Button2
              text={buttonText}
              variant={buttonVariant as any}
              href={buttonHref}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default IntertitleCTA;
