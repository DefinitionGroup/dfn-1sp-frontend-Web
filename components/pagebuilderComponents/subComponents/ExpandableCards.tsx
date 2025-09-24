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
    (n as 3 | 4 | 5) || 5
  ] || "grid-cols-5";

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
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

export default function ExpandableCards({
  items,
  variant = "default",
  columns = 5,
}: ExpandableCardsProps) {
  const [active, setActive] = useState<UIShape | boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Compute source cards with useMemo
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
  const gap = variant === "compact" ? "gap-2" : "gap-4";

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className={`flex absolute top-2 right-2 lg:hidden items-center overflow-hidden justify-around rounded-full h-6 w-6 ${
                variant === "compact" ? "bg-neutral-900" : ""
              }`}
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              {/* Media */}
              <motion.div
                className={`w-full ${variant === "default" ? "min-h-[70vh]" : ""} absolute sm:rounded-t-xl opacity-80 object-cover object-top`}
                layoutId={`image-${active.title}-${id}`}
              >
                <img
                  width={200}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  className={`w-full ${variant === "default" ? "min-h-[70vh]" : ""} absolute sm:rounded-t-xl ${imageOpacity} object-cover object-top`}
                />
              </motion.div>

              {/* Logo (optional) */}
              {active.logo && (
                <motion.img
                  layoutId={`logo-${active.title}-${id}`}
                  src={active.logo}
                  alt={active.title}
                  className="w-24 h-20 object-contain absolute top-24 left-8"
                />
              )}

              {/* Text content */}
              <div className="flex justify-between border-t border-neutral-100 items-start m-8 pt-8 z-10">
                <div className="flex justify-between items-start z-10 left-0">
                  <div>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-100 text-5xl dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-neutral-300 text-xl max-w-2/3 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                  </div>
                </div>
                <div className="relative px-8">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-md md:text-sm lg:text-base max-w-2/3 mb-2 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? (active.content as any)()
                      : active.content}
                  </motion.div>
                  {(active.ctaText || active.ctaLink) && (
                    <motion.a
                      layoutId={`button-${active.title}-${id}`}
                      href={active.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 text-sm font-bold bg-lime-500 text-white"
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
          className={`grid ${colsClass(columns)} ${gap} mx-auto h-full min-h-full w-full`}
        >
          {sourceCards.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className={`col-span-1 grid grid-cols-1 grid-row-1 row-span-1 rounded-lg overflow-hidden cursor-pointer ${cardHeight} ${hoverScale}`}
            >
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full min-h-full rounded-lg overflow-hidden"
              >
                <img
                  width={1000}
                  height={1000}
                  src={card.src}
                  alt={card.title}
                  className={`w-full h-full object-cover object-top ${imageOpacity}`}
                />
              </motion.div>

              <div className="col-start-1 border col-span-1 opacity-100 row-start-1 p-8 z-1">
                {card.logo && (
                  <motion.img
                    layoutId={`logo-${card.title}-${id}`}
                    src={card.logo}
                    alt={card.title}
                    className={`object-contain ${variant === "compact" ? "w-7 h-7 mb-16" : "w-10 h-10"}`}
                  />
                )}
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className={`text-neutral-100 ${variant === "compact" ? "text-xl" : "text-2xl"} dark:text-neutral-400 md:text-left`}
                >
                  {card.description}
                </motion.p>
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className={`font-medium ${variant === "compact" ? "text-sm" : "mt-8 text-sm"} leading-snug text-neutral-100 dark:text-neutral-200 text-center md:text-left`}
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
