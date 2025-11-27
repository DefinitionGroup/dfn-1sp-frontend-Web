"use client";

import { motion, useInView } from "motion/react";
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
      const targetNumber =
        typeof numberEl === "string" ? parseInt(numberEl, 10) || 0 : numberEl;
      const timeoutId = setTimeout(() => {
        setAnimateNumberValue(targetNumber as number);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, numberEl]);

  return (
    <div className={`${className}  `}>
      <motion.div
        ref={ref}
        className={` relative  border-t  border-black/20 mb-12 md:mb-0 flex flex-col md:rounded justify-between min-w-[70%] md:w-[80%] mr-12  lg:scale-100 lg:w-3/4 md:aspect-square md:bg-black items-start ${className}`}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, scaleY: 0 },
          visible: {
            opacity: 1,
            scaleY: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 },
          },
        }}
      >
        <div className="flex-col w-full ">
          <div className="flex md:px-4 pt-2 md:py-4 items-start border-white justify-between w-full">
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
                src="/ci/1sp-outline.svg"
                alt="1SP Logo"
                width={60}
                height={60}
                className="w-4 h-4"
              />
            </motion.div>
            <motion.div
              className="text-[8px] absolute -top-[8px] md:relative font-bold self-start  md:self-end md:text-gray-100"
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
            </motion.div>
          </div>
          <motion.p
            className="text-lg lg:text-3xl font md:px-4 md:text-gray-200"
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
          className="text-xxs rounded-b-sm font-semibold md:mt-2 md:px-4 md:py-4 w-full md:bg-neutral-800 md:text-gray-200"
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
