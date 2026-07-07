"use client";

/**
 * StickyCardStack — scroll-driven stack of full-bleed media cards
 * (Skiper 34 pattern). Each card pins below the viewport top; as the
 * next card scrolls over it, the pinned card slowly scales down and
 * rotates away (media counter-rotates for a parallax-twist feel).
 * The item's text content animates in over the media once the card
 * is in place.
 */
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import DeferredVideo from "@msm/components/ui/DeferredVideo";
import CornerMarkers from "@msm/components/ui/CornerMarkers";
import { hasVisibleText } from "@1sp/utils/text-content";

export interface StickyCardItem {
  name?: string;
  text?: string;
  image?: string;
  video?: string;
}

/** vh kept free above/below a pinned card */
const VERT_MARGIN = 10;
/** px of scroll over which a passed card scales/rotates away */
const EXIT_RANGE = 10000;

const VAST_BEZIER: [number, number, number, number] = [0.62, 0.05, 0.01, 0.99];

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.2, staggerChildren: 0.18, ease: VAST_BEZIER },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: VAST_BEZIER },
  },
};

function StickyCard({
  item,
  priority,
}: {
  item: StickyCardItem;
  priority: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  // Sentinel keeps the transforms clamped to their resting values
  // until the card has actually pinned (Infinity would produce NaN).
  const [pinScrollY, setPinScrollY] = useState(Number.MAX_SAFE_INTEGER);

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [pinScrollY, pinScrollY + EXIT_RANGE], [1, 0]);
  const rotate = useTransform(scrollY, [pinScrollY, pinScrollY + EXIT_RANGE], [0, 100]);
  const negRotate = useTransform(() => -rotate.get());

  // "In place" = the card has reached its sticky slot near the top.
  const isInView = useInView(container, {
    margin: `0px 0px -${100 - VERT_MARGIN}% 0px`,
    once: true,
  });

  useEffect(() => {
    if (isInView) setPinScrollY(scrollY.get());
  }, [isInView, scrollY]);

  return (
    <motion.div
      ref={container}
      className="sticky w-full overflow-hidden bg-msm-surface will-change-transform"
      style={{
        scale,
        rotate,
        height: `${100 - 2 * VERT_MARGIN}vh`,
        top: `${VERT_MARGIN}vh`,
      }}
    >
      {/* Media — counter-rotates against the card, overscanned so the
          rotation never reveals edges */}
      <motion.div
        className="absolute inset-0 scale-125"
        style={{ rotate: negRotate }}
      >
        {item.video ? (
          <DeferredVideo
            src={item.video}
            maxWidth={1280}
            className="absolute inset-0 h-full w-full object-cover"
            mountDelay={150}
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.name || ""}
            fill
            priority={priority}
            sizes="90vw"
            className="object-cover"
          />
        ) : null}
      </motion.div>

      {/* Readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />

      {/* Content over the media, animated in once the card is in place */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end text-neutral-50"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={contentVariants}
      >
        <div className="relative m-4 max-w-2xl space-y-3 p-4 sm:m-6 sm:p-6 md:m-8 md:p-8">
          {/* System pattern: corner markers frame the text group
              (services zone → cyan) */}
          <CornerMarkers className="text-msm-cyan/50 text-xs" inset="0.375rem" />
          {hasVisibleText(item.name) && (
            <motion.h3
              variants={lineVariants}
              className="headline-display max-w-[20ch]"
              /* Step-specific exception: half the unified headline size */
              style={{ fontSize: "calc(var(--headline-size) * 0.5)" }}
            >
              {item.name}
            </motion.h3>
          )}
          {hasVisibleText(item.text) && (
            <motion.p
              variants={lineVariants}
              className="max-w-md text-sm leading-relaxed font-medium text-gray-100 sm:text-base"
            >
              {item.text}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StickyCardStack({
  items,
}: {
  items?: StickyCardItem[];
}) {
  const cards = (items ?? []).filter((item) => item.video || item.image || hasVisibleText(item.name));
  if (cards.length === 0) return null;

  return (
    <div className="relative flex w-full flex-col items-center gap-[10vh]">
      {cards.map((item, index) => (
        <StickyCard
          key={`${item.name || "card"}-${index}`}
          item={item}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
