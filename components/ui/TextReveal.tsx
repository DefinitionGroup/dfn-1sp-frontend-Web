"use client";

import {
  AnimatePresence,
  clamp,
  motion,
  MotionValue,
  Transition,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";

export type RevealItem = {
  label?: string;
  image?: CloudinaryAsset;
  number?: number;
};

function usePointerToSkew(axisMotionValue: MotionValue<number>) {
  const velocity = useVelocity(axisMotionValue);
  const maxVelocity = useTransform(() => clamp(-1000, 1000, velocity.get()));
  const smoothVelocity = useSpring(maxVelocity, {
    damping: 10,
    stiffness: 200,
  });
  return useTransform(smoothVelocity, [0, 100], [0, -1], { clamp: false });
}

const enterTransition: Transition = {
  duration: 0.5,
  ease: [0, 0.54, 0.37, 0.97],
};
const exitTransition: Transition = { duration: 0.2, ease: "easeIn" };

function TextRevealItem({
  label = "",
  number,
  imageUrl,
  imgW = 300,
  imgH = 400,
}: {
  label?: string;
  number: number;
  imageUrl?: string;
  imgW?: number;
  imgH?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const skewX = usePointerToSkew(pointerX);
  const skewY = usePointerToSkew(pointerY);

  const updatePointerPosition = ({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) => {
    pointerX.set(clientX + 30);
    pointerY.set(clientY + 30);
  };

  const content = (
    <>
      <span style={numberLabel}>0{number}</span>
      {label}
    </>
  );

  return (
    <motion.li
      style={{ ...item, justifyContent: isHovered ? "flex-end" : "flex-start" }}
      onPointerEnter={(event) => {
        updatePointerPosition(event);
        setIsHovered(true);
      }}
      onPointerMove={updatePointerPosition}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.span layout style={text}>
        {content}
      </motion.span>
      <motion.span layout style={text} aria-hidden>
        {content}
      </motion.span>

      <AnimatePresence>
        {isHovered && imageUrl && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              clipPath: "inset(50% 50% 50% 50%)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              transition: enterTransition,
            }}
            exit={{
              opacity: 0,
              scale: 1.08,
              clipPath: "inset(50% 50% 50% 50%)",
              transition: exitTransition,
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              x: pointerX,
              y: pointerY,
              skewX,
              skewY,
              originX: 0,
              originY: 0,
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            <motion.div style={{ width: imgW, height: imgH }}>
              <Image
                src={imageUrl}
                width={imgW}
                height={imgH}
                alt={label ? `Photo of ${label}` : "Reveal image"}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function TextReveal({
  items,
  defaultImageSize = { width: 300, height: 400 },
}: {
  items?: RevealItem[];
  defaultImageSize?: { width: number; height: number };
}) {
  const normalized = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .map((it, idx) => {
        const url = assetUrl(it?.image);
        return {
          label: it?.label ?? "",
          number: it?.number ?? idx + 1,
          imageUrl: url,
          imgW: it?.image?.width || defaultImageSize.width,
          imgH: it?.image?.height || defaultImageSize.height,
        };
      })
      .filter((n) => n.label);
  }, [items, defaultImageSize]);

  if (normalized.length === 0) return null;

  return (
    <ul style={list}>
      {normalized.map((n, i) => (
        <TextRevealItem
          key={(n.label || "reveal") + i}
          label={n.label}
          number={n.number}
          imageUrl={n.imageUrl}
          imgW={n.imgW}
          imgH={n.imgH}
        />
      ))}
    </ul>
  );
}

/** ============== Styles (inline to match your original) ============== */

const list = {
  display: "flex",
  gap: 20,
  listStyle: "none",
  padding: 0,
  margin: 0,
  flexDirection: "column",
} as const;

const item = {
  position: "relative",
  cursor: "pointer",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
  height: 48,
} as const;

const text = {
  color: "#666",
  fontSize: 48,
  fontWeight: "bold",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: 10,
  lineHeight: "48px",
} as const;

const numberLabel = {
  fontSize: 48,
  fontWeight: "bold",
  textTransform: "uppercase",
  opacity: 0.5,
  fontVariantNumeric: "tabular-nums",
} as const;
