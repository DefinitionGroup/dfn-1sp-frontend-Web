"use client";

import { motion, AnimatePresence, PanInfo } from "motion/react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Button2 from "@/components/ui/Button2";
import type {
  CarouselItem as SanityCarouselItem,
  CTA,
} from "@/types/sanity.types";
import { assetUrl, ctaToButtonProps } from "@/utils/utils";

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

export default function InteractiveCarousel({
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
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
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
  };

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
    <section>
      <div ref={containerRef} className="container mx-auto w-full ">
        <div className="relative h-[800px] flex items-start">
          <div className="relative w-full rounded-sm overflow-hidden h-full perspective-1000">
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
                  {active.video ? (
                    <motion.video
                      src={active.video}
                      className="absolute inset-0 w-full h-full overflow-hidden object-cover"
                      initial={{ scale: 1.3, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.6 }}
                      loop
                      autoPlay
                      muted
                    />
                  ) : (
                    <motion.img
                      src={active.image}
                      alt={active.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ scale: 1.3, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.6 }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 flex left-0 right-0 p-8 text-white">
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
                          <motion.div className="w-fit px-3 text-black flex text-xs rounded-xs ">
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

                  <motion.div
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
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

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

        <div className="flex justify-center mt-8 mx-auto space-x-2 bg-gray-100 h-8 items-center px-4 rounded-full w-fit">
          {carouselItems.map((_, index) => (
            <motion.button
              key={index}
              className={`w-1 h-2 rounded-full transition-all hover:bg-black duration-300 cursor-pointer ${index === currentIndex ? "bg-lime-400 min-w-16" : "bg-gray-300 min-w-3"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>

        <div
          ref={stripRef}
          className={`flex justify-center mt-8 space-x-4 pt-4 pb-4 ${isScrollable ? "overflow-x-auto" : ""}`}
        >
          {carouselItems.map((item, index) => (
            <motion.button
              key={item.id}
              className={`flex-shrink-0 w-32 h-32 rounded-sm overflow-hidden outline-3 transition-colors ${index === currentIndex ? "outline-lime-500" : "outline-transparent"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
