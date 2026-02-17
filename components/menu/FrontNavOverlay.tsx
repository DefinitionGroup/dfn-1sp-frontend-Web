"use client";
import React from "react";
import Image from "next/image";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Link } from "next-view-transitions";
import { useOptimizedTransitionRouter } from "@/hooks/use-optimized-transition-router";
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
  const router = useOptimizedTransitionRouter();
  const pathname = usePathname() || "";
  const [showOverlay, setShowOverlay] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);

  // Scroll direction detection for show/hide navbar
  const { scrollY } = useScroll();
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [hasInitialAnimationCompleted, setHasInitialAnimationCompleted] = React.useState(false);
  const lastScrollY = React.useRef(0);

  // Mark initial animation as complete after delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialAnimationCompleted(true);
    }, 1700); // Wait for initial animation (1s duration + 0.7s delay)
    return () => clearTimeout(timer);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hasInitialAnimationCompleted) return; // Don't hide during initial animation

    const direction = latest > lastScrollY.current ? "down" : "up";
    const threshold = 10; // Minimum scroll distance to trigger show/hide

    if (Math.abs(latest - lastScrollY.current) > threshold) {
      if (direction === "down" && latest > 100) {
        setIsNavVisible(false);
      } else if (direction === "up") {
        setIsNavVisible(true);
      }
      lastScrollY.current = latest;
    }
  });

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

  // Decide effective color: prefer explicit `color` prop (page setting),
  // otherwise fall back to route-based defaults for legacy pages
  const effectiveColor = React.useMemo(() => {
    if (color) return color;
    if (isCaseDetailRoute) return "light";
    if (isAnyCasesRoute) return "dark";
    return "light";
  }, [isCaseDetailRoute, isAnyCasesRoute, color]);

  const [detectedTheme, setDetectedTheme] = React.useState<"light" | "dark">(
    effectiveColor
  );

  // Keep detectedTheme in sync with effectiveColor prop
  React.useEffect(() => {
    setDetectedTheme(effectiveColor);
  }, [effectiveColor]);

  // Disable body scroll when overlay is open
  React.useEffect(() => {
    if (showOverlay) {
      // Get current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling on both html and body
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Cleanup: restore scroll when overlay closes
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showOverlay]);

  const textColor =
    detectedTheme === "dark" ? "text-neutral-800 " : "text-neutral-50 ";
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

  const itemClass = `text-xs leading-compress tracking-wide font-medium mr-8 inline-block `;

  return (
    <>
      <motion.nav

        ref={navRef}
        initial={{ opacity: 0, scale: 0.95, y: 0, clipPath: "inset(45% 49.9% 45% 49.9% round 48%)", backdropFilter: "blur(1px)", backgroundColor: "rgba(255, 255, 255, 1)" }}
        animate={
          hasInitialAnimationCompleted
            ? {
              opacity: isNavVisible ? 1 : 0,
              y: isNavVisible ? 0 : -100,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0% round 2rem)",
              backdropFilter: "blur(12px)",
              backgroundColor: "rgba(111,111,111, 0.4)"
            }
            : {
              opacity: [0, 1, 1],
              scale: [2, 1, 1],
              clipPath: [
                "inset(49% 49% 49% 49% round 50%)", // tiny circle
                "inset(0% 49% 0% 49% round 2rem)",       // full height pill
                "inset(0% 49% 0% 49% round 2rem)",       // full height pill
                "inset(0% 0% 0% 0% round 2rem)"          // full width menu
              ],
              backdropFilter: "blur(12px)",
              backgroundColor: "rgba(111,111,111, 0.4)"
            }
        }
        transition={
          hasInitialAnimationCompleted
            ? {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }
            : {
              duration: 1,
              delay: 0.7,
            }
        }
        className={`floating-nav z-99999   hidden fixed top-6 left-0 backdrop-blur-xl rounded-4xl border border-white/20 w-fit h-16  px-6  right-0 md:grid items-center z-50 grid-cols-12 py-2  mx-auto ${textColor} ${className}`}
      >
        <div className="col-span-2 flex items-center pr-16  justify-start">
          <motion.div

            className=" flex items-start  justify-center">
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
                width={64}
                height={64}
                className="object-contain transition-all duration-300"
                style={{ height: "auto" }}
              />
            </Link>
          </motion.div>
        </div>

        <motion.div

          className="col-span-7   flex items-center "
        >


          {menuData?.menuItems && menuData.menuItems.length > 0 ? (
            <StaggeredSlideUp
              className="flex items-center "
              delay={1.3}
              staggerDelay={0.08}
              duration={0.5}
              distance={10}
              easing="spring"
              rootMargin="0px 0px -20px 0px"
              once={true}
              animateImmediately={true}
            >
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
                      className="hover:text-lime-400  transition-colors "
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
            </StaggeredSlideUp>
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


        </motion.div>

        <div className="col-span-3 flex relative justify-end items-center align-start   gap-1">
          {/* All Cases button only on case detail pages */}
          {isCaseDetailRoute && (
            <button
              type="button"
              className={`border rounded-full min-w-[80px] inline-block py-2 px-2 text-xxs font-bold cursor-pointer hover:text-lime-400 hover:border-lime-400 transition-colors`}
              onClick={() => setShowOverlay(true)}
            >
              All Cases
            </button>
          )}
          <div className="min-w-[110px] w-[50px] max-w-[110px] n block relative   -right-2 top-1 rounded-full ">
            <Button2
              variant="limesmall"
              className="min-w-[110px] w-[50px] max-w-[110px] overflow-hidden block absolute  rounded-full "
              href={`/${locale}/contact`}
              text="Contact us"
            />
          </div>
        </div>


      </motion.nav>
      {/* Cases overlay */}
      {showOverlay && (
        <div className="fixed inset-0 flex items-center justify-center p-8 backdrop-blur-lg z-[100] bg-black/20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -50,
              transition: { duration: 0.4, type: "spring", bounce: 0.06 },
            }}
            transition={{ type: "spring", visualDuration: 0.25, bounce: 0.56 }}
            className="relative w-full max-w-[900px] max-h-[calc(100vh-4rem)] rounded-xl flex flex-col bg-neutral-100 dark:bg-neutral-900 shadow-2xl overflow-y-auto"
          >
            <button
              aria-label="Close overlay"
              className="sticky top-2 ml-auto mr-2 hover:rotate-45 cursor-pointer transition duration-200 z-50 p-2"
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
            <div className="pb-8">
              <CaseGalleryMenu caseStudies={caseStudies} locale={locale} />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default FrontNavOverlay;
