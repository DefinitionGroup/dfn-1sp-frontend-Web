"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

interface LogoCarouselProps {
  speedSeconds?: number;
  height?: number;
  gapRem?: number;
  pauseOnHover?: boolean;
  className?: string;
  grayscale?: boolean;
  duplicate?: number; // how many times to repeat (>=2 for smooth loop)
}

/**
 * Statically declare your logos here.
 * All logos from /public/logos are included.
 */
const logoMap: Record<string, string> = {
  Amazon: "/logos/Amazon_logo.svg",
  Anker: "/logos/Anker_logo.svg",
  "Bandai Namco": "/logos/Bandai_Namco_logo_(2022).svg",
  Blizzard: "/logos/Blizzard_Entertainment_Logo.svg",
  "Coca-Cola": "/logos/Coca-Cola_logo.svg",
  Cupra: "/logos/Cupra.svg",
  Disney: "/logos/Disney_wordmark.svg",
  Dyson: "/logos/Dyson_logo.svg",
  Electrolux: "/logos/Electrolux_2015.svg",
  "Electronic Arts": "/logos/Electronic_Arts_2020.svg",
  "Epic Games": "/logos/Epic_Games_logo.svg",
  "Fjall Raven": "/logos/Fjall_Raven_Logo.svg",
  Garmin: "/logos/Garmin_logo_2006.svg",
  Hisense: "/logos/hisense_logo.svg",
  Intel1: "/logos/Intel_logo_2023-1.svg",
  Intel: "/logos/Intel_logo_2023.svg",
  LG: "/logos/LG_logo_(2014).svg",
  Logitech: "/logos/Logitech_logo.svg",
  "Warner Bros": "/logos/Logo_Warner_Bros.svg",
  Lufthansa: "/logos/Lufthansa_Logo_2018.svg",
  Marshall: "/logos/Marshall_logo.svg",
  Mattel: "/logos/Mattel_logo.svg",
  "Media Markt": "/logos/Media_Markt_&_Saturn_Logo_01.2023.svg",
  Meta: "/logos/Meta_Platforms_Inc._logo.svg",
  Microsoft: "/logos/Microsoft-logo_black.svg",
  Nespresso: "/logos/Nespresso_logo_(wordmark).svg",
  Recaro: "/logos/Recaro_Logo.svg",
  Ring: "/logos/Ring_logo.svg",
  "Riot Games": "/logos/Riot_Games_logo.svg",
  Samsung: "/logos/Samsung_wordmark.svg",
  Sony: "/logos/Sony_logo.svg",
  Telefonica: "/logos/Telefonica_Logo.svg",
  "Tencent Games": "/logos/Tencent_Games.avif",
  "Turtle Beach": "/logos/Turtle_Beach_logo.avif",
  Ubisoft: "/logos/Ubisoft_logo.svg",
  Vodafone: "/logos/vodafone_logo.avif",
  Xbox: "/logos/Xbox_2020_horz_Black.svg",
};

export default function LogoCarousel({
  speedSeconds = 80,
  height = 28,
  gapRem = 4,
  pauseOnHover = true,
  className = "",
  grayscale = true,
  duplicate = 2,
}: LogoCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);

  const logos = useMemo(
    () =>
      Object.entries(logoMap).map(([alt, src]) => ({
        alt,
        src,
      })),
    []
  );

  if (!logos.length) {
    return (
      <div className={`text-xxs text-neutral-500 ${className}`}>
        No logos configured.
      </div>
    );
  }

  const sequence = useMemo(
    () =>
      Array.from({ length: Math.max(2, duplicate) }, () => logos)
        .flat()
        .map((item, i) => ({ ...item, key: `${item.alt}-${i}` })),
    [logos, duplicate]
  );

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height,
      }}>
      <motion.ul
        className="flex items-center"
        style={{
          gap: `${gapRem}rem`,
          height,
        }}
        animate={
          isHovered && pauseOnHover
            ? {}
            : {
                x: [0, -100 * duplicate + "%"],
              }
        }
        transition={{
          duration: speedSeconds,
          repeat: Infinity,
          ease: "linear",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        aria-label="Client & partner logos scrolling continuously">
        {sequence.map(({ alt, src, key }) => (
          <motion.li
            key={key}
            className="flex items-center justify-center shrink-0"
            style={{ height }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}>
            <Image
              src={src}
              alt={alt}
              height={height}
              width={height * 2}
              className={`h-full w-auto object-contain ${
                grayscale ? "grayscale" : ""
              } opacity-80 hover:opacity-100 transition-opacity`}
              priority={key.endsWith("-0")}
            />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
