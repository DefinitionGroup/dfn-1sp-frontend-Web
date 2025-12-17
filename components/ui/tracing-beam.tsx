"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // Track scroll progress relative to the CONTENT, not the container
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start 0.8", "end 0.2"], // Start when content is 80% from top, end when 20% from top
  });

  // Update height dynamically when content changes
  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      const height = contentRef.current.offsetHeight;
      setSvgHeight(height);
    }
  }, []);

  useEffect(() => {
    updateHeight();

    // Use ResizeObserver to track content height changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Also update on window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [updateHeight]);

  // Smooth spring animation for the gradient endpoints
  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.9], [50, svgHeight]),
    {
      stiffness: 400,
      damping: 90,
    },
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      stiffness: 400,
      damping: 90,
    },
  );

  return (
    <motion.div
      className={cn("relative top-0 left-0  mx-auto h-full w-full ", className)}
    >
      {/* Tracing beam - hidden on mobile, shown on md+ */}
      < div className="absolute top-0 md:-left-10 lg:-left-20 hidden  md:block pointer-events-none" >
        <div className="sticky top-0">
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{}}
            className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full"
          >
            <motion.div
              transition={{
                duration: 0.2,
                delay: 0.5,
              }}
              animate={{
                backgroundColor: scrollYProgress.get() > 0 ? "white" : "#66ff00",
              }}
              className="h-2 w-2 rounded-full bg-lemon-500"
            />
          </motion.div>
          <svg
            viewBox={`0 0 20 ${svgHeight}`}
            width="20"
            height={svgHeight}
            className="ml-4 block"
            aria-hidden="true"
          >
            <motion.path
              d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -0 24V ${svgHeight}`}
              fill="none"
              stroke="#9091A0"
              strokeOpacity="0.16"
              transition={{
                duration: 10,
              }}
            ></motion.path>
            <motion.path
              d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -0 24V ${svgHeight}`}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2.25"
              strokeLinecap="round"
              className="motion-reduce:hidden"
              transition={{
                duration: 10,
              }}
            ></motion.path>
            <defs>
              <motion.linearGradient
                id="gradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                x2="0"
                y1={y1}
                y2={y2}
              >
                <stop stopColor="#ffffff" stopOpacity="0"></stop>
                <stop stopColor="#ffffff"></stop>
                <stop offset="0.325" stopColor="#00ff00"></stop>
                <stop offset="1" stopColor="#6344F5" stopOpacity="0"></stop>
              </motion.linearGradient>
            </defs>
          </svg>
        </div>
      </div >
      <div ref={contentRef} className="relative md:left-2 lg:left-1  z-10 ">{children}</div>
    </motion.div >
  );
};
