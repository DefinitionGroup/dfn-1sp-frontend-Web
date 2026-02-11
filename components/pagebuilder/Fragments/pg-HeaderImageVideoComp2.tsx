"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
import { optimizedVideoUrl } from "@/utils/utils";

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  enableParallax?: boolean;
  opacity?: number; // overlay target opacity when in view
  videoDelay?: number; // delay before video starts (seconds)
}

const HeaderImageVideoComp2: React.FC<HeaderImageVideoCompProps> = ({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "Hero Background",
  className = "",
  enableParallax = true,
  opacity = 0.6, // default overlay opacity
  videoDelay = 0.5, // default delay after animation starts
}) => {
  // Create ref for the component
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, {
    once: true, // Only animate once - prevent re-triggering
    amount: 0.1, // Lower threshold to trigger earlier
    margin: "100px 0px 0px 0px", // Trigger before element enters viewport
  });

  // Play video after animation completes
  useEffect(() => {
    if (isInView && useVideo && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play();
      }, videoDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, useVideo, videoDelay]);

  return (
    <div
      ref={ref}
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}

    >
      <motion.div
        initial={{ clipPath: "inset(55% 44% 55% 44% round 2rem)" }}
        animate={
          isInView
            ? { clipPath: "inset(0% 0% 0% 0% round 2rem)" }
            : { clipPath: "inset(55% 0% 0% 0% round 2rem)" }
        }
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute mx-auto rounded-xl inset-0 overflow-hidden"

      >
        {useVideo ? (
          <video
            ref={videoRef}
            src={optimizedVideoUrl(videoSrc, { maxWidth: 1920 })}
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
          className="absolute inset-0 bg-black"
          style={{ opacity }}
        />
      </motion.div>
    </div>
  );
};

export default withDebugBadge(HeaderImageVideoComp2, "fragment-HeaderImageVideoComp2", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
