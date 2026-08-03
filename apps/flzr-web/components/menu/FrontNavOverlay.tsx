"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import StaggeredSlideUp from "../ui/StaggeredSlideUp";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import { usePathname } from "next/navigation";
import CaseGalleryMenu from "../data/data-CaseGalleryMenu";
import Button2 from "../ui/Button2";
import { NavbarMenu } from "@1sp/sanity-types/menu";
import LanguageSelector, { type LanguageOption } from "./LanguageSelector";

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string; taglabel?: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
}

interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark";
  menuData?: NavbarMenu | null;
  channel?: string;
  locale?: string;
  hasCaseStudies?: boolean;
  hasServices?: boolean;
  initialCaseStudies?: CaseStudy[];
  languageOptions?: LanguageOption[];
}

const NAV_COPY: Record<
  string,
  {
    allCases: string;
    projects: string;
    services: string;
    loading: string;
    error: string;
    empty: string;
  }
> = {
  en: {
    allCases: "All Cases",
    projects: "Projects",
    services: "Services",
    loading: "Loading cases...",
    error: "Unable to load cases right now.",
    empty: "No cases available right now.",
  },
  de: {
    allCases: "Alle Cases",
    projects: "Projekte",
    services: "Leistungen",
    loading: "Cases werden geladen...",
    error: "Cases können gerade nicht geladen werden.",
    empty: "Aktuell sind keine Cases verfügbar.",
  },
  pl: {
    allCases: "Wszystkie realizacje",
    projects: "Realizacje",
    services: "Usługi",
    loading: "Ładowanie realizacji...",
    error: "Nie można teraz załadować realizacji.",
    empty: "Obecnie brak dostępnych realizacji.",
  },
};

const NAV_COMPACT_SCROLL_Y = 64;
const NAV_HIDE_SCROLL_Y = 228;
const NAV_DIRECTION_THRESHOLD = 4;
const NAV_IDLE_HIDE_MS = 3000;

