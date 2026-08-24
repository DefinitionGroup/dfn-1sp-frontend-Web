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

function FlzrMenuLogo({ className }: { className?: string }) {
  return (
    <svg
      width="144"
      height="34"
      viewBox="0 0 144 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g clipPath="url(#clip0_flzr_menu_logo)">
        <path
          d="M136.432 22.0147L139.663 34H132.265L129.289 22.9926H126.44L124.526 34H117.467L123.421 0H133.327C139.961 0 144 4.63237 144 10.2847C144 15.9371 141.109 20.23 136.432 22.0147ZM130.904 16.1502C134.603 16.1502 136.644 14.1953 136.644 10.8372C136.644 8.28777 134.944 6.6723 131.797 6.6723H129.331L127.672 16.1502H130.904Z"
          fill="black"
        />
        <path
          d="M75.1605 27.4128L79.9652 0H72.9073L66.9541 34H82.1019L87.067 27.4128H75.1605Z"
          fill="black"
        />
        <path
          d="M50.0314 0L44.0791 34H51.137L53.4753 20.5703H65.0834L66.274 13.9822H54.6238L55.9417 6.58723H61.7515L66.7175 0H50.0314Z"
          fill="black"
        />
        <path
          d="M120.33 0H98.0002L93.0343 6.58723H106.795L86.1699 34H87.1509H113.471L114.619 27.4128H99.7365L119.083 1.69964L120.33 0Z"
          fill="black"
        />
        <path
          d="M5.74 0L0 34H31.5373L37.2773 0H5.74ZM21.6027 2.31216C24.3397 2.31216 26.566 4.53745 26.566 7.27318C26.566 10.0089 24.3397 12.2342 21.6027 12.2342C18.8658 12.2342 16.6395 10.0089 16.6395 7.27318C16.6395 4.53745 18.8658 2.31216 21.6027 2.31216ZM19.9158 29.793L16.4728 27.6411L19.2555 24.0968H15.37L9.6479 31.6878L6.09657 29.1939L13.2673 19.7993L13.4922 19.4751L14.26 18.3674L9.39705 18.3414L9.40243 18.2859L12.7262 13.8765L23.02 13.8461L18.7959 19.4733H27.6043L19.9167 29.793H19.9158Z"
          fill="#7B34EA"
        />
      </g>
      <defs>
        <clipPath id="clip0_flzr_menu_logo">
          <rect width="144" height="34" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
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
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const firstMobileLinkRef = React.useRef<HTMLAnchorElement>(null);
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

  // Disable body scroll while either navigation overlay is open.
  React.useEffect(() => {
    if (showOverlay || showMobileMenu) {
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
  }, [showMobileMenu, showOverlay]);

  React.useEffect(() => {
    if (!showMobileMenu) return;

    firstMobileLinkRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowMobileMenu(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMobileMenu]);

  const textColor =
    detectedTheme === "dark" ? "text-neutral-800 " : "text-neutral-50 ";
  const isFlzrScrolled = isFlzrChannel && !isExpanded;
  const navTextColor = isFlzrChannel
    ? "text-flzr-violet"
    : textColor;
  const desktopSurfaceClass = isFlzrChannel
    ? "border border-black/[0.035] bg-white shadow-[0_8px_26px_rgba(33,25,49,0.12)]"
    : "border border-transparent bg-neutral-600/40 backdrop-blur-md";
  const mobileSurfaceClass = isFlzrChannel
    ? "border border-black/[0.035] bg-white shadow-[0_8px_26px_rgba(33,25,49,0.12)]"
    : "border border-white/15 bg-neutral-600/40 shadow-lg backdrop-blur-xl";
  const logoUrl =
    detectedTheme === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";
  const logoAlt = isFlzrChannel ? "FLZR Logo" : "1SP Logo";
  const logoClassName = "object-contain transition-[filter] duration-300";

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
  const visibleMenuItems = syncedMenuItems.filter((item) => {
    const isCasesPage = item.slug?.includes("cases");
    const isServicesPage = item.slug?.includes("services");
    if (isCasesPage && !hasCaseStudies) return false;
    if (isServicesPage && !hasServices) return false;
    return true;
  });
  const getMenuItemHref = (slug?: string) => {
    const normalizedSlug = slug?.replace(/^\/+|\/+$/g, "") ?? "";
    return !normalizedSlug || normalizedSlug === "home"
      ? `/${locale}`
      : `/${locale}/${normalizedSlug}`;
  };

  return (
    <>
      <div className="relative z-[99998] mx-auto h-20 w-[calc(100%-1rem)] max-w-[1278px] pt-3 md:h-28 md:pt-6">
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
          data-nav-surface={isFlzrChannel ? "paper" : isFlzrScrolled ? "frosted" : "transparent"}
          className={`floating-nav z-99999 hidden items-center grid-cols-12 py-2 transition-[height,background-color,border-color,box-shadow,backdrop-filter,color] duration-300 md:grid ${
            isExpanded
              ? "relative mx-auto h-[3.6rem] w-full rounded-[2rem] px-6"
              : "fixed left-0 right-0 top-6 mx-auto h-14 w-[calc(100%-2rem)] max-w-[1278px] rounded-full px-6 iphone-landscape:top-2 iphone-landscape:scale-70"
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
                href={`/${locale}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}`);
                }}
                aria-label="Home"
                className="flex items-center justify-center"
              >
                {isFlzrChannel ? (
                  <FlzrMenuLogo className="h-auto w-24" />
                ) : (
                  <Image
                    src={logoUrl}
                    alt={logoAlt}
                    width={64}
                    height={64}
                    className={logoClassName}
                    style={{ height: "auto" }}
                  />
                )}
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
                {visibleMenuItems.map((item) => (
                    <span key={item._key} className={itemClass}>
                      <Link
                        className="hover:text-violet-400  transition-colors "
                        href={getMenuItemHref(item.slug)}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(getMenuItemHref(item.slug));
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
              eyebrow={menuData?.oneSpMembershipLabel || "proud member of"}
              text="1SP.agency"
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
          data-nav-surface={isFlzrChannel ? "paper" : isFlzrScrolled ? "frosted" : "transparent"}
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
              {isFlzrChannel ? (
                <FlzrMenuLogo className="h-auto w-[81px]" />
              ) : (
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  width={54}
                  height={24}
                  className={logoClassName}
                  style={{ height: "auto" }}
                />
              )}
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
            <div className="flex items-center gap-2">
              {languageOptions.length ? (
                <LanguageSelector
                  currentLocale={locale}
                  options={languageOptions}
                  compact
                  frosted={false}
                />
              ) : null}
              <button
                type="button"
                aria-controls="flzr-mobile-menu"
                aria-expanded={showMobileMenu}
                onClick={() => setShowMobileMenu((open) => !open)}
                className="rounded-full border border-flzr-violet/25 px-3 py-2 text-[0.7rem] font-bold uppercase leading-none text-flzr-violet transition-colors hover:bg-flzr-violet hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flzr-violet"
              >
                {showMobileMenu ? "Close" : "Menu"}
              </button>
            </div>
          </motion.div>
        </motion.nav>
      </div>
      {showMobileMenu ? (
        <motion.div
          id="flzr-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-[99997] overflow-y-auto bg-flzr-canvas px-5 pb-10 pt-28 md:hidden"
        >
          <nav className="mx-auto flex min-h-full max-w-xl flex-col justify-between gap-12">
            <ul className="border-t border-flzr-violet/20">
              {visibleMenuItems.map((item, index) => {
                const href = getMenuItemHref(item.slug);
                return (
                  <li key={item._key} className="border-b border-flzr-violet/20">
                    <Link
                      ref={index === 0 ? firstMobileLinkRef : undefined}
                      href={href}
                      onClick={(event) => {
                        event.preventDefault();
                        setShowMobileMenu(false);
                        router.push(href);
                      }}
                      className="flzr-headline block py-5 text-[clamp(2rem,10vw,3.5rem)] leading-[0.95] text-flzr-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flzr-violet"
                    >
                      {item.displayName || item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <a
              href="https://1sp.agency"
              className="flex items-center justify-between rounded-full bg-flzr-violet px-5 py-4 text-sm font-bold text-white"
            >
              <span>{menuData?.oneSpMembershipLabel || "Proud member of 1SP"}</span>
              <span>1SP.agency ↗</span>
            </a>
          </nav>
        </motion.div>
      ) : null}
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
