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
  const textColor = color === "dark" ? "text-neutral-800" : "text-neutral-50";
  const imageLogo =
    color === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";
  return (
    <nav
      className={`relative hidden md:grid  z-10 grid-cols-12 pt-5 mx-auto container ${className}`}>
      <div className="w-[90px] h-[90px] col-start-1 col-span-1 pt-2">
        <Image
          src={imageLogo}
          alt="1SP Logo"
          width={90}
          height={90}
          className="object-contain"
        />
      </div>
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
          y: 10,
          originX: 0,
          originY: 0,
        }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.4,
        }}
        className="col-start-2 grid grid-cols-12 col-span-6">
        <StaggeredSlideUp
          className="grid grid-cols-12 col-span-12 pb-2 flex-wrap items-center"
          delay={0.55}
          staggerDelay={0.02}
          duration={0.8}
          distance={10}
          maskHeight="150%"
          easing="spring">
          <span className={`${textColor}  text-xxs leading-compress font-bold`}>
            <Link
              className="hover:text-lime-400"
              href={"/"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/", {
                  onTransitionReady: pageAnimation,
                });
              }}>
              Home
            </Link>
          </span>
          <span
            className={`${textColor} text-xxs leading-compress font-bold`}></span>
          <span className={`${textColor} text-xxs leading-compress font-bold`}>
            {" "}
            <Link
              className="hover:text-lime-400"
              href={"/projects"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/projects", {
                  onTransitionReady: pageAnimation,
                });
              }}>
              Project
            </Link>
          </span>
          <span
            className={`${textColor} text-xxs leading-compress font-bold`}></span>
          <span
            className={`${textColor} text-xxs leading-compress font-bold hover:text-lime-500`}>
            {" "}
            <Link
              className="hover:text-lime-400"
              href={"/whatwedo"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/whatwedo", {
                  onTransitionReady: pageAnimation,
                });
              }}>
              What we do
            </Link>
          </span>
        </StaggeredSlideUp>
        <div className="grid grid-cols-12 col-span-12 items-start">
          <StaggeredSlideUp
            className="col-start-1 col-span-1"
            delay={1}
            staggerDelay={0.02}
            duration={0.1}
            distance={10}>
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Marketing
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Social
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Design
            </span>{" "}
          </StaggeredSlideUp>
          <StaggeredSlideUp
            className="col-start-3 col-span-1"
            delay={1.25}
            staggerDelay={0.02}
            duration={0.1}
            distance={10}>
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              AR / VR
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              POS
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Campaign
            </span>{" "}
          </StaggeredSlideUp>
          <StaggeredSlideUp
            className="col-start-5 col-span-1"
            delay={1.425}
            staggerDelay={0.02}
            duration={0.1}
            distance={10}>
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              EA GAMES
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              SAMSUNG
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              MICROSOFT
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              META
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              MARSHALL
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              BLIZZARD
            </span>{" "}
          </StaggeredSlideUp>
          <StaggeredSlideUp
            className="col-start-7 col-span-1"
            delay={1.75}
            staggerDelay={0.02}
            duration={0.1}
            distance={10}>
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Our Story
            </span>{" "}
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              Work with us
            </span>
            <span
              className={`${textColor} text-xxs leading-compress font-normal`}>
              What we do
            </span>{" "}
          </StaggeredSlideUp>
        </div>{" "}
      </motion.div>{" "}
    </nav>
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
