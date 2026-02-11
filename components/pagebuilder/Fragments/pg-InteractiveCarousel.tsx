"use client";

import { motion, AnimatePresence, PanInfo, useInView } from "motion/react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Button2 from "@/components/ui/Button2";
import type {
  CarouselItem as SanityCarouselItem,
  CTA,
} from "@/types/sanity.types";
import { assetUrl, ctaToButtonProps } from "@/utils/utils";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

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

function InteractiveCarousel({
  items,
}: {
  items?: SanityCarouselItem[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isScrollable, setIsScrollable] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "200px" });
  const [preloadedVideos, setPreloadedVideos] = useState<Set<number>>(new Set());

  const carouselItems: UIItem[] = useMemo(() => {
    const list = (items ?? []).map((it, i) => {
      const image = assetUrl((it as any)?.image) || "";
      const logosrc =
        assetUrl((it as any)?.logoSrc || (it as any)?.logo) || undefined;
      const video = assetUrl((it as any)?.video) || undefined;
      const linkHref = (it as any)?.linkHref || undefined;
      return {
        id: String((it as any)?.id ?? i),
        title: it.title || "",
        subtitle: it.subtitle || (it as any)?.category || "",
        image,
        video,
        description: (it as any)?.description || "",
        category: (it as any)?.category || undefined,
        logosrc,
        cta: (it as any)?.cta,
        linkHref,
      } as UIItem;
    });
    return list.filter((x) => !!x.image || !!x.video);
  }, [items]);

  // Preload active + next video when carousel is in view
  useEffect(() => {
    if (!isInView || !carouselItems.length) return;
    const nextIndex = (currentIndex + 1) % carouselItems.length;
    setPreloadedVideos((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      next.add(nextIndex);
      return next;
    });
  }, [isInView, currentIndex, carouselItems.length]);

  const shouldLoadVideo = useCallback(
    (index: number) => isInView && preloadedVideos.has(index),
    [isInView, preloadedVideos]
  );

  useEffect(() => {
    if (!isAutoPlaying || !carouselItems.length) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselItems.length]);

  useEffect(() => {
    const checkScrollable = () => {
      if (typeof window === "undefined") return;
      if (stripRef.current && containerRef.current) {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          const stripWidth = stripRef.current.scrollWidth;
          const containerWidth = containerRef.current.clientWidth;
          setIsScrollable(stripWidth > containerWidth);
        } else {
          setIsScrollable(false);
        }
      }
    };
    checkScrollable();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkScrollable);
      return () => window.removeEventListener("resize", checkScrollable);
    }
  }, []);

  if (!carouselItems.length) return null;

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1,
      rotateY: d > 0 ? 45 : -45,
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (d: number) => ({
      zIndex: 0,
      x: d < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.1,
      rotateY: d < 0 ? 45 : -45,
    }),
  } as const;

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) =>
    Math.abs(offset) * velocity;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) =>
      newDirection === 1
        ? (prev + 1) % carouselItems.length
        : prev === 0
          ? carouselItems.length - 1
          : prev - 1
    );
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) paginate(1);
    else if (swipe > swipeConfidenceThreshold) paginate(-1);
  };

  const active = carouselItems[currentIndex];

  return (
    <section ref={sectionRef}>
      <div
        ref={containerRef}
        className="container relative top-0 left-0 mx-auto w-full"
      >
        <div className="relative h-[800px] flex items-start">
          {/* Main Carousel */}
          <div className="relative w-full rounded-xl overflow-hidden h-full perspective-1000">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.1 },
                  scale: { duration: 1 },
                  rotateY: { duration: 1 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="relative w-full h-full overflow-hidden bg-gradient-to-brshadow-2xl">
                  {/* Background media */}
                  {active.video && shouldLoadVideo(currentIndex) ? (
                    <motion.video
                      src={active.video}
                      className="absolute inset-0 w-full h-full overflow-hidden object-cover"
                      initial={{ scale: 1.3, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.6 }}
                      loop
                      autoPlay
                      muted
                      preload="auto"
                    />
                  ) : active.video ? (
                    /* Poster fallback while video hasn't been preloaded yet */
                    <motion.div
                      className="absolute inset-0 w-full h-full bg-neutral-900"
                      initial={{ scale: 1.3, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.6 }}
                    />
                  ) : (
                    <motion.img
                      src={active.image}
                      alt={active.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ scale: 1.3, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.6 }}
                      loading="lazy"
                    />
                  )}

                  {/* Hidden preload for next video */}
                  {carouselItems.map((item, idx) =>
                    item.video && preloadedVideos.has(idx) && idx !== currentIndex ? (
                      <video
                        key={`preload-${idx}`}
                        src={item.video}
                        preload="auto"
                        muted
                        className="hidden"
                        aria-hidden="true"
                      />
                    ) : null
                  )}

                  {/* Overlay (match Plaintext: gradient from top) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 to-transparent" />

                  {/* Content (match Plaintext: top placement) */}
                  <div className="absolute top-0 flex left-0 right-0 p-8 text-white">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      className="flex-col items-start justify-start p-8 max-w-3xl space-y-2"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { delay: 0.6, staggerChildren: 0.4252 },
                        },
                      }}
                    >
                      <div>
                        {(active.logosrc || "/logos/Amazon_logo.svg") && (
                          <motion.div className="w-fit px-3 text-black flex text-xs rounded-xs">
                            <Image
                              className="mb-8 invert"
                              src={active.logosrc || "/logos/Amazon_logo.svg"}
                              alt="Logo"
                              width={96}
                              height={44}
                            />
                          </motion.div>
                        )}
                        {active.title && (
                          <motion.h3 className="text-3xl md:text-7xl font-semibold leading-compressed pb-0">
                            {active.title}
                          </motion.h3>
                        )}
                      </div>
                      {active.subtitle && (
                        <motion.p className="md:text-xl text-gray-100">
                          {active.subtitle}
                        </motion.p>
                      )}
                      {active.description && (
                        <motion.p className="text-gray-100 text-sm max-w-lg ">
                          {active.description}
                        </motion.p>
                      )}
                      <motion.div className="text-gray-100 text-sm max-w-2xl ">
                        {active.cta ? (
                          <Button2 {...ctaToButtonProps(active.cta)} />
                        ) : active.linkHref ? (
                          <Button2
                            variant="limesmall"
                            href={active.linkHref}
                            text="View Case Study"
                          />
                        ) : null}
                      </motion.div>
                    </motion.div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows (match Plaintext classes) */}
          <motion.button
            className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-300 backdrop-blur-sm rounded-xs items-center justify-center text-black hover:bg-white/20 transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-300 backdrop-blur-sm rounded-xs items-center justify-center text-black hover:bg-white/20 transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>

        {/* Dots Indicator (match Plaintext positioning & style) */}
        <div className="absolute w-full bottom-[16px] z-30">
          <div className="flex justify-center mt-8 mx-auto space-x-2 bg-gray-900/50 backdrop-blur-xl h-10 items-center px-8 rounded-full w-fit">
            {carouselItems.map((_, index) => (
              <motion.button
                key={index}
                className={`h-2 rounded-full transition-all hover:bg-lime-400 duration-300 cursor-pointer ${index === currentIndex ? "bg-lime-400 min-w-16" : "bg-gray-100 min-w-2"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Strip (match Plaintext absolute positioning) */}
        <div className="absolute flex justify-center w-full bottom-[200px] z-30">
          <div
            ref={stripRef}
            className={`flex absolute justify-center mt-8 space-x-4 pt-4 pb-4 ${isScrollable ? "overflow-x-auto" : ""}`}
          >
            {carouselItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`relative flex-shrink-0 w-22 h-18 rounded-xl overflow-hidden outline-3 transition-colors ${index === currentIndex ? "outline-lime-500" : "outline-transparent"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default withDebugBadge(InteractiveCarousel, "fragment-InteractiveCarousel", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
