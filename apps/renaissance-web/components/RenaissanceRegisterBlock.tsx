import Image from "next/image";
import Link from "next/link";
import type { CTA, RegisterBlock as RegisterBlockData } from "@1sp/sanity-types";
import { getRenderableCta } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

const DEFAULT_CARDS: NonNullable<RegisterBlockData["cards"]> = [
  {
    _key: "join-content-creators",
    _type: "cta",
    text: "Content creators",
    variant: "black",
    link: { linkType: "external", externalUrl: "/contact" },
  },
  {
    _key: "join-media",
    _type: "cta",
    text: "Media",
    variant: "black",
    link: { linkType: "external", externalUrl: "/contact" },
  },
];

const REGISTER_CARD_MEDIA = [
  "/renaissance/figma/service-02.jpg",
  "/renaissance/figma/service-01.jpg",
] as const;

function RegisterCard({ cta, index }: { cta: CTA; index: number }) {
  const action = getRenderableCta(cta);
  if (!action) return null;

  const opensNewTab = /^https?:\/\//i.test(action.href);

  return (
    <Link
      href={action.href}
      {...(opensNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group relative aspect-square overflow-hidden rounded-card bg-renaissance-button text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-renaissance-button"
    >
      <Image
        src={REGISTER_CARD_MEDIA[index % REGISTER_CARD_MEDIA.length]}
        alt=""
        fill
        sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 767px) 46vw, 30vw"
        className="object-cover brightness-[.8] transition-[filter] duration-500 ease-out group-hover:brightness-100 group-focus-visible:brightness-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-renaissance-ink/80 via-renaissance-ink/10 to-renaissance-ink/45"
      />
      <span className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="font-mono text-[0.7rem] font-medium tracking-[0.12em] text-white/75">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex items-end justify-between gap-6">
          <span className="renaissance-display text-[clamp(1.75rem,2.4vw,2.7rem)] font-bold leading-[0.95] tracking-[-0.025em]">
            {action.text}
          </span>
          <svg
            width="30"
            height="20"
            viewBox="0 0 30 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="mb-1 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none"
          >
            <path d="M0 19H11L28.5 1.5" stroke="currentColor" />
            <path d="M15 1H29V15" stroke="currentColor" />
          </svg>
        </span>
      </span>
    </Link>
  );
}

export default function RenaissanceRegisterBlock({
  data,
}: {
  data: RegisterBlockData;
}) {
  const headline = hasVisibleText(data.headline)
    ? data.headline
    : "Register with us";
  const description = hasVisibleText(data.description)
    ? data.description
    : "If you are a content creator/journalist or influencer register with us now to get all the latest news from our clients!";
  const cards = Array.isArray(data.cards) && data.cards.length
    ? data.cards
    : DEFAULT_CARDS;

  return (
    <div
      className="mx-auto grid max-w-[1680px] gap-10 px-5 pb-14 pt-10 sm:px-8 md:grid-cols-12 md:gap-x-10 md:pb-20 md:pt-14 lg:px-12"
      data-component="register-block"
    >
      <div className="md:col-span-5">
        <h2 className="renaissance-display max-w-[12ch] text-[clamp(2.7rem,4.4vw,5.25rem)] font-bold leading-[0.88] tracking-[-0.035em] text-renaissance-ink text-balance">
          {headline}
        </h2>
        <p className="mt-6 max-w-[38rem] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] text-renaissance-ink/75 text-pretty">
          {description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:col-span-7 md:col-start-6">
        {cards.map((cta, index) => (
          <RegisterCard key={cta._key ?? `${cta.text ?? "card"}-${index}`} cta={cta} index={index} />
        ))}
      </div>
    </div>
  );
}
