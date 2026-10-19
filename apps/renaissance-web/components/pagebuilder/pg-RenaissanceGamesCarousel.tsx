"use client";

import {AnimatePresence, MotionConfigContext, motion, useInView, useReducedMotion, type PanInfo, type Variants} from 'motion/react';
import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {stegaClean} from '@sanity/client/stega';
import type {RenaissanceCarouselBackgroundTone, RenaissanceGame, RenaissanceGamesCarousel} from '@1sp/sanity-types';
import {assetUrl, optimizedImageUrl} from '@1sp/utils/cloudinary';
import {hasVisibleText} from '@1sp/utils/text-content';

const controlClass = 'grid h-11 min-w-11 place-items-center rounded-control border border-renaissance-ink px-3 text-renaissance-ink transition-colors hover:bg-renaissance-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-renaissance-ink';

// Pages fill whole rows: 4 × 3 on desktop, 3 × 3 on tablets, 2 × 4 on phones.
const PAGE_SIZES = [{query: '(min-width: 1024px)', size: 12}, {query: '(min-width: 640px)', size: 9}];
const PHONE_PAGE_SIZE = 8;
const TILE_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';
// A slow cover gets this long before its page is revealed without it.
const READY_TIMEOUT_MS = 1200;

// The old page fades out; the new one waits for its covers, then its tiles
// fade in one after another.
const PAGE_VARIANTS: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.045}},
  exit: {opacity: 0, transition: {duration: 0.2, ease: [0.4, 0, 1, 1]}},
};
const TILE_VARIANTS: Variants = {
  hidden: {opacity: 0, y: 12},
  visible: {opacity: 1, y: 0, transition: {duration: 0.5, ease: [0.22, 1, 0.36, 1]}},
};

type LinkedGame = Required<Pick<RenaissanceGame, 'title' | 'url'>> & RenaissanceGame;

function usePageSize() {
  const [size, setSize] = useState(PAGE_SIZES[0].size);
  useEffect(() => {
    const queries = PAGE_SIZES.map(({query, size}) => ({list: window.matchMedia(query), size}));
    const update = () => setSize(queries.find(({list}) => list.matches)?.size ?? PHONE_PAGE_SIZE);
    update();
    queries.forEach(({list}) => list.addEventListener('change', update));
    return () => queries.forEach(({list}) => list.removeEventListener('change', update));
  }, []);
  return size;
}

function storeLabel(url: string) {
  try {
    return new URL(url).hostname.endsWith('steampowered.com') ? 'Steam' : 'Website';
  } catch {
    return 'Website';
  }
}

function coverSources(game: LinkedGame) {
  const source = assetUrl(game.image);
  const small = optimizedImageUrl(source, {width: 480, crop: 'limit'}) ?? '';
  return {src: small, srcSet: `${small} 480w, ${optimizedImageUrl(source, {width: 960, crop: 'limit'})} 960w`};
}

/** Loads and decodes covers exactly as the tiles will request them. */
function preloadCovers(games: LinkedGame[]) {
  return Promise.all(games.map(game => {
    const {src, srcSet} = coverSources(game);
    const image = new Image();
    image.sizes = TILE_SIZES;
    image.srcset = srcSet;
    image.src = src;
    return image.decode().catch(() => undefined);
  }));
}

function GameTile({game}: {game: LinkedGame}) {
  const {src, srcSet} = coverSources(game);
  const label = storeLabel(game.url);
  return (
    <motion.li variants={TILE_VARIANTS}>
      <a href={game.url} target="_blank" rel="noopener noreferrer" aria-label={`${stegaClean(game.title)} on ${label} (opens in a new tab)`}
        className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-renaissance-signal">
        <span className="relative block aspect-[460/215] overflow-hidden rounded-card bg-white/5">
          {/* Cloudinary serves the sized variants directly, like the case carousel's stage. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} srcSet={srcSet} sizes={TILE_SIZES} alt="" loading="lazy" decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        </span>
        {/* Phones stack the store label above the title; wider tiles set them side by side. */}
        <span className="mt-2.5 flex flex-col-reverse gap-1 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <span className="line-clamp-2 min-h-[2.75em] font-semibold leading-snug text-white">{game.title}</span>
          <span aria-hidden="true" className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-renaissance-teal transition-colors group-hover:text-renaissance-signal sm:pt-0.5">
            {label} ↗
          </span>
        </span>
      </a>
    </motion.li>
  );
}

