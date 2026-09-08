"use client";

import React from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type {
  ClientLogoCarousel as ClientLogoCarouselType,
  ClientLogoItem,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";
import Eyebrow from "@renaissance/components/ui/Eyebrow";
import { hasVisibleText } from "@1sp/utils/text-content";

const GRID_SLOT_COUNT = 6;

const SWAP_INTERVAL_MS: Record<string, number> = {
  slow: 2600,
  normal: 1800,
  fast: 1500,
};

const GRID_REVEAL_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.055,
    },
  },
};

const LOGO_CELL_REVEAL_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(12px)",
    transform: "translateY(8px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transform: "translateY(0px)",
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

type LogoEntry = {
  id: string;
  name: string;
  src: string;
};

type LogoSlot = {
  entry: LogoEntry;
  position: number;
  revision: number;
};

function createInitialSlots(logos: LogoEntry[]): LogoSlot[] {
  return Array.from({ length: GRID_SLOT_COUNT }, (_, position) => ({
    entry: logos[position % logos.length],
    position,
    revision: 0,
  }));
}

function LogoSwapGrid({
  logos,
  speed,
  grayscale,
}: {
  logos: LogoEntry[];
  speed: string;
  grayscale: boolean;
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isInView, setIsInView] = React.useState(false);
  const [hasEnteredView, setHasEnteredView] = React.useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = React.useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  const [isPaused, setIsPaused] = React.useState(false);
  const [slots, setSlots] = React.useState<LogoSlot[]>(() =>
    createInitialSlots(logos),
  );

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  React.useEffect(() => {
    if (
      shouldReduceMotion ||
      isPaused ||
      !isInView ||
      !isDocumentVisible ||
      logos.length < 2
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setSlots((currentSlots) => {
        const position = Math.floor(Math.random() * currentSlots.length);
        const currentEntry = currentSlots[position].entry;
        const alternatives = logos.filter((logo) => logo.id !== currentEntry.id);
        const nextEntry =
          alternatives[Math.floor(Math.random() * alternatives.length)];
        const nextSlots = [...currentSlots];

        nextSlots[position] = {
          entry: nextEntry,
          position,
          revision: currentSlots[position].revision + 1,
        };

        return nextSlots;
      });
    }, SWAP_INTERVAL_MS[speed] ?? SWAP_INTERVAL_MS.normal);

    return () => window.clearInterval(interval);
  }, [isDocumentVisible, isInView, isPaused, logos, shouldReduceMotion, speed]);

  return (
    <motion.div
      ref={gridRef}
      className="grid grid-cols-6 grid-rows-1 gap-x-2 sm:gap-x-3 md:gap-x-5"
      aria-label="Client logo grid"
      variants={GRID_REVEAL_VARIANTS}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={hasEnteredView || shouldReduceMotion ? "visible" : "hidden"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {slots.map(({ entry, position, revision }) => {
        const isFirstInstance =
          slots.findIndex((slot) => slot.entry.id === entry.id) === position;

        return (
          <motion.div
            key={position}
            className="group/logo relative grid h-20 place-items-center overflow-hidden px-2 sm:h-24 md:h-28 md:px-5"
            data-logo-slot={position}
            variants={LOGO_CELL_REVEAL_VARIANTS}
          >
            <div className="relative h-[2.66rem] w-full md:h-16">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={`${entry.id}-${revision}`}
                  className="absolute inset-0"
                  data-logo-id={entry.id}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 0,
                          filter: "blur(8px)",
                          transform: "translateY(18px)",
                        }
                  }
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    transform: "translateY(0px)",
                  }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 0,
                          filter: "blur(6px)",
                          transform: "translateY(-18px)",
                          transition: {
                            duration: 0.75,
                            ease: [0.4, 0, 1, 1],
                          },
                        }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.75,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Image
                    src={entry.src}
                    alt={isFirstInstance ? entry.name : ""}
                    fill
                    sizes="(min-width: 1480px) 224px, 16vw"
                    className={`object-contain transition-[filter,opacity] duration-300 ${
                      grayscale
                        ? "grayscale opacity-70 group-hover/logo:grayscale-0 group-hover/logo:opacity-100"
                        : ""
                    }`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function ClientLogoCarousel({
  data,
  presentationRole,
}: {
  data: ClientLogoCarouselType;
  presentationRole?: RenaissanceSectionRole;
}) {
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
  const logos = clients.flatMap((client, index) => {
    const src = assetUrl(client.logo);
    if (!src) return [];

    return [{
      id: client._id || `${client.name || "client"}-${index}`,
      name: client.name || "Client logo",
      src,
    }];
  });

  if (logos.length === 0) {
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

  const isServicesProof = presentationRole === "services";
  const gridKey = logos.map((logo) => logo.id).join("|");

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className={
        isServicesProof
          ? "w-full bg-renaissance-paper py-12 md:py-16"
          : "w-full py-16 md:py-24"
      }
      data-component="client-logo-carousel"
    >
      <div className="container mx-auto w-full">
        {(hasVisibleText(eyebrow) || hasVisibleText(headline)) && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">
            {hasVisibleText(eyebrow) && !isServicesProof && <Eyebrow>{eyebrow}</Eyebrow>}
            {hasVisibleText(headline) && (
              <h2
                className={
                  isServicesProof
                    ? "renaissance-display text-[clamp(2.7rem,3.5vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.025em] text-renaissance-signal"
                    : "text-title"
                }
              >
                {isServicesProof ? "You’re in great company." : headline}
              </h2>
            )}
          </div>
        )}

        <div className="py-6 md:py-8">
          <LogoSwapGrid
            key={gridKey}
            logos={logos}
            speed={speed}
            grayscale={grayscale}
          />
        </div>
      </div>
    </section>
  );
}

export default ClientLogoCarousel;
