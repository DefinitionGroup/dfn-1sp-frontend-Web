"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    optimizedVideoUrl,
    optimizedPortraitVideoUrl,
    cloudinaryPosterUrl,
    cloudinaryPosterSrcSet,
} from "@/utils/utils";

interface HeroVideoCompProps {
    useVideo: boolean;
    videoSrc?: string;
    imageSrc?: string;
    imageAlt?: string;
}

const HeroVideoComp: React.FC<HeroVideoCompProps> = ({
    useVideo,
    videoSrc,
    imageSrc,
    imageAlt = "",
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const posterImgRef = useRef<HTMLImageElement>(null);

    const [isMobile, setIsMobile] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [posterLoaded, setPosterLoaded] = useState(!useVideo);
    const [shouldMountVideo, setShouldMountVideo] = useState(false);

    // --- Poster image URLs (derived from Cloudinary video URL) ---
    const posterDesktop = useVideo
        ? cloudinaryPosterUrl(videoSrc, { maxWidth: 1280 })
        : undefined;
    const posterMobile = useVideo
        ? cloudinaryPosterUrl(videoSrc, { maxWidth: 480, portrait: true })
        : undefined;
    const srcSetDesktop = useVideo
        ? cloudinaryPosterSrcSet(videoSrc, [960, 1280, 1600, 1920])
        : undefined;
    const srcSetMobile = useVideo
        ? cloudinaryPosterSrcSet(videoSrc, [360, 480, 640, 750], {
            portrait: true,
        })
        : undefined;
    const posterFallback = isMobile
        ? posterMobile ?? posterDesktop
        : posterDesktop ?? posterMobile;
    const posterSrcSet = isMobile
        ? srcSetMobile ?? srcSetDesktop
        : srcSetDesktop ?? srcSetMobile;

    // --- Optimized video URLs ---
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
        if (typeof window === "undefined") return;

        const mediaQueryList = window.matchMedia("(max-width: 768px)");
        const updateIsMobile = (event?: MediaQueryListEvent) => {
            setIsMobile(event?.matches ?? mediaQueryList.matches);
        };

        updateIsMobile();

        if (typeof mediaQueryList.addEventListener === "function") {
            mediaQueryList.addEventListener("change", updateIsMobile);
            return () => mediaQueryList.removeEventListener("change", updateIsMobile);
        }

        mediaQueryList.addListener(updateIsMobile);
        return () => mediaQueryList.removeListener(updateIsMobile);
    }, []);

    // Detect poster loaded from cache
    useEffect(() => {
        if (!useVideo || posterLoaded) return;
        if (posterImgRef.current?.complete) {
            setPosterLoaded(true);
            return;
        }
        // Safety: don't block video mount forever if the poster is slow.
        const timer = window.setTimeout(() => setPosterLoaded(true), 900);
        return () => window.clearTimeout(timer);
    }, [useVideo, posterLoaded]);

    // Mount video after a fixed delay from hydration — does not wait for poster,
    // so video bytes start flowing in parallel. By the time this fires the poster
    // preload (high-priority, started at HTML parse) has had a 200ms head start
    // and is typically already downloaded, so there is no bandwidth competition.
    useEffect(() => {
        if (!useVideo || shouldMountVideo) return;
        const timer = window.setTimeout(() => setShouldMountVideo(true), 200);
        return () => window.clearTimeout(timer);
    }, [useVideo, shouldMountVideo]);

    const attemptPlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.defaultMuted = true;

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // If autoplay is temporarily blocked, keep the poster visible and retry later.
            });
        }
    }, []);

    useEffect(() => {
        if (!useVideo || !shouldMountVideo || !videoRef.current) return;

        const video = videoRef.current;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            setVideoReady(true);
        }

        attemptPlay();
    }, [useVideo, shouldMountVideo, attemptPlay]);

    useEffect(() => {
        if (!useVideo || !shouldMountVideo) return;

        const retryPlayback = () => {
            if (document.visibilityState !== "visible") return;
            attemptPlay();
        };

        retryPlayback();
        window.addEventListener("pageshow", retryPlayback);
        document.addEventListener("visibilitychange", retryPlayback);

        return () => {
            window.removeEventListener("pageshow", retryPlayback);
            document.removeEventListener("visibilitychange", retryPlayback);
        };
    }, [useVideo, shouldMountVideo, attemptPlay]);

    const handleVideoReady = useCallback(() => {
        setVideoReady(true);
        attemptPlay();
    }, [attemptPlay]);

    return (
        <div className="absolute mt-4 inset-0 overflow-visible mx-auto">
            {/* CSS-only clip-path reveal — paints from SSR HTML, no JS needed */}
            <div className="absolute mx-auto rounded-xl inset-0 overflow-hidden hero-clip-reveal">
                {useVideo ? (
                    <div className="relative w-full h-full">
                        {/* Poster — the LCP element. Loads eagerly, high priority. */}
                        {posterFallback && (
                            <picture>
                                {srcSetMobile && (
                                    <source
                                        media="(max-width: 768px)"
                                        srcSet={srcSetMobile}
                                        sizes="100vw"
                                    />
                                )}
                                {srcSetDesktop && (
                                    <source
                                        media="(min-width: 769px)"
                                        srcSet={srcSetDesktop}
                                        sizes="100vw"
                                    />
                                )}
                                <img
                                    ref={posterImgRef}
                                    src={posterFallback}
                                    srcSet={posterSrcSet}
                                    sizes="100vw"
                                    alt={imageAlt}
                                    width={1920}
                                    height={1080}
                                    fetchPriority="high"
                                    loading="eager"
                                    decoding="async"
                                    onLoad={() => setPosterLoaded(true)}
                                    onError={() => setPosterLoaded(true)}
                                    className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {/* Video — deferred until poster paints so poster wins LCP */}
                        {shouldMountVideo && (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                poster={posterFallback}
                                onLoadedMetadata={handleVideoReady}
                                onCanPlay={handleVideoReady}
                                onLoadedData={handleVideoReady}
                                onPlaying={() => setVideoReady(true)}
                                onError={() => {
                                    // If optimized sources fail, keep poster visible
                                    setVideoReady(false);
                                }}
                                className="object-cover w-full h-full"
                                style={{ zIndex: 0 }}
                            >
                                {videoUrlMobile && (
                                    <source src={videoUrlMobile} media="(max-width: 768px)" />
                                )}
                                {videoUrlDesktop && (
                                    <source src={videoUrlDesktop} media="(min-width: 769px)" />
                                )}
                                {/* Raw fallback */}
                                {videoSrc && <source src={videoSrc} />}
                            </video>
                        )}
                    </div>
                ) : (
                    imageSrc && (
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            sizes="100vw"
                            decoding="async"
                            className="object-cover object-top"
                            priority
                            fetchPriority="high"
                        />
                    )
                )}

                {/* Dark overlay */}
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: 0.6, zIndex: 2 }}
                />
            </div>
        </div>
    );
};

export default HeroVideoComp;
