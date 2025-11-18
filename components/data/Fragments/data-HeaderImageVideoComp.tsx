"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import bg from "@/public/dot-background.png";

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  enableParallax?: boolean;
  opacity?: string;
  enableVertical?: boolean;
}

const HeaderImageVideoComp: React.FC<HeaderImageVideoCompProps> = ({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "Hero Background",
  enableVertical = false,
  className = "",
  enableParallax = true,
  opacity = "opacity-45",
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  // Create ref for the component
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    margin: "0px 0px -100px 0px",
  });

  return (
    <motion.div
      className={`absolute bg-black inset-0 overflow-hidden ${className}`}
      initial={{ opacity: 0, scaleX: 0.9, y: 100 }}
      animate={{
        opacity: 1,
        scaleX: 1,
        y: 0,
      }}
      transition={{
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.8 },
        scaleX: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
      }}
    >
      <motion.div
        ref={ref}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.1, filter: "blur(128px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{
          duration: 3.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 1.8 },
          filter: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
        }}
        style={enableParallax ? { y } : {}}
      >
        {useVideo ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className={
              enableVertical
                ? "absolute right-0 top-0 w-1/2 h-full object-cover"
                : `object-cover w-full h-full ${opacity}`
            }
          />
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
        )}

        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bg.src})`,
            backgroundSize: "24px 24px",
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeaderImageVideoComp;
