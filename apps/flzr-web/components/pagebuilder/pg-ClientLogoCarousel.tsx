import React from "react";
import Image from "next/image";
import type { ClientLogoCarousel as ClientLogoCarouselType, ClientLogoItem } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";
import Eyebrow from "@flzr/components/ui/Eyebrow";
import { hasVisibleText } from "@1sp/utils/text-content";

const SPEED_DURATION: Record<string, string> = {
  slow: "60s",
  normal: "40s",
  fast: "22s",
};

/**
 * Infinite client-logo marquee. Uses the `.logo-marquee-track` /
 * `.logo-carousel-mask` utilities from globals.css; the track is
 * duplicated once so the -50% keyframe loops seamlessly.
 */
function ClientLogoCarousel({ data }: { data: ClientLogoCarouselType }) {
  const {
    eyebrow,
    headline,
    selectionMode = "auto",
    selectedClients,
    autoClients,
    speed = "normal",
    grayscale = true,
    navPointName,
    hideFromNav = true,
  } = data || {};

  const clients: ClientLogoItem[] =
    (selectionMode === "manual" ? selectedClients : autoClients) ?? [];
  const withLogos = clients.filter((c) => assetUrl(c.logo));

  if (withLogos.length === 0) {
    // Visible hint instead of a silent null so editors can see why the
    // block is empty (same pattern as SmartPeople / SmartUnitsGlobe).
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="max-w-md text-center text-sm text-gray-400">
          No client logos to display. In auto mode, clients need this
          website&apos;s channel ticked in their &quot;Channel&quot; field and a
          logo set — or switch the block to manual selection and pick clients
          directly.
        </div>
      </div>
    );
  }

  const sectionId = headline
    ? headline
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "client-logos";

  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  const renderLogos = (ariaHidden: boolean) => (
    <div
      className="flex items-center gap-14 pr-14"
      aria-hidden={ariaHidden || undefined}
    >
      {withLogos.map((client, idx) => (
        <div
          key={`${client._id || client.name || "client"}-${idx}${ariaHidden ? "-dup" : ""}`}
          className={`relative h-10 w-32 shrink-0 md:h-12 md:w-40 ${
            grayscale
              ? "grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
              : ""
          }`}
        >
          <Image
            src={assetUrl(client.logo as any) || ""}
            alt={ariaHidden ? "" : client.name || "Client logo"}
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="w-full py-16 md:py-24"
      data-component="client-logo-carousel"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        {(hasVisibleText(eyebrow) || hasVisibleText(headline)) && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">
            {hasVisibleText(eyebrow) && <Eyebrow>{eyebrow}</Eyebrow>}
            {hasVisibleText(headline) && (
              <h2 className="text-title">{headline}</h2>
            )}
          </div>
        )}

        <div className="logo-marquee-pausable rounded-[2rem] border border-[var(--color-flzr-hairline)] bg-white px-2 py-8 md:py-10">
          <div className="logo-carousel-mask overflow-hidden">
            <div
              className="logo-marquee-track flex"
              style={{ "--marquee-duration": SPEED_DURATION[speed] || SPEED_DURATION.normal } as React.CSSProperties}
            >
              {renderLogos(false)}
              {renderLogos(true)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientLogoCarousel;
