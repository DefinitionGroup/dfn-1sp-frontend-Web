"use client";

import React from "react";
import Image from "next/image";
import StaggeredSlideUp from "./StaggeredSlideUp";
import { motion } from "motion/react";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark"; // light = neutral-50 (default), dark = neutral-800
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
}) => {
  const router = useTransitionRouter();
  const textColor = color === "dark" ? "text-neutral-800" : "text-neutral-800";
  const imageLogo =
    color === "dark"
      ? "/flizzr/Logo_FLZR_color_RGB_500.png"
      : "/flizzr/Logo_FLZR_color_RGB_500.png";
  return (
    <motion.nav
      initial={{
        opacity: 0,
        width: 100,
      }}
      animate={{
        opacity: 1,
        width: "auto",
      }}
      transition={{
        opacity: { duration: 0.3 },
        width: { duration: 0.3, delay: 0.8 },
      }}
      className={`hidden m-auto inset-x-0 md:flex shadow-2xl fixed place-items-start mx-auto top-8 bg-gray-200/50 backdrop-blur-sm px-8 rounded-full overflow-hidden z-10 py-3 container max-w-4xl ${className}`}
    >
      <motion.div
        className="flex-shrink-0 pt-2"
        initial={{
          opacity: 0,
          scaleX: 1,
          y: 10,
          originX: 0,
          originY: 0,
        }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 1.4,
        }}
      >
        <Link
          className="hover:text-violet-600"
          href={"/"}
          onClick={(e) => {
            e.preventDefault();
            router.push("/", {
              onTransitionReady: pageAnimation,
            });
          }}
        >
          <Image
            src={imageLogo}
            alt="1SP Logo"
            width={90}
            height={90}
            className="object-contain"
          />
        </Link>
      </motion.div>
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 1,
          y: 10,
          originX: 0,
          originY: 0,
        }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 1.4,
        }}
        className="flex-1 flex justify-end"
      >
        <StaggeredSlideUp
          className="flex gap-16 items-center"
          delay={0.55}
          staggerDelay={0.02}
          duration={0.8}
          distance={10}
          maskHeight="150%"
          easing="spring"
        >
          <span className={`${textColor}  text-xs leading-compress font-bold`}>
            <Link
              className="hover:text-violet-600"
              href={"/"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Home
            </Link>
          </span>
          <span className={`${textColor} text-xs leading-compress font-bold`}>
            {" "}
            <Link
              className="hover:text-violet-600"
              href={"/cases"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/cases", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Projects
            </Link>
          </span>
          <span
            className={`${textColor} text-xs leading-compress font-bold hover:text-violet-700`}
          >
            <Link
              className="hover:text-violet-600"
              href={"/whatwedo"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/whatwedo", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Services
            </Link>
          </span>
          <span
            className={`${textColor} text-xs leading-compress font-bold hover:text-violet-700`}
          >
            <Link
              className="hover:text-violet-600"
              href={"/whatwedo"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/whatwedo", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              About us
            </Link>
          </span>
        </StaggeredSlideUp>
      </motion.div>{" "}
      <motion.div
        className="w-[90px] ml-12 flex-shrink-0 pt-2"
        initial={{
          opacity: 0,
          scaleX: 1,
          y: 10,
          originX: 0,
          originY: 0,
        }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 1.4,
        }}
      >
        <Image
          src="/ci/1sp-fulllogotype-blk.svg"
          alt="1SP Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </motion.div>
    </motion.nav>
  );
};
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
export default FrontNavOverlay;
