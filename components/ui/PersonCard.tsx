"use client";
import { useState } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { assetUrl } from "@/utils/utils";
import DeferredVideo from "@/components/ui/DeferredVideo";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";

type CloudinaryAsset = {
  _type?: string;
  public_id?: string;
  resource_type?: string;
  type?: string;
  format?: string;
  version?: number;
  url?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  [key: string]: any;
};

type Person = {
  _id: string;
  name?: string;
  slug?: { current: string };
  image?: CloudinaryAsset;
  video?: CloudinaryAsset;
  altText?: string;
  fullname?: string;
  position?: string;
  email?: string;
  profileUrl?: string;
  tagline?: string;
  channel?: string[];
  language?: string;
};

interface PersonCardProps {
  person: Person;
  index: number;
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  return lowered.endsWith(".mp4") || lowered.includes("/video/");
}

export default function PersonCard({ person, index }: PersonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const media = person.video || person.image;
  const src = assetUrl(media as any);

  if (!src) {
    return null;
  }

  const isVideo = isVideoUrl(src) || (media as any)?.resource_type === "video";
  const key = (person.name || person.fullname || "person") + index;
  const label = person.altText || person.fullname || person.name || "";

  return (
    <div
      key={key}
      className="group relative overflow-hidden rounded-xs transition-all duration-300 hover:cursor-pointer ease-out aspect-[3/4]"
      data-member={(person.name || person.fullname || "").toLowerCase()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo ? (
        <DeferredVideo
          src={src ?? ""}
          maxWidth={320}
          className="w-full h-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-105"
          mountDelay={300}
          posterFrame="0"
        />
      ) : (
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}

      {/* Always visible name overlay at bottom */}
      <div className="absolute flex flex-col   bottom-0 left-0 right-0 bg-gradient-to-t from-black/25 h-full via-black/10 to-black/10 p-2 transition-all duration-300 group-hover:from-black/55 group-hover:via-black/40 group-hover:to-black/70">
        {person.fullname && (
          <h3 className="text-black group-hover:text-white font-bold text-xs mb-0.5 drop-shadow-lg">
            {person.fullname}
          </h3>
        )}
        {person.position && (
          <p className="text-black/80 group-hover:text-white  text-xxs font-medium mb-2">
            {person.position}
          </p>
        )}

        {/* Contact icons - fade in on hover */}
        <StaggeredFadeIn
          className="flex items-center gap-3"
          triggerOnView={false}
          delay={0} duration={0.2}
          staggerDelay={0.15}
          animate={isHovered ? "visible" : "hidden"}
        >
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="flex items-center gap-1.5 text-black/90 group-hover:text-white   hover:text-lime-500 transition-colors"
              title={person.email}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-xs font-medium hidden md:inline">
                Email
              </span>
            </a>
          )}
          {person.profileUrl && (
            <Link
              href={person.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-black/90 group-hover:text-white  hover:text-lime-500 transition-colors"
              title="LinkedIn Profile"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span className="text-xs font-medium hidden md:inline">
                LinkedIn
              </span>
            </Link>
          )}
        </StaggeredFadeIn>
      </div>
    </div>
  );
}
