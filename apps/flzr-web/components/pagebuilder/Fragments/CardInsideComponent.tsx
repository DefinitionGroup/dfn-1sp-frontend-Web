import { assetUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import type { CardInsideComponent as CardInsideComponentType } from "@1sp/sanity-types";

function isVideo(resourceType?: string, url?: string) {
  return resourceType === "video" || !!url?.match(/\/video\/|\.(mp4|webm|ogg)(\?|$)/i);
}

export default function CardInsideComponent({
  card,
}: {
  card: CardInsideComponentType;
}) {
  const mediaUrl = assetUrl(card.media);
  const resourceType =
    card.media && "resource_type" in card.media
      ? String((card.media as { resource_type?: string }).resource_type)
      : card.media?.metadata?.resource_type;
  const video = isVideo(resourceType, mediaUrl);

  return (
    <article className="group relative aspect-[6/7] min-h-[150px] w-full overflow-hidden rounded-[2rem] bg-neutral-900 text-white">
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
            className="h-full w-full bg-[radial-gradient(circle_at_80%_10%,rgba(124,92,255,0.65),transparent_38%),linear-gradient(145deg,#2b2335,#131019_65%)]"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131019]/65 via-transparent to-[#131019]/10 opacity-80 transition-opacity duration-500 group-hover:opacity-55" />
      </div>

      <div className="absolute bottom-3 left-3 z-10 w-fit max-w-[calc(100%-1.5rem)] rounded-[1.5rem] border border-white/10 bg-[rgba(111,111,111,0.4)] px-4 py-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:px-5 sm:py-4">
        <h3 className="text-lg font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-xl">
          {card.headline}
        </h3>
        <p className="mt-1.5 line-clamp-4 max-w-[42ch] text-balance text-sm leading-snug tracking-normal text-white/70 sm:text-base">
          {card.text}
        </p>
      </div>
    </article>
  );
}
