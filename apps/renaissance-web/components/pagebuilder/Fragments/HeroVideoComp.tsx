"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getHeroMediaVariants } from "@1sp/utils/hero-media";

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
    const posterImgRef = useRef<HTMLImageElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaReady, setMediaReady] = useState(false);
    const [revealComplete, setRevealComplete] = useState(!useVideo);
    const [isNearViewport, setIsNearViewport] = useState(false);
    const [posterPainted, setPosterPainted] = useState(!useVideo);

    const heroMediaVariants = getHeroMediaVariants(videoSrc);
    const posterVariants = heroMediaVariants.filter((variant) => variant.posterUrl);
    const videoVariants = heroMediaVariants.filter((variant) => variant.videoUrl);
    const rawFallbackSource =
        videoSrc && (!videoSrc.includes("/upload/") || videoVariants.length === 0)
            ? videoSrc
            : undefined;
    const posterFallback = posterVariants.at(-1)?.posterUrl;
    const videoVisible = revealComplete && mediaReady;
    const shouldMountVideo = posterPainted;
    const shouldRenderVideo = shouldMountVideo && isNearViewport;

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
        setRevealComplete(!useVideo);
        if (!useVideo) return;

        const timer = window.setTimeout(() => {
            setRevealComplete(true);
        }, HERO_REVEAL_SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [useVideo, videoSrc]);

    useEffect(() => {
        setMediaReady(false);
        setPosterPainted(!useVideo || !posterFallback);
    }, [useVideo, posterFallback, videoSrc]);

    useEffect(() => {
        if (posterPainted || !useVideo) return;

        const posterImg = posterImgRef.current;
        if (posterImg?.complete && posterImg.naturalWidth > 0) {
            requestAnimationFrame(() => setPosterPainted(true));
        }
    }, [posterPainted, useVideo, videoSrc]);

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
        if (!useVideo || !shouldRenderVideo || !revealComplete || !videoRef.current) {
            return;
        }

        const video = videoRef.current;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            setMediaReady(true);
        }

        attemptPlay();
    }, [useVideo, shouldRenderVideo, revealComplete, attemptPlay]);

    useEffect(() => {
        if (!useVideo || !shouldRenderVideo || !revealComplete) return;

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
    }, [useVideo, shouldRenderVideo, revealComplete, isNearViewport, attemptPlay]);

    useEffect(() => {
        if (shouldRenderVideo) return;
        setMediaReady(false);
    }, [shouldRenderVideo]);

    const handleVideoReady = useCallback(() => {
        setMediaReady(true);
        if (!revealComplete) return;
        attemptPlay();
    }, [attemptPlay, revealComplete]);

    return (
        <div ref={containerRef} className="absolute mt-4 inset-0 overflow-visible mx-auto">
            {/* CSS-only clip-path reveal — paints from SSR HTML, no JS needed */}
            <div className="hero-clip-reveal container absolute inset-0 mx-auto overflow-hidden rounded-media">
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
                                    ref={posterImgRef}
                                    src={posterFallback}
                                    alt={imageAlt}
                                    width={1920}
                                    height={1080}
                                    fetchPriority="high"
                                    loading="eager"
                                    decoding="async"
                                    onLoad={() => {
                                        requestAnimationFrame(() => setPosterPainted(true));
                                    }}
                                    onError={() => setPosterPainted(true)}
                                    className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoVisible ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {shouldRenderVideo && (
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
