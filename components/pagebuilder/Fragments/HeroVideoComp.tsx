"use client";

import React, { useEffect, useRef, useState } from "react";
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
    imageAlt = "Hero Background",
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const posterImgRef = useRef<HTMLImageElement>(null);

    const [videoMounted, setVideoMounted] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [posterLoaded, setPosterLoaded] = useState(!useVideo);

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
    const posterFallback = posterDesktop ?? posterMobile;

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

    // Detect poster loaded from cache
    useEffect(() => {
        if (!useVideo || posterLoaded) return;
        if (posterImgRef.current?.complete) {
            setPosterLoaded(true);
            return;
        }
        // Safety: don't block video mount forever
        const timer = window.setTimeout(() => setPosterLoaded(true), 1500);
        return () => window.clearTimeout(timer);
    }, [useVideo, posterLoaded]);

    // Defer video mount until after poster paints as LCP
    useEffect(() => {
        if (!useVideo || videoMounted || !posterLoaded) return;

        const win = window as Window & {
            requestIdleCallback?: (
                cb: IdleRequestCallback,
                opts?: IdleRequestOptions,
            ) => number;
            cancelIdleCallback?: (id: number) => void;
        };

        let timeoutId: number | undefined;
        let idleId: number | undefined;

        if (win.requestIdleCallback) {
            idleId = win.requestIdleCallback(() => setVideoMounted(true), {
                timeout: 1500,
            });
        } else {
            timeoutId = window.setTimeout(() => setVideoMounted(true), 300);
        }

        return () => {
            if (timeoutId !== undefined) window.clearTimeout(timeoutId);
            if (idleId !== undefined && win.cancelIdleCallback)
                win.cancelIdleCallback(idleId);
        };
    }, [useVideo, posterLoaded, videoMounted]);

    // Autoplay once video is mounted
    useEffect(() => {
        if (!videoMounted || !videoRef.current) return;
        videoRef.current.play().catch(() => {
            // Autoplay blocked — poster stays visible, which is fine
        });
    }, [videoMounted]);

    const handleVideoReady = () => setVideoReady(true);

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
                                    srcSet={srcSetDesktop}
                                    sizes="100vw"
                                    alt={imageAlt}
                                    width={1920}
                                    height={1080}
                                    fetchPriority="high"
                                    loading="eager"
                                    onLoad={() => setPosterLoaded(true)}
                                    onError={() => setPosterLoaded(true)}
                                    className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
                                    style={{ zIndex: 1 }}
                                />
                            </picture>
                        )}

                        {/* Video — deferred mount, never competes with poster for bandwidth */}
                        {videoMounted && (
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none"
                                onCanPlay={handleVideoReady}
                                onLoadedData={handleVideoReady}
                                onPlaying={() => setVideoReady(true)}
                                onError={() => {
                                    // If optimized sources fail, keep poster visible
                                    setVideoReady(false);
                                }}
                                className={`object-cover w-full h-full transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
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
