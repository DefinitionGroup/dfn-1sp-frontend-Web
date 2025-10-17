"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import StaggeredSlideUp from "./StaggeredSlideUp";
import Link from "next/link";

import { useTransitionRouter } from "next-view-transitions";
import Button2 from "./Button2";
import IntertitleCTA from "./IntertitleCTA";

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

export default function CaseGalleryMenu({
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
              key={`card-${item.title}-${id}`}
              onClick={() => setActive(item)}
              className="flex-col min-h-[120px] group/card rounded-xl overflow-clip bg-white overflow-hidden h-[250px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${item.title}-${id}`}
                className="col-start-1 h-1/2 col-span-1  row-start-1 bg-black  overflow-hidden "
              >
                {item.video ? (
                  <video
                    src={item.video}
                    autoPlay
                    muted
                    loop
                    className="w-full object-cover group-hover/card:opacity-100 object-top opacity-80 transition-all h-full "
                  />
                ) : (
                  <img
                    width={1000}
                    height={1000}
                    src={item.image}
                    alt={item.title}
                    className="w-full  object-cover  group-hover/card:opacity-100 object-top opacity-80 transition-all"
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
                    {item.subtitle}
                  </motion.p>
                  {/* Set link to case */}
                </div>
                <motion.a
                  layoutId={`link-${item.title}-${id}`}
                  href={`${item.link}`}
                  className="text-gray-700 hover:text-white transition mt-2 absolute bottom-4 border hover:bg-black px-2 py-0.5 rounded-full font-medium text-xs "
                >
                  View Case
                </motion.a>
              </div>
            </motion.div>
          ))}
        </StaggeredSlideUp>
      </ul>
    </>
  );
}
