"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getHeroMediaVariants } from "@/lib/hero-media";
import { useRobustInView } from "@/hooks/use-robust-in-view";

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
    const { isInView: isNearViewport } = useRobustInView(containerRef, {
        once: false,
        amount: 0.05,
        margin: "160px 0px 160px 0px",
        mobileAmount: 0.01,
        mobileMargin: "240px 0px 240px 0px",
    });

    const heroMediaVariants = getHeroMediaVariants(videoSrc);
    const posterVariants = heroMediaVariants.filter((variant) => variant.posterUrl);
    const videoVariants = heroMediaVariants.filter((variant) => variant.videoUrl);
    const rawFallbackSource =
        videoSrc && (!videoSrc.includes("/upload/") || videoVariants.length === 0)
            ? videoSrc
            : undefined;
    const posterFallback = posterVariants.at(-1)?.posterUrl;
    const shouldRenderVideo = useVideo && isNearViewport;
    const videoVisible = revealComplete && mediaReady;

    const attemptPlay = useCallback(() => {
        const video = videoRef.current;
        if (!video || !isNearViewport || document.visibilityState !== "visible") return;

        video.muted = true;
        video.defaultMuted = true;

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // If autoplay is temporarily blocked, keep the poster visible and retry later.
            });
        }
    }, [isNearViewport]);

    useEffect(() => {
        if (!useVideo) return;

        const timer = window.setTimeout(() => {
            setRevealComplete(true);
        }, HERO_REVEAL_SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [useVideo]);

    useEffect(() => {
        if (!useVideo || !revealComplete || !shouldRenderVideo || !videoRef.current) return;

        const video = videoRef.current;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            setMediaReady(true);
        }

        attemptPlay();
    }, [useVideo, revealComplete, shouldRenderVideo, attemptPlay]);

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
    }, [useVideo, revealComplete, isNearViewport, attemptPlay]);

    useEffect(() => {
        if (isNearViewport) return;

        videoRef.current?.pause();
        setMediaReady(false);
    }, [isNearViewport]);

    const handleVideoReady = useCallback(() => {
        setMediaReady(true);
        if (!revealComplete || !isNearViewport) return;
        attemptPlay();
    }, [attemptPlay, revealComplete, isNearViewport]);

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
                                    className={`object-cover w-full h-full absolute inset-0 ${videoVisible ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {/* Video mounts only while the hero is near the viewport. */}
                        {shouldRenderVideo && (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none"
                                poster={posterFallback}
                                onLoadedMetadata={handleVideoReady}
                                onCanPlay={handleVideoReady}
                                onLoadedData={handleVideoReady}
                                onPlaying={() => setMediaReady(true)}
                                onError={() => {
                                    // If optimized sources fail, keep poster visible.
                                    setMediaReady(false);
                                }}
                                className={`object-cover w-full h-full ${videoVisible ? "opacity-100" : "opacity-0"}`}
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
