import Image from "next/image";
import type { RenaissanceXPost } from "@1sp/sanity-types";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});

/** Shows links the way x.com does: no scheme, long paths shortened. */
function displayText(text: string) {
  return text.replace(/https?:\/\/(?:www\.)?([^\s]+)/g, (_, rest: string) =>
    rest.length > 30 ? `${rest.slice(0, 29)}…` : rest,
  );
}

/** First paragraph (or sentence, when long) becomes the tile headline. */
function splitPost(text: string): [string, string] {
  const clean = displayText(text).trim();
  const [first, ...rest] = clean.split(/\n\s*\n/);
  if (first.length <= 140) return [first.trim(), rest.join("\n\n").trim()];
  const sentence = first.match(/^[\s\S]{20,140}?[.!?](?=\s)/)?.[0];
  return sentence
    ? [sentence.trim(), clean.slice(sentence.length).trim()]
    : [first.trim(), rest.join("\n\n").trim()];
}

function Arrow() {
  return (
    <svg
      width="30"
      height="20"
      viewBox="0 0 30 20"
      fill="none"
      aria-hidden="true"
      className="mb-1 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
    >
      <path d="M0 19H11L28.5 1.5" stroke="currentColor" />
      <path d="M15 1H29V15" stroke="currentColor" />
    </svg>
  );
}

function XMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

type Props = { post: RenaissanceXPost; featured?: boolean; className?: string };

/**
 * One archive tile, linking to the post on x.com. Posts with an image (their
 * own or the quoted post's) use the register-card image treatment; posts
 * without one become a petrol typographic plane with the signature streak.
 */
export default function RenaissanceXPostCard({ post, featured = false, className = "" }: Props) {
  const image = post.imageUrl || post.quotedPost?.imageUrl;
  const quotedHandle = post.quotedPost?.authorHandle;
  const [headline, body] = splitPost(post.text);
  const date = DATE.format(new Date(post.publishedAt));

  const meta = (
    <span className="flex items-start justify-between gap-4 font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em]">
      <span className="grid gap-1.5">
        <time dateTime={post.publishedAt}>{date}</time>
        {quotedHandle && <span className="normal-case tracking-[0.04em] opacity-80">Quoting @{quotedHandle}</span>}
      </span>
      <XMark className="size-4 shrink-0" />
    </span>
  );

  const link =
    `group relative flex overflow-hidden rounded-card focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-renaissance-ink ${className}`;
  const srLabel = <span className="sr-only"> (opens the post on x.com)</span>;

  if (image) {
    return (
      <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className={`${link} bg-renaissance-ink text-white`}>
        <Image
          src={image}
          alt=""
          fill
          sizes={featured ? "(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 100vw, 66vw" : "(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 50vw, 33vw"}
          className="object-cover brightness-[.8] transition-[filter,scale] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-100 group-focus-visible:brightness-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-renaissance-ink/95 via-renaissance-ink/60 to-renaissance-ink/50" />
        <span className="relative z-10 flex w-full flex-col justify-between gap-6 p-5 sm:p-6 lg:p-7">
          <span className="text-white/80">{meta}</span>
          <span className="flex items-end justify-between gap-6">
            <span className="grid gap-3">
              <span
                className={`renaissance-display font-bold leading-[0.98] tracking-[-0.02em] text-balance ${
                  featured
                    ? "line-clamp-4 text-[clamp(1.75rem,3.2vw,3.25rem)]"
                    : "line-clamp-4 text-[clamp(1.35rem,1.75vw,1.75rem)]"
                }`}
              >
                {headline}
              </span>
              {body && (
                <span
                  className={`whitespace-pre-line text-white/80 text-pretty ${
                    featured ? "line-clamp-3 max-w-[46ch] text-[1.0625rem] leading-[1.45]" : "line-clamp-2 text-[0.9375rem] leading-[1.45]"
                  }`}
                >
                  {body}
                </span>
              )}
              {srLabel}
            </span>
            <Arrow />
          </span>
        </span>
      </a>
    );
  }

  const quoted = post.quotedPost;
  return (
    <a
      href={post.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${link} bg-renaissance-accent text-white transition-colors duration-300 hover:bg-renaissance-ink focus-visible:bg-renaissance-ink motion-reduce:transition-none`}
    >
      <span
        aria-hidden="true"
        className="absolute -right-[18%] top-0 h-full w-[46%] -skew-x-[24deg] bg-renaissance-teal/20 transition-transform duration-500 ease-out group-hover:-translate-x-3 motion-reduce:transition-none"
      />
      <span className="relative z-10 flex w-full flex-col justify-between gap-6 p-5 sm:p-6 lg:p-7">
        <span className="text-white/80">{meta}</span>
        <span className="grid gap-4">
          <span
            className={`renaissance-display font-bold leading-[0.98] tracking-[-0.02em] text-balance ${
              featured ? "line-clamp-4 text-[clamp(1.75rem,3.2vw,3.25rem)]" : "line-clamp-4 text-[clamp(1.35rem,1.75vw,1.75rem)]"
            }`}
          >
            {headline}
          </span>
          {quoted?.text ? (
            <span className="grid gap-1.5 border-t border-white/25 pt-3">
              <span className="text-[0.8125rem] font-semibold">{quoted.authorName}</span>
              <span className="line-clamp-3 whitespace-pre-line text-[0.9375rem] leading-[1.45] text-white/80">
                {displayText(quoted.text)}
              </span>
            </span>
          ) : (
            body && (
              <span className="line-clamp-3 whitespace-pre-line text-[0.9375rem] leading-[1.45] text-white/80 text-pretty">
                {body}
              </span>
            )
          )}
          <span className="flex justify-end">
            <Arrow />
          </span>
          {srLabel}
        </span>
      </span>
    </a>
  );
}
