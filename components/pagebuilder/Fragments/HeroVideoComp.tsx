"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getHeroMediaVariants } from "@/lib/hero-media";

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
    const [videoReady, setVideoReady] = useState(false);

    const heroMediaVariants = getHeroMediaVariants(videoSrc);
    const posterVariants = heroMediaVariants.filter((variant) => variant.posterUrl);
    const videoVariants = heroMediaVariants.filter((variant) => variant.videoUrl);
    const posterFallback = posterVariants.at(-1)?.posterUrl;

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
        if (!useVideo || !videoRef.current) return;

        const video = videoRef.current;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            setVideoReady(true);
        }

        attemptPlay();
    }, [useVideo, attemptPlay]);

    useEffect(() => {
        if (!useVideo) return;

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
    }, [useVideo, attemptPlay]);

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
                                    className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {/* Video — rendered in SSR HTML so the browser selects the right source immediately. */}
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
                            onPlaying={() => setVideoReady(true)}
                            onError={() => {
                                // If optimized sources fail, keep poster visible.
                                setVideoReady(false);
                            }}
                            className={`object-cover w-full h-full transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
                            style={{ zIndex: 0 }}
                        >
                            {videoVariants.map((variant) => (
                                <source
                                    key={`video-${variant.id}`}
                                    src={variant.videoUrl}
                                    media={variant.media}
                                />
                            ))}
                            {/* Raw fallback */}
                            {videoSrc && <source src={videoSrc} />}
                        </video>
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
