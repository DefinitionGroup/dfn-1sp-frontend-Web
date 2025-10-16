"use client";
import React from "react";
import Image from "next/image";
import StaggeredSlideUp from "./StaggeredSlideUp";
import { motion } from "motion/react";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import Button2 from "./ui/Button2";
import { NavbarMenu } from "@/types/menu.types";

interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark";
  menuData?: NavbarMenu | null;
  locale?: string;
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
  menuData,
  locale = "en",
}) => {
  const router = useTransitionRouter();
  const textColor = color === "dark" ? "text-neutral-800" : "text-neutral-50";
  const imageLogo =
    color === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";

  // Use Sanity logo if available, otherwise use default
  const logoUrl = menuData?.logoUrl || imageLogo;

  return (
    <nav
      className={`hidden absolute top-0 left-0 right-0 md:grid place-items-start z-50 grid-cols-12 pt-5 mx-auto container ${className}`}
    >
      <div className="w-[90px] h-[90px] col-start-1 col-span-1 pt-2">
        <Image
          src={logoUrl}
          alt="1SP Logo"
          width={90}
          height={90}
          className="object-contain"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0, y: 10, originX: 0, originY: 0 }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="col-start-2 flex col-span-9"
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
          {menuData?.menuItems && menuData.menuItems.length > 0 ? (
            // Render menu items from Sanity
            menuData.menuItems.map((item) => (
              <span
                key={item._key}
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${item.slug}`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  {item.displayName || item.title}
                </Link>
              </span>
            ))
          ) : (
            // Fallback to default menu items if no Sanity data
            <>
              <span
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${locale}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  Home
                </Link>
              </span>
              <span
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${locale}/cases`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/cases`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  Cases
                </Link>
              </span>
              <span
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${locale}/whatwedo`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/whatwedo`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  Services
                </Link>
              </span>
              <span
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${locale}/our-family`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/our-family`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  Our Family
                </Link>
              </span>
              <span
                className={`${textColor} text-xs leading-compress font-bold`}
              >
                <Link
                  className="hover:text-lime-400"
                  href={`/${locale}/whatwedo`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/whatwedo`, {
                      onTransitionReady: pageAnimation,
                    });
                  }}
                >
                  Work with us
                </Link>
              </span>
            </>
          )}
        </StaggeredSlideUp>
      </motion.div>

      <div className="w-fit flex min-w-[120px] justify-end col-start-11 col-span-2 pt-2">
        <Button2 variant="limesmall" text="Contact us" />
      </div>
    </nav>
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

export default FrontNavOverlay;
