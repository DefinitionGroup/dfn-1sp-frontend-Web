"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import StaggeredSlideUp from "./StaggeredSlideUp";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import Button2 from "./Button2";

interface CaseItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  description: string;
  category: string;
  logosrc?: string;
  url?: string;
  urltext?: string;
  link?: string;
}

const caseItems: CaseItem[] = [
  {
    id: 6,
    title: "Turning up the Noise on Amazon",
    subtitle: "Marshall",
    image: "/case-marshall.jpg",
    video: "/video/atf.mp4",
    description:
      "Expanding reach, increasing traffic, and driving deeper engagement through Amazon Stores globally.",
    category: "Marketing",
    logosrc: "/logos/Marshall_logo_black.svg",
    url: "https://www.marshallheadphones.com/",
    urltext: "Visit Website",
    link: "/work/marshall",
  },
  {
    id: 1,
    title: "Zucked!",
    subtitle: "AR/VR In Flight",
    image: "/metaplaceholder.png",
    description:
      "Immersive gaming experience with cutting-edge visuals and Mark Zuckerberg",
    category: "Social",
    logosrc: "/logos/Meta_Platforms_Inc._logo.svg",
    link: "/work/meta",
    video: "/video/Zuckerberg_Inflight.mp4",
  },
  {
    id: 3,
    title: "Interactive Web",
    subtitle: "User Experience",
    image: "/s2.png",
    description: "Revolutionary web experiences that engage and convert",
    category: "Web",
    logosrc: "/logos/Ubisoft_logo.svg",
  },
  {
    id: 2,
    title: "Brand Identity",
    subtitle: "Visual Storytelling",
    image: "/s4.jpg",
    description: "Complete brand transformation with interactive elements",
    category: "Design",
    logosrc: "/logos/Lufthansa_Logo_2018.svg",
  },
  {
    id: 4,
    title: "Motion Graphics",
    subtitle: "Dynamic Content",
    image: "/s3.png",
    description: "Stunning motion graphics for digital campaigns",
    category: "Design",
    logosrc: "/logos/Microsoft-logo_black.svg",
  },
  {
    id: 5,
    title: "AR Experience",
    subtitle: "Augmented Reality",
    image: "/s1.png",
    description: "Next-generation AR solutions for marketing",
    category: "POS",
    logosrc: "/logos/Lufthansa_Logo_2018.svg",
  },
];

interface CaseGalleryProps {
  activeFilter?: string;
}

export default function CaseGallery({
  activeFilter = "All",
}: CaseGalleryProps) {
  const router = useTransitionRouter();
  const [active, setActive] = useState<
    (typeof caseItems)[number] | boolean | null
  >(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Filter items based on active filter
  const filteredItems =
    activeFilter === "All"
      ? caseItems
      : caseItems.filter((item) => item.category === activeFilter);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
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
        {active && typeof active === "object" && (
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
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
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
              layoutId={`card-${active.title}-${id}`}
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
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              <motion.div
                className="w-full h-100 sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}
              >
                {active.video ? (
                  <video
                    src={active.video}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                ) : (
                  <img
                    width={100}
                    height={500}
                    src={active.image}
                    alt={active.title}
                    className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                )}
              </motion.div>
              <div className="flex justify-between absolute items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  <motion.img
                    layoutId={`logo-${active.title}-${id}`}
                    src={active.logosrc}
                    alt={active.title}
                    className="w-24 h-20 object-contain invert"
                  />
                  <div className="">
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
                  {active.link && (
                    <motion.div
                      className="mt-4 w-fit min-w-[250px] "
                      transition={{ duration: 0.3, delay: 0.7 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button2
                        variant="violetsmall"
                        href={active.link}
                        text="View Case Study"
                      />
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto w-full min-h-full"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              key={`card-${item.title}-${id}`}
              onClick={() => setActive(item)}
              className="col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[400px] group/card overflow-hidden max-h-[500px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${item.title}-${id}`}
                className="col-start-1 col-span-1  row-start-1 bg-black h-full min-h-full overflow-hidden rounded-4xl"
              >
                {item.video ? (
                  <video
                    src={item.video}
                    autoPlay
                    muted
                    loop
                    className="w-full object-cover grayscale h-[300px] group-hover/card:grayscale-0 group-hover/card:opacity-100 object-top opacity-50 duration-300 transition-all"
                  />
                ) : (
                  <img
                    width={1000}
                    height={1000}
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[300px] object-cover grayscale group-hover/card:grayscale-0 group-hover/card:opacity-100 object-top opacity-50 duration-300 transition-all"
                  />
                )}
              </motion.div>
              <div className="col-start-1 col-span-1 flex  justify-between opacity-100 row-start-2 p-2 mt-4 mb-16 z-1">
                <motion.img
                  layoutId={`logo-${item.title}-${id}`}
                  src={item.logosrc}
                  alt={item.title}
                  className="w-24 h-8 object-contain object-left mb-4"
                />
                <div className="flex flex-col items-end">
                  <motion.h3
                    layoutId={`title-${item.title}-${id}`}
                    className="font-medium text-lg leading-snug tracking-tight text-neutral-600 dark:text-neutral-200 text-left"
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
