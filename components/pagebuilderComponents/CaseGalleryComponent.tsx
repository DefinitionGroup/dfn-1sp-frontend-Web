"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import StaggeredSlideUp from "../StaggeredSlideUp";
import { useTransitionRouter } from "next-view-transitions";
import Button2 from "../ui/Button2";

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
}

interface CaseGalleryComponentProps {
  caseStudies: CaseStudy[];
  activeFilter?: string;
  locale?: string;
  variant?: "light";
}

export default function CaseGalleryComponent({
  caseStudies = [],
  activeFilter = "All",
  locale = "en",
  variant,
}: CaseGalleryComponentProps) {
  const router = useTransitionRouter();
  const [active, setActive] = useState<CaseStudy | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Filter items based on active filter - using services instead of categories
  const filteredItems =
    activeFilter === "All"
      ? caseStudies
      : caseStudies.filter((item) =>
          item.services?.some((service) => service.name === activeFilter)
        );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }

    // Scroll lock matches Plaintext behavior
    document.body.style.overflow = active ? "hidden" : "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleViewCaseStudy = (slug: string) => {
    router.push(`/${locale}/cases/${slug}`);
  };

  return (
    <>
      {/* Dimmed backdrop (same opacity/blur/z-index as Plaintext) */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.2,
              transition: { type: "spring", stiffness: 20 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full backdrop-blur-lg w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Modal card */}
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden justify-around rounded-full h-6 w-6 z-50"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0.2 }}
              ref={ref}
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              <motion.div
                className="w-full h-100 sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}
              >
                {active.mainVideoUrl ? (
                  <video
                    src={active.mainVideoUrl}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                ) : (
                  <img
                    width={100}
                    height={500}
                    src={active.mainImageUrl || "/placeholder.jpg"}
                    alt={active.title}
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                )}
              </motion.div>

              <div className="flex justify-between absolute items-start m-8 pt-8 z-10">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  {active.client?.logoUrl && (
                    <motion.img
                      layoutId={`logo-${active.title}-${id}`}
                      src={active.client.logoUrl}
                      alt={active.title}
                      className={`w-24 h-20 object-contain ${variant === "light" ? "invert" : ""}`}
                    />
                  )}

                  <div>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-100 text-5xl dark:text-neutral-400 mb-8"
                    >
                      {active.description}
                    </motion.p>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-white text-xl max-w-2/3 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                  </div>

                  <motion.div
                    transition={{ duration: 0.3, delay: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-sm md:text-sm lg:text-base mt-8 max-w-1/2 mb-2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.description}
                  </motion.div>

                  <motion.div
                    transition={{ duration: 0.3, delay: 0.7 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-[150px]"
                    onClick={() => handleViewCaseStudy(active.slug.current)}
                  >
                    <Button2 variant="limesmall" text="View Case Study" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Grid of cards (matches Plaintext) */}
      <ul className="w-full">
        <StaggeredSlideUp
          staggerDelay={0.125}
          distance={30}
          duration={1.6}
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -100px 0px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full min-h-full"
        >
          {filteredItems.map((item) => (
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              key={`card-${item.title}-${id}`}
              onClick={() => setActive(item)}
              className="col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[400px] group/card overflow-hidden h-[300px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${item.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full min-h-full overflow-hidden rounded-sm"
              >
                {item.mainVideoUrl ? (
                  <video
                    src={item.mainVideoUrl}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover min-h-[400px] group-hover/card:opacity-100 object-top opacity-80 transition-all"
                  />
                ) : (
                  <img
                    width={1000}
                    height={1000}
                    src={item.mainImageUrl || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-full object-cover min-h-[400px] group-hover/card:opacity-100 object-top opacity-80 transition-all"
                  />
                )}
              </motion.div>

              <div className="col-start-1 col-span-1 flex justify-between opacity-100 row-start-2 p-2 mb-16 z-1">
                {item.client?.logoUrl && (
                  <motion.img
                    layoutId={`logo-${item.title}-${id}`}
                    src={item.client.logoUrl}
                    alt={item.title}
                    className={`w-24 h-8 object-contain object-left mb-4 ${variant === "light" ? "invert" : ""}`}
                  />
                )}

                <div className="flex flex-col items-end">
                  <motion.h3
                    layoutId={`title-${item.title}-${id}`}
                    className={`font-medium text-lg leading-snug tracking-tight ${variant === "light" ? "invert" : ""} text-neutral-600 dark:text-neutral-200 text-left`}
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${item.description}-${id}`}
                    className="text-neutral-400 font-bold text-sm dark:text-neutral-400"
                  >
                    {item.subtitle}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggeredSlideUp>
      </ul>
    </>
  );
}

export const CloseIcon = () => (
  <motion.svg
    whileHover={{ rotate: 90 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
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
