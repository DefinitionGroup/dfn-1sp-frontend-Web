"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "motion/react";
import { assetUrl, cloudinaryPosterUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import { getRenderableCta, resolveCtaLink } from "@1sp/utils/cta";
import type { FooterExternalBannerData, FooterExternalBannerUnit } from "@1sp/sanity-types";
import styles from "./footerExternalBanner.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const getServerMotionPreference = () => true;

function localizeHref(href: string, language: string) {
  // 1SP exposes locale-free URLs; avoid redirecting every internal click.
  const prefix = `/${language}`;
  if (href === prefix) return "/";
  return href.startsWith(`${prefix}/`) ? href.slice(prefix.length) : href;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>;
}

function UnitCard({ unit, language, reducedMotion, paused }: {
  unit: FooterExternalBannerUnit;
  language: string;
  reducedMotion: boolean;
  paused: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLLIElement>(null);
  const inView = useInView(cardRef, { amount: 0.1 });
  const active = hovered || focused;
  const logo = assetUrl(unit.logo) || assetUrl(unit.logoColor);
  const href = resolveCtaLink(unit.cta?.link);
  const label = unit.name || "1SP unit";
  const videoUrl = assetUrl(unit.footerHoverVideo);
  const poster = assetUrl(unit.backgroundImage) || (videoUrl ? cloudinaryPosterUrl(videoUrl, { maxWidth: 640 }) : undefined);
  const play = active && inView && !reducedMotion && !paused;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (play) void video.play().catch(() => {});
    else video.pause();
  }, [play]);

  const content = <>
    <span className={styles.unitMedia} aria-hidden="true">
      {poster && <Image src={poster} alt="" fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw" className={styles.unitImage} />}
      {videoUrl && play && <video ref={videoRef} src={optimizedVideoUrl(videoUrl, { maxWidth: 640 })}
        poster={poster} muted loop playsInline preload="none" className={styles.unitVideo} />}
    </span>
    <span className={styles.unitBrand}>
      {logo ? <Image src={logo} alt="" width={240} height={120} unoptimized className={styles.unitLogo} />
        : <span className={styles.unitName}>{label}</span>}
    </span>
    {unit.tagline && <span className={styles.unitText}>{unit.tagline}</span>}
  </>;

  return <li ref={cardRef} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
    {href && href !== "#" ? <Link href={localizeHref(href, language)} className={styles.unit}
      aria-label={label} data-details={Boolean(unit.tagline)}
      target={unit.cta?.link?.linkType === "external" ? "_blank" : undefined}
      rel={unit.cta?.link?.linkType === "external" ? "noopener noreferrer" : undefined}>
      {content}
    </Link> : <div className={styles.unit} aria-label={label} data-details={Boolean(unit.tagline)}>{content}</div>}
  </li>;
}

export default function FooterExternalBanner({ data, units = [], language = "en", hostLogo }: {
  data: FooterExternalBannerData;
  units?: FooterExternalBannerUnit[];
  language?: string;
  hostLogo?: { src: string; alt: string };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seen = useInView(sectionRef, { once: true, margin: "200px" });
  const inView = useInView(sectionRef, { amount: 0.01 });
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, getServerMotionPreference);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoUrl = assetUrl(data.video);
  const posterUrl = assetUrl(data.poster) || (videoUrl ? cloudinaryPosterUrl(videoUrl, { maxWidth: 1920 }) : undefined);
  const cta = getRenderableCta(data.cta);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused && !reducedMotion) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, paused, reducedMotion, seen, videoUrl]);

  return (
    <section ref={sectionRef} className={styles.banner} aria-label={data.logoAlt || "1SP Agency"} data-nav-hidden="true" data-visible={seen}>
      <div className={styles.media} aria-hidden="true">
        {posterUrl && <Image src={posterUrl} alt="" fill sizes="100vw" unoptimized className={styles.poster} />}
        {videoUrl && seen && !reducedMotion && (
          <video ref={videoRef} src={optimizedVideoUrl(videoUrl, { maxWidth: 1920 })} poster={posterUrl || undefined} muted loop playsInline preload="none"
            onPlaying={() => setPlaying(true)} onError={() => setPlaying(false)}
            className={`${styles.video} ${playing ? styles.playing : ""}`} />
        )}
      </div>
      <div className={styles.shade} />
      <div className={styles.content}>
        {hostLogo && <div className={styles.hostHeader}>
          <Image src={hostLogo.src} alt={hostLogo.alt} width={134} height={32} unoptimized className={styles.hostLogo} />
          {data.eyebrow && <p className={styles.eyebrow}>{data.eyebrow}</p>}
        </div>}
        <div className={styles.intro}>
          <div className={styles.brand}>
            {!hostLogo && data.eyebrow && <p className={styles.eyebrow}>{data.eyebrow}</p>}
            <Image src={assetUrl(data.logo) || "/ci/1sp-fulllogotype.svg"} alt={data.logoAlt || "1SP Agency"} width={440} height={238} unoptimized className={styles.logo} />
          </div>
          <div className={styles.message}>
            {(data.headline || data.text) && <div className={styles.copy}>
              {data.headline && <h2 className={styles.headline}>{data.headline}</h2>}
              {data.text && <p className={styles.text}>{data.text}</p>}
            </div>}
            {cta && <Link href={localizeHref(cta.href, language)} className={styles.cta}
              target={data.cta?.link?.linkType === "external" ? "_blank" : undefined}
              rel={data.cta?.link?.linkType === "external" ? "noopener noreferrer" : undefined}>
              {cta.text}<Arrow />
            </Link>}
          </div>
        </div>
        {units.length > 0 && <ul className={styles.units}>
          {units.map((unit) => <UnitCard key={unit._id} unit={unit} language={language} reducedMotion={reducedMotion} paused={paused} />)}
        </ul>}
        {(data.copyright || videoUrl) && <div className={styles.bottom}>
          {data.copyright && <p>{data.copyright}</p>}
          {videoUrl && !reducedMotion && <button type="button" className={styles.pause} onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? "Play background video" : "Pause background video"}
          </button>}
        </div>}
      </div>
    </section>
  );
}
