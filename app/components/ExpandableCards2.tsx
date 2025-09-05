"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import StaggeredSlideUp from "./StaggeredSlideUp";

export default function ExpandableCards2() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
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
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden bg-neutral-900 justify-around   rounded-full h-6 w-6"
              onClick={() => setActive(null)}>
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[900px] min-h-[70vh]  relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col  bg-neutral-900 dark:bg-neutral-900  shadow-2xl overflow-hidden">
              <motion.div
                className="w-full h-100   sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}>
                <img
                  width={200}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-100 absolute  sm:rounded-t-xl opacity-50 object-cover object-top"
                />
              </motion.div>{" "}
              <motion.img
                layoutId={`logo-${active.title}-${id}`}
                src={active.logo}
                alt={active.title}
                className="w-24 h-20 object-contain absolute top-24 left-8"
              />
              <div className="flex justify-between border-t h-full border-neutral-100 items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between items-start   z-10 left-0">
                  <div className="">
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-100 text-5xl  dark:text-neutral-400">
                      {active.description}
                    </motion.p>{" "}
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className=" text-neutral-300 text-xl max-w-2/3 dark:text-neutral-200">
                      {active.title}
                    </motion.h3>
                  </div>
                </div>
                <div className=" relative px-8">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-md md:text-sm lg:text-base max-w-2/3 mb-2 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm font-bold bg-lime-500 text-white">
                    {active.ctaText}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className=" w-full  ">
        <StaggeredSlideUp className=" grid grid-cols-5 gap-2 mx-auto h-full min-h-full w-full ">
          {cards.map((card, index) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className=" col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[240px] rounded-lg overflow-hidden hover:scale-105 transition duration-200 h-[100px] cursor-pointer">
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full  rounded-lg overflow-hidden">
                <img
                  width={1000}
                  height={1000}
                  src={card.src}
                  alt={card.title}
                  className="w-full h-full object-cover  object-top opacity-25"
                />
              </motion.div>
              <div className="col-start-1 border col-span-1 opacity-100 row-start-1 p-8 z-1">
                <motion.img
                  layoutId={`logo-${card.title}-${id}`}
                  src={card.logo}
                  alt={card.title}
                  className="w-7 h-7 mb-16 object-contain"
                />
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-100 text-xl dark:text-neutral-400  md:text-left">
                  {card.description}
                </motion.p>
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-sm text-neutral-100 dark:text-neutral-200 text-center md:text-left">
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

export const CloseIcon = () => {
  return (
    <motion.svg
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
      className="h-4 w-4 text-black">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const cards = [
  {
    description: "Blizzard",
    title: "Let us help you grow your business and brand awarenessxx",
    src: "/s2.png",
    logo: "/msmlogo.svg",
    ctaText: "Visit MSM",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "Renai",
    title: "Let us help you grow your business and brand awarenessx",
    src: "/s3.png",
    logo: "/studioco2.svg",
    ctaText: "Play @ StudioCo2",
    ctaLink: "https://studioco2.",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "GamesCon",
    title: "Let us help you grow your business and brand awarenessa",
    src: "/s1.png",
    logo: "/msmlogo.svg",
    ctaText: "Rush to Flizzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "GamesCon",
    title: "Let us help you grow your business and brand awarenessa",
    src: "/s1.png",
    logo: "/msmlogo.svg",
    ctaText: "Rush to Flizzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "Samsung",
    title: "elp you grow your business an",
    src: "/s4.jpg",
    logo: "/msmlogo.svg",
    ctaText: "Rush to Flizzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "FakeCase",
    title: "Let us help our business an",
    src: "/s4.jpg",
    logo: "/msmlogo.svg",
    ctaText: "Rush to Flizzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
  {
    description: "GamesCon2",
    title: "Let usou grow your business and brand awarenessa",
    src: "/s1.png",
    logo: "/msmlogo.svg",
    ctaText: "Rush to Flizzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          This is where we get our creative spark from. And epochs of customer
          focus and talking to the public. This is where we get our creative
          spark from. And epochs of customer focus and talking to the public.
        </p>
      );
    },
  },
];
