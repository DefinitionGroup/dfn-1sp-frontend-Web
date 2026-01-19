"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { useOptimizedTransitionRouter } from "@/hooks/use-optimized-transition-router";
import Button2 from "../ui/Button2";
import Image from "next/image";
import StaggeredFadeIn from "../ui/StaggeredFadeIn";
import CaseGalleryCard from "./CaseGalleryCard";

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
  filterAllText?: string;
}

export default function CaseGalleryComponent({
  caseStudies = [],
  activeFilter = "All",
  locale = "en",
  variant,
  filterAllText = "All",
}: CaseGalleryComponentProps) {
  const router = useOptimizedTransitionRouter();
  const [active, setActive] = useState<CaseStudy | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const filteredItems =
    activeFilter === filterAllText
      ? caseStudies
      : caseStudies.filter((item) =>
        item.services?.some((service) => service.name === activeFilter)
      );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }

    document.body.style.overflow = active ? "hidden" : "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleViewCaseStudy = (slug: string) => {
    document.body.style.overflow = "auto";
    setActive(null);
    setTimeout(() => {
      router.push(`/${locale}/cases/${slug}`);
    }, 50);
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.7,
              transition: { type: "spring", stiffness: 110, duration: 0.2 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 cl-overlay backdrop-blur-2xl bg-black w-full min-h-[100vh] z-100"
          />
        )}
      </AnimatePresence>

      <>
        {active ? (
          <div className="fixed inset-0 grid place-items-center  w-full  z-[100]">


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
                    muted playsInline
                    loop
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                ) : (
                  <Image
                    width={100}
                    height={500}
                    src={active.mainImageUrl || "/placeholder.png"}
                    alt={active.title}
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                )}

              </motion.div>

              <div className="flex justify-between absolute items-start m-8 pt-8 z-10 ">

                <motion.button
                  key={`button-${active.title}-${id}`}
                  layout
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1, transition: { duration: 0.05 } }}
                  className="flex absolute top-2  right-2 lg items-center hover:cursor-pointer overflow-hidden justify-around rounded-full h-6 w-6 z-100"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                >
                  <CloseIcon />
                </motion.button>
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  {active.client?.logoUrl && (
                    <motion.img
                      layoutId={`logo-${active.title}-${id}`}
                      src={active.client.logoUrl}
                      alt={active.title}
                      className={`w-32 h-20 object-contain invert ${variant === "light" ? "invert" : ""}`}
                    />
                  )}

                  <div>

                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-white text-5xl max-w-2/3 dark:text-neutral-200"
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
                    transition={{ duration: 0.1, delay: 0.1 }}
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
      </>

      <ul className="w-full ">
        <StaggeredFadeIn
          key={activeFilter}
          staggerDelay={0.2}
          distance={10}
          duration={1}


          once={true}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3  mx-auto w-full min-h-full"
        >
          {filteredItems.map((item) => (
            <CaseGalleryCard
              key={`card-${item.title}-${id}`}
              item={item}
              id={id}
              variant={variant}
              activeFilter={activeFilter}
              onClick={() => setActive(item)}
            />
          ))}
        </StaggeredFadeIn>
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
    className="h-6 w-6 text-white z-100"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
