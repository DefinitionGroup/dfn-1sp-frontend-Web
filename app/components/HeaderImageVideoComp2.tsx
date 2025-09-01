"use client";

import React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useRef } from "react";

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  enableParallax?: boolean;
}

const HeaderImageVideoComp2: React.FC<HeaderImageVideoCompProps> = ({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "Hero Background",
  className = "",
  enableParallax = true,
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  // Create ref for the component
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.4,
  });

  return (
    <motion.div className={`absolute inset-0   mx-auto ${className}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 1, scale: 0.9, width: "90%" }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, width: "100%" }
            : { opacity: 1, scale: 0.9, width: "90%" }
        }
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="absolute mx-auto rounded-sm inset-0 overflow-hidden ">
        {useVideo ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            className="object-cover w-full h-full overflow-hidden "
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
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
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

export default HeaderImageVideoComp2;
