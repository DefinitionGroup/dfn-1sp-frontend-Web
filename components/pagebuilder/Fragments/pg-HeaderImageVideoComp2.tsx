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
    once: true, // Only animate once - prevent re-triggering
    amount: 0.1, // Lower threshold to trigger earlier
    margin: "100px 0px 0px 0px", // Trigger before element enters viewport
  });

  return (
    <div
      ref={ref}
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}

    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          isInView
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.9 }
        }
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="absolute mx-auto rounded-xl inset-0 overflow-hidden"

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

          className="absolute inset-0 opacity-60
           bg-black"
        />
      </motion.div>
    </div>
  );
};

export default withDebugBadge(HeaderImageVideoComp2, "fragment-HeaderImageVideoComp2", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
