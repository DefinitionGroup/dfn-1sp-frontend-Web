"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { usePathname } from "next/navigation";
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
  /** Mark as above-the-fold hero — adds fetchPriority="high" and priority to images */
  isHero?: boolean;
}

type VideoSource = {
  src: string;
  media?: string;
};

const HeaderImageVideoComp2: React.FC<HeaderImageVideoCompProps> = ({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "",
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
  const [heroIntroArmed, setHeroIntroArmed] = useState(!isHero);

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

  // Re-arm hero intro after route changes so clipPath reveal is visible
  // even when View Transition overlays are active.
  useEffect(() => {
    if (!isHero) {
      setHeroIntroArmed(true);
      return;
    }

    setHeroIntroArmed(false);
    const timer = window.setTimeout(() => {
      setHeroIntroArmed(true);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [pathname, isHero]);

  const hasEnteredViewport = isHero
    ? heroIntroArmed
    : animatedForPath === pathname;

  // LCP optimization: defer video mount, show poster image first
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(!useVideo);
  const [sourceFallbackStage, setSourceFallbackStage] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);

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
  // - Mobile: portrait 9:16 crop, 360px wide, aggressive compression
  // - Desktop: landscape, 1280px wide, good compression with vc_auto
  const videoUrlDesktop = optimizedVideoUrl(videoSrc, {
    maxWidth: 1280,
    quality: "good",
    autoCodec: true,
  });
  const videoUrlMobile = optimizedPortraitVideoUrl(videoSrc, {
    maxWidth: 360,
    quality: "eco",
  });
  const rawFallbackSource = videoSrc && !videoSrc.includes("/upload/") ? videoSrc : undefined;

  const sourceStages = useMemo(() => {
    const dedupe = (sources: Array<VideoSource | undefined>) => {
      const seen = new Set<string>();
      const out: VideoSource[] = [];
      for (const source of sources) {
        if (!source?.src) continue;
        const key = `${source.src}|${source.media ?? "all"}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(source);
      }
      return out;
    };

    const stage0 = dedupe([
      videoUrlMobile
        ? { src: videoUrlMobile, media: "(max-width: 768px)" }
        : undefined,
      videoUrlDesktop
        ? { src: videoUrlDesktop, media: "(min-width: 769px)" }
        : undefined,
      rawFallbackSource ? { src: rawFallbackSource } : undefined,
    ]);

    const stage1 = dedupe([
      videoUrlDesktop ? { src: videoUrlDesktop } : undefined,
      rawFallbackSource ? { src: rawFallbackSource } : undefined,
    ]);

    const stage2 = dedupe([rawFallbackSource ? { src: rawFallbackSource } : undefined]);

    return [stage0, stage1, stage2].filter((stage) => stage.length > 0);
  }, [rawFallbackSource, videoUrlDesktop, videoUrlMobile]);

  const maxStage = Math.max(sourceStages.length - 1, 0);
  const activeStage = Math.min(sourceFallbackStage, maxStage);
  const activeVideoSources = sourceStages[activeStage] ?? [];
  const shouldRenderVideo = shouldMountVideo && activeVideoSources.length > 0;
  const shouldPlayVideo = shouldRenderVideo && rawInView;
  const videoSourceKey = `${activeStage}:${activeVideoSources
    .map((source) => `${source.media ?? "all"}=${source.src}`)
    .join("|")}`;

  useEffect(() => {
    // Reset visual/video state when media changes
    setShouldMountVideo(false);
    setVideoReady(false);
    setPosterLoaded(!useVideo || !posterFallback);
    setSourceFallbackStage(0);
    setAutoplayBlocked(false);
    setVideoLoadFailed(false);
  }, [useVideo, posterFallback, videoSrc, videoUrlDesktop, videoUrlMobile, pathname]);

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
    if (!isHero && !rawInView) return;

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
  }, [useVideo, posterLoaded, isHero, shouldMountVideo, rawInView]);

  // Play video after animation completes + mount delay
  useEffect(() => {
    if (
      !hasEnteredViewport ||
      !useVideo ||
      !shouldPlayVideo ||
      !videoRef.current ||
      videoLoadFailed
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const playAttempt = videoRef.current?.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt
          .then(() => setAutoplayBlocked(false))
          .catch(() => {
            // Autoplay can be blocked on mobile Safari/Chrome battery modes.
            setAutoplayBlocked(true);
          });
      }
    }, videoDelay * 1000);

    return () => clearTimeout(timer);
  }, [
    hasEnteredViewport,
    useVideo,
    videoDelay,
    shouldPlayVideo,
    videoLoadFailed,
    activeStage,
  ]);

  useEffect(() => {
    if (rawInView) return;

    videoRef.current?.pause();
    setAutoplayBlocked(false);
  }, [rawInView]);

  const handleVideoReady = () => {
    setVideoReady(true);
    setVideoLoadFailed(false);
  };

  const handleVideoError = () => {
    setVideoReady(false);
    setAutoplayBlocked(false);
    if (activeStage < maxStage) {
      setSourceFallbackStage((current) => current + 1);
      return;
    }
    setVideoLoadFailed(true);
  };

  const handleManualPlay = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = true;
    const playAttempt = videoRef.current.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    }
  };

  const clipPathClosed = isHero
    ? "inset(6% 6% 6% 6% round 2rem)"
    : "inset(55% 44% 55% 44% round 2rem)";
  const clipPathPreInView = isHero
    ? "inset(3% 3% 3% 3% round 2rem)"
    : "inset(55% 0% 0% 0% round 2rem)";
  const clipPathOpen = "inset(0% 0% 0% 0% round 2rem)";
  const preInViewOpacity = isHero ? 0.92 : 0.86;

  // Shared inner content rendered identically for both hero (CSS) and non-hero (Framer Motion) paths
  const innerContent = (
    <>
      {useVideo ? (
        <div className="relative w-full h-full">
          {/* Poster image — lightweight, loads immediately, becomes LCP element */}
          {posterFallback && (
            <picture>
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
          {shouldRenderVideo && (
            <video
              key={videoSourceKey}
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster={posterFallback}
              onCanPlay={handleVideoReady}
              onLoadedData={handleVideoReady}
              onPlaying={() => {
                setVideoReady(true);
                setAutoplayBlocked(false);
                setVideoLoadFailed(false);
              }}
              onError={handleVideoError}
              className={`object-cover w-full h-full transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
              style={{ zIndex: 0 }}
            >
              {activeVideoSources.map((source) => (
                <source
                  key={`${source.media ?? "all"}-${source.src}`}
                  src={source.src}
                  media={source.media}
                />
              ))}
            </video>
          )}
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          decoding="async"
          className="object-cover object-top"
          priority={isHero}
          fetchPriority={isHero ? "high" : undefined}
        />
      )}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity, zIndex: 2 }}
      />
      {useVideo && shouldMountVideo && autoplayBlocked && !videoLoadFailed && (
        <button
          type="button"
          onClick={handleManualPlay}
          className="absolute bottom-4 right-4 z-[3] rounded-md border border-white/60 bg-black/45 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          Tap to play
        </button>
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={`absolute mt-4 inset-0 overflow-visible mx-auto ${className}`}
    >
      {/* Hero: CSS-only clip-path animation — paints from SSR without waiting for JS */}
      {isHero ? (
        <div
          className="absolute mx-auto rounded-xl inset-0 overflow-hidden hero-clip-reveal"
        >
          {innerContent}
        </div>
      ) : (
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
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.28 },
          }}
          className="absolute mx-auto rounded-xl inset-0 overflow-hidden"
          style={{
            willChange: "clip-path, opacity",
            transform: "translateZ(0)",
          }}
        >
          {innerContent}
        </motion.div>
      )}
    </div>
  );
};

export default HeaderImageVideoComp2;
