"use client";

import React, { useEffect, useId, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import type { CardItem, CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";
import { useOutsideClick } from "@/app/hooks/use-outside-click";

export interface ExpandableCardsProps {
  items?: CardItem[];
  variant?: "default" | "compact";
  columns?: 3 | 4 | 5;
}

type UIShape = {
  description: string;
  title: string;
  src: string;
  logo?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: React.ReactNode;
};

const colsClass = (n: number) =>
  (({ 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" }) as const)[
    (n as 3 | 4 | 5) || 4
  ] || "grid-cols-4";

function mapCard(item: CardItem): UIShape | null {
  const src =
    assetUrl(item.src as CloudinaryAsset) ||
    assetUrl(item.logo as CloudinaryAsset) ||
    "";
  if (!src) return null;

  const logo = assetUrl(item.logo as CloudinaryAsset) || undefined;
  const ctaText = item?.ctaButton?.text || "";
  const ctaLink =
    (item?.ctaButton?.link?.linkType === "internal"
      ? `/${(item?.ctaButton?.link?.page as any)?.slug?.current || (item?.ctaButton?.link?.page as any)?._ref || ""}`
      : item?.ctaButton?.link?.externalUrl) || "#";

  const contentNode =
    typeof item.content === "string" ? (
      <p>{item.content}</p>
    ) : (
      (item as any)?.content
    );

  return {
    description: item.description || "",
    title: item.title || "",
    src,
    logo,
    ctaText,
    ctaLink,
    content: contentNode,
  };
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
    strokeWidth="1" // match old branch
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-white" // match old branch color/size
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

export default function ExpandableCards({
  items,
  variant = "default",
  columns = 4,
}: ExpandableCardsProps) {
  const [active, setActive] = useState<UIShape | boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const sourceCards = useMemo(
    () => (items || []).map(mapCard).filter(Boolean) as UIShape[],
    [items]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(false);
    }
    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  if (sourceCards.length === 0) return null;

  const cardHeight =
    variant === "compact"
      ? "min-h-[240px] h-[100px]"
      : "min-h-[250px] h-[200px]";
  const imageOpacity = variant === "compact" ? "opacity-25" : "opacity-50";
  const hoverScale =
    variant === "compact" ? "hover:scale-105 transition duration-200" : "";
  const gap = variant === "compact" ? "gap-2" : "gap-1";

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 20 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 z-50 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              transition={{ type: "spring", bounce: 0.2, visualDuration: 0.3 }}
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[50%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              {/* Media */}
              <motion.div
                className="w-full h-100 sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}
              >
                <img
                  width={100}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                />
              </motion.div>

              {/* Foreground content area (logo, title, body, cta) */}
              <div className="flex justify-between absolute items-start m-8 pt-8 z-10">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0 text-white">
                  {active.logo && (
                    <motion.img
                      layoutId={`logo-${active.title}-${id}`}
                      src={active.logo}
                      alt={active.title}
                      className="w-24 h-20 object-contain"
                    />
                  )}
                  <motion.h3
                    layoutId={`title-${active.title}-${id}`}
                    className="text-white text-xl dark:text-neutral-200"
                  >
                    {active.title}
                  </motion.h3>

                  <motion.div
                    transition={{ duration: 0.3, delay: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-sm md:text-sm lg:text-base mt-8 md:max-w-1/2 mb-2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? (active.content as any)()
                      : active.content}
                  </motion.div>

                  {(active.ctaText || active.ctaLink) && (
                    <motion.a
                      transition={{ duration: 0.3, delay: 0.7 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      href={active.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 text-xs font-bold bg-lime-500 rounded-xs hover:bg-black transition-all duration-500 text-white"
                    >
                      {active.ctaText}
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Grid */}
      <ul className="w-full">
        <StaggeredSlideUp
          className={`grid grid-cols-2 md:${colsClass(columns)} ${gap} mx-auto h-full min-h-full w-full`}
        >
          {sourceCards.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className={`col-span-1 grid grid-cols-1 grid-row-1 row-span-1 rounded-sm overflow-hidden cursor-pointer ${cardHeight} ${hoverScale}`}
            >
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full min-h-full overflow-hidden"
              >
                <img
                  width={1000}
                  height={1000}
                  src={card.src}
                  alt={card.title}
                  className={`w-full h-full object-cover object-top ${imageOpacity} group-hover/card:opacity-100 transition-all`}
                />
              </motion.div>

              <div className="col-start-1 col-span-1 flex flex-col justify-end opacity-100 row-start-1 p-4 z-1 text-white">
                {card.logo && (
                  <motion.img
                    layoutId={`logo-${card.title}-${id}`}
                    src={card.logo}
                    alt={card.title}
                    className="w-28 h-14 object-contain object-left"
                  />
                )}
                {/* Old tile only showed title; keep that for parity */}
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium mt-2 text-sm leading-snug tracking-tight text-neutral-100 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
              </div>
            </motion.div>
          ))}
        </StaggeredSlideUp>
      </ul>
    </>
  );
}
