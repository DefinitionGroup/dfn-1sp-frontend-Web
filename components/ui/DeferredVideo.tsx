"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { optimizedVideoUrl, cloudinaryPosterUrl } from "@/utils/utils";

/**
 * DeferredVideo — LCP-optimized video component.
 *
 * Strategy:
 * 1. On mount, renders a lightweight Cloudinary poster image (derived from the
 *    video URL — no extra assets needed).
 * 2. After a configurable delay (default 300ms), mounts the actual <video> element.
 * 3. Once the video has buffered enough to play, crossfades from poster → video.
 *
 * This ensures the poster image is the LCP element, not the video, eliminating
 * LCP penalties from heavy video payloads on mobile.
 */

interface DeferredVideoProps {
  src: string;
  maxWidth?: number;
  className?: string;
  posterClassName?: string;
  mediaStyle?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "auto" | "metadata" | "none";
  /** Delay in ms before mounting the <video> element. Default: 300 */
  mountDelay?: number;
  /** Custom poster URL — if not provided, one is derived from the Cloudinary video URL */
  posterUrl?: string;
  /** Cloudinary poster frame selection. "0" = first frame, "auto" = AI-selected best frame */
  posterFrame?: "0" | "auto";
  /** Max width for the poster image. Defaults to the video maxWidth */
  posterMaxWidth?: number;
  /** Callback when video starts playing */
  onPlay?: () => void;
  /** Style object for the container */
  style?: React.CSSProperties;
}

export default function DeferredVideo({
  src,
  maxWidth = 1920,
  className = "object-cover w-full h-full",
  posterClassName,
  mediaStyle,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = "auto",
  mountDelay = 300,
  posterUrl: customPosterUrl,
  posterFrame = "0",
  posterMaxWidth,
  onPlay,
  style,
}: DeferredVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Derive poster URL from video URL via Cloudinary transformation
  const posterUrl =
    customPosterUrl ||
    cloudinaryPosterUrl(src, {
      maxWidth: posterMaxWidth ?? maxWidth,
      frame: posterFrame,
    });

  // Optimized video URL
  const videoUrl = optimizedVideoUrl(src, { maxWidth });

  // Delay-mount the video element to let the poster paint as LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldMount(true);
    }, mountDelay);
    return () => clearTimeout(timer);
  }, [mountDelay]);

  // Handle video ready state
  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
    if (autoPlay) {
      videoRef.current?.play().catch(() => {
        // Autoplay blocked — poster stays visible, which is fine
      });
    }
    onPlay?.();
  }, [autoPlay, onPlay]);

  return (
    <div className="relative w-full h-full" style={style}>
      {/* Poster image — lightweight, loads immediately, becomes LCP element */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          className={`${posterClassName || className} absolute inset-0 w-full h-full transition-opacity duration-500 ${videoReady ? "opacity-0" : "opacity-100"}`}
          style={{ ...mediaStyle, zIndex: 1 }}
        />
      )}

      {/* Placeholder background for non-Cloudinary URLs */}
      {!posterUrl && (
        <div
          className="absolute inset-0 bg-neutral-900"
          style={{ zIndex: 1, opacity: videoReady ? 0 : 1, transition: "opacity 500ms" }}
        />
      )}

      {/* Video — mounted after delay, fades in once ready */}
      {shouldMount && videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          onCanPlay={handleCanPlay}
          className={`${className} ${videoReady ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
          style={{ ...mediaStyle, zIndex: 0 }}
        />
      )}
    </div>
  );
}
