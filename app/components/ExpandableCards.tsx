"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import StaggeredSlideUp from "./StaggeredSlideUp";

export default function ExpandableCards() {
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
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden  justify-around   rounded-full h-6 w-6"
              onClick={() => setActive(null)}>
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col  bg-neutral-900 dark:bg-neutral-900  shadow-2xl overflow-hidden">
              <motion.div
                className="w-full h-100   sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}>
                <img
                  width={200}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-full absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                />
              </motion.div>{" "}
              <motion.img
                layoutId={`logo-${active.title}-${id}`}
                src={active.logo}
                alt={active.title}
                className="w-24 h-20 object-contain absolute top-10 left-8"
              />
              <div className="flex justify-between border-t border-neutral-100/50 items-start m-8 pt-8 z-10 ">
                <div className="flex justify-between flex-col items-start   z-10 left-0">
                  <div className="">
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-100 text-5xl  dark:text-neutral-400">
                      {active.description}
                    </motion.p>{" "}
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className=" text-white text-xl max-w-2/3 dark:text-neutral-200">
                      {active.title}
                    </motion.h3>
                  </div>

                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-sm md:text-sm lg:text-base mt-8  max-w-2/3 mb-2 md:h-fit pb-4 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm font-bold bg-lime-500 hover:bg-black transition-all duration-500 text-white">
                    {active.ctaText}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className=" w-full ">
        <StaggeredSlideUp className=" grid grid-cols-4  gap-4  mx-auto h-full min-h-full w-full ">
          {cards.map((card, index) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={`card-${card.title}-${id}`}
              onClick={() => setActive(card)}
              className=" col-span-1 grid grid-cols-1 grid-row-1 row-span-1 min-h-[250px] rounded-xs group/card overflow-hidden h-[200px]   cursor-pointer">
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full min-h-full  rounded-xs overflow-hidden">
                <img
                  width={1000}
                  height={1000}
                  src={card.src}
                  alt={card.title}
                  className="w-full h-full object-cover group/card:hover:opacity-50 object-top opacity-50"
                />
              </motion.div>
              <div className="col-start-1 border col-span-1 flex flex-col justify-end opacity-100 row-start-1 p-4 z-1">
                <motion.img
                  layoutId={`logo-${card.title}-${id}`}
                  src={card.logo}
                  alt={card.title}
                  className="w-28 h-14 object-contain  object-left"
                />

                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium mt-2  text-sm leading-snug tracking-tight text-neutral-100 dark:text-neutral-200 text-center md:text-left">
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
    description: "MSM",
    title: "Driving sales, reach, and connection for world-class brands",
    src: "/units/MSMDIGITAL/msm_cover-mage.jpg",
    logo: "/units/MSMDIGITAL/msm_digital_logo.svg",
    ctaText: "Visit MSM",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
 We help world-class brands boost sales with cutting-edge marketing. By harnessing PR, social media, online retail, tech innovation, and digital POS, we drive awareness, reach, sell-through, and lasting customer connections at every touchpoint.
        </p>
      );
    },
  },
  {
    description: "StudioCO2",
    title: "Sharp specialists in creative customer journeys",
    src: "/units/STUDIOCO2/studio-co2_cover-image.jpg",
    logo: "/units/STUDIOCO2/studio_co2_logo.svg",
    ctaText: "Play @ StudioCo2",
    ctaLink: "https://studioco2.",
    content: () => {
      return (
        <p>
          Whether its a full funnel product campaign, an interactive retail experience or a fun piece of theatre… we have the people, the skills and all the tools to make it happen all under one roof.
        </p>
      );
    },
  },
  {
    description: "Flzr",
    title: "20+ years of driving success at the point of sale.",
    src: "/units/FLZR/flzr_cover-image.jpg",
    logo: "/units/FLZR/flzr_logo.svg",
    ctaText: "Rush to Flzr",
    ctaLink: "https://www.msm.digital",
    content: () => {
      return (
        <p>
       We create tailored brand experiences that deliver results. With full-service solutions and innovations like video consulting and social selling, we help brands win at the point of sale — across Europe and beyond.
        </p>
      );
    },
  },

  {
    description: "Insight",
    title: "Connecting creators, brands, and fans through authentic influence",
    src: "/units/INSIGHT/insight_cover-image.jpg",
    logo: "/units/INSIGHT/insight_logo.svg",
    ctaText: "Rush to Insight",
    ctaLink: "https://www.ins.gg/en/",
    content: () => {
      return (
        <p>
We empower leading creators to tell authentic stories. By partnering with global brands and focusing on communities, we spark engagement, build awareness, and drive sales through genuine connections.
        </p>
      );
    },
  },
  {
    description: "Renaissance",
    title: "Masterminding PR and marketing campaigns across every genre",
    src: "/units/RENAISSANCE/renaissance_cover-image.jpg",
    logo: "/units/RENAISSANCE/renaissance_logo.svg",
    ctaText: "Click to Renaissance",
    ctaLink: "https://renaissancepr.co.uk/",
    content: () => {
      return (
        <p>
From strategy and planning to audience insights and execution, Renaissance brings together expert talent across every discipline to craft PR and marketing campaigns that resonate and perform. We ensure your brand is always positioned to make the most of every opportunity.
        </p>
      );
    },
  },
  {
    description: "1SP XR Studio",
    title: "Innovative 3D communication that inspires you and your customers",
    src: "/units/1SPXRSTUDIOS/1sp-xr-studios_cover-image.jpg",
    logo: "/units/1SPXRSTUDIOS/1sp-xr-studios_logo.svg",
    ctaText: "Visit 1SP XR Studio",
    ctaLink: "https://www.cad-laif.com/",
    content: () => {
      return (
        <p>
From complex 3D models and emotive renderings to animations, AR, and VR apps — every 1SP XR Studio project reflects the passion and expertise of our highly motivated team.
        </p>
      );
    },
  },
  {
    description: "promoPers",
    title: "Combining  exceptional brand products with extraordinary personalities.",
    src: "/units/PROMOPERS/promopers_cover-image.jpg",
    logo: "/units/PROMOPERS/promopers_logo.svg",
    ctaText: "PromoPers",
    ctaLink: "https://promopers.com/en/",
    content: () => {
      return (
        <p>
Our mission is centered on your vision, values, and products — whether it’s new campaigns, sales promotions, or tailored personnel solutions. Trusted by long-standing clients for our transparency, proximity, and flexibility, we remain committed to driving your success.        </p>
      );
    },
  },
  {
    description: "New Fluence",
    title: "#1 solution for successful Influencer marketing",
    src: "/units/NEWFLUENCE/new-fluence_cover-image.jpg",
    logo: "/units/NEWFLUENCE/new-fluence_logo.svg",
    ctaText: "Let NewFluence you ",
    ctaLink: "https://www.new-fluence.com/en/",
    content: () => {
      return (
        <p>
New Fluence enhances brand credibility and visibility by partnering with authentic content creators. We make your brand digitally visible, driving growth and success through simple, targeted, and effective promotion.  </p>
      );
    },
  },
  {
    description: "Fijak",
    title: "End-to-end expertise in design, production, logistics, and retail activation",
    src: "/units/FIJAK/fijak_cover-image.jpg",
    logo: "/units/FIJAK/fijak_logo.svg",
    ctaText: "",
    ctaLink: "https://www.new-fluence.com/en/",
    content: () => {
      return (
        <p>
With over 30 years of experience, we take ideas from concept to the point of sale — delivering seamless brand experiences that connect with customers. </p>
      );
    },
  },
];
