import React from "react";
import Image from "next/image";
import type { ClientLogoCarousel as ClientLogoCarouselType, ClientLogoItem } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";
import Eyebrow from "@renaissance/components/ui/Eyebrow";
import { hasVisibleText } from "@1sp/utils/text-content";

/* Seconds per logo, so perceived speed stays constant no matter how many
   logos (or set repeats) the track holds. Editable per block in Studio
   via the "Scroll Speed" field. */
const SPEED_SECONDS_PER_LOGO: Record<string, number> = {
  slow: 10,
  normal: 7,
  fast: 4,
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

  // Each half of the -50% loop must be wider than any viewport, otherwise
  // the loop point exposes whitespace. Repeat the set until a half holds
  // at least 12 logos (~12 * 136px > 1600px).
  const repeats = Math.max(1, Math.ceil(12 / withLogos.length));
  const logosPerHalf = repeats * withLogos.length;
  const secondsPerLogo =
    SPEED_SECONDS_PER_LOGO[speed] ?? SPEED_SECONDS_PER_LOGO.normal;
  const marqueeDuration = `${logosPerHalf * secondsPerLogo}s`;

  const renderHalf = (ariaHidden: boolean) => (
    <div
      className="flex items-center gap-10 pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {Array.from({ length: repeats }).flatMap((_, rep) =>
        withLogos.map((client, idx) => (
          <div
            key={`${client._id || client.name || "client"}-${rep}-${idx}${ariaHidden ? "-dup" : ""}`}
            className={`relative h-6 w-24 shrink-0 md:h-8 md:w-28 ${
              grayscale
                ? "grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                : ""
            }`}
          >
            <Image
              src={assetUrl(client.logo as any) || ""}
              alt={ariaHidden || rep > 0 ? "" : client.name || "Client logo"}
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
        ))
      )}
    </div>
  );

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="w-full py-16 md:py-24"
      data-component="client-logo-carousel"
    >
      <div className="container mx-auto w-full">
        {(hasVisibleText(eyebrow) || hasVisibleText(headline)) && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">
            {hasVisibleText(eyebrow) && <Eyebrow>{eyebrow}</Eyebrow>}
            {hasVisibleText(headline) && (
              <h2 className="text-title">{headline}</h2>
            )}
          </div>
        )}

        <div className="logo-marquee-pausable py-6 md:py-8">
          <div className="logo-carousel-mask overflow-hidden">
            <div
              className="logo-marquee-track flex"
              style={{ "--marquee-duration": marqueeDuration } as React.CSSProperties}
            >
              {renderHalf(false)}
              {renderHalf(true)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientLogoCarousel;
