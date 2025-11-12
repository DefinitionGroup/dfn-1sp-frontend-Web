"use client";
import React, { useState } from "react";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";
import Image from "next/image";
import Link from "next/link";
export interface MemberItem {
  name?: string;
  media?: (CloudinaryAsset & { resource_type?: string }) | null;
  altText?: string;
  fullname?: string;
  email?: string;
  profileUrl?: string;
  position?: string;
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  return lowered.endsWith(".mp4") || lowered.includes("/video/");
}

export default function PeopleShowcaseHero({
  members,
}: {
  members?: MemberItem[];
}) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section
      className="flex flex-col items-start justify-start w-full mx-auto"
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title"
    >
      <div className="flex items-center justify-start w-full overflow-x-auto">
        <StaggeredSlideUp className="grid grid-cols-3 gap-1 w-full overflow-x-auto">
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
                className="group relative border-neutral-100 overflow-hidden flex-shrink-0 rounded-xs transition-transform duration-300 focus-within:scale-[1.02] aspect-square"
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
                  <video
                    src={src ?? ""}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-[0.45]"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-[0.45]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/90 to-black/95 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-300 flex flex-col justify-end p-4">
                  <StaggeredFadeIn
                    className="flex flex-col"
                    triggerOnView={false}
                    delay={0}
                    staggerDelay={0.1}
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
              </div>
            );
          })}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
