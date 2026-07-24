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
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  subline,
  subtitle,
  cta,
  containerClassName = "w-full",
  alignment = "center",
  paddingTop = "0",
  navPointName,
  hideFromNav = false,
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
  const paddingTopClass = paddingTopMap[paddingTop] || "";
  const hasSubline = hasVisibleText(subline);

  const titleClass = `max-w-5xl text-balance text-[clamp(2.25rem,3.2vw,4.25rem)] font-semibold leading-[0.98] text-flzr-violet ${isLeftAligned ? "text-left" : "text-center"}`;
  const sublineClass = `mt-6 max-w-3xl text-balance text-[clamp(1.35rem,2.25vw,2.25rem)] font-regular leading-[1.15] text-neutral-500 sm:mt-8 ${isLeftAligned ? "text-left" : "text-center"}`;
  const subtitleClass = `${hasSubline ? "mt-6 sm:mt-8" : "mt-8 sm:mt-10"} max-w-3xl text-pretty text-base leading-[1.55] text-neutral-800 sm:text-lg lg:text-xl ${isLeftAligned ? "text-left" : "text-center"}`;
  const buttonContainerClass = `mt-10 block w-fit min-w-40 sm:mt-12 ${isLeftAligned ? "self-start" : "mx-auto"}`;

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
  const buttonVariant =
    (cta?.variant as "default" | "black" | "violet" | "violetsmall") ||
    "violet";

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
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <div
        className={`relative mx-auto w-full max-w-[1480px] px-4 font-flzr sm:px-6 lg:px-8 ${paddingTopClass}`}
      >
        <div className="relative border-t border-neutral-900/15 py-16 sm:py-20 lg:py-28">
          <span
            aria-hidden="true"
            className={`mb-8 block h-[3px] w-12 bg-flzr-violet sm:mb-10 ${isLeftAligned ? "" : "mx-auto"}`}
          />
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
                variant={buttonVariant}
                href={buttonHref}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IntertitleCTA;
