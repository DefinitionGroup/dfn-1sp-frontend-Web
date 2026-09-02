import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { hasVisibleText } from "@1sp/utils/text-content";

const clientLogos = [
  ["/renaissance/figma/client-amazon-kids.png", "Amazon Kids"],
  ["/renaissance/figma/client-pm-studios.png", "PM Studios"],
  ["/renaissance/figma/client-curveball-games.png", "Curveball Games"],
  ["/renaissance/figma/client-activision-blizzard.png", "Activision Blizzard"],
  ["/renaissance/figma/client-505-games.png", "505 Games"],
  ["/renaissance/figma/client-wild-river.png", "Wild River"],
  ["/renaissance/figma/client-pathea.png", "Pathea Games"],
  ["/renaissance/figma/client-plaion.png", "Plaion"],
  ["/renaissance/figma/client-team17.png", "Team17"],
] as const;

type OriginsData = {
  title?: string;
  content?: Array<Record<string, unknown>>;
};

export default function RenaissanceOrigins({ data }: { data: OriginsData }) {
  return (
    <div className="mx-auto grid max-w-[1680px] gap-12 px-5 pb-10 pt-12 sm:px-8 md:grid-cols-12 md:items-center md:gap-x-10 md:pb-4 md:pt-[4.25rem] lg:px-12">
      <div className="md:col-span-5">
        {hasVisibleText(data.title) ? (
          <h2 className="renaissance-display text-[clamp(2.7rem,3.5vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.025em] text-renaissance-ink">
            {data.title}
          </h2>
        ) : null}
        {Array.isArray(data.content) && data.content.length ? (
          <div className="mt-5 max-w-[34rem] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] text-renaissance-ink/75">
            <PortableText
              value={data.content as never}
              components={{
                block: {
                  normal: ({ children }) => <p className="mb-5">{children}</p>,
                },
              }}
            />
          </div>
        ) : null}

        <Link
          href="/about-us"
          className="mt-6 inline-flex min-w-[12.5rem] items-center justify-between gap-8 rounded-[4px] bg-renaissance-accent px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-renaissance-ink"
        >
          Our story <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 items-center gap-x-8 gap-y-7 md:col-span-7 md:gap-x-12 md:gap-y-8">
        {clientLogos.map(([src, alt]) => (
          <div key={src} className="relative h-12 md:h-16">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 767px) 30vw, 22vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
