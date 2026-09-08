"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "motion/react";
import type { NewsCTABlock } from "@1sp/sanity-types";
import {
  assetUrl,
  cloudinaryPosterUrl,
  getRenderableCta,
  isVideoAsset,
  optimizedVideoUrl,
} from "@1sp/utils/cloudinary";
import styles from "./RenaissanceNewsCTABlock.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => true;

function NewsMedia({ data, src }: { data: NewsCTABlock; src: string }) {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const inView = useInView(container, { amount: 0.1 });
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getReducedMotion,
    getServerReducedMotion,
  );
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const isVideo = isVideoAsset(data.media, src);
  const poster = isVideo
    ? assetUrl(data.poster) || cloudinaryPosterUrl(src, { maxWidth: 960 })
    : src;
  const shouldPlay =
    isVideo && reducedMotion === false && inView && !paused && !failed;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const syncPlayback = () => {
      if (shouldPlay && !document.hidden)
        element.play().catch(() => setPaused(true));
      else element.pause();
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      element.pause();
    };
  }, [shouldPlay]);

  return (
    <div ref={container} className={styles.media}>
      <div
        className={styles.mask}
        role={isVideo ? "img" : undefined}
        aria-label={isVideo ? data.mediaAlt : undefined}
      >
        {poster && (
          <Image
            src={poster}
            alt={isVideo ? "" : data.mediaAlt || ""}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1760px) 38vw, 640px"
            className={styles.picture}
          />
        )}
        {isVideo && (
          <video
            ref={video}
            src={optimizedVideoUrl(src, { maxWidth: 960 })}
            poster={poster || undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={styles.video}
            style={{
              opacity: playing && !failed && reducedMotion === false ? 1 : 0,
            }}
            onPlaying={() => setPlaying(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {isVideo && reducedMotion === false && !failed && (
        <button
          type="button"
          className={styles.pause}
          aria-label={paused ? "Play news video" : "Pause news video"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
    </div>
  );
}

export default function RenaissanceNewsCTABlock({
  data,
}: {
  data: NewsCTABlock;
}) {
  const src = assetUrl(data.media);
  const action = getRenderableCta({ text: data.headline, link: data.link });
  if (!src || !action) return null;

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-12" data-component="news-cta-block">
      <article className={styles.banner}>
        <NewsMedia key={src} data={data} src={src} />
        <div className={styles.copy}>
          <div>
            <h2 className={styles.headline}>
              <Link href={action.href}>{data.headline}</Link>
            </h2>
            {data.text && <p className={styles.text}>{data.text}</p>}
          </div>
          <svg
            className={styles.arrow}
            viewBox="0 0 22 14"
            fill="none"
            aria-hidden="true"
          >
            <path d="M0 13.5H8L20.5 1" stroke="currentColor" />
            <path d="M10 0.5H21V12" stroke="currentColor" />
          </svg>
        </div>
      </article>
    </div>
  );
}
