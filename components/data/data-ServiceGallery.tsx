"use client";

import React, { startTransition, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { useOptimizedTransitionRouter } from "@/hooks/use-optimized-transition-router";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
import DeferredVideo from "@/components/ui/DeferredVideo";
import { cloudinaryPosterUrl, withCacheKey } from "@/utils/utils";
import { useRobustInView } from "@/hooks/use-robust-in-view";
import type { CloudinaryImage, Service } from "@1sp/sanity-types";

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

interface ServiceGalleryProps {
  services: Service[];
  activeFilter?: string;
  locale?: string;
  filterAllText?: string;
  initialVisibleCount?: number;
}

export default function ServiceGalleryComponent({
  services = [],
  activeFilter = "All",
  locale = "en",
  filterAllText = "All",
  initialVisibleCount = Number.POSITIVE_INFINITY,
}: ServiceGalleryProps) {
  const router = useOptimizedTransitionRouter();
  const [active, setActive] = useState<Service | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const { isInView } = useRobustInView(gridRef, {
    amount: 0.01,
    margin: "0px 0px 120px 0px",
    mobileAmount: 0.01,
    mobileMargin: "0px 0px 180px 0px",
    fallbackVisibleAfterMs: 2500,
  });
  const [shouldRenderAll, setShouldRenderAll] = useState(
    !Number.isFinite(initialVisibleCount)
  );
  const openService = (service: Service) => {
    startTransition(() => {
      setActive(service);
    });
  };
  const closeService = () => {
    startTransition(() => {
      setActive(null);
    });
  };

  // Filter items based on active filter - using service groups
  const filteredItems =
    activeFilter === filterAllText
      ? services
      : services.filter((item) =>
        item.servicegrouprel?.some((group) => group.name === activeFilter)
      );

  useEffect(() => {
    if (shouldRenderAll || !isInView) return;

    const win = window as Window & typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const run = () => setShouldRenderAll(true);
    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(run, { timeout: 800 });
      return () => {
        if (win.cancelIdleCallback) {
          win.cancelIdleCallback(idleId);
        }
      };
    }

    const timer = win.setTimeout(run, 180);
    return () => win.clearTimeout(timer);
  }, [isInView, shouldRenderAll]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeService();
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, closeService);

  const activeCacheKey = active?._updatedAt;
  const activeBg =
    withCacheKey(
      active?.serviceBackground?.asset?.secure_url ||
        active?.serviceBackground?.asset?.url ||
        active?.iconUrl,
      activeCacheKey
    );
  const activeIcon =
    withCacheKey(
      active?.serviceicon?.asset?.secure_url ||
        active?.serviceicon?.asset?.url ||
        active?.iconUrl,
      activeCacheKey
    );
  const activeObjectPosition = getObjectPosition(active?.serviceBackground);
  const visibleItems =
    shouldRenderAll || !Number.isFinite(initialVisibleCount)
      ? filteredItems
      : filteredItems.slice(0, initialVisibleCount);

  return (
    <>
      <AnimatePresence>
        {active ? (
          <div className=" grid place-items-center fixed inset-0 bg-black/50 h-full backdrop-blur-lg w-full z-50">
            <motion.button
              key={`button-${active.name}-${id}`}
              layout
              initial={{
                opacity: 1,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 1,
                transition: {
                  duration: 0.025,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden justify-around rounded-full h-6 w-6 z-50"
              onClick={closeService}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.name}-${id}`}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0.2 }}
              ref={ref}
              className="w-full z-50 max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >      <motion.button
              key={`button-${active.name}-${id}`}
              layout
              initial={{
                opacity: 1,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 1,
                transition: {
                  duration: 0.025,
                },
              }}
              className="flex absolute top-4 right-4 items-center overflow-hidden justify-around rounded-full h-6 w-6 z-50"
              onClick={closeService}
            >
                <CloseIcon />
              </motion.button>
              <motion.div
                className="w-full sm:rounded-t-xl relative overflow-hidden h-full"
                layoutId={`image-${active.name}-${id}`}
              >
                {activeBg && isVideoUrl(activeBg) ? (
                  <DeferredVideo
                    src={activeBg}
                    maxWidth={1000}
                    className="w-full min-h-[1000px] sm:rounded-t-xl object-cover"
                    mediaStyle={
                      activeObjectPosition
                        ? { objectPosition: activeObjectPosition }
                        : undefined
                    }
                    mountDelay={100}
                    style={{ opacity: 0.5 }}
                  />
                ) : activeBg ? (
                  <Image
                    width={1000}
                    height={400}
                    src={activeBg}
                    alt={active.serviceBackground?.alt || active.name}
                    className="w-full min-h-[1000px]  sm:rounded-t-xl  opacity-50 object-cover"
                    style={
                      activeObjectPosition
                        ? { objectPosition: activeObjectPosition }
                        : undefined
                    }
                  />
                ) : (
                  <div className="w-full h-full sm:rounded-t-xl bg-neutral-800 opacity-50" />
                )}
              </motion.div>
              <div className="flex justify-between absolute items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  {activeIcon && (
                    <motion.img
                      layoutId={`logo-${active.name}-${id}`}
                      src={activeIcon}
                      alt={active.name}
                      className="w-5 h-5 mb-12  object-contain "
                    />
                  )}
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.name}-${id}`}
                      className="text-white text-5xl max-w-2/3 dark:text-neutral-200 mb-4"
                    >
                      {active.name}
                    </motion.h3>
                    {active.taglabel && (
                      <motion.p
                        layoutId={`description-${active.taglabel}-${id}`}
                        className="text-neutral-100 text-xl dark:text-neutral-400 mb-4"
                      >
                        {active.taglabel}
                      </motion.p>
                    )}
                    {active.serviceDescription && (
                      <motion.p
                        layoutId={`Servicedescription-${active.serviceDescription}-${id}`}
                        className="text-neutral-100 text-xl md:max-w-1/2 dark:text-neutral-400 "
                      >
                        {active.serviceDescription}
                      </motion.p>
                    )}
                  </div>
                  {active.servicegrouprel &&
                    active.servicegrouprel.length > 0 && (
                      <motion.div
                        transition={{ duration: 0.3, delay: 0.5 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-white text-sm md:text-sm lg:text-base mt-8 max-w-1/2 mb-2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                      >
                        <div className="text-sm text-neutral-300 mb-2">
                          Service Groups:
                        </div>
                        {active.servicegrouprel.map((group) => (
                          <span
                            key={group._id}
                            className="px-3 py-1 bg-neutral-700 rounded-full text-xs"
                          >
                            {group.name}
                          </span>
                        ))}
                      </motion.div>
                    )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul ref={gridRef} className="w-full">
        <StaggeredSlideUp
          key={activeFilter}
          staggerDelay={0.0225}
          distance={30}
          duration={1}
          threshold={0.2}
          rootMargin="0px 0px -100px 0px"
          once={true}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full min-h-full"
        >
          {visibleItems.map((item) => {
            const cacheKey = item._updatedAt;
            const bg = withCacheKey(
              item.serviceBackground?.asset?.secure_url ||
                item.serviceBackground?.asset?.url ||
                item.iconUrl,
              cacheKey
            );
            const icon = withCacheKey(
              item.serviceicon?.asset?.secure_url ||
                item.serviceicon?.asset?.url ||
                item.iconUrl,
              cacheKey
            );
            const objectPosition = getObjectPosition(item.serviceBackground);

            return (
              <motion.div
                layoutId={`card-${item.name}-${id}`}
                key={`card-${item.name}-${id}`}
                onClick={() => openService(item)}
                className="col-span-1 grid grid-cols-1 grid-rows-4 row-span-1  h-[350px] group/card overflow-hidden cursor-pointer"
              >
                <motion.div
                  layoutId={`image-${item.name}-${id}`}
                  className="col-start-1 col-span-1  row-start-1 row-span-3 bg-black  overflow-hidden rounded-xl"
                >
                  {bg && isVideoUrl(bg) ? (
                    <div className="w-full h-full opacity-50 group-hover/card:opacity-100 transition-opacity">
                      <DeferredVideo
                        src={bg}
                        maxWidth={600}
                        className="w-full h-full object-cover min-h-[320px]"
                        mediaStyle={
                          objectPosition
                            ? { objectPosition }
                            : undefined
                        }
                        posterUrl={cloudinaryPosterUrl(bg, { maxWidth: 600, frame: "0" })}
                        mountDelay={200}
                      />
                    </div>
                  ) : bg ? (
                    <Image
                      width={1000}
                      height={600}
                      src={bg}
                      alt={item.serviceBackground?.alt || item.name}
                      className="w-full h-full object-cover min-h-[320px] group-hover/card:opacity-100 opacity-80 transition-all"
                      style={
                        objectPosition
                          ? { objectPosition }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 border opacity-80 min-h-[200px] group-hover/card:opacity-100 transition-all" />
                  )}
                </motion.div>
                <div className="w-full flex row-span-1  justify-start opacity-100  mb-16 z-1">
                  <div className="flex  justify-end items-start gap-4 w-full">
                    {/* {icon && (
                      <motion.img
                        layoutId={`logo-${item.name}-${id}`}
                        src={icon}
                        alt={item.name}
                        className="w-10 h-10 object-contain mb-2"
                      />
                    )} */}
                    <div className="flex flex-col items-end">
                      <motion.h3
                        layoutId={`title-${item.name}-${id}`}
                        className="font-medium text-xl leading-snug tracking-tight text-neutral-700 dark:text-neutral-200 text-right"
                      >
                        {item.name}
                      </motion.h3>
                      {item.taglabel && (
                        <motion.p
                          layoutId={`description-${item.taglabel}-${id}`}
                          className="text-neutral-500  text-sm dark:text-neutral-400"
                        >
                          {item.taglabel}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </StaggeredSlideUp>
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      whileHover={{ rotate: 90 }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