export default function RenaissanceGamesCarouselBlock({data, backgroundTone = 'darkGreen'}: {
  data: RenaissanceGamesCarousel;
  backgroundTone?: RenaissanceCarouselBackgroundTone;
}) {
  const games = useMemo(() => (data.games ?? []).filter((game): game is LinkedGame =>
    Boolean(game?.title && game.url && assetUrl(game.image))), [data.games]);
  const pageSize = usePageSize();
  const [requestedPage, setRequestedPage] = useState(0);
  // The first page is on screen from the start; later pages wait for their covers.
  const [readyPage, setReadyPage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const nearView = useInView(sectionRef, {once: true, margin: '200px'});
  const systemReducedMotion = useReducedMotion();
  const motionConfig = useContext(MotionConfigContext);
  // A containing preview/accessibility preference may reduce motion further,
  // but must never override the visitor's system preference to allow motion.
  const reducedMotion = systemReducedMotion || motionConfig.reducedMotion === 'always';

  const pageCount = Math.max(1, Math.ceil(games.length / pageSize));
  // A smaller viewport means more pages; keep the index valid when it changes.
  const page = Math.min(requestedPage, pageCount - 1);
  const ready = reducedMotion || readyPage === page;

  useEffect(() => {
    if (reducedMotion || !nearView) return;
    let cancelled = false;
    let timer = 0;
    const timeout = new Promise(resolve => {timer = window.setTimeout(resolve, READY_TIMEOUT_MS);});
    void Promise.race([preloadCovers(games.slice(page * pageSize, (page + 1) * pageSize)), timeout]).then(() => {
      if (cancelled) return;
      setReadyPage(page);
      // Warm the next page so the following change can reveal straight away.
      const next = (page + 1) % pageCount;
      void preloadCovers(games.slice(next * pageSize, (next + 1) * pageSize));
    });
    return () => {cancelled = true; window.clearTimeout(timer);};
  }, [games, nearView, page, pageCount, pageSize, reducedMotion]);

  if (games.length === 0) return null;

  const pageGames = games.slice(page * pageSize, (page + 1) * pageSize);
  const canMove = pageCount > 1;
  const light = backgroundTone === 'light';

  const paginate = (step: number) => {
    if (!canMove) return;
    setRequestedPage((page + step + pageCount) % pageCount);
  };
  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60 || info.offset.x * info.velocity.x > 10000 && info.offset.x < 0) paginate(1);
    else if (info.offset.x > 60 || info.offset.x * info.velocity.x > 10000 && info.offset.x > 0) paginate(-1);
  };
  const anchor = stegaClean(data.navPointName || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  return (
    <section ref={sectionRef} id={anchor || undefined} aria-roledescription="carousel" aria-label={stegaClean(data.headline || '') || 'Renaissance games'}
      data-navpoint-name={data.navPointName || undefined} data-nav-hidden={data.hideFromNav || undefined}
      data-renaissance-games-carousel data-carousel-background={backgroundTone}
      className={`relative scroll-mt-28 py-3 sm:py-5 ${light ? 'bg-renaissance-paper' : 'bg-renaissance-ink'}`}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); paginate(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
      <div className="mx-auto max-w-[1680px]">
        {hasVisibleText(data.headline) || hasVisibleText(data.subheadline) ? (
          <header className="px-5 pb-8 pt-10 sm:px-8 sm:pb-10 lg:px-12">
            {hasVisibleText(data.headline) ? (
              <h2 className={`renaissance-display text-[clamp(2.7rem,4.4vw,5.25rem)] font-bold leading-none ${light ? 'text-renaissance-ink' : 'text-white'}`}>
                {data.headline}
              </h2>
            ) : null}
            {hasVisibleText(data.subheadline) ? (
              <p className={`mt-4 text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] ${light ? 'text-renaissance-ink/75' : 'text-white/75'}`}>
                {data.subheadline}
              </p>
            ) : null}
          </header>
        ) : null}

        <div className="relative overflow-hidden rounded-media border-b-[3px] border-renaissance-signal bg-renaissance-ink px-6 pb-24 pt-8 sm:px-9 sm:pt-10 lg:px-12 lg:pt-12">
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              <motion.ul key={page} variants={PAGE_VARIANTS} initial={reducedMotion ? false : 'hidden'}
                animate={ready ? 'visible' : 'hidden'} exit={reducedMotion ? undefined : 'exit'}
                role="group" aria-roledescription="slide" aria-label={`Page ${page + 1} of ${pageCount}`}
                drag={canMove && !reducedMotion ? 'x' : false} dragConstraints={{left: 0, right: 0}} dragElastic={0.15} onDragEnd={onDragEnd}
                className="grid grid-cols-2 gap-x-3 gap-y-5 bg-renaissance-ink sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-7"
                style={{touchAction: 'pan-y'}}>
                {pageGames.map(game => <GameTile key={game._key ?? game.url} game={game} />)}
                {/* Invisible fillers keep the last page as tall as a full one. */}
                {Array.from({length: pageSize - pageGames.length}, (_, filler) => (
                  <li key={`filler-${filler}`} aria-hidden="true" className="invisible">
                    <span className="block aspect-[460/215]" />
                    <span className="mt-2.5 flex flex-col-reverse gap-1 text-sm sm:flex-row">
                      <span className="min-h-[2.75em] leading-snug" />
                      <span className="font-mono text-[0.65rem]">&nbsp;</span>
                    </span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-0 left-6 z-20 flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-2 rounded-t-control bg-renaissance-signal px-3 py-2 sm:left-9 lg:left-12">
            <span aria-hidden="true" className="mr-3 font-mono text-xs font-semibold text-renaissance-ink">{String(page + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}</span>
            {canMove ? <>
              <button type="button" aria-label="Previous games" className={controlClass} onClick={() => paginate(-1)}><span aria-hidden="true">←</span></button>
              <button type="button" aria-label="Next games" className={controlClass} onClick={() => paginate(1)}><span aria-hidden="true">→</span></button>
            </> : null}
            <span className="sr-only" aria-live="polite" aria-atomic="true">Page {page + 1} of {pageCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
