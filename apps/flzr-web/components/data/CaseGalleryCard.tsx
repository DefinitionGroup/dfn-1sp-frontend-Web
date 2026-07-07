"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import DeferredVideo from "@flzr/components/ui/DeferredVideo";

interface CaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  services?: { name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    logoUrl?: string;
  };
}

interface CaseGalleryCardProps {
  item: CaseStudy;
  id: string;
  variant?: "light";
  activeFilter?: string;
  locale?: string;
  onClick: () => void;
}

export default function CaseGalleryCard({
  item,
  id,
  variant,
  activeFilter,
  locale = "en",
  onClick,
}: CaseGalleryCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transform Y for parallax effect (image moves slower than container)
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  // Add spring for smoothness
  const springY = useSpring(y, { stiffness: 400, damping: 90 });

  return (

    <motion.div
      layoutId={`card-${item.title}-${id}`}
      key={`card-${item.title}-${id}`}
      onClick={onClick}
      ref={ref}
      className="col-span-1 grid grid-cols-1 grid-row-1 row-span-1  md:min-h-[500px] group/card overflow-hidden md:h-[500px] cursor-pointer card-hover"
    >
      <motion.div
        layoutId={`image-${item.title}-${id}`}
        className="col-start-1 col-span-1 row-start-1 bg-neutral-900 min-h-[260px] md:h-[300px] md:min-h-full rounded-[2rem] overflow-hidden relative"
      >
        <motion.div style={{ y: springY }} className="w-full h-[120%]   relative -top-[10%]">
          {item.mainVideoUrl ? (
            <DeferredVideo
              src={item.mainVideoUrl}
              maxWidth={640}
              className="w-full h-full object-cover object-top opacity-80 transition-all group-hover/card:opacity-100"
              mountDelay={300}
              posterFrame="0"
            />
          ) : (
            <Image
              width={1000}
              height={1000}
              src={item.mainImageUrl || "/placeholder.png"}
              alt={item.title}
              className="w-full h-full object-cover group-hover/card:opacity-100 object-top  opacity-80 transition-all"
            />
          )}

             {item.client?.logoUrl ? (
            <motion.img
              layoutId={`logo-${item.title}-${id}`}
              src={item.client?.logoUrl}
              alt={item.title}
              className={` min-w-[144px] max-w-full max-h-7 object-contain absolute left-4 top-12 object-left invert`}
            />
          ) : null}  
        </motion.div>
      </motion.div>

      <StaggeredSlideUp
        key={activeFilter}
        staggerDelay={0.2}
        distance={10}
        delay={0.4}
        duration={1}
        className={`col-start-1  col-span-1 flex flex-col opacity-100 row-start-2 p-2  mt-4 mb-8 md:mb-16 z-1 h-[250px]`}
      >
        <div className={`flex-col flex justify-start mb-2`}>
      <Link href={`/cases/${item.slug?.current}`} className="contents">
            <motion.h3
              layoutId={`title-${item.title}-${id}`}
              className={`font-medium md:ext-lg leading-snug max-w-[350px] tracking-tight ${variant !== "light" ? "" : "invert"
                } text-neutral-600 hover:text-neutral-400 transition-colors dark:text-neutral-200 md:text-left`}
            >
              {item.title}
            </motion.h3>  </Link>
        </div>

        {item.services && item.services.length > 0 && (
          <div className="flex justify-end   ">
            <motion.p
              layoutId={`description-${item.description}-${id}`}
              className="text-neutral-400   md:text-left text-xxs font-regular md:text-xs dark:text-neutral-400"
            >
              {item.services.map((s) => s.name).join(", ")}
            </motion.p>
          </div>
        )}
      </StaggeredSlideUp>
    </motion.div>

  );
}
