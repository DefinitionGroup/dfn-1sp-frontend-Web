"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { useTransitionRouter } from "next-view-transitions";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import Button2 from "../ui/Button2";
import Image from "next/image";

interface Service {
  _id: string;
  name: string;
  taglabel?: string;
  iconUrl?: string;
  serviceicon?: any;
  servicegrouprel?: { _id: string; name: string; taglabel?: string }[];
  unitsrel?: { _id: string; name: string; slug: { current: string } }[];
}

interface ServiceGalleryProps {
  services: Service[];
  activeFilter?: string;
  locale?: string;
}

export default function ServiceGalleryComponent({
  services = [],
  activeFilter = "All",
  locale = "en",
}: ServiceGalleryProps) {
  const router = useTransitionRouter();
  const [active, setActive] = useState<Service | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Filter items based on active filter - using service groups
  const filteredItems =
    activeFilter === "All"
      ? services
      : services.filter((item) =>
          item.servicegrouprel?.some((group) => group.name === activeFilter)
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
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden justify-around rounded-full h-6 w-6 z-50"
              onClick={() => setActive(null)}
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
            >
              <motion.div
                className="w-full h-100 sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.name}-${id}`}
              >
                {active.iconUrl ? (
                  <img
                    width={100}
                    height={500}
                    src={active.iconUrl}
                    alt={active.name}
                    className="w-full h-full absolute min-h-[90vh] sm:rounded-t-xl invert opacity-50 object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full absolute min-h-[90vh] sm:rounded-t-xl bg-neutral-800 opacity-50" />
                )}
              </motion.div>
              <div className="flex justify-between absolute items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  {active.iconUrl && (
                    <motion.img
                      layoutId={`logo-${active.name}-${id}`}
                      src={active.iconUrl}
                      alt={active.name}
                      className="w-24 h-20 object-contain "
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
                        className="text-neutral-100 text-xl dark:text-neutral-400 mb-8"
                      >
                        {active.taglabel}
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
      <ul className="w-full">
        <StaggeredSlideUp
          staggerDelay={0.125}
          distance={30}
          duration={1.6}
          viewport={{
            once: true,
            amount: 0.2,
            margin: "0px 0px -100px 0px",
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full min-h-full"
        >
          {filteredItems.map((item) => (
            <motion.div
              layoutId={`card-${item.name}-${id}`}
              key={`card-${item.name}-${id}`}
              onClick={() => setActive(item)}
              className="col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[400px] group/card overflow-hidden h-[300px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${item.name}-${id}`}
                className="col-start-1 col-span-1  row-start-1 bg-black h-full min-h-full overflow-hidden rounded-sm"
              >
                {item.iconUrl ? (
                  <Image
                    width={1000}
                    height={1000}
                    src={item.iconUrl}
                    alt={item.name}
                    className="w-full h-full object-cover min-h-[400px] group-hover/card:opacity-100 object-top opacity-80 transition-all"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 opacity-80 group-hover/card:opacity-100 transition-all" />
                )}
              </motion.div>
              <div className="col-start-1 col-span-1 flex  justify-between opacity-100 row-start-2 p-2 mb-16 z-1">
                <div className="flex flex-col items-start">
                  <motion.h3
                    layoutId={`title-${item.name}-${id}`}
                    className="font-medium text-xl leading-snug tracking-tight text-neutral-700 dark:text-neutral-200 text-left"
                  >
                    {item.name}
                  </motion.h3>
                  {item.taglabel && (
                    <motion.p
                      layoutId={`description-${item.taglabel}-${id}`}
                      className="text-neutral-500 font-semibold text-sm dark:text-neutral-400"
                    >
                      {item.taglabel}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
