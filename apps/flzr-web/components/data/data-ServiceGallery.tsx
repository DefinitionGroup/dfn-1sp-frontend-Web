"use client";

import {
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import Image from "next/image";
import DeferredVideo from "@flzr/components/ui/DeferredVideo";
import {
  cloudinaryPosterUrl,
  withCacheKey,
} from "@1sp/utils/cloudinary";
import { useOutsideClick } from "@1sp/utils/hooks/use-outside-click";
import type { CloudinaryImage, Service } from "@1sp/sanity-types";

const EASE_FLZR = [0.62, 0.05, 0.01, 0.99] as const;

function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes("/video/");
}

function clampFocus(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function getObjectPosition(image?: CloudinaryImage | null): string | undefined {
  if (image?.focusMode !== "manual") return undefined;
  return `${clampFocus(image.focusX)}% ${clampFocus(image.focusY)}%`;
}

function getServiceMedia(service: Service) {
  const cacheKey = service._updatedAt;
  const background = withCacheKey(
    service.serviceBackground?.asset?.secure_url ||
      service.serviceBackground?.asset?.url ||
      service.iconUrl,
    cacheKey,
  );
  const icon = withCacheKey(
    service.serviceicon?.asset?.secure_url ||
      service.serviceicon?.asset?.url ||
      service.iconUrl,
    cacheKey,
  );

  return {
    background,
    icon,
    objectPosition: getObjectPosition(service.serviceBackground),
  };
}

function getPageTargets(viewportWidth: number, limit: number): number[] {
  if (limit <= 0) return [0];

  const pageDistance = viewportWidth * 0.88;
  const targets = [0];

  for (let distance = pageDistance; distance < limit; distance += pageDistance) {
    targets.push(-distance);
  }
  targets.push(-limit);

  return targets;
}

interface ServiceGalleryProps {
  services: Service[];
  activeFilter?: string;
  locale?: string;
  filterAllText?: string;
}

export default function ServiceGalleryComponent({
  services = [],
  activeFilter = "All",
  filterAllText = "All",
}: ServiceGalleryProps) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const maxOffsetRef = useRef(0);
  const wheelEndTimerRef = useRef<number | null>(null);
  const titleId = useId();
  const dragControls = useDragControls();
  const trackX = useMotionValue(0);

  const [active, setActive] = useState<Service | null>(null);
  const [maxOffset, setMaxOffset] = useState(0);
  const [pageTargets, setPageTargets] = useState<number[]>([0]);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredItems =
    activeFilter === filterAllText
      ? services
      : services.filter((item) =>
          item.servicegrouprel?.some((group) => group.name === activeFilter),
        );

  const measureTrack = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const styles = window.getComputedStyle(viewport);
    const horizontalPadding =
      Number.parseFloat(styles.paddingLeft) +
      Number.parseFloat(styles.paddingRight);
    const visibleWidth = viewport.clientWidth - horizontalPadding;
    const nextMaxOffset = Math.max(0, track.scrollWidth - visibleWidth);

    maxOffsetRef.current = nextMaxOffset;
    setMaxOffset(nextMaxOffset);
    setPageTargets(getPageTargets(viewport.clientWidth, nextMaxOffset));

    const clampedX = Math.max(-nextMaxOffset, Math.min(0, trackX.get()));
    if (clampedX !== trackX.get()) trackX.set(clampedX);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    trackX.stop();
    trackX.set(0);
    setCurrentPage(0);
    measureTrack();

    const observer = new ResizeObserver(measureTrack);
    observer.observe(viewport);
    observer.observe(track);

    // Motion lays out the track after the first client commit. Measure again
    // once those card widths exist so the controls never start falsely disabled.
    let followupFrame = 0;
    const initialFrame = requestAnimationFrame(() => {
      followupFrame = requestAnimationFrame(measureTrack);
    });

    return () => {
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(followupFrame);
      if (wheelEndTimerRef.current !== null) {
        window.clearTimeout(wheelEndTimerRef.current);
      }
      observer.disconnect();
    };
  }, [activeFilter, filteredItems.length]);

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  useOutsideClick(modalRef, () => setActive(null));

  const animateTrackTo = (value: number) => {
    const clamped = Math.max(-maxOffsetRef.current, Math.min(0, value));
    const viewport = viewportRef.current;
    trackX.stop();

    if (viewport) {
      const targets = getPageTargets(
        viewport.clientWidth,
        maxOffsetRef.current,
      );
      const closestIndex = targets.reduce(
        (closest, target, index) =>
          Math.abs(target - clamped) < Math.abs(targets[closest] - clamped)
            ? index
            : closest,
        0,
      );
      setCurrentPage(closestIndex);
    }

    if (reducedMotion) {
      trackX.set(clamped);
      return;
    }

    animate(trackX, clamped, {
      type: "spring",
      stiffness: 250,
      damping: 32,
      mass: 0.9,
    });
  };

  const scrollPage = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const limit = maxOffsetRef.current;
    const currentX = trackX.get();
    const isAtStart = currentX >= -4;
    const isAtEnd = currentX <= -limit + 4;
    const pageDistance = viewport.clientWidth * 0.88;
    const nextX =
      direction === 1 && isAtEnd
        ? 0
        : direction === -1 && isAtStart
          ? -limit
          : currentX - direction * pageDistance;

    animateTrackTo(nextX);
  };

  const snapTrack = (velocity = 0) => {
    const viewport = viewportRef.current;
    if (!viewport || maxOffsetRef.current <= 0) return;

    const limit = maxOffsetRef.current;
    const projectedX = Math.max(
      -limit,
      Math.min(0, trackX.get() + velocity * 0.16),
    );
    const targets = getPageTargets(viewport.clientWidth, limit);

    const closestTarget = targets.reduce((closest, target) =>
      Math.abs(target - projectedX) < Math.abs(closest - projectedX)
        ? target
        : closest,
    );

    animateTrackTo(closestTarget);
  };

  const handleDragStart = () => {
    trackX.stop();
    didDragRef.current = true;
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    snapTrack(info.velocity.x);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const horizontalDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;

    if (horizontalDelta === 0 || maxOffsetRef.current <= 0) return;

    event.preventDefault();
    trackX.stop();
    trackX.set(
      Math.max(
        -maxOffsetRef.current,
        Math.min(0, trackX.get() - horizontalDelta),
      ),
    );

    if (wheelEndTimerRef.current !== null) {
      window.clearTimeout(wheelEndTimerRef.current);
    }
    wheelEndTimerRef.current = window.setTimeout(() => snapTrack(), 120);
  };

  const openService = (service: Service) => {
    if (didDragRef.current) return;
    startTransition(() => setActive(service));
  };

  if (filteredItems.length === 0) return null;

  const activeMedia = active ? getServiceMedia(active) : null;

  return (
    <>
      <div className="relative" data-component="flzr-services-carousel">
        <div className="mb-5 flex items-end justify-between gap-6 md:mb-7">
          <p className="text-xs uppercase text-neutral-500">
            {String(filteredItems.length).padStart(2, "0")} services
          </p>

          <div className="flex items-center gap-2" aria-label="Carousel controls">
            <button
              type="button"
              onClick={() => scrollPage(-1)}
              disabled={filteredItems.length <= 1}
              aria-label="Previous services"
              className="grid h-11 w-11 place-items-center rounded-full border border-neutral-900/15 text-neutral-900 transition-[background-color,color,opacity,transform] duration-300 hover:bg-neutral-900 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-25"
            >
              <ArrowIcon direction="back" />
            </button>
            <button
              type="button"
              onClick={() => scrollPage(1)}
              disabled={filteredItems.length <= 1}
              aria-label="Next services"
              className="grid h-11 w-11 place-items-center rounded-full bg-neutral-900 text-white transition-[background-color,color,opacity,transform] duration-300 hover:bg-violet-500 active:scale-95 disabled:pointer-events-none disabled:opacity-25"
            >
              <ArrowIcon direction="forward" />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          role="region"
          aria-label="Services carousel"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") scrollPage(-1);
            if (event.key === "ArrowRight") scrollPage(1);
          }}
          onPointerDown={(event) => {
            dragControls.start(event, { distanceThreshold: 6 });
          }}
          onWheel={handleWheel}
          className="-mx-4 touch-pan-y select-none overflow-hidden px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          <motion.ul
            ref={trackRef}
            key={activeFilter}
            drag="x"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ left: -maxOffset, right: 0 }}
            dragElastic={0.06}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x: trackX }}
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            whileDrag={{ cursor: "grabbing" }}
            viewport={{ once: true, amount: 0.08 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="flex w-max cursor-grab gap-3 will-change-transform md:gap-4"
          >
            {filteredItems.map((item, index) => {
              const { background, objectPosition } = getServiceMedia(item);
              const groups = item.servicegrouprel?.map((group) => group.name) ?? [];

              return (
                <motion.li
                  key={item._id || `${item.name}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 34 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.65, ease: EASE_FLZR },
                    },
                  }}
                  className="w-[78vw] max-w-[25rem] shrink-0 [scroll-snap-align:start] sm:w-[45vw] lg:w-[calc((100vw-8rem)/3.15)] lg:max-w-[26rem] 2xl:w-[calc((100vw-10rem)/4.15)] 2xl:max-w-[22rem]"
                >
                  <button
                    type="button"
                    onClick={() => openService(item)}
                    aria-label={`Open details for ${item.name}`}
                    className="group relative block aspect-[6/7] w-full overflow-hidden rounded-[2rem] bg-neutral-900 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      {background && isVideoUrl(background) ? (
                        <DeferredVideo
                          src={background}
                          maxWidth={640}
                          className="pointer-events-none h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          mediaStyle={objectPosition ? { objectPosition } : undefined}
                          style={{ pointerEvents: "none" }}
                          posterUrl={cloudinaryPosterUrl(background, {
                            maxWidth: 640,
                            frame: "0",
                          })}
                          mountDelay={index < 4 ? 80 : 240}
                        />
                      ) : background ? (
                        <Image
                          src={background}
                          alt={item.serviceBackground?.alt || item.name}
                          fill
                          priority={index < 4}
                          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw"
                          draggable={false}
                          className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          style={objectPosition ? { objectPosition } : undefined}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(124,92,255,0.65),transparent_38%),linear-gradient(145deg,#2b2335,#131019_65%)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131019]/65 via-transparent to-[#131019]/10 opacity-80" />
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
                    </div>

                    <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
                      <Image
                        src="/units/FLZR/flzr_logo.svg"
                        alt="FLZR"
                        width={84}
                        height={20}
                        draggable={false}
                        className="pointer-events-none h-auto w-[4.75rem] object-contain object-left"
                      />
                      <span className="text-xxs text-white/75">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: 0.18, ease: EASE_FLZR }}
                      className="absolute bottom-3 left-3 z-10 w-fit max-w-[calc(100%-1.5rem)] rounded-[1.5rem] bg-[rgba(111,111,111,0.4)] px-4 py-3 text-white backdrop-blur-md sm:px-5 sm:py-4"
                    >
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="flzr-card-title text-lg font-semibold leading-[1.05] text-white sm:text-xl">
                            {item.name}
                          </h3>
                          {item.taglabel ? (
                            <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-white/70">
                              {item.taglabel}
                            </p>
                          ) : groups.length > 0 ? (
                            <p className="mt-1.5 truncate text-xs text-white/65">
                              {groups.join(" · ")}
                            </p>
                          ) : null}
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-neutral-900 transition-[background-color,color,transform] duration-500 group-hover:rotate-[-35deg] group-hover:scale-105 group-hover:bg-flzr-violet group-hover:text-white">
                          <ArrowUpRightIcon />
                        </span>
                      </div>
                    </motion.div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <div className="mt-6 flex w-full justify-center">
          <div className="flex h-8 w-fit items-center justify-center space-x-1.5 rounded-4xl bg-gray-900/50 px-4 backdrop-blur-md sm:h-10 sm:space-x-2 sm:px-8">
            {pageTargets.map((target, index) => (
              <motion.button
                key={`${target}-${index}`}
                type="button"
                aria-label={`Go to services page ${index + 1}`}
                aria-current={index === currentPage ? "true" : undefined}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 hover:bg-violet-400 sm:h-2 ${
                  index === currentPage
                    ? "min-w-8 bg-violet-400 sm:min-w-16"
                    : "min-w-1.5 bg-gray-100 sm:min-w-2"
                }`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => animateTrackTo(target)}
              />
            ))}
          </div>
        </div>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {active && activeMedia ? (
                <motion.div
            className="fixed inset-0 z-[2147483647] isolate grid place-items-center bg-[#131019]/65 p-3 backdrop-blur-xl sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <motion.div
              ref={modalRef}
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.985 }}
              transition={{ duration: 0.55, ease: EASE_FLZR }}
              className="relative grid h-[min(90dvh,54rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-neutral-900 text-white md:grid-cols-[1.25fr_0.75fr]"
            >
              <div className="relative min-h-[42dvh] overflow-hidden md:min-h-0">
                {activeMedia.background && isVideoUrl(activeMedia.background) ? (
                  <DeferredVideo
                    src={activeMedia.background}
                    maxWidth={1200}
                    className="pointer-events-none h-full w-full object-cover"
                    mediaStyle={
                      activeMedia.objectPosition
                        ? { objectPosition: activeMedia.objectPosition }
                        : undefined
                    }
                    style={{ pointerEvents: "none" }}
                    posterUrl={cloudinaryPosterUrl(activeMedia.background, {
                      maxWidth: 1200,
                      frame: "0",
                    })}
                    mountDelay={0}
                  />
                ) : activeMedia.background ? (
                  <Image
                    src={activeMedia.background}
                    alt={active.serviceBackground?.alt || active.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 65vw"
                    draggable={false}
                    className="pointer-events-none object-cover"
                    style={
                      activeMedia.objectPosition
                        ? { objectPosition: activeMedia.objectPosition }
                        : undefined
                    }
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(124,92,255,0.7),transparent_35%),linear-gradient(145deg,#2b2335,#131019_65%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/55 via-transparent to-neutral-900/10 md:bg-gradient-to-r md:from-transparent md:to-neutral-900/30" />
              </div>

              <div className="relative flex min-h-0 flex-col justify-between overflow-y-auto p-7 sm:p-10 md:p-12">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-neutral-900"
                  aria-label="Close service details"
                >
                  <CloseIcon />
                </button>

                <div className="pt-12">
                  <Image
                    src="/units/FLZR/flzr_logo.svg"
                    alt="FLZR"
                    width={112}
                    height={28}
                    draggable={false}
                    className="pointer-events-none mb-8 h-auto w-28 object-contain object-left"
                  />
                  <p className="mb-4 text-xs uppercase text-violet-400">
                    Service
                  </p>
                  <h3
                    id={titleId}
                    className="text-4xl font-semibold leading-[0.95] sm:text-5xl"
                  >
                    {active.name}
                  </h3>
                  {active.taglabel ? (
                    <p className="mt-5 text-lg leading-snug text-white/72">
                      {active.taglabel}
                    </p>
                  ) : null}
                  {active.serviceDescription ? (
                    <p className="mt-7 text-sm leading-relaxed text-white/65 sm:text-base">
                      {active.serviceDescription}
                    </p>
                  ) : null}
                </div>

                {active.servicegrouprel?.length ? (
                  <div className="mt-10 border-t border-white/15 pt-5">
                    <p className="text-xxs uppercase text-white/45">
                      {active.servicegrouprel.map((group) => group.name).join(" / ")}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function ArrowIcon({ direction }: { direction: "back" | "forward" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={direction === "back" ? "rotate-180" : undefined}
    >
      <path d="M3.75 9h10.5M10.25 5l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M3.25 11.75 11.75 3.25M5 3.25h6.75V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path d="m4 4 9 9M13 4l-9 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
