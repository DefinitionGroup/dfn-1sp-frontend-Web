"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useRef } from "react";
import { optimizedVideoUrl, cloudinaryPosterUrl } from "@/utils/utils";

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
  opacity = 0.5, // default overlay opacity
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 250]);

  // Create ref for the component
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.6,
  });

  // LCP optimization: defer video mount, show poster image first
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Derive poster from Cloudinary video URL
  const posterUrl = useVideo
    ? cloudinaryPosterUrl(videoSrc, { maxWidth: 1920 })
    : undefined;

  // Mount video after 300ms to let the poster image become the LCP element
  useEffect(() => {
    if (!useVideo) return;
    const timer = setTimeout(() => {
      setShouldMountVideo(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [useVideo]);

  return (
    <motion.div className={`absolute inset-0   mx-auto ${className}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 1, scale: 0.95, width: "95%" }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, width: "100%" }
            : { opacity: 1, scale: 0.95, width: "98%" }
        }
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="absolute mx-auto rounded-xl inset-0 overflow-hidden "
      >
        {useVideo ? (
          <div className="relative w-full h-full">
            {/* Poster image — lightweight, loads immediately, becomes LCP element */}
            {posterUrl && (
              <img
                src={posterUrl}
                alt={imageAlt}
                className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
                style={{ zIndex: 1 }}
              />
            )}
            {/* Video — mounted after 300ms delay, fades in once ready */}
            {shouldMountVideo && (
              <video
                src={optimizedVideoUrl(videoSrc, { maxWidth: 1920 })}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setVideoReady(true)}
                className={`object-cover w-full h-full transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
                style={{ zIndex: 0 }}
              />
            )}
          </div>
        ) : imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-top"
            priority
            unoptimized={imageSrc.includes("cloudinary")}
          />
        ) : null}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity } : { opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ zIndex: 2 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeaderImageVideoComp2;
