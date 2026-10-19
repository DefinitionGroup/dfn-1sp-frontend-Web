import Image from "next/image";
import Link from "next/link";
import type {
  RegisterBlock as RegisterBlockData,
  RegisterCard as RegisterCardData,
} from "@1sp/sanity-types";
import { getRenderableCta } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

const DEFAULT_CARDS: NonNullable<RegisterBlockData["cards"]> = [
  {
    _key: "join-content-creators",
    _type: "registerCard",
    text: "Content creators",
    buttonText: "Click here to register as a content creator",
    link: { linkType: "external", externalUrl: "/contact" },
  },
  {
    _key: "join-media",
    _type: "registerCard",
    text: "Media",
    buttonText: "Click here to register as media",
    link: { linkType: "external", externalUrl: "/contact" },
  },
];

const REGISTER_CARD_MEDIA = [
  "/renaissance/figma/service-02.jpg",
  "/renaissance/figma/service-01.jpg",
] as const;

/**
 * Button2's violet look for a card-wide link: a span, since a nested Button2
 * would put a link inside a link. The label always sets on two balanced lines;
 * the max width is narrower than any one-line label but wide enough for two.
 */
function TwoLineButton({ children }: { children: string }) {
  return (
    <span className="flex items-center justify-between gap-4 rounded-action bg-renaissance-button py-3 pl-5 pr-4 text-sm font-semibold leading-snug transition-colors duration-300 group-hover:bg-renaissance-accent group-focus-visible:bg-renaissance-accent motion-reduce:transition-none">
      <span className="max-w-[22ch] text-balance">{children}</span>
      <svg
        width="21"
        height="14"
        viewBox="0 0 30 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
      >
        <path d="M0 19H11L28.5 1.5" stroke="currentColor" />
        <path d="M15 1H29V15" stroke="currentColor" />
      </svg>
    </span>
  );
}

function RegisterCard({ card, index }: { card: RegisterCardData; index: number }) {
  const action = getRenderableCta(card);
  if (!action) return null;

  const opensNewTab = /^https?:\/\//i.test(action.href);
  const buttonText = hasVisibleText(card.buttonText) ? card.buttonText : null;

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
        sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 46vw, 30vw"
        className="object-cover brightness-[.8] transition-[filter] duration-500 ease-out group-hover:brightness-100 group-focus-visible:brightness-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-renaissance-ink/80 via-renaissance-ink/10 to-renaissance-ink/45"
      />
      <span className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-[0.7rem] font-medium tracking-[0.12em] text-white/75">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="renaissance-display text-[clamp(1.75rem,2.4vw,2.7rem)] font-bold leading-[0.95] tracking-[-0.025em]">
            {action.text}
          </span>
        </span>
        {buttonText ? <TwoLineButton>{buttonText}</TwoLineButton> : null}
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
      className="mx-auto grid max-w-[1680px] gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-x-10 md:pb-20 md:pt-14 lg:px-12"
      data-component="register-block"
    >
      <div className="lg:col-span-4 xl:col-span-5">
        <h2 className="renaissance-display max-w-[12ch] text-[clamp(2.7rem,4.4vw,5.25rem)] font-bold leading-[0.88] tracking-[-0.035em] text-renaissance-ink text-balance">
          {headline}
        </h2>
        <p className="mt-6 max-w-[38rem] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] text-renaissance-ink/75 text-pretty">
          {description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-6">
        {cards.map((card, index) => (
          <RegisterCard key={card._key ?? `${card.text ?? "card"}-${index}`} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
