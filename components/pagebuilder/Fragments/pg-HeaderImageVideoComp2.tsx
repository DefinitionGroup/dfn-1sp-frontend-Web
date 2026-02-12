"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
import { optimizedVideoUrl, cloudinaryPosterUrl } from "@/utils/utils";

/**
 * Helper to compute the hero poster URL for server-side <link rel="preload"> hints.
 * Call this from a server component / page to generate a preload tag.
 */
export function getHeroPosterUrl(
  videoSrc?: string,
  opts?: { mobile?: boolean }
): string | undefined {
  if (!videoSrc) return undefined;
  // Use a smaller width for mobile preload (matches responsive poster below)
  const maxWidth = opts?.mobile ? 640 : 1280;
  return cloudinaryPosterUrl(videoSrc, { maxWidth });
}

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  enableParallax?: boolean;
  opacity?: number; // overlay target opacity when in view
  videoDelay?: number; // delay before video starts (seconds)
  /** Mark as above-the-fold hero — adds fetchpriority="high" and priority to images */
  isHero?: boolean;
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
  isHero = false,
}) => {
  // Create ref for the component
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, {
    once: true, // Only animate once - prevent re-triggering
    amount: 0.1, // Lower threshold to trigger earlier
    margin: "100px 0px 0px 0px", // Trigger before element enters viewport
  });

  // LCP optimization: defer video mount, show poster image first
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Derive poster from Cloudinary video URL
  // Use a responsive width: 640px covers most mobile screens, 1280px for desktop
  const posterUrl = useVideo
    ? cloudinaryPosterUrl(videoSrc, { maxWidth: 1280 })
    : undefined;
  // Tiny srcset-like approach: mobile devices get a smaller poster
  const posterUrlMobile = useVideo
    ? cloudinaryPosterUrl(videoSrc, { maxWidth: 640 })
    : undefined;

  // Mount video after 300ms to let the poster image become the LCP element
  useEffect(() => {
    if (!useVideo) return;
    const timer = setTimeout(() => {
      setShouldMountVideo(true);
    }, 3333);
    return () => clearTimeout(timer);
  }, [useVideo]);

  // Play video after animation completes + mount delay
  useEffect(() => {
    if (isInView && useVideo && shouldMountVideo && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {
          // Autoplay may be blocked on some browsers — poster stays visible
        });
      }, videoDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, useVideo, videoDelay, shouldMountVideo]);

  return (
    <div
      ref={ref}
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}

    >
      <motion.div
        initial={{
          // Start less clipped so the poster image is partially visible immediately.
          // This lets the browser register the LCP element sooner on mobile.
          clipPath: isHero
            ? "inset(20% 10% 20% 10% round 2rem)"
            : "inset(55% 44% 55% 44% round 2rem)",
        }}
        animate={
          isInView
            ? { clipPath: "inset(0% 0% 0% 0% round 2rem)" }
            : { clipPath: isHero ? "inset(20% 10% 20% 10% round 2rem)" : "inset(55% 0% 0% 0% round 2rem)" }
        }
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute mx-auto rounded-xl inset-0 overflow-hidden"

      >
        {useVideo ? (
          <div className="relative w-full h-full">
            {/* Poster image — lightweight, loads immediately, becomes LCP element */}
            {posterUrl && (
              <picture>
                {/* Serve smaller poster to mobile devices for faster LCP */}
                {posterUrlMobile && (
                  <source
                    media="(max-width: 768px)"
                    srcSet={posterUrlMobile}
                  />
                )}
                <img
                  src={posterUrl}
                  alt={imageAlt}
                  width={1280}
                  height={720}
                  // eslint-disable-next-line react/no-unknown-property
                  fetchPriority={isHero ? "high" : undefined}
                  loading={isHero ? "eager" : undefined}
                  decoding={isHero ? "sync" : "async"}
                  className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
                  style={{ zIndex: 1 }}
                />
              </picture>
            )}
            {/* Video — mounted after 300ms delay, fades in once ready */}
            {shouldMountVideo && (
              <video
                ref={videoRef}
                src={optimizedVideoUrl(videoSrc, { maxWidth: 960 })}
                loop
                muted
                playsInline
                onCanPlay={() => setVideoReady(true)}
                className={`object-cover w-full h-full transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
                style={{ zIndex: 0 }}
              />
            )}
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority={isHero}
            fetchPriority={isHero ? "high" : undefined}
          />
        )}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity, zIndex: 2 }}
        />
      </motion.div>
    </div>
  );
};

export default withDebugBadge(HeaderImageVideoComp2, "fragment-HeaderImageVideoComp2", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
