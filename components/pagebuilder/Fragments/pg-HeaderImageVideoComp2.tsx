"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  enableParallax?: boolean;
  opacity?: number; // overlay target opacity when in view
}

const HeaderImageVideoComp2: React.FC<HeaderImageVideoCompProps> = ({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "Hero Background",
  className = "",
  enableParallax = true,
  opacity = 0.6, // default overlay opacity
}) => {
  // Create ref for the component
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true, // Only animate once for better performance
    amount: 0.2,
  });

  return (
    <motion.div
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}
      style={{ willChange: "transform" }}
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0, scale: 0.9, }
        }
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute mx-auto md:rounded-xl inset-0 overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        {useVideo ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full overflow-hidden"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-top"
            priority
          />
        )}
        <div
          className="absolute inset-0 bg-black/60"
        />
      </motion.div>
    </motion.div>
  );
};

export default withDebugBadge(HeaderImageVideoComp2, "fragment-HeaderImageVideoComp2", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
