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
        className={`flex flex-col rounded-xl justify-between w-3/4 aspect-square bg-gray-100 items-start  ${className}`}
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
        }}
      >
        <div className="flex-col w-full  ">
          <div className="flex px-4 py-4 items-start    justify-between w-full ">
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
                },
              }}
            >
              <Image
                src="/flizzr/Logo_FLZR_color_RGB_500.png"
                alt="1SP Logo"
                width={60}
                height={60}
                className="w-20 h-4 object-contain"
              />
            </motion.div>
            <motion.p
              className="text-[8px] font-bold  self-end text-gray-800"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: -10,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              <AnimateNumber
                format={{ minimumIntegerDigits: 3 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                {animateNumberValue}
              </AnimateNumber>
            </motion.p>
          </div>
          <motion.p
            className="text-3xl font px-4  text-violet-700 "
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {text}
          </motion.p>
        </div>
        <motion.p
          className="text-xxs rounded-b-xl font-semibold mt-2 px-4 py-4  w-full bg-gray-200 text-gray-600"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" },
            },
          }}
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </div>
  );
}
