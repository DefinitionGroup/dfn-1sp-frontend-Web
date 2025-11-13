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
  hasServices?: boolean;
  services?: any[];
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
  menuData,
  locale = "en",
  hasCaseStudies = false,
  caseStudies = [],
  hasServices = false,
  services = [],
}) => {
  const router = useTransitionRouter();
  const pathname = usePathname() || "";
  const [showOverlay, setShowOverlay] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);

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

  // Decide effective color based on route
  const effectiveColor = React.useMemo(() => {
    if (isCaseDetailRoute) return "light";
    if (isAnyCasesRoute) return "dark";
    return color;
  }, [isCaseDetailRoute, isAnyCasesRoute, color]);

  const [detectedTheme, setDetectedTheme] = React.useState<"light" | "dark">(
    effectiveColor
  );

  // Detect background brightness and set theme
  React.useEffect(() => {
    let animationFrameId: number | null = null;
    let lastDetectedTheme: "light" | "dark" | null = null;

    const detectBackground = () => {
      if (!navRef.current) return null;

      const nav = navRef.current;
      const rect = nav.getBoundingClientRect();

      // Sample multiple points to get better detection
      const points = [
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, // center
        { x: rect.left + rect.width * 0.25, y: rect.top + rect.height / 2 }, // left
        { x: rect.left + rect.width * 0.75, y: rect.top + rect.height / 2 }, // right
      ];

      let whiteBackgroundCount = 0;
      let samplesCount = 0;

      // Hide nav temporarily to sample background
      const originalVisibility = nav.style.visibility;
      const originalPointerEvents = nav.style.pointerEvents;
      nav.style.visibility = "hidden";
      nav.style.pointerEvents = "none";

      for (const point of points) {
        const elementBehind = document.elementFromPoint(point.x, point.y);
        if (elementBehind) {
          let currentElement: HTMLElement | null = elementBehind as HTMLElement;

          // Walk up the DOM tree to find the first non-transparent background
          let depth = 0;
          while (
            currentElement &&
            currentElement !== document.documentElement &&
            depth < 10
          ) {
            const computedStyle = window.getComputedStyle(currentElement);
            const bgColor = computedStyle.backgroundColor;

            // Check if background is not transparent
            const rgbMatch = bgColor.match(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
            );
            if (rgbMatch) {
              const alpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
              if (alpha > 0.1) {
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);

                samplesCount++;

                // Check if it's white or very close to white (RGB values all above 240)
                if (r >= 240 && g >= 240 && b >= 240) {
                  whiteBackgroundCount++;
                }
                break;
              }
            }
            currentElement = currentElement.parentElement;
            depth++;
          }

          // If we reached the end without finding a background, assume white
          if (
            depth >= 10 ||
            !currentElement ||
            currentElement === document.documentElement
          ) {
            whiteBackgroundCount++;
            samplesCount++;
          }
        }
      }

      nav.style.visibility = originalVisibility;
      nav.style.pointerEvents = originalPointerEvents;

      if (samplesCount > 0) {
        // If most samples are white, use dark text; otherwise use light text
        const newTheme =
          whiteBackgroundCount > samplesCount / 2 ? "dark" : "light";

        // Only update if theme changed
        if (newTheme !== lastDetectedTheme) {
          lastDetectedTheme = newTheme;
          setDetectedTheme(newTheme);
          console.log(
            `🎨 Navbar theme: ${whiteBackgroundCount}/${samplesCount} white samples → ${newTheme} text`
          );
        }

        return newTheme;
      } else {
        // Fallback to effectiveColor
        if (effectiveColor !== lastDetectedTheme) {
          lastDetectedTheme = effectiveColor;
          setDetectedTheme(effectiveColor);
          console.log(`🎨 Navbar using fallback theme: ${effectiveColor}`);
        }
        return effectiveColor;
      }
    };

    // Continuous monitoring loop
    const monitorBackground = () => {
      detectBackground();
      animationFrameId = requestAnimationFrame(monitorBackground);
    };

    // Wait for page animations to settle before initial detection
    const initialTimer = setTimeout(() => {
      // Use effectiveColor initially to avoid flickering
      setDetectedTheme(effectiveColor);
    }, 100);

    // Delay monitoring start to let animations complete (most animations are < 1s)
    const monitorTimer = setTimeout(() => {
      detectBackground();
      // Start continuous monitoring after animations settle
      animationFrameId = requestAnimationFrame(monitorBackground);
    }, 1200);

    // Periodic revalidation every 2 seconds to catch lazy-loaded content
    const revalidationInterval = setInterval(() => {
      detectBackground();
    }, 5000);

    // Also detect on scroll and resize as fallback
    const handleScroll = () => detectBackground();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(monitorTimer);
      clearInterval(revalidationInterval);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [effectiveColor, pathname]);

  const textColor =
    detectedTheme === "dark" ? "text-neutral-800" : "text-neutral-50";
  const imageLogo =
    detectedTheme === "dark"
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

  // Detect if Sanity menu already contains a Services link
  const hasServicesLinkInMenu =
    !!menuData?.menuItems &&
    menuData.menuItems.some((item) => {
      const slug = item.slug?.toLowerCase() || "";
      const title = (item.displayName || item.title || "")
        .toString()
        .toLowerCase();
      return (
        slug.includes("services") ||
        title === "services" ||
        title.includes("services")
      );
    });

  const itemClass = `text-xs leading-compress font-bold mr-8 inline-block transition-colors duration-300`;

  return (
    <nav
      ref={navRef}
      className={`hidden absolute top-0 left-0 right-0 md:grid items-center z-50 grid-cols-12 gap-4 py-5 container mx-auto ${textColor} ${className}`}
    >
      <div className="col-span-1 flex items-center justify-center">
        <div className=" flex items-center justify-center">
          <Link
            href={`/${locale}`}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/${locale}`);
            }}
            aria-label="Home"
            className="flex items-center justify-center"
          >
            <Image
              src={logoUrl}
              alt="1SP Logo"
              width={90}
              height={90}
              className="object-contain transition-all duration-300"
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
                  const isServicesPage = item.slug?.includes("services");
                  if (isCasesPage && !hasCaseStudies) {
                    return false;
                  }
                  if (isServicesPage && !hasServices) {
                    return false;
                  }
                  return true;
                })
                .map((item) => (
                  <span key={item._key} className={itemClass}>
                    <Link
                      className="hover:text-lime-400 transition-colors"
                      href={`/${item.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/${item.slug}`);
                      }}
                    >
                      {item.displayName || item.title}
                    </Link>
                  </span>
                ))}
            </>
          ) : (
            <>
              <span className={itemClass}>
                <Link
                  className="hover:text-lime-400 transition-colors"
                  href={`/${locale}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}`);
                  }}
                >
                  Home
                </Link>
              </span>
              <span className={itemClass}>
                <Link
                  className="hover:text-lime-400 transition-colors"
                  href={`/${locale}/whatwedo`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/whatwedo`);
                  }}
                >
                  Services
                </Link>
              </span>
              <span className={itemClass}>
                <Link
                  className="hover:text-lime-400 transition-colors"
                  href={`/${locale}/our-family`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/our-family`);
                  }}
                >
                  Our Family
                </Link>
              </span>
              <span className={itemClass}>
                <Link
                  className="hover:text-lime-400 transition-colors"
                  href={`/${locale}/whatwedo`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/${locale}/whatwedo`);
                  }}
                >
                  Work with us
                </Link>
              </span>
            </>
          )}
        </StaggeredSlideUp>
      </motion.div>

      <div className="col-span-2 flex justify-center items-center gap-4">
        {/* All Cases button only on case detail pages */}
        {isCaseDetailRoute && (
          <button
            type="button"
            className={`border rounded-full min-w-[80px] inline-block py-1 px-2 text-xxs font-bold cursor-pointer hover:text-lime-400 hover:border-lime-400 transition-colors`}
            onClick={() => setShowOverlay(true)}
          >
            All Cases
          </button>
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

export default FrontNavOverlay;
