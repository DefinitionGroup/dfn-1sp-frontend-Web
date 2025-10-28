"use client";
import Button2 from "./ui/Button2";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import StaggeredSlideUp from "./StaggeredSlideUp";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import CaseGalleryMenu from "./CaseGalleryMenu";
import { useTransitionRouter } from "next-view-transitions";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark";
}

const FrontNavOverlayCases: React.FC<FrontNavOverlayProps> = ({
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

  // ESC to close + lock scroll while overlay open
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowOverlay(false);
    }

    document.body.style.overflow = showOverlay ? "hidden" : "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showOverlay]);

  useOutsideClick(ref, () => setShowOverlay(false));

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <div className="fixed inset-0 grid place-items-center backdrop-blur-lg z-[100] bg-black/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -50,
                transition: { duration: 0.4, type: "spring", bounce: 0.06 },
              }}
              transition={{
                type: "spring",
                visualDuration: 0.25,
                bounce: 0.56,
              }}
              ref={ref}
            >
              <div className="flex justify-center items-center">
                <div className="relative w-full max-w-[900px] min-h-[70vh] h-full md:h-fit md:max-h-[85vh] rounded-xl flex flex-col bg-neutral-100 dark:bg-neutral-900 shadow-2xl overflow-hidden">
                  <motion.button
                    layout
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1, transition: { duration: 0.05 } }}
                    className="flex absolute top-2 right-2 items-center cursor-pointer justify-around rounded-full h-6 w-6 z-50"
                    aria-label="Close overlay"
                  >
                    <CloseIcon onClick={() => setShowOverlay(false)} />
                  </motion.button>
                  <CaseGalleryMenu />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top nav (match Plaintext layout/styling) */}
      <nav
        className={`hidden relative md:flex gap-8 z-10 pt-5 items-start mx-auto container ${className}`}
      >
        {/* Logo */}
        <div className="w-[90px] h-[90px] col-start-1 col-span-1">
          <Link
            className="hover:text-lime-400"
            href={"/"}
            onClick={(e) => {
              e.preventDefault();
              router.push("/", { onTransitionReady: pageAnimation });
            }}
            aria-label="Home"
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

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0, y: 10, originX: 0, originY: 0 }}
          animate={{ opacity: 1, scaleX: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-start-2 flex-grow pt-3 flex row-start-1"
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
            <span className={`${textColor} text-xs leading-compress font-bold`}>
              <Link
                className="hover:text-lime-400"
                href={"/"}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/", { onTransitionReady: pageAnimation });
                }}
              >
                Home
              </Link>
            </span>
            <span className={`${textColor} text-xs leading-compress font-bold`}>
              <Link
                className="hover:text-lime-400"
                href={"/cases"}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cases", { onTransitionReady: pageAnimation });
                }}
              >
                Cases
              </Link>
            </span>
            <span className={`${textColor} text-xs leading-compress font-bold`}>
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
            <span className={`${textColor} text-xs leading-compress font-bold`}>
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
            <span className={`${textColor} text-xs leading-compress font-bold`}>
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
            </span>
          </StaggeredSlideUp>
        </motion.div>

        {/* Right block: All Cases + CTA */}
        <div className="min-w-[300px] flex gap-8 items-center">
          <button
            type="button"
            className={`border rounded-full inline-block mt-2 py-1 px-2 ${textColor} text-xxs font-bold cursor-pointer hover:text-lime-400`}
            onClick={() => setShowOverlay(true)}
          >
            All Cases
          </button>
          <div className="flex min-w-[120px] items-end justify-end">
            <Button2 variant="limesmall" text="Contact us" className="mt-2" />
          </div>
        </div>
      </nav>
    </>
  );
};

const pageAnimation = () => {
  document.documentElement.animate(
    [
      { opacity: 1, scale: 1, transform: "translateY(0)" },
      { opacity: 1, scale: 0.9, transform: "translateY(-100px)" },
    ],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
};

const CloseIcon = ({ onClick }: { onClick?: () => void }) => (
  <motion.svg
    whileHover={{ rotate: 90 }}
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-black z-50 cursor-pointer"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

export default FrontNavOverlayCases;
