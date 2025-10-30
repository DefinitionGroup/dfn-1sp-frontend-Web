"use client";
import React from "react";
import Image from "next/image";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { motion } from "motion/react";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import CaseGalleryMenu from "../data/data-CaseGalleryMenu";
import Button2 from "../ui/Button2";
import { NavbarMenu } from "@/types/menu.types";

interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark";
  menuData?: NavbarMenu | null;
  locale?: string;
  hasCaseStudies?: boolean;
  caseStudies?: any[];
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
  menuData,
  locale = "en",
  hasCaseStudies = false,
  caseStudies = [],
}) => {
  const router = useTransitionRouter();
  const pathname = usePathname() || "";
  const [showOverlay, setShowOverlay] = React.useState(false);

  // Match case detail pages: /cases/[slug] or /locale/cases/[slug]
  const isCaseDetailRoute = React.useMemo(() => {
    if (!pathname) return false;
    return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?cases\/[^/]+/.test(pathname);
  }, [pathname]);

  // Match any /cases route (including main /cases)
  const isAnyCasesRoute = React.useMemo(() => {
    if (!pathname) return false;
    return /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?cases(?:\/|$)/.test(pathname);
  }, [pathname]);

  // Decide effective color
  const effectiveColor = React.useMemo(() => {
    if (isCaseDetailRoute) return "light";
    if (isAnyCasesRoute) return "dark";
    return color;
  }, [isCaseDetailRoute, isAnyCasesRoute, color]);

  const effectiveTextColor =
    effectiveColor === "dark" ? "text-neutral-800" : "text-neutral-50";

  const textColor = effectiveTextColor;
  const imageLogo =
    effectiveColor === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";

  const logoUrl = imageLogo;

  // Detect if Sanity menu already contains a Cases link
  const hasCasesLinkInMenu =
    !!menuData?.menuItems &&
    menuData.menuItems.some((item) => {
      const slug = item.slug?.toLowerCase() || "";
      const title = (item.displayName || item.title || "")
        .toString()
        .toLowerCase();
      return (
        slug.includes("cases") || title === "cases" || title.includes("cases")
      );
    });

  const itemClass = `${textColor} text-xs leading-compress font-bold mr-8 inline-block`;

  return (
    <nav
      className={`hidden absolute top-0 left-0 right-0 md:grid items-center z-50 grid-cols-12 gap-4 py-5 container mx-auto ${textColor} ${className}`}
    >
      <div className="col-span-1 flex items-center justify-center">
        <div className=" flex items-center justify-center">
          <Link
            href={`/${locale}`}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/${locale}`, {
                onTransitionReady: pageAnimation,
              });
            }}
            aria-label="Home"
            className="flex items-center justify-center"
          >
            <Image
              src={logoUrl}
              alt="1SP Logo"
              width={90}
              height={90}
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0, y: 10, originX: 0, originY: 0 }}
        animate={{ opacity: 1, scaleX: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="col-span-9 flex items-center"
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
            <>
              {menuData.menuItems
                .filter((item) => {
                  const isCasesPage = item.slug?.includes("cases");
                  if (isCasesPage && !hasCaseStudies) {
                    return false;
                  }
                  return true;
                })
                .map((item) => (
                  <span key={item._key} className={itemClass}>
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
                ))}

              {hasCaseStudies && !hasCasesLinkInMenu && (
                <span key="cases-fallback" className={itemClass}>
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
              )}
            </>
          ) : (
            <>
              <span className={itemClass}>
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
              {hasCaseStudies && (
                <span className={itemClass}>
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
              )}
              <span className={itemClass}>
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
              <span className={itemClass}>
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
              <span className={itemClass}>
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

      <div className="col-span-2 flex justify-end items-center gap-4">
        {/* All Cases button only on case detail pages */}
        {isCaseDetailRoute && (
          <div className="flex items-center">
            <button
              type="button"
              className={`border rounded-full inline-block mt-2 py-1 px-2 ${textColor} text-xxs font-bold cursor-pointer hover:text-lime-400`}
              onClick={() => setShowOverlay(true)}
            >
              All Cases
            </button>
          </div>
        )}
        <Button2 variant="limesmall" text="Contact us" />
      </div>

      {/* Cases overlay */}
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
            transition={{ type: "spring", visualDuration: 0.25, bounce: 0.56 }}
          >
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-[900px] min-h-[70vh] h-full md:h-fit md:max-h-[85vh] rounded-xl flex flex-col bg-neutral-100 dark:bg-neutral-900 shadow-2xl overflow-hidden">
                <button
                  aria-label="Close overlay"
                  className="absolute top-2 right-2 z-50 p-2"
                  onClick={() => setShowOverlay(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-black"
                  >
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
                <div>
                  <CaseGalleryMenu caseStudies={caseStudies} locale={locale} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
