"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button2 from "@renaissance/components/ui/Button2";
import {
  getCarouselImageUrl,
  getCarouselLogoUrl,
  getCarouselPosterUrl,
  getCarouselVideoSources,
} from "@1sp/utils/carousel-media";
import type { CarouselItem as SanityCarouselItem, CTA } from "@1sp/sanity-types";
import { assetUrl, ctaToButtonProps } from "@1sp/utils/cloudinary";

interface UIItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  description?: string;
  category?: string;
  logosrc?: string;
  cta?: CTA;
  linkHref?: string;
}

function CarouselTextOverlay() {
  return (
    <svg
      width="875"
      height="845"
      viewBox="0 0 875 845"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-y-0 left-0 z-[1] h-full w-auto max-w-none"
      data-carousel-text-overlay
    >
      <path
        d="M638.8 910L874.3 287.5H240.3L357.3 -44.5L-62.7 -44.5V910H638.8Z"
        fill="#245E66"
        fillOpacity="0.9"
      />
    </svg>
  );
}

function InteractiveCarousel({ items }: { items?: SanityCarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [preloadedVideos, setPreloadedVideos] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "200px" });
  const reduceMotion = useReducedMotion();

  const carouselItems: UIItem[] = useMemo(() => {
    const list = (items ?? []).map((item, index) => ({
      id: String((item as any)?.id ?? index),
      title: item.title || "",
      subtitle: item.subtitle || (item as any)?.category || "",
      image: getCarouselImageUrl(assetUrl((item as any)?.image)) || "",
      video: assetUrl((item as any)?.video) || undefined,
      description: (item as any)?.description || "",
      category: (item as any)?.category || undefined,
      logosrc: getCarouselLogoUrl(
        assetUrl((item as any)?.logoSrc || (item as any)?.logo),
      ),
      cta: (item as any)?.cta,
      linkHref: (item as any)?.linkHref || undefined,
    }));

    return list.filter((item) => Boolean(item.image || item.video));
  }, [items]);

  useEffect(() => {
    if (!isInView || !carouselItems.length) return;
    const nextIndex = (currentIndex + 1) % carouselItems.length;
    setPreloadedVideos((previous) => {
      const next = new Set(previous);
      next.add(currentIndex);
      next.add(nextIndex);
      return next;
    });
  }, [isInView, currentIndex, carouselItems.length]);

  const shouldLoadVideo = useCallback(
    (index: number) => isInView && preloadedVideos.has(index),
    [isInView, preloadedVideos],
  );

  useEffect(() => {
    if (!isAutoPlaying || carouselItems.length < 2 || reduceMotion) return;
    const interval = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((previous) => (previous + 1) % carouselItems.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [isAutoPlaying, carouselItems.length, reduceMotion]);

  if (!carouselItems.length) return null;

  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((previous) =>
      newDirection === 1
        ? (previous + 1) % carouselItems.length
        : previous === 0
          ? carouselItems.length - 1
          : previous - 1,
    );
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -10000) paginate(1);
    else if (swipe > 10000) paginate(-1);
  };

  const active = carouselItems[currentIndex];
  const activeButton = ctaToButtonProps(active.cta);
  const activeVideoSources = getCarouselVideoSources(active.video);
  const activePosterUrl = getCarouselPosterUrl(active.video);
  const duration = reduceMotion ? 0.01 : 0.72;
  const slideVariants = {
    enter: (slideDirection: number) => ({
      clipPath:
        slideDirection > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      opacity: reduceMotion ? 1 : 0.75,
    }),
    center: { clipPath: "inset(0 0 0 0)", opacity: 1 },
    exit: (slideDirection: number) => ({
      clipPath:
        slideDirection < 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      opacity: reduceMotion ? 1 : 0.75,
    }),
  };

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Renaissance stories"
      className="relative bg-renaissance-ink py-3 text-white sm:py-5"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onFocusCapture={() => setIsAutoPlaying(false)}
      onBlurCapture={() => setIsAutoPlaying(true)}
    >
      <div className="container relative mx-auto">
        <div className="relative min-h-[34rem] overflow-hidden rounded-media sm:min-h-[42rem] lg:min-h-[48rem]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.article
              key={active.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              drag={carouselItems.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab bg-renaissance-mist active:cursor-grabbing"
            >
              {active.video && shouldLoadVideo(currentIndex) ? (
                <motion.video
                  poster={activePosterUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ scale: reduceMotion ? 1 : 1.045 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: reduceMotion ? 0.01 : 7.5, ease: "linear" }}
                  loop
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                >
                  {activeVideoSources.map((source) => (
                    <source
                      key={`${source.media ?? "all"}-${source.src}`}
                      src={source.src}
                      media={source.media}
                    />
                  ))}
                </motion.video>
              ) : (
                <motion.img
                  src={active.video ? activePosterUrl || "" : active.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ scale: reduceMotion ? 1 : 1.045 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: reduceMotion ? 0.01 : 7.5, ease: "linear" }}
                  loading="lazy"
                />
              )}

              <CarouselTextOverlay />


              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-9 lg:p-12">
                <div className="max-w-[42rem]">
                  <motion.div
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.24, duration: 0.5 }}
                  >
                    <p className="eyebrow-mono mb-3 tracking-[0.04em] text-white">
                      Story {String(currentIndex + 1).padStart(2, "0")} ·{" "}
                      {active.subtitle || "Campaign"}
                    </p>
                    <h3 className="max-w-5xl text-[clamp(2.75rem,8vw,7.5rem)] font-semibold leading-[0.84] tracking-[-0.055em] text-white">
                      {active.title}
                    </h3>
                  </motion.div>

                  <motion.div
                    className="mt-5 max-w-lg border-t border-white/35 pt-5"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.38, duration: 0.45 }}
                  >
                    {active.description ? (
                      <p className="max-w-xl text-sm leading-relaxed text-white/84 sm:text-base">
                        {active.description}
                      </p>
                    ) : null}
                    {activeButton ? (
                      <div className="mt-5">
                        <Button2 {...activeButton} />
                      </div>
                    ) : active.linkHref ? (
                      <div className="mt-5">
                        <Button2
                          variant="violetsmall"
                          href={active.linkHref}
                          text="View case study"
                        />
                      </div>
                    ) : null}
                  </motion.div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          {carouselItems.map((item, index) =>
            item.video && preloadedVideos.has(index) && index !== currentIndex ? (
              <video
                key={`preload-${index}`}
                preload="metadata"
                muted
                playsInline
                className="hidden"
                aria-hidden="true"
              >
                {getCarouselVideoSources(item.video).map((source) => (
                  <source
                    key={`${index}-${source.media ?? "all"}-${source.src}`}
                    src={source.src}
                    media={source.media}
                  />
                ))}
              </video>
            ) : null,
          )}

          <div className="absolute left-5 top-5 z-20 flex items-center gap-2 sm:left-8 sm:top-8">
            <span className="mr-2 font-mono text-xs font-semibold tracking-[0.14em] text-white">
              {String(currentIndex + 1).padStart(2, "0")} / {String(carouselItems.length).padStart(2, "0")}
            </span>
            {carouselItems.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous story"
                  className="grid h-11 w-11 place-items-center rounded-control border border-white/55 bg-renaissance-ink/40 text-white transition-colors hover:bg-white hover:text-renaissance-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={() => paginate(-1)}
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  aria-label="Next story"
                  className="grid h-11 w-11 place-items-center rounded-control border border-white/55 bg-renaissance-ink/40 text-white transition-colors hover:bg-white hover:text-renaissance-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={() => paginate(1)}
                >
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveCarousel;
