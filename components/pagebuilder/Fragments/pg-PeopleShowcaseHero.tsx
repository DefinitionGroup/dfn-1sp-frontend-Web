"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl, optimizedVideoUrl } from "@/utils/utils";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
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

function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });

  return (
    <div ref={ref} className={`w-full h-full ${className ?? ""}`}>
      {isInView ? (
        <video
          src={optimizedVideoUrl(src, { maxWidth: 640 })}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
        />
      ) : (
        <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
      )}
    </div>
  );
}

function PeopleShowcaseHero({
  members,
}: {
  members?: MemberItem[];
}) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<MemberItem | null>(null);

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section
      className="flex flex-col items-start justify-start w-full mx-auto"
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title"
    >
      <div className="flex items-center justify-start  w-full overflow-x-auto">
        <StaggeredSlideUp className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[2px] w-full overflow-x-auto">
          {members.map((member, index) => {
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
                className="group relative border-neutral-100 overflow-hidden flex-shrink-0  transition-transform duration-300 focus-within:scale-[1.02] aspect-square"
                data-member={(
                  member.name ||
                  member.fullname ||
                  ""
                ).toLowerCase()}
                onMouseEnter={() =>
                  setHoveredMember(
                    member.name || member.fullname || String(index)
                  )
                }
                onMouseLeave={() => setHoveredMember(null)}
              >
                {isVideo ? (
                  <LazyVideo src={src ?? ""} />
                ) : (
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-all duration-300 group-hover:brightness-110 "
                  />
                )}
                {/* Unit Logo Signet */}
                {member.unit?.logoSignet && (
                  <div className="absolute top-4 left-4  w-12 h-12 z-10">
                    <Image
                      src={assetUrl(member.unit.logoSignet as any) || ""}
                      alt={member.unit.name || "Unit logo"}
                      fill
                      sizes="40px"
                      className="object-contain object-left border  relative border block left-0"
                    />
                  </div>
                )}
                <div className="absolute inset-0 hidden bg-gradient-to-t from-black/70 via-black/60 to-black/65 opacity-0 md:flex md:opacity-0 md:group-hover:opacity-100 rounded-xs transition-opacity duration-300 flex-col justify-end p-4">
                  <StaggeredFadeIn
                    className="flex flex-col"
                    triggerOnView={false}
                    delay={0}
                    staggerDelay={0.05}
                    animate={
                      hoveredMember ===
                        (member.name || member.fullname || String(index))
                        ? "visible"
                        : "hidden"
                    }
                  >
                    {member.fullname && (
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {member.fullname}
                      </h3>
                    )}
                    {member.position && (
                      <p className="text-white/80 text-sm mb-2 font-medium">
                        {member.position}
                      </p>
                    )}
                    {member.email && (
                      <p className="text-white/90 text-sm mb-1 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {member.email}
                      </p>
                    )}
                    {member.profileUrl && (
                      <Link
                        href={member.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 text-sm hover:text-lime-400 transition-colors flex items-center"
                      >
                        <Image
                          src="/LinkedinLogo.svg"
                          alt="LinkedIn"
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-2"
                        />
                        LinkedIn Profile
                      </Link>
                    )}
                  </StaggeredFadeIn>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModal(member);
                  }}
                  className="md:hidden absolute bottom-3 left-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-lg cursor-pointer transition hover:-translate-y-[1px] hover:shadow-xl"
                >
                  View contact
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </StaggeredSlideUp>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative w-full max-w-sm rounded-2xl bg-neutral-900 p-5 text-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                {activeModal.media?.secure_url ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-neutral-800">
                    {isVideoUrl(activeModal.media.secure_url) ? (
                      <video
                        src={optimizedVideoUrl(activeModal.media.secure_url, { maxWidth: 112 })}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={assetUrl(activeModal.media as any) || activeModal.media.secure_url}
                        alt={activeModal.altText || activeModal.fullname || activeModal.name || "Profile image"}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ) : null}
                <div className="flex flex-col max-w-2/3">
                  <p className="text-xxs mb-4 uppercase tracking-[0.04em] text-neutral-400">Team contact</p>
                  <h3 className="text-lg font-semibold leading-tight">
                    {activeModal.fullname || activeModal.name}
                  </h3>
                  {activeModal.position && (
                    <p className="text-xs mt-2 text-neutral-400">{activeModal.position}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {activeModal.email && (
                  <a
                    href={`mailto:${activeModal.email}`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                      @
                    </span>
                    <span className="break-all">{activeModal.email}</span>
                  </a>
                )}
                {activeModal.profileUrl && (
                  <Link
                    href={activeModal.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <Image
                      src="/LinkedinLogo.svg"
                      alt="LinkedIn"
                      width={16}
                      height={16}
                      className="h-5 w-5"
                    />
                    <span>LinkedIn profile</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default withDebugBadge(PeopleShowcaseHero, "fragment-PeopleShowcaseHero", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
