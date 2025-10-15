"use client";
import Button2 from "./Button2";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import StaggeredSlideUp from "./StaggeredSlideUp";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import CaseGalleryMenu from "./CaseGalleryMenu";
import { useTransitionRouter } from "next-view-transitions";
import { useOutsideClick } from "../hooks/use-outside-click";
interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark"; // light = neutral-50 (default), dark = neutral-800
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
}) => {
  const router = useTransitionRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const textColor = color === "dark" ? "text-neutral-800" : "text-neutral-50";
  const imageLogo =
    color === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowOverlay(false);
      }
    }

    if (showOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showOverlay]);

  useOutsideClick(ref, () => setShowOverlay(false));

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.2,
              transition: { type: "spring", stiffness: 20 },
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full backdrop-blur-lg w-full z-10"
          ></motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOverlay && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
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
              onClick={() => setShowOverlay(false)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
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
              className="w-full max-w-[900px] min-h-[70vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-100 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-center items-center h-full">
                {/* Empty div as requested */}
                <div>
                  <CaseGalleryMenu />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
          className="col-start-3  pt-3 flex  col-span-9 row-start-1 "
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
            <span
              className={`${textColor}  text-xs leading-compress font-bold`}
            >
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
        <a
          className={`w-fit flex row-start-1 justify-end col-start-10 col-span-1 border rounded-xs mt-2 p-2 ${textColor} text-xs font-bold cursor-pointer hover:text-lime-400`}
          onClick={() => setShowOverlay(true)}
        >
          All Cases
        </a>
        <div className="w-fit flex  w-fit row-start-1 min-w-[120px]  justify-end col-start-12 col-span-1 pt-2">
          <Button2 variant="limesmall" text="Contact us" />
        </div>
      </nav>
    </>
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

const CloseIcon = () => {
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
