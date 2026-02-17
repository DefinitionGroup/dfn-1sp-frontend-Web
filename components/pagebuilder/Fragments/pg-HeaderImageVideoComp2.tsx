"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { usePathname } from "next/navigation";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
import {
  optimizedVideoUrl,
  optimizedPortraitVideoUrl,
  cloudinaryPosterUrl,
  cloudinaryPosterSrcSet,
} from "@/utils/utils";

/**
 * Helper to compute the hero poster URL for server-side <link rel="preload"> hints.
 * Call this from a server component / page to generate a preload tag.
 */
export function getHeroPosterUrl(
  videoSrc?: string,
  opts?: { mobile?: boolean }
): string | undefined {
  if (!videoSrc) return undefined;
  if (opts?.mobile) {
    return cloudinaryPosterUrl(videoSrc, { maxWidth: 480, portrait: true });
  }
  return cloudinaryPosterUrl(videoSrc, { maxWidth: 1280 });
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
  const posterImgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();
  const rawInView = useInView(ref, {
    once: false,
    amount: 0.1,
    margin: "100px 0px 0px 0px",
  });

  // "once per route" — reset on navigation, latch on first intersection
  const [animatedForPath, setAnimatedForPath] = useState<string | null>(null);

  // Reset when pathname changes so the animation can re-trigger on the new route
  useEffect(() => {
    if (isHero) return;
    setAnimatedForPath(null);
  }, [pathname, isHero]);

  // Latch when in view on the current route
  useEffect(() => {
    if (isHero) return;
    if (rawInView && animatedForPath !== pathname) {
      setAnimatedForPath(pathname);
    }
  }, [rawInView, pathname, animatedForPath, isHero]);

  // Fallback: if the element is already in the viewport after a route change,
  // useInView may not re-fire. Check once after mount / pathname change.
  useEffect(() => {
    if (isHero || animatedForPath === pathname) return;
    // Small delay to let the intersection observer settle after route change
    const timer = setTimeout(() => {
      if (ref.current) {
        const rect = (ref.current as HTMLElement).getBoundingClientRect();
        const inViewport =
          rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) {
          setAnimatedForPath(pathname);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname, isHero, animatedForPath]);

  const hasEnteredViewport = isHero || animatedForPath === pathname;

  // LCP optimization: defer video mount, show poster image first
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(!useVideo);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount for responsive video source
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Derive poster from Cloudinary video URL — portrait for mobile, landscape for desktop
  const posterUrl = useVideo
    ? cloudinaryPosterUrl(videoSrc, { maxWidth: 1280 })
    : undefined;
  const posterUrlMobile = useVideo
    ? cloudinaryPosterUrl(videoSrc, { maxWidth: 480, portrait: true })
    : undefined;
  const posterSrcSetDesktop = useVideo
    ? cloudinaryPosterSrcSet(videoSrc, [960, 1280, 1600, 1920])
    : undefined;
  const posterSrcSetMobile = useVideo
    ? cloudinaryPosterSrcSet(videoSrc, [360, 480, 640, 750], { portrait: true })
    : undefined;
  const posterFallback = posterUrl || posterUrlMobile;

  // Responsive video URLs:
  // - Mobile: portrait 9:16 crop, 480px wide, aggressive compression
  // - Desktop: landscape, 960px wide, good compression with vc_auto
  const videoUrlDesktop = optimizedVideoUrl(videoSrc, {
    maxWidth: 1440,
    quality: "auto",
    autoCodec: true,
  });
  const videoUrlMobile = optimizedPortraitVideoUrl(videoSrc, {
    maxWidth: 360,
    quality: "eco",
  });

  useEffect(() => {
    // Reset visual/video state when media changes
    setShouldMountVideo(false);
    setVideoReady(false);
    setPosterLoaded(!useVideo || !posterFallback);
  }, [useVideo, posterFallback]);

  useEffect(() => {
    if (!useVideo || posterLoaded) return;

    // If poster came from cache, mark immediately.
    if (posterImgRef.current?.complete) {
      setPosterLoaded(true);
      return;
    }

    // Safety valve: never block video mount forever if image load events are missed.
    const fallbackTimer = window.setTimeout(() => {
      setPosterLoaded(true);
    }, 1500);

    return () => window.clearTimeout(fallbackTimer);
  }, [useVideo, posterLoaded]);

  // Mount video after poster paint + idle time so the poster can win LCP
  useEffect(() => {
    if (!useVideo || shouldMountVideo || !posterLoaded) return;

    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const mountVideo = () => setShouldMountVideo(true);

    if (isHero && win.requestIdleCallback) {
      idleId = win.requestIdleCallback(() => mountVideo(), { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(mountVideo, isHero ? 300 : 800);
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined && win.cancelIdleCallback) {
        win.cancelIdleCallback(idleId);
      }
    };
  }, [useVideo, posterLoaded, isHero, shouldMountVideo]);

  // Play video after animation completes + mount delay
  useEffect(() => {
    if (hasEnteredViewport && useVideo && shouldMountVideo && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {
          // Autoplay may be blocked on some browsers — poster stays visible
        });
      }, videoDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [hasEnteredViewport, useVideo, videoDelay, shouldMountVideo]);

  const clipPathClosed = isHero
    ? "inset(6% 6% 6% 6% round 2rem)"
    : "inset(55% 44% 55% 44% round 2rem)";
  const clipPathPreInView = isHero
    ? "inset(3% 3% 3% 3% round 2rem)"
    : "inset(55% 0% 0% 0% round 2rem)";
  const clipPathOpen = "inset(0% 0% 0% 0% round 2rem)";
  const preInViewOpacity = isHero ? 0.92 : 0.86;

  return (
    <div
      ref={ref}
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}
    >
      <motion.div
        initial={{
          clipPath: clipPathClosed,
          opacity: preInViewOpacity,
        }}
        animate={
          hasEnteredViewport
            ? { clipPath: clipPathOpen, opacity: 1 }
            : { clipPath: clipPathPreInView, opacity: preInViewOpacity }
        }
        transition={{
          duration: isHero ? 0.22 : 0.35,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: isHero ? 0.18 : 0.28 },
        }}
        className="absolute mx-auto rounded-xl inset-0 overflow-hidden"
        style={{
          clipPath: hasEnteredViewport ? undefined : clipPathClosed,
          willChange: "clip-path, opacity",
          transform: "translateZ(0)",
        }}

      >
        {useVideo ? (
          <div className="relative w-full h-full">
            {/* Poster image — lightweight, loads immediately, becomes LCP element */}
            {posterFallback && (
              <picture>
                {/* Portrait poster for mobile — matches the portrait video crop */}
                {posterSrcSetMobile && (
                  <source
                    media="(max-width: 768px)"
                    srcSet={posterSrcSetMobile}
                    sizes="100vw"
                  />
                )}
                {posterSrcSetDesktop && (
                  <source
                    media="(min-width: 769px)"
                    srcSet={posterSrcSetDesktop}
                    sizes="100vw"
                  />
                )}
                <img
                  ref={posterImgRef}
                  src={posterFallback}
                  srcSet={posterSrcSetDesktop}
                  sizes="100vw"
                  alt={imageAlt}
                  width={1280}
                  height={720}
                  fetchPriority={isHero ? "high" : undefined}
                  loading={isHero ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => setPosterLoaded(true)}
                  onError={() => setPosterLoaded(true)}
                  className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
                  style={{ zIndex: 1 }}
                />
              </picture>
            )}
            {/* Video — responsive: portrait (9:16) on mobile, landscape on desktop */}
            {shouldMountVideo && (
              <video
                ref={videoRef}
                src={isMobile ? videoUrlMobile : videoUrlDesktop}
                autoPlay
                loop
                muted
                playsInline
                preload={isHero ? "metadata" : "none"}
                onCanPlay={() => setVideoReady(true)}
                onLoadedData={() => setVideoReady(true)}
                onPlaying={() => setVideoReady(true)}
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
