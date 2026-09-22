"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView, useReducedMotion } from "motion/react";
import { optimizedVideoUrl, cloudinaryPosterUrl } from "@1sp/utils/cloudinary";

interface HeaderImageVideoCompProps {
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  className?: string;
  opacity?: string;
  enableVertical?: boolean;
}

/** Case media stays full bleed and still; no texture, blur or viewport-scale motion. */
export default function HeaderImageVideoComp({
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/video/atf.mp4",
  imageAlt = "Hero Background",
  enableVertical = false,
  className = "",
  opacity = "opacity-50",
}: HeaderImageVideoCompProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useInView(ref, { amount: 0.1 });
  const reduced = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const posterUrl = useVideo ? cloudinaryPosterUrl(videoSrc, { maxWidth: 1280 }) || imageSrc : undefined;
  const mediaClass = enableVertical ? "absolute right-0 top-0 w-1/2 h-full object-cover" : "absolute inset-0 w-full h-full object-cover";

  useEffect(() => {
    if (reduced || !ref.current) return;
    const animation = ref.current.animate([{ opacity: 0.65 }, { opacity: 1 }], {
      duration: 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    });
    return () => animation.cancel();
  }, [reduced]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reduced) void video.play().catch(() => {});
    else video.pause();
    return () => video.pause();
  }, [visible, reduced, videoSrc]);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden bg-black ${className}`}>
      <div className={`absolute inset-0 ${opacity}`}>
        {useVideo ? <>
          {posterUrl && <img src={posterUrl} alt={imageAlt}
            className={`${mediaClass} transition-opacity duration-300 motion-reduce:transition-none ${videoReady && !reduced ? "opacity-0" : "opacity-100"}`} />}
          <video ref={videoRef} src={optimizedVideoUrl(videoSrc, { maxWidth: 1280, quality: "good", autoCodec: true })}
            poster={posterUrl} preload="none" loop muted playsInline aria-hidden
            onLoadStart={() => setVideoReady(false)}
            onPlaying={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className={`${mediaClass} transition-opacity duration-300 motion-reduce:transition-none ${videoReady && !reduced ? "opacity-100" : "opacity-0"}`} />
        </> : <Image src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover" priority />}
      </div>
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgb(0 0 0 / 12%) 20%, rgb(0 0 0 / 25%) 45%, rgb(0 0 0 / 80%) 100%)" }} />
    </div>
  );
}
