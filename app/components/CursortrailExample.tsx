"use client";

import { Cursor, usePointerPosition } from "motion-plus/react";
import {
  AnimatePresence,
  clamp,
  motion,
  MotionValue,
  Transition,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useState } from "react";

function usePointerToSkew(axisMotionValue: MotionValue<number>) {
  const velocity = useVelocity(axisMotionValue);
  const maxVelocity = useTransform(() => clamp(-1000, 1000, velocity.get()));
  const smoothVelocity = useSpring(maxVelocity, {
    damping: 10,
    stiffness: 200,
  });
  return useTransform(smoothVelocity, [0, 100], [0, -1], {
    clamp: false,
  });
}

const enterTransition: Transition = {
  duration: 0.5,
  ease: [0, 0.54, 0.37, 0.97],
};

const exitTransition: Transition = {
  duration: 0.2,
  ease: "easeIn",
};

function Item({
  label,
  number,
  image,
}: {
  label: string;
  number: number;
  image: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const position = usePointerPosition();
  const skewX = usePointerToSkew(position.x);
  const skewY = usePointerToSkew(position.y);

  const content = (
    <>
      <span style={numberLabel}>0{number}</span>
      {label}
    </>
  );

  return (
    <motion.li
      style={{
        ...item,
        justifyContent: isHovered ? "flex-end" : "flex-start",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}>
      <motion.span layout style={text}>
        {content}
      </motion.span>
      <motion.span layout style={text} aria-hidden>
        {content}
      </motion.span>
      <AnimatePresence>
        {isHovered && (
          <Cursor
            follow
            offset={{ x: 30, y: 30 }}
            variants={{
              default: {
                clipPath: "inset(0% 0% 0% 0%)",
                transition: enterTransition,
              },
              exit: {
                clipPath: "inset(50% 50% 50% 50%)",
                transition: exitTransition,
              },
            }}
            style={{ skewX, skewY, originX: 0, originY: 0 }}
            key="cursor">
            <motion.div
              variants={{
                default: {
                  scale: 1,
                  transition: enterTransition,
                },
                exit: {
                  scale: 1.5,
                  transition: exitTransition,
                },
              }}
              style={{ width: 300, height: 400 }}>
              <Image
                src={image}
                width={300}
                height={400}
                alt={"Photo of " + label}
              />
            </motion.div>
          </Cursor>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function TextReveal() {
  return (
    <ul style={list}>
      <Item label="Torsten" number={1} image="/torsten.png" />
      <Item label="Marcus" number={2} image="/markus.png" />
      <Item label="Sven" number={3} image="/sven.png" />
    </ul>
  );
}

/**
 * ==============   Styles   ================
 */

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
