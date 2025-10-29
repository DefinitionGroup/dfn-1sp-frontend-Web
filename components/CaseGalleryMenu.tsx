"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import StaggeredSlideUp from "./StaggeredSlideUp";
import Link from "next/link";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import { useTransitionRouter } from "next-view-transitions";
import Button2 from "./ui/Button2";
import IntertitleCTA from "./IntertitleCTA";

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

interface CaseGalleryProps {
  caseStudies?: CaseStudy[];
  activeFilter?: string;
  locale?: string;
}

export default function CaseGalleryMenu({
  caseStudies = [],
  activeFilter = "All",
  locale = "en",
}: CaseGalleryProps) {
  const router = useTransitionRouter();
  const [active, setActive] = useState<CaseStudy | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Filter items based on active filter - using services
  const filteredItems =
    activeFilter === "All"
      ? caseStudies
      : caseStudies.filter((item) =>
          item.services?.some((service) => service.name === activeFilter)
        );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
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

  useOutsideClick(ref, () => setActive(null));

  const handleViewCase = (slug: string) => {
    router.push(`/${locale}/cases/${slug}`);
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.2,
              transition: { type: "spring", stiffness: 20 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full backdrop-blur-xs w-full z-10"
          ></motion.div>
        )}
      </AnimatePresence>
      <div className="px-8 ">
        <IntertitleCTA
          title={"Our Work"}
          alignment="left"
          subtitle={"Explore our projects"}
        />
      </div>
      <ul className="w-full  flex p-8 ">
        <StaggeredSlideUp
          staggerDelay={0.1}
          easing="ease-out"
          distance={10}
          duration={0.6}
          viewport={{
            once: true,
            amount: 0.2,
            margin: "0px 0px -100px 0px",
          }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 "
        >
          {filteredItems.map((item, index) => (
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              key={`card-${item._id}-${id}`}
              onClick={() => setActive(item)}
              className="flex-col min-h-[120px] group/card rounded-xl bg-white overflow-hidden h-[250px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${item.title}-${id}`}
                className="col-start-1 h-1/2 col-span-1 row-start-1 bg-black overflow-hidden"
              >
                {item.mainVideoUrl ? (
                  <video
                    src={item.mainVideoUrl}
                    autoPlay
                    muted
                    loop
                    className="w-full object-cover group-hover/card:opacity-100 object-top opacity-80 transition-all h-full"
                  />
                ) : (
                  <img
                    width={1000}
                    height={1000}
                    src={item.mainImageUrl || "/placeholder.jpg"}
                    alt={item.title}
                    className="w-full object-cover group-hover/card:opacity-100 object-top opacity-80 transition-all"
                  />
                )}
              </motion.div>
              <div className="col-start-1 col-span-1 flex-col justify-between opacity-100 row-start-2 p-2 mb-16 z-1">
                <div className="flex flex-col items-start">
                  <motion.h3
                    layoutId={`title-${item.title}-${id}`}
                    className="font-medium text-base leading-none mb-2 tracking-tight text-neutral-600 dark:text-neutral-200 text-left"
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${item.description}-${id}`}
                    className="text-neutral-400 font-medium text-xs dark:text-neutral-400"
                  >
                    {item.subtitle || item.client?.name}
                  </motion.p>
                </div>
                <motion.button
                  layoutId={`link-${item.title}-${id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCase(item.slug.current);
                  }}
                  className="text-gray-700 hover:text-white transition mt-2 absolute bottom-4 border hover:bg-black px-2 py-0.5 rounded-full font-medium text-xs "
                >
                  View Case
                </motion.button>
              </div>
            </motion.div>
          ))}
        </StaggeredSlideUp>
      </ul>
    </>
  );
}
