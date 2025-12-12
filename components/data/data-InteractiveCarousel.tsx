"use client";

import { motion, AnimatePresence, PanInfo } from "motion/react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Button2 from "@/components/ui/Button2";
import type { CTA, CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";
import { client } from "@/sanity/lib/client";
import { getInteractiveCarouselQuery } from "@/sanity/lib/queries";

// Channel to carousel field mapping
const CHANNEL_FIELD_MAP = {
  "1spWeb": "connectedDataCarouselPromo1SP",
  msmWeb: "connectedDataCarouselPromoMSM",
  studioco2Web: "connectedDataCarouselPromoStudioCO2",
} as const;

// Channel display names
const CHANNEL_NAMES = {
  "1spWeb": "1SP",
  msmWeb: "MSM",
  studioco2Web: "Studio CO2",
} as const;

// Helper to get channel from cookies on client side
function getChannelFromCookie(): "1spWeb" | "msmWeb" | "studioco2Web" | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  const channelCookie = cookies.find((c) => c.trim().startsWith("channel="));
  const channel = channelCookie?.split("=")[1]?.trim() as
    | "1spWeb"
    | "msmWeb"
    | "studioco2Web"
    | undefined;
  return channel || null;
}

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  services?: { _id: string; name: string }[];
  mainImage?: CloudinaryAsset;
  mainVideo?: CloudinaryAsset;
  client?: {
    _id: string;
    name: string;
    logo?: CloudinaryAsset;
  };
  slug?: { current: string };
}

interface UIItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  description?: string;
  category?: string;
  logosrc?: string;
  linkHref?: string;
}

interface SmartCarouselProps {
  maxItems?: number;
  language?: string;
  channel?: "1spWeb" | "msmWeb" | "studioco2Web";
}

