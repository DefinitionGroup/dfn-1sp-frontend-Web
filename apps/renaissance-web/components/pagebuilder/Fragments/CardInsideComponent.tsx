import { assetUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import type { CardInsideComponent as CardInsideComponentType } from "@1sp/sanity-types";

function isVideo(resourceType?: string, url?: string) {
  return resourceType === "video" || !!url?.match(/\/video\/|\.(mp4|webm|ogg)(\?|$)/i);
}

export default function CardInsideComponent({
  card,
  index,
  mediaOverride,
}: {
  card: CardInsideComponentType;
  index?: number;
  mediaOverride?: string;
}) {
  const mediaUrl = mediaOverride || assetUrl(card.media);
  const resourceType =
    card.media && "resource_type" in card.media
      ? String((card.media as { resource_type?: string }).resource_type)
      : card.media?.metadata?.resource_type;
  const video = !mediaOverride && isVideo(resourceType, mediaUrl);

  return (
    <article className="group relative min-h-[22rem] w-full overflow-hidden rounded-[4px] bg-renaissance-ink text-white md:min-h-[24.2rem]">
      <div className="absolute inset-0 overflow-hidden">
        {mediaUrl && video ? (
          <video
            src={optimizedVideoUrl(mediaUrl, { maxWidth: 960 })}
            aria-label={card.altText || undefined}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={card.altText || ""}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full bg-[linear-gradient(145deg,#245e66_0%,#1c4c54_56%,#163f45_100%)]"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-renaissance-ink/65 via-transparent to-renaissance-ink/10 opacity-80" />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 text-white sm:p-8">
        <span className="text-sm font-semibold tabular-nums text-white/55">
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <div>
        <h3 className="renaissance-card-title text-[clamp(1.65rem,2.4vw,2.5rem)] font-semibold leading-[0.98] text-white">
          {card.headline}
        </h3>
        <p className="mt-5 max-w-[42ch] text-pretty text-base leading-[1.45] text-white/75">
          {card.text}
        </p>
        </div>
      </div>
    </article>
  );
}
