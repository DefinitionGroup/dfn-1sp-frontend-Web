"use client";

import React, { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import Image from "next/image";
import { getHeroMediaVariants } from "@/lib/hero-media";

const HERO_REVEAL_SETTLE_MS = 450;

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
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaReady, setMediaReady] = useState(false);
    const [revealComplete, setRevealComplete] = useState(!useVideo);
    const [isNearViewport, setIsNearViewport] = useState(true);
    // LCP optimization: track when the poster has actually painted so we can
    // mount the <video> element *after* the LCP frame, not before.
    const [posterPainted, setPosterPainted] = useState(!useVideo);

    // Handle cached images: if the poster loaded before React hydrated (from
    // browser cache), the onLoad handler was never attached. Check img.complete
    // after mount to catch this race condition.
    useEffect(() => {
        if (posterPainted || !useVideo) return;
        const img = containerRef.current?.querySelector(
            'img[fetchpriority="high"]'
        ) as HTMLImageElement | null;
        if (img?.complete && img.naturalWidth > 0) {
            requestAnimationFrame(() => setPosterPainted(true));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const heroMediaVariants = getHeroMediaVariants(videoSrc);
    const posterVariants = heroMediaVariants.filter((variant) => variant.posterUrl);
    const videoVariants = heroMediaVariants.filter((variant) => variant.videoUrl);
    const rawFallbackSource =
        videoSrc && (!videoSrc.includes("/upload/") || videoVariants.length === 0)
            ? videoSrc
            : undefined;
    const posterFallback = posterVariants.at(-1)?.posterUrl;
    const videoVisible = revealComplete && mediaReady;
    // Only mount <video> after the poster has painted (outside LCP window).
    const shouldMountVideo = posterPainted;

    const attemptPlay = useCallback(() => {
        const video = videoRef.current;
        if (!video || document.visibilityState !== "visible") return;

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
        if (!useVideo) return;

        const timer = window.setTimeout(() => {
            setRevealComplete(true);
        }, HERO_REVEAL_SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [useVideo]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const syncInView = () => {
            const rect = element.getBoundingClientRect();
            setIsNearViewport(rect.bottom > 0 && rect.top < window.innerHeight);
        };

        syncInView();

        if (typeof IntersectionObserver !== "function") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                setIsNearViewport(entry.isIntersecting);
            },
            { threshold: 0.01 },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!useVideo || !revealComplete || !isNearViewport || !videoRef.current) return;

        const video = videoRef.current;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            setMediaReady(true);
        }

        attemptPlay();
    }, [useVideo, revealComplete, isNearViewport, attemptPlay, shouldMountVideo]);

    useEffect(() => {
        if (!useVideo || !revealComplete) return;

        const retryPlayback = () => {
            if (!isNearViewport || document.visibilityState !== "visible") return;
            attemptPlay();
        };

        retryPlayback();
        window.addEventListener("pageshow", retryPlayback);
        document.addEventListener("visibilitychange", retryPlayback);

        return () => {
            window.removeEventListener("pageshow", retryPlayback);
            document.removeEventListener("visibilitychange", retryPlayback);
        };
    }, [useVideo, revealComplete, isNearViewport, attemptPlay, shouldMountVideo]);

    useEffect(() => {
        if (isNearViewport) return;
        videoRef.current?.pause();
    }, [isNearViewport]);

    const handleVideoReady = useCallback(() => {
        setMediaReady(true);
        if (!revealComplete) return;
        attemptPlay();
    }, [attemptPlay, revealComplete]);

    return (
        <div ref={containerRef} className="absolute mt-4 inset-0 overflow-visible mx-auto">
            {/* CSS-only clip-path reveal — paints from SSR HTML, no JS needed */}
            <div className="absolute mx-auto rounded-xl inset-0 overflow-hidden hero-clip-reveal">
                {useVideo ? (
                    <div className="relative w-full h-full">
                        {/* Poster — the LCP element. Loads eagerly, high priority. */}
                        {posterFallback && (
                            <picture>
                                {posterVariants.map((variant) =>
                                    variant.posterSrcSet ? (
                                        <source
                                            key={`poster-${variant.id}`}
                                            media={variant.media}
                                            srcSet={variant.posterSrcSet}
                                            sizes={variant.sizes}
                                        />
                                    ) : null,
                                )}
                                <img
                                    src={posterFallback}
                                    alt={imageAlt}
                                    width={1920}
                                    height={1080}
                                    fetchPriority="high"
                                    loading="eager"
                                    decoding="async"
                                    onLoad={() => {
                                        // Wait one animation frame so the browser
                                        // has committed the poster paint (= LCP).
                                        requestAnimationFrame(() => setPosterPainted(true));
                                    }}
                                    onError={() => setPosterPainted(true)}
                                    className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoVisible ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {/* Video mounts after poster has painted (outside the LCP window).
                            Using preload="auto" so the browser starts downloading immediately. */}
                        {shouldMountVideo && (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                poster={posterFallback}
                                onLoadedMetadata={handleVideoReady}
                                onCanPlay={handleVideoReady}
                                onLoadedData={handleVideoReady}
                                onPlaying={() => setMediaReady(true)}
                                onError={() => {
                                    // If optimized sources fail, keep poster visible.
                                    setMediaReady(false);
                                }}
                                className={`object-cover w-full h-full transition-opacity duration-700 ${videoVisible ? "opacity-100" : "opacity-0"}`}
                                style={{ zIndex: 0 }}
                            >
                                {videoVariants.map((variant) => (
                                    <source
                                        key={`video-${variant.id}`}
                                        src={variant.videoUrl}
                                        media={variant.media}
                                    />
                                ))}
                                {rawFallbackSource && <source src={rawFallbackSource} />}
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
