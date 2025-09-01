"use client";

import { motion, AnimatePresence, PanInfo, useInView } from "motion/react";
import { AnimateNumber } from "motion-plus/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Badgemodule({
  text,
  subtitle,
  numberEl,
  className,
}: {
  text: string;
  subtitle: string;
  numberEl: string | number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [animateNumberValue, setAnimateNumberValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Convert numberEl to number for animation
      const targetNumber =
        typeof numberEl === "string" ? parseInt(numberEl, 10) || 0 : numberEl;

      // Delay the animation by 500ms
      const timeoutId = setTimeout(() => {
        setAnimateNumberValue(targetNumber);
      }, 200);

      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, numberEl]);
  return (
    <div className={` ${className}`}>
      <motion.div
        ref={ref}
        className={`flex flex-col rounded-sm justify-between w-full  aspect-square bg-black items-start  ${className}`}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, scaleY: 0 },
          visible: {
            opacity: 1,
            scaleY: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.1,
            },
          },
        }}>
        <div className="flex-col">
          <div className="flex px-4 py-4 items-start  border-white justify-between w-full ">
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
                },
              }}>
              <Image
                src="/ci/1sp-outline.svg"
                alt="1SP Logo"
                width={60}
                height={60}
                className="w-8 h-8"
              />
            </motion.div>
            <motion.p
              className="text-xxs font-bold  self-end text-gray-100"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}>
              <AnimateNumber
                format={{ minimumIntegerDigits: 3 }}
                transition={{ duration: 1.5, ease: "easeOut" }}>
                {animateNumberValue}
              </AnimateNumber>
            </motion.p>
          </div>
          <motion.p
            className="text-5xl font-bold px-4  text-gray-200"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}>
            {text}
          </motion.p>{" "}
        </div>
        <motion.p
          className="text-xxs rounded-b-sm font-semibold mt-2 px-4 py-4  w-full bg-neutral-800 text-gray-200"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" },
            },
          }}>
          {subtitle}
        </motion.p>
      </motion.div>
    </div>
  );
}
