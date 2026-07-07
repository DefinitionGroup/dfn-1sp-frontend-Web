"use client";
import React, { useEffect, useRef, useState } from "react";
import type { CloudinaryAsset } from "@1sp/sanity-types";
import { assetUrl, optimizedVideoUrl, cloudinaryPosterUrl } from "@1sp/utils/cloudinary";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import Image from "next/image";
import Link from "next/link";
import { useRobustInView } from "@1sp/utils/hooks/use-robust-in-view";
import { hasVisibleText } from "@1sp/utils/text-content";
export interface MemberItem {
  name?: string;
  media?: (CloudinaryAsset & { resource_type?: string }) | null;
  altText?: string;
  fullname?: string;
  email?: string;
  profileUrl?: string;
  position?: string;
  unit?: {
    _id?: string;
    name?: string;
    logoSignet?: CloudinaryAsset | null;
  } | null;
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  return lowered.endsWith(".mp4") || lowered.includes("/video/");
}

function LazyVideo({
  src,
  className,
  priority = false,
}: {
  src: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { isInView, isMobile } = useRobustInView(ref, {
    amount: 0.01,
    margin: "0px 0px 200px 0px",
    mobileAmount: 0.01,
    mobileMargin: "0px 0px 280px 0px",
    fallbackVisibleAfterMs: 500,
  });
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Derive poster image from Cloudinary video URL
  const posterUrl = cloudinaryPosterUrl(src, { maxWidth: 640 });

  React.useEffect(() => {
    if (!isInView) return;

    if (isMobile) {
      setShouldMountVideo(true);
      return;
    }

    const timer = setTimeout(() => setShouldMountVideo(true), 120);
    return () => clearTimeout(timer);
  }, [isInView, isMobile]);

  return (
    <div ref={ref} className={`w-full h-full relative pointer-events-none overflow-hidden bg-neutral-200 dark:bg-neutral-800 ${className ?? ""}`}>
      {posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 group-hover:brightness-110 ${videoReady ? "opacity-0" : "opacity-100"}`}
          style={{ zIndex: 1 }}
        />
      ) : (
        <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
      )}

      {shouldMountVideo && (
        <video
          src={optimizedVideoUrl(src, { maxWidth: 640 })}
          poster={posterUrl || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload={isMobile ? "metadata" : "none"}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 group-hover:brightness-110 ${videoReady ? "opacity-100" : "opacity-0"}`}
          style={{ zIndex: 0 }}
        />
      )}
    </div>
  );
}

function PeopleShowcaseHero({
  members,
  initialVisibleCount = Number.POSITIVE_INFINITY,
}: {
  members?: MemberItem[];
  initialVisibleCount?: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { isInView } = useRobustInView(sectionRef, {
    amount: 0.01,
    margin: "0px 0px 120px 0px",
    mobileAmount: 0.01,
    mobileMargin: "0px 0px 180px 0px",
    fallbackVisibleAfterMs: 2500,
  });
  const [shouldRenderAll, setShouldRenderAll] = useState(
    !Number.isFinite(initialVisibleCount)
  );

  useEffect(() => {
    if (shouldRenderAll || !isInView) return;

    const win = window as Window & typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const run = () => setShouldRenderAll(true);
    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(run, { timeout: 800 });
      return () => {
        if (win.cancelIdleCallback) {
          win.cancelIdleCallback(idleId);
        }
      };
    }

    const timer = win.setTimeout(run, 180);
    return () => win.clearTimeout(timer);
  }, [isInView, shouldRenderAll]);

  if (!members || members.length === 0) {
    return null;
  }

  const visibleMembers =
    shouldRenderAll || !Number.isFinite(initialVisibleCount)
      ? members
      : members.slice(0, initialVisibleCount);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-start justify-start w-full mx-auto"
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title"
    >
      <div className="flex items-center justify-start w-full">
        <StaggeredSlideUp
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full"
          threshold={0.01}
          rootMargin="0px 0px 160px 0px"
        >
          {visibleMembers.map((member, index) => {
            const src = assetUrl(member.media as any);

            // Skip rendering if no valid source URL
            if (!src) {
              return null;
            }

            const isVideo =
              isVideoUrl(src) ||
              (member.media as any)?.resource_type === "video";

            const key = (member.name || member.fullname || "member") + index;
            const label =
              member.altText || member.fullname || member.name || "";
            return (
              <div
                key={key}
                className="group relative overflow-hidden rounded-[2rem] flex-shrink-0 aspect-square bg-neutral-100"
                data-member={(
                  member.name ||
                  member.fullname ||
                  ""
                ).toLowerCase()}
              >
                {isVideo ? (
                  <LazyVideo src={src ?? ""} priority={index < 4} />
                ) : (
                  <Image
                    src={src}
                    alt={label}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover pointer-events-none transition-all duration-300 group-hover:brightness-110"
                  />
                )}
                {/* Unit Logo Signet */}
                {member.unit?.logoSignet && (
                  <div className="absolute top-4 left-4 w-10 h-10 z-10">
                    <Image
                      src={assetUrl(member.unit.logoSignet as any) || ""}
                      alt={member.unit.name || "Unit logo"}
                      fill
                      sizes="40px"
                      className="object-contain object-left"
                    />
                  </div>
                )}

                {/* Always-visible info — no hover needed */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5 bg-gradient-to-t from-[#131019]/90 via-[#131019]/55 to-transparent px-4 pb-4 pt-10 sm:px-5 sm:pb-5">
                  {hasVisibleText(member.fullname || member.name) && (
                    <h3 className="text-white font-aspekta font-semibold text-sm sm:text-base leading-tight">
                      {member.fullname || member.name}
                    </h3>
                  )}
                  {member.position && (
                    <p className="text-white/70 text-xs leading-snug">
                      {member.position}
                    </p>
                  )}
                  {(member.email || member.profileUrl) && (
                    <div className="mt-2 flex items-center gap-2">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          aria-label={`Email ${member.fullname || member.name || ""}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#7c5cff] backdrop-blur-sm transition-colors hover:bg-[#7c5cff] hover:text-white"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </a>
                      )}
                      {member.profileUrl && (
                        <Link
                          href={member.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`LinkedIn profile of ${member.fullname || member.name || ""}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#7c5cff] backdrop-blur-sm transition-colors hover:bg-[#7c5cff] hover:text-white"
                        >
                          {/* Inline so the glyph follows currentColor (the
                              public SVG has lime hardcoded) */}
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}

export default PeopleShowcaseHero;
