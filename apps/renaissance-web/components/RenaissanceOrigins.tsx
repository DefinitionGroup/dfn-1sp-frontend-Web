import { stegaClean } from "@sanity/client/stega";
import Image from "next/image";
import Button2 from "./ui/Button2";
import { PortableText } from "@portabletext/react";
import { assetUrl, ctaToButtonProps } from "@1sp/utils/cloudinary";
import type { CTA, CloudinaryAsset } from "@1sp/sanity-types";
import { getOriginsLogos } from "../lib/renaissanceOrigins";
import { hasVisibleText } from "@1sp/utils/text-content";
import DeferredVideo from "./ui/DeferredVideo";

type OriginsData = {
  renaissanceHeadline?: string;
  title?: string;
  content?: Array<Record<string, unknown>>;
  showTitle?: boolean;
  titleColor?: "neutral-700" | "neutral-400" | "white";
  contentSize?: "sm" | "base" | "lg" | "xl";
  paddingY?: "8" | "16" | "24" | "32";
  reverseColumns?: boolean;
  renaissanceMediaLayout?: "logos" | "media";
  renaissanceLogos?: Parameters<typeof getOriginsLogos>[0];
  cta?: CTA;
  image?: CloudinaryAsset;
  video?: CloudinaryAsset;
  useVideo?: boolean;
  mediaAlt?: string;
};

const paddingClasses = { "8": "py-8", "16": "py-16", "24": "py-24", "32": "py-32" };
const contentClasses = { sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl" };
const titleClasses = { "neutral-700": "text-neutral-700", "neutral-400": "text-neutral-400", white: "text-white" };

export default function RenaissanceOrigins({ data }: { data: OriginsData }) {
  const logos = getOriginsLogos(data.renaissanceLogos);
  const button = ctaToButtonProps(data.cta);
  const showsLogos = stegaClean(data.renaissanceMediaLayout) === "logos";
  const mediaSrc = assetUrl(data.useVideo ? data.video : data.image);
  const hasHeadline = hasVisibleText(data.renaissanceHeadline);
  // The big headline sits directly above the column title, which becomes its subheading.
  const TitleTag = hasHeadline ? "h3" : "h2";
  return (
    <div className={`mx-auto grid max-w-[1680px] gap-12 px-5 sm:px-8 md:grid-cols-12 md:items-center md:gap-x-10 lg:px-12 ${paddingClasses[stegaClean(data.paddingY) ?? "24"] ?? paddingClasses["24"]}`}>
      <div className={`md:col-span-5 ${data.reverseColumns ? "md:order-2" : ""}`}>
        {hasHeadline ? (
          <h2 className="renaissance-display text-[clamp(3.75rem,6vw,6rem)] font-bold leading-none text-renaissance-signal">
            {data.renaissanceHeadline}
          </h2>
        ) : null}
        {data.showTitle !== false && hasVisibleText(data.title) ? (
          <TitleTag className={`renaissance-display text-[clamp(2.7rem,3.5vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.025em] ${hasHeadline ? "mt-3" : ""} ${titleClasses[stegaClean(data.titleColor) ?? "neutral-700"]}`}>
            {data.title}
          </TitleTag>
        ) : null}
        {Array.isArray(data.content) && data.content.length ? (
          <div className={`mt-5 max-w-[34rem] leading-[1.4] text-renaissance-ink/75 ${contentClasses[stegaClean(data.contentSize) ?? "lg"]}`}>
            <PortableText
              value={data.content as never}
              components={{
                block: {
                  normal: ({ children }) => <p className="mb-5">{children}</p>,
                },
                list: {
                  bullet: ({ children }) => <ul className="mb-5 list-disc pl-5">{children}</ul>,
                  number: ({ children }) => <ol className="mb-5 list-decimal pl-5">{children}</ol>,
                },
                marks: {
                  link: ({ value, children }) => (
                    <a href={value?.href} target={value?.blank ? "_blank" : undefined} rel={value?.blank ? "noopener noreferrer" : undefined} className="underline underline-offset-4">
                      {children}
                    </a>
                  ),
                },
              }}
            />
          </div>
        ) : null}

        {button ? (
          <Button2 {...button} className="mt-6 min-w-[12.5rem]" />
        ) : null}
      </div>

      {showsLogos ? (
        <div data-origins-media="logos" className="grid grid-cols-3 items-center gap-x-8 gap-y-7 md:col-span-7 md:gap-x-12 md:gap-y-8">
          {logos.map(({ key, src, alt }) => (
            <div key={key} className="relative h-12 md:h-16">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 767px) 30vw, 22vw"
                unoptimized={src.startsWith("https://") && !src.startsWith("https://res.cloudinary.com/")}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      ) : mediaSrc ? (
        <div data-origins-media="media" className="relative aspect-[4/3] overflow-hidden rounded-media md:col-span-7">
          {data.useVideo ? (
            // Muted ambient loop like the hero; the poster is the video's own
            // first frame, so a leftover image never flashes before it.
            <DeferredVideo src={mediaSrc} maxWidth={1280} className="h-full w-full object-cover" />
          ) : (
            <Image src={mediaSrc} alt={data.mediaAlt || ""} fill sizes="(max-width: 767px) 100vw, 58vw" className="object-cover" />
          )}
        </div>
      ) : null}
    </div>
  );
}