type NavState = "expanded" | "compact" | "hidden";

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
  menuData,
  channel = "1spWeb",
  locale = "en",
  hasCaseStudies = false,
  hasServices = false,
  initialCaseStudies = [],
  languageOptions = [],
}) => {
  const router = useOptimizedTransitionRouter();
  const pathname = usePathname() || "";
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [caseStudies, setCaseStudies] =
    React.useState<CaseStudy[]>(initialCaseStudies);
  const [isCasesLoading, setIsCasesLoading] = React.useState(false);
  const [hasLoadedCases, setHasLoadedCases] = React.useState(
    initialCaseStudies.length > 0,
  );
  const [casesLoadError, setCasesLoadError] = React.useState<string | null>(
    null,
  );
  const navRef = React.useRef<HTMLElement>(null);
  const copy = NAV_COPY[locale] ?? NAV_COPY.en;
  const isFlzrChannel = channel === "flizrWeb";

  // The nav starts in page flow, compacts into the floating treatment after
  // 64px, stays visible while scrolling, then hides after three idle seconds.
  const { scrollY } = useScroll();
  const [navState, setNavState] = React.useState<NavState>("expanded");
  const lastScrollY = React.useRef(0);
  const navIdleTimer = React.useRef<number | null>(null);
  const isExpanded = navState === "expanded";
  const isNavVisible = navState !== "hidden";

  function clearNavIdleTimer() {
    if (navIdleTimer.current !== null) {
      window.clearTimeout(navIdleTimer.current);
      navIdleTimer.current = null;
    }
  }

  function scheduleNavIdleHide() {
    clearNavIdleTimer();
    navIdleTimer.current = window.setTimeout(() => {
      setNavState("hidden");
      navIdleTimer.current = null;
    }, NAV_IDLE_HIDE_MS);
  }

  React.useEffect(() => {
    const currentScrollY = window.scrollY;
    lastScrollY.current = currentScrollY;

    if (currentScrollY <= NAV_COMPACT_SCROLL_Y) {
      setNavState("expanded");
    } else if (isFlzrChannel) {
      setNavState("compact");
      scheduleNavIdleHide();
    } else if (currentScrollY <= NAV_HIDE_SCROLL_Y) {
      setNavState("compact");
    } else {
      setNavState("hidden");
    }

    return clearNavIdleTimer;
  }, [isFlzrChannel]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current;

    if (isFlzrChannel) {
      lastScrollY.current = latest;

      if (latest <= NAV_COMPACT_SCROLL_Y) {
        clearNavIdleTimer();
        setNavState("expanded");
      } else {
        setNavState("compact");
        scheduleNavIdleHide();
      }
      return;
    }

    if (Math.abs(delta) < NAV_DIRECTION_THRESHOLD) {
      return;
    }

    lastScrollY.current = latest;

    if (latest <= NAV_COMPACT_SCROLL_Y) {
      clearNavIdleTimer();
      setNavState("expanded");
    } else if (delta < 0) {
      setNavState("compact");
    } else if (latest >= NAV_HIDE_SCROLL_Y) {
      setNavState("hidden");
    } else {
      setNavState("compact");
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
    effectiveColor,
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
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Cleanup: restore scroll when overlay closes
      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showOverlay]);

  const textColor =
    detectedTheme === "dark" ? "text-neutral-800 " : "text-neutral-50 ";
  const isFlzrScrolled = isFlzrChannel && !isExpanded;
  const navTextColor = isFlzrChannel
    ? isFlzrScrolled
      ? "text-white"
      : "text-flzr-violet"
    : textColor;
  const desktopSurfaceClass = isFlzrChannel
    ? isFlzrScrolled
      ? "border border-white/10 bg-neutral-900/60 shadow-lg shadow-black/15 backdrop-blur-xl"
      : "border border-transparent bg-transparent shadow-none backdrop-blur-none"
    : "border border-transparent bg-neutral-600/40 backdrop-blur-md";
  const mobileSurfaceClass = isFlzrChannel
    ? isFlzrScrolled
      ? "border border-white/10 bg-neutral-900/60 shadow-lg shadow-black/15 backdrop-blur-xl"
      : "border border-transparent bg-transparent shadow-none backdrop-blur-none"
    : "border border-white/15 bg-neutral-600/40 shadow-lg backdrop-blur-xl";
  const imageLogo = isFlzrChannel
    ? "/units/FLZR/flzr_logo.svg"
    : detectedTheme === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";
  const logoUrl = imageLogo;
  const logoAlt = isFlzrChannel ? "FLZR Logo" : "1SP Logo";
  const logoClassName = [
    "object-contain transition-[filter] duration-300",
    isFlzrChannel
      ? isFlzrScrolled
        ? "brightness-0 invert"
        : "brightness-0"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  React.useEffect(() => {
    if (!showOverlay || !isCaseDetailRoute || hasLoadedCases) {
      return;
    }

    let isCancelled = false;

    const fetchCaseStudies = async () => {
      try {
        setIsCasesLoading(true);
        setCasesLoadError(null);

        const response = await fetch(
          `/api/cases?channel=${encodeURIComponent(channel)}&language=${encodeURIComponent(locale)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(
            `Cases request failed with status ${response.status}`,
          );
        }

        const payload = await response.json();
        const data = Array.isArray(payload?.caseStudies)
          ? payload.caseStudies
          : [];

        if (!isCancelled) {
          setCaseStudies(data);
          setHasLoadedCases(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setCasesLoadError(copy.error);
          setHasLoadedCases(true);
        }
        console.error("Error fetching case studies for overlay:", error);
      } finally {
        if (!isCancelled) {
          setIsCasesLoading(false);
        }
      }
    };

    fetchCaseStudies();

    return () => {
      isCancelled = true;
    };
  }, [
    channel,
    copy.error,
    hasLoadedCases,
    isCaseDetailRoute,
    locale,
    showOverlay,
  ]);

  const itemClass = `text-xs leading-compress font-medium inline-block ${
    isExpanded ? "mr-8" : "mr-6"
  }`;
  const syncedMenuItems =
    menuData?.menuItems && menuData.menuItems.length > 0
      ? menuData.menuItems
      : isFlzrChannel
        ? [
            ...(hasCaseStudies
              ? [
                  {
                    _key: "localized-cases",
                    slug: "cases",
                    title: copy.projects,
                  },
                ]
              : []),
            ...(hasServices
              ? [
                  {
                    _key: "localized-services",
                    slug: "services",
                    title: copy.services,
                  },
                ]
              : []),
          ]
        : [];

  return (
    <>
      <div className="container relative z-[99998] mx-auto h-20 px-3 pt-3 md:h-28 md:px-4 md:pt-6">
        <motion.nav
          ref={navRef}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: isNavVisible ? 1 : 0,
            y: isNavVisible ? 0 : -96,
          }}
          transition={{
            layout: {
              type: "spring",
              bounce: 0.08,
              visualDuration: 0.45,
            },
            opacity: { duration: 0.32, ease: "easeOut" },
            y: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
          }}
          aria-hidden={!isNavVisible}
          inert={!isNavVisible}
          data-nav-state={navState}
          data-nav-surface={isFlzrScrolled ? "frosted" : "transparent"}
          className={`floating-nav z-99999 hidden items-center grid-cols-12 py-2 transition-[height,background-color,border-color,box-shadow,backdrop-filter,color] duration-300 md:grid ${
            isExpanded
              ? "relative mx-auto h-16 w-full rounded-[2rem] px-6"
              : "fixed left-0 right-0 top-6 mx-auto h-14 w-fit rounded-full px-5 iphone-landscape:top-2 iphone-landscape:scale-70"
          } ${isNavVisible ? "" : "pointer-events-none"} ${desktopSurfaceClass} ${navTextColor} ${className}`}
        >
          <div className="col-span-2 flex items-center pr-16  justify-start">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
              className=" flex items-start  justify-center"
            >
              <Link
                href={`/`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/`);
                }}
                aria-label="Home"
                className="flex items-center justify-center"
              >
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  width={64}
                  height={64}
                  className={logoClassName}
                  style={{ height: "auto" }}
                />
              </Link>
            </motion.div>
          </div>

          <motion.div className="col-span-7   flex items-center ">
            {menuData ? (
              <StaggeredSlideUp
                className="flex items-center "
                delay={0.42}
                staggerDelay={0.07}
                duration={0.36}
                distance={8}
                easing="spring"
                rootMargin="0px 0px -20px 0px"
                once={true}
                animateImmediately={true}
              >
                {syncedMenuItems
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
                        className="hover:text-violet-400  transition-colors "
                        href={`/${locale}/${item.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/${locale}/${item.slug}`);
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
                    className="hover:text-violet-400 transition-colors"
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
                    className="hover:text-violet-400 transition-colors"
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
                    className="hover:text-violet-400 transition-colors"
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
                    className="hover:text-violet-400 transition-colors"
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

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: 0.62,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="col-span-3 flex relative justify-end items-center align-start gap-1"
          >
            {/* All Cases button only on case detail pages */}
            {isCaseDetailRoute && (
              <button
                type="button"
                className={`border  min-w-[80px] inline-block py-2 px-2 text-xxs font-bold cursor-pointer hover:text-violet-400 hover:border-violet-400 transition-colors`}
                onClick={() => setShowOverlay(true)}
              >
                {copy.allCases}
              </button>
            )}
            {languageOptions.length ? (
              <LanguageSelector
                currentLocale={locale}
                options={languageOptions}
                frosted={isFlzrScrolled}
              />
            ) : null}
            <Button2
              variant="limesmall"
              href="https://1sp.agency"
              text="1sp.agency"
            />
          </motion.div>
        </motion.nav>
        <motion.nav
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: isNavVisible ? 1 : 0,
            y: isNavVisible ? 0 : -80,
          }}
          transition={{
            layout: {
              type: "spring",
              bounce: 0.08,
              visualDuration: 0.4,
            },
            opacity: { duration: 0.25 },
            y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
          aria-hidden={!isNavVisible}
          inert={!isNavVisible}
          data-nav-state={navState}
          data-nav-surface={isFlzrScrolled ? "frosted" : "transparent"}
          className={`z-99999 flex items-center justify-between rounded-full transition-[height,background-color,border-color,box-shadow,backdrop-filter,color] duration-300 md:hidden ${
            isExpanded
              ? "relative mx-auto h-14 w-full px-4"
              : "fixed left-3 right-3 top-3 h-12 px-3"
          } ${isNavVisible ? "" : "pointer-events-none"} ${mobileSurfaceClass} ${navTextColor}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={`/${locale}`}
              aria-label="Home"
              className="flex items-center"
              onClick={(event) => {
                event.preventDefault();
                router.push(`/${locale}`);
              }}
            >
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={54}
                height={24}
                className={logoClassName}
                style={{ height: "auto" }}
              />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {languageOptions.length ? (
              <LanguageSelector
                currentLocale={locale}
                options={languageOptions}
                compact
                frosted={isFlzrScrolled}
              />
            ) : null}
          </motion.div>
        </motion.nav>
      </div>
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
            className="relative w-full max-w-[900px] max-h-[calc(100vh-4rem)]  flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-y-auto"
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
              {isCasesLoading ? (
                <div className="px-8 py-20 text-sm text-neutral-500">
                  {copy.loading}
                </div>
              ) : casesLoadError ? (
                <div className="px-8 py-20 text-sm text-neutral-500">
                  {casesLoadError}
                </div>
              ) : caseStudies.length === 0 ? (
                <div className="px-8 py-20 text-sm text-neutral-500">
                  {copy.empty}
                </div>
              ) : (
                <CaseGalleryMenu caseStudies={caseStudies} locale={locale} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default FrontNavOverlay;