export default function SmartCarousel({
  maxItems = 6,
  language = "en",
  channel,
}: SmartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isScrollable, setIsScrollable] = useState(false);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get channel from prop or cookie (only on client)
  const activeChannel = channel || "1spWeb";

  // Handle client-side channel detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch case studies on mount
  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        // Use channel from cookie if not provided as prop (client-side only)
        const effectiveChannel =
          channel || (mounted ? getChannelFromCookie() : null) || "1spWeb";
        const carouselField = CHANNEL_FIELD_MAP[effectiveChannel];

        const query = getInteractiveCarouselQuery(carouselField);
        const results = await client.fetch(query, {
          language,
          maxItems,
        });
        setCaseStudies(results);
      } catch (error) {
        console.error("Error fetching case studies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseStudies();
  }, [maxItems, language, channel, mounted]);

  const carouselItems: UIItem[] = useMemo(() => {
    const list = caseStudies
      .map((cs) => {
        const image = assetUrl(cs.mainImage);
        const logosrc = assetUrl(cs.client?.logo);
        const video = assetUrl(cs.mainVideo);
        const linkHref = cs.slug?.current
          ? `/${language}/cases/${cs.slug.current}`
          : undefined;

        // Skip items without valid image or video
        if (!image && !video) return null;

        return {
          id: cs._id,
          title: cs.title || "",
          subtitle:
            cs.subtitle ||
            (cs.services ? cs.services.map((s) => s.name).join(", ") : ""),
          image: image || "",
          video: video || undefined,
          description: cs.description || "",
          category: cs.services
            ? cs.services.map((s) => s.name).join(", ")
            : undefined,
          logosrc: logosrc || undefined,
          linkHref,
        } as UIItem;
      })
      .filter((x): x is UIItem => x !== null);
    return list;
  }, [caseStudies, language]);

  const clearAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const startAutoPlay = () => {
    clearAutoPlay();
    if (!isAutoPlaying || !carouselItems.length) return;
    autoPlayRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
  };

  const resetAutoPlayTimer = () => {
    if (!isAutoPlaying) return;
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return clearAutoPlay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return (
      <section className="px-2 sm:px-4 md:px-0">
        <div className="container mx-auto w-full">
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[800px] flex items-center justify-center">
            <div className="text-gray-400 text-sm sm:text-base">Loading case studies...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!carouselItems.length) {
    return (
      <section className="px-2 sm:px-4 md:px-0">
        <div className="container mx-auto w-full">
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[800px] flex items-center justify-center">
            <div className="text-gray-400 text-sm sm:text-base text-center px-4">
              No case studies found for Smart Carousel
            </div>
          </div>
        </div>
      </section>
    );
  }

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
    resetAutoPlayTimer();
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) paginate(1);
    else if (swipe > swipeConfidenceThreshold) paginate(-1);
  };

  const active = carouselItems[currentIndex];

  return (
    <section className="px-2 sm:px-4 md:px-0">
      <div
        ref={containerRef}
        className="container relative top-0 mx-auto w-full"
      >
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[800px] flex items-start">
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
                style={{ willChange: "transform, opacity" }}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="relative w-full h-full overflow-hidden bg-black">
                  {/* Background media */}
                  {active.video ? (
                    <motion.video
                      src={active.video}
                      className="absolute inset-0 w-full h-full overflow-hidden object-cover"
                      initial={{ scale: 1.3, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 0.7 }}
                      transition={{ duration: 1.6 }}
                      loop
                      autoPlay playsInline
                      muted
                    />
                  ) : active.image ? (
                    <motion.img
                      src={active.image}
                      alt={active.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ scale: 1.3, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 0.7 }}
                      transition={{ duration: 1.6 }}
                    />
                  ) : null}

                  {/* Overlay (match Plaintext: gradient from top) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 to-transparent" />

                  {/* Content (match Plaintext: top placement) */}
                  <div className="absolute top-0 flex left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      className="flex-col items-start justify-start p-2 sm:p-4 md:p-8 max-w-full sm:max-w-2xl md:max-w-3xl space-y-2"
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
                          <motion.div className="mb-2 sm:mb-4 max-h-6 sm:max-h-8 w-auto text-black flex items-start text-xs rounded-xs">
                            <Image
                              className="invert h-5 sm:h-6 md:h-8 w-auto"
                              src={active.logosrc || "/logos/Amazon_logo.svg"}
                              alt="Logo"
                              width={120}
                              height={32}
                            />
                          </motion.div>
                        )}
                        {active.title && (
                          <motion.h3 className="text-xl sm:text-2xl md:text-5xl tracking-tighter leading-tight md:leading-none   pb-0 md:pb-4 md:pt-4 ">
                            {active.title}
                          </motion.h3>
                        )}
                      </div>
                      {/* {active.subtitle && (
                        <motion.p className="md:text-xl text-gray-100">
                          {active.subtitle}
                        </motion.p>
                      )} */}
                      {active.description && (
                        <motion.p className="text-gray-100 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mb-2 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                          {active.description}
                        </motion.p>
                      )}
                      <motion.div className="text-gray-100 text-sm max-w-2xl">
                        {active.linkHref && (
                          <Button2
                            variant="limesmall"
                            href={active.linkHref}
                            text="View Case Study"
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Top-right icon */}
                  {/* <motion.div
                    className="absolute top-4 right-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <button className="w-6 h-6 cursor-pointer bg-black/50 backdrop-blur-sm rounded-xs flex items-center justify-center text-lime-400 hover:bg-white/100 hover:text-black transition-colors">
                      <svg
                        width="11"
                        height="113"
                        viewBox="0 0 14 14"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M14 1.00696V10.757C14 10.9061 13.9407 11.0492 13.8353 11.1547C13.7298 11.2602 13.5867 11.3195 13.4375 11.3195C13.2883 11.3195 13.1452 11.2602 13.0398 11.1547C12.9343 11.0492 12.875 10.9061 12.875 10.757V2.36446L1.83501 13.4045C1.72838 13.5038 1.58734 13.5579 1.44162 13.5553C1.29589 13.5528 1.15685 13.4937 1.05379 13.3907C0.950731 13.2876 0.891697 13.1486 0.889126 13.0028C0.886555 12.8571 0.940647 12.7161 1.04001 12.6095L12.08 1.56946H3.68751C3.53832 1.56946 3.39525 1.51019 3.28976 1.40471C3.18427 1.29922 3.12501 1.15614 3.12501 1.00696C3.12501 0.857774 3.18427 0.7147 3.28976 0.60921C3.39525 0.503721 3.53832 0.444458 3.68751 0.444458H13.4375C13.5867 0.444458 13.7298 0.503721 13.8353 0.60921C13.9407 0.7147 14 0.857774 14 1.00696Z" />
                      </svg>
                    </button>
                  </motion.div> */}
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
        <div className="absolute w-full bottom-2 sm:bottom-4 z-30">
          <div className="flex justify-center mt-4 sm:mt-8 mx-auto space-x-1.5 sm:space-x-2 bg-gray-900/50 backdrop-blur-xl h-8 sm:h-10 items-center px-4 sm:px-8 rounded-full w-fit">
            {carouselItems.map((_, index) => (
              <motion.button
                key={index}
                className={`h-1.5 sm:h-2 rounded-full transition-all hover:bg-lime-400 duration-300 cursor-pointer ${index === currentIndex ? "bg-lime-400 min-w-8 sm:min-w-16" : "bg-gray-100 min-w-1.5 sm:min-w-2"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                  resetAutoPlayTimer();
                }}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Strip (match Plaintext absolute positioning) */}
        <div className="absolute flex justify-center w-full  bottom-16 md:bottom-[64px] z-30 px-2">
          <div
            ref={stripRef}
            className={`flex justify-center mt-4 sm:mt-8 space-x-1.5 sm:space-x-2 md:space-x-4 pt-2 sm:pt-4 md:pb-4 ${isScrollable ? "overflow-x-auto scrollbar-hide" : ""}`}
          >
            {carouselItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`relative flex-shrink-0 w-10 sm:w-12 md:w-22 h-8 sm:h-12 md:h-18 rounded-xl overflow-hidden outline-1 sm:outline-2 md:outline-3 transition-colors ${index === currentIndex ? "outline-lime-500" : "outline-transparent"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                  resetAutoPlayTimer();
                }}
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
