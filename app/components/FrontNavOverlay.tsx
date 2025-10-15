"use client";
import Button2 from "./Button2";
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
      className={`hidden relative  md:grid place-items-start z-10 grid-cols-12 pt-5 mx-auto container ${className}`}
    >
      <div className="w-[90px] h-[90px] col-start-1 col-span-1 ">
        <Link
          className="hover:text-lime-400"
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
        className="col-start-3  pt-3 flex  col-span-9 "
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
              className="hover:text-lime-400"
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
              className="hover:text-lime-400"
              href={"/cases"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/cases", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Cases
            </Link>
          </span>
          <span
            className={`${textColor} text-xs leading-compress font-bold hover:text-lime-500`}
          >
            <Link
              className="hover:text-lime-400"
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
            className={`${textColor} text-xs leading-compress font-bold hover:text-lime-500`}
          >
            <Link
              className="hover:text-lime-400"
              href={"/our-family"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/our-family", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Our Family
            </Link>
          </span>
          <span
            className={`${textColor} text-xs leading-compress font-bold hover:text-lime-500`}
          >
            <Link
              className="hover:text-lime-400"
              href={"/whatwedo"}
              onClick={(e) => {
                e.preventDefault();
                router.push("/whatwedo", {
                  onTransitionReady: pageAnimation,
                });
              }}
            >
              Work with us
            </Link>
          </span>{" "}
        </StaggeredSlideUp>
      </motion.div>{" "}
      <div className="w-fit flex  w-fit  min-w-[120px]  justify-end col-start-12 col-span-1 pt-2">
        <Button2 variant="limesmall" text="Contact us" />
      </div>
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
