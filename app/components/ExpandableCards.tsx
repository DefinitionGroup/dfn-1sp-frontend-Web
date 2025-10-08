"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import StaggeredSlideUp from "./StaggeredSlideUp";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
export default function ExpandableCards() {
  const router = useTransitionRouter();
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
            animate={{
              opacity: 0.2,
              transition: { type: "spring", stiffness: 20 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  bg-black/50 h-full backdrop-blur-lg w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
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
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[50%] rounded-xl flex flex-col  bg-neutral-900 dark:bg-neutral-900  shadow-2xl overflow-hidden"
            >
              {" "}
              <motion.button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-50 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <CloseIcon />
              </motion.button>
              <motion.div
                className="w-full  h-100   sm:rounded-t-xl opacity-80 object-cover object-top"
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
              <div className="flex justify-between absolute  items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between relative top-0 flex-col items-start   z-10 left-0">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className=" text-white text-xl max-w-2/3 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                  </div>
                  <motion.div
                    transition={{ duration: 0.3, delay: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-sm md:text-sm lg:text-base mt-8  md:max-w-1/2 mb-2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                  <motion.a
                    transition={{ duration: 0.3, delay: 0.7 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-xs font-bold bg-violet-500 rounded-xs hover:bg-black transition-all duration-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className=" w-full ">
        <StaggeredSlideUp className=" grid grid-cols-2 md:grid-cols-4  gap-4  mx-auto h-full min-h-full w-full ">
          {cards.map((card, index) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className=" col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[250px] rounded-4xl group/card  h-[200px] overflow-clip cursor-pointer"
            >
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full min-h-full  overflow-hidden"
              >
                <img
                  width={1000}
                  height={1000}
                  src={card.src}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover/card:opacity-100 object-top opacity-50 transition-all"
                />
              </motion.div>
              <div className="col-start-1  col-span-1 flex flex-col justify-end opacity-100 row-start-1 p-4 z-1">
                <motion.h3
                  layoutId={`description-${card.description}-${id}`}
                  className="font-medium mt-2  text-xl leading-snug tracking-tight text-neutral-100 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.description}
                </motion.h3>
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium mt-2  text-sm leading-snug tracking-tight text-neutral-100 dark:text-neutral-200 text-center md:text-left"
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
      strokeWidth="1"
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

const cards = [
  {
    description: "Trainings",
    title: "Our trainings for convincing customer communication",
    src: "/flizzr/live-shopping.webp",

    ctaText: "Trainings",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return <p>Our trainings for convincing customer communication</p>;
    },
  },
  {
    description: "Business Intelligence",
    title: "Use data, achieve goals",
    src: "/flizzr/business-analyse.webp",

    ctaText: "Business Intelligence",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return <p>Customized analysis tools and data visualization</p>;
    },
  },
  {
    description: "Sales Force",
    title: "Unique shopping experiences for a new type of sales",
    src: "/flizzr/sales-force-shared-sales-force.webp",

    ctaText: "Sales Force",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          Our sales strategies seamlessly integrate traditional brick-and-mortar
          shopping with modern digital experiences. Emphasizing personal
          interaction at key touchpoints, our seasoned sales team brings their
          expertise directly to stores, providing adaptable, sales-driven
          support services across Germany and Europe. They consistently tailor
          their approach to suit the brand and target audience, ensuring optimal
          sales outcomes.
        </p>
      );
    },
  },
  {
    description: "Go To Markets:",
    title: "From the idea to the shelf: your product in Europe’s stores",
    src: "/flizzr/go-to-market.webp",

    ctaText: "Go To Markets:",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
          We support you in successfully establishing your product in
          international retail chains and distributing it throughout the
          European market, from key account sales to sales promotions and
          training. Our expertise in consumer electronics and technology as well
          as advanced AI technologies and customized retail marketing campaigns
          ensure the optimal placement of your products. FLZR is the strong
          partner at your side!
        </p>
      );
    },
  },
];

const pageAnimation = () => {
  document.documentElement.animate(
    [
      {
        opacity: 1,
        scale: 1,
        transform: "translateY(0)",
      },
      {
        opacity: 1,
        scale: 0.9,
        transform: "translateY(-100px)",
      },
    ],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [
      {
        transform: "translateY(100%)",
      },
      {
        transform: "translateY(0)",
      },
    ],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
};
