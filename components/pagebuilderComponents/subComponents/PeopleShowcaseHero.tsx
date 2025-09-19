"use client";
import React from "react";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
export interface MemberItem {
  name?: string;
  media?: (CloudinaryAsset & { resource_type?: string }) | null;
  altText?: string;
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
  if (!members || members.length === 0) return null;

  return (
    <section
      className="flex flex-col gap-8 items-start justify-start w-full mx-auto"
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title"
    >
      <div className="flex items-center justify-start w-full overflow-x-auto">
        <StaggeredSlideUp className="grid grid-cols-4 gap-4 w-full overflow-x-auto">
          {members.map((member, index) => {
            const src = assetUrl(member.media as any);
            const video =
              isVideoUrl(src) ||
              (member.media as any)?.resource_type === "video";
            return (
              <div
                key={(member.name || "member") + index}
                className="group relative border border-neutral-100 overflow-hidden bg-neutral-600 flex-shrink-0 rounded-xs transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
                data-member={(member.name || "").toLowerCase()}
              >
                {video ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                  />
                ) : (
                  <img
                    src={src}
                    alt={member.altText || member.name || ""}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 p-4 overflow-hidden transition-colors duration-300" />
              </div>
            );
          })}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
