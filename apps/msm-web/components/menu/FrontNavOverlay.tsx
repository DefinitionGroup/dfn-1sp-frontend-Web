"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import { usePathname } from "next/navigation";
import CaseGalleryMenu from "../data/data-CaseGalleryMenu";
import { GlassSurface, menuGlassSurfaceProps } from "../ui/glass-surface";
import { NavbarMenu } from "@1sp/sanity-types/menu";

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
}

// Same shader as the hero glass card (`cardGlassSurfaceProps`), but pushed
// harder for the nav. The bar is thin and usually sits over the darker top
// strip of the hero, so it gets less "free" refraction than the card (which
// floats over the vibrant lower video). A stronger displacement + a lighter
// tint make the glass read here too. See docs/MSM_NAV_GLASS.md.
const msmNavGlassSurfaceProps = {
  ...menuGlassSurfaceProps,
  distortionScale: -340, // stronger bending (preset is -255)
  tintOpacity: 0.39, // lighter than the card's 0.42 so the refraction shows over dark frames
};

// The entrance/scroll animation MUST live on the glass element itself, not on a
// wrapper above it: a `transform`/`opacity`/`clip-path` on an ANCESTOR of a
// backdrop-filter element makes that ancestor a "backdrop root", so the SVG
// filter samples the (empty) wrapper instead of the page/hero behind it — i.e.
// no refraction. Animating the GlassSurface itself keeps the backdrop = the page.
// See docs/MSM_NAV_GLASS.md.
const MotionGlassSurface = motion.create(GlassSurface);

/** A separate fixed surface, so hiding the glass bar never hides this link. */
function OneSpAgencyLink({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.a
      href="https://1sp.agency"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="1SP Agency website (opens in a new tab)"
      data-onesp-agency=""
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className="fixed right-3 top-3 z-[100000] flex h-14 w-[3.75rem] items-center justify-center bg-black text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-msm-cyan md:right-4 md:top-4 md:h-16 md:w-[7.5rem]"
    >
      <Image
        src="/ci/1sp-fulllogotype-blk.svg"
        alt=""
        width={58}
        height={31}
        className="h-auto w-[34px] brightness-0 invert md:w-[58px]"
      />
    </motion.a>
  );
}

const FrontNavOverlay: React.FC<FrontNavOverlayProps> = ({
  className = "",
  color = "light",
  menuData,
  channel = "1spWeb",
  locale = "en",
  hasCaseStudies = false,
  hasServices = false,
  initialCaseStudies = [],
}) => {
  const router = useOptimizedTransitionRouter();
  const pathname = usePathname() || "";
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const mobileNavRef = React.useRef<HTMLElement>(null);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [caseStudies, setCaseStudies] = React.useState<CaseStudy[]>(initialCaseStudies);
  const [isCasesLoading, setIsCasesLoading] = React.useState(false);
  const [hasLoadedCases, setHasLoadedCases] = React.useState(
    initialCaseStudies.length > 0
  );
  const [casesLoadError, setCasesLoadError] = React.useState<string | null>(null);
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
    if (!hasInitialAnimationCompleted && !reduceMotion) return;

    const direction = latest > lastScrollY.current ? "down" : "up";
    const threshold = 10; // Minimum scroll distance to trigger show/hide

    if (Math.abs(latest - lastScrollY.current) > threshold) {
      if (latest <= 100) {
        setIsNavVisible(true);
      } else if (direction === "down") {
        setIsNavVisible(false);
      } else if (direction === "up") {
        setIsNavVisible(true);
      }
      lastScrollY.current = latest;
    }
  });

  React.useEffect(() => {
    if (!showMobileMenu) return;

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowMobileMenu(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !mobileNavRef.current?.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    document.addEventListener("keydown", dismissOnEscape);
    document.addEventListener("pointerdown", dismissOutside);
    return () => {
      document.removeEventListener("keydown", dismissOnEscape);
      document.removeEventListener("pointerdown", dismissOutside);
    };
  }, [showMobileMenu]);

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

  const detectedTheme = effectiveColor;

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
  const isMsmChannel = channel === "msmWeb";
  const imageLogo =
    isMsmChannel
      ? "/units/MSM/msm_logo.svg"
      : detectedTheme === "dark"
        ? "/ci/1sp-fulllogotype-blk.svg"
        : "/ci/1sp-fulllogotype.svg";
  const logoUrl = imageLogo;
  const logoAlt = isMsmChannel ? "MSM Logo" : "1SP Logo";
  const logoClassName = [
    "object-contain transition-all duration-300",
    // MSM mark is a multi-colour cube — keep its native colours on any background.
  ]
    .filter(Boolean)
    .join(" ");

  React.useEffect(() => {
    if (
      !showOverlay ||
      !isCaseDetailRoute ||
      hasLoadedCases ||
      isCasesLoading
    ) {
      return;
    }

    let isCancelled = false;

    const fetchCaseStudies = async () => {
      try {
        setIsCasesLoading(true);
        setCasesLoadError(null);

        const response = await fetch(
          `/api/cases?channel=${encodeURIComponent(channel)}&language=${encodeURIComponent(locale)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`Cases request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const data = Array.isArray(payload?.caseStudies) ? payload.caseStudies : [];

        if (!isCancelled) {
          setCaseStudies(data);
          setHasLoadedCases(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setCasesLoadError("Unable to load cases right now.");
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
  }, [channel, hasLoadedCases, isCaseDetailRoute, isCasesLoading, locale, showOverlay]);

  const itemClass = `text-xs leading-compress tracking-wide font-medium mr-8 inline-block `;
  const navGlassRadius = 0;
  const isBarVisible = isNavVisible || showMobileMenu || showOverlay;
  const mobileLinks: NonNullable<NavbarMenu["menuItems"]> = (menuData?.menuItems?.length ? menuData.menuItems : [
    { _key: "cases", slug: "cases", title: "Cases" },
    { _key: "services", slug: "services", title: "Services" },
    { _key: "contact", slug: "contact", title: "Contact" },
    { _key: "units", slug: "units", title: "Units" },
  ]).filter((item) => item.slug &&
    (!item.slug.includes("cases") || hasCaseStudies) &&
    (!item.slug.includes("services") || hasServices));

  return (
    <>
      <motion.nav
        ref={mobileNavRef}
        aria-label="Main navigation"
        aria-hidden={!isBarVisible}
        inert={!isBarVisible}
        data-nav-state={isBarVisible ? "visible" : "hidden"}
        initial={false}
        animate={{ opacity: isBarVisible ? 1 : 0, y: isBarVisible ? 0 : -84 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed left-3 right-[5rem] top-3 z-[99999] border border-white/15 bg-msm-paper/90 text-msm-ink backdrop-blur-md md:hidden ${isBarVisible ? "" : "pointer-events-none"}`}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3">
        <Link href={locale === "en" ? "/" : `/${locale}`} aria-label="MSM.digital home" className="flex min-h-11 min-w-11 items-center">
          <Image src={logoUrl} alt="" width={30} height={30} />
        </Link>
        <button
          ref={mobileMenuButtonRef}
          type="button"
          aria-expanded={showMobileMenu}
          aria-controls="msm-mobile-menu"
          aria-label={showMobileMenu ? (locale === "de" ? "Menü schließen" : "Close menu") : (locale === "de" ? "Menü öffnen" : "Open menu")}
          onClick={() => setShowMobileMenu((open) => !open)}
          className="flex min-h-11 items-center gap-3 px-2 text-xs uppercase tracking-wider"
        >
          <span>{locale === "de" ? "Menü" : "Menu"}</span>
          <span aria-hidden="true" className="grid gap-1">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
        </button>
        </div>
        {showMobileMenu && (
          <motion.div
            id="msm-mobile-menu"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="flex max-h-[calc(100svh-6rem)] flex-col overflow-y-auto border-t border-white/15 px-3 py-2"
          >
            {mobileLinks.map((item) => <Link key={item._key} href={`${locale === "en" ? "" : `/${locale}`}/${item.slug}`} onClick={() => setShowMobileMenu(false)} aria-current={pathname.replace(/^\/en/, "") === `${locale === "en" ? "" : `/${locale}`}/${item.slug}` ? "page" : undefined} className="flex min-h-11 items-center px-2 text-sm aria-[current=page]:text-msm-cyan">{item.displayName || item.title}</Link>)}
          </motion.div>
        )}
      </motion.nav>
      <OneSpAgencyLink reduceMotion={reduceMotion} />
      <nav
        ref={navRef}
        style={{ zIndex: 99999 }}
        aria-label="Main navigation"
        aria-hidden={!isBarVisible}
        inert={!isBarVisible}
        data-nav-state={isBarVisible ? "visible" : "hidden"}
        className={`floating-nav hidden fixed left-4 right-[9.5rem] top-4 h-16 md:block ${isBarVisible ? "" : "pointer-events-none"} ${textColor} ${className}`}
      >
        <MotionGlassSurface
          key={hasInitialAnimationCompleted ? "settled" : "intro"}
          {...msmNavGlassSurfaceProps}
          borderRadius={navGlassRadius}
          contentClassName="w-full items-center justify-between gap-6 px-6 py-2"
          width="100%"
          height="100%"
          initial={
            hasInitialAnimationCompleted || reduceMotion
              ? false
              : { opacity: 0, scale: 1, y: 0, clipPath: "inset(0% 49.9% 0% 49.9%)" }
          }
          animate={
            hasInitialAnimationCompleted || reduceMotion
              ? {
                opacity: isBarVisible ? 1 : 0,
                y: isBarVisible ? 0 : -100,
                scale: 1,
                clipPath: "inset(0%)",
              }
              : {
                opacity: [0, 1, 1],
                scale: [1, 1, 1],
                clipPath: [
                  "inset(0% 49% 0% 49%)",
                  "inset(0% 49% 0% 49%)",
                  "inset(0%)",
                ],
              }
          }
          transition={
            hasInitialAnimationCompleted || reduceMotion
              ? {
                duration: reduceMotion ? 0 : 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
              : {
                duration: 1,
                delay: 0.7,
              }
          }
        >
          <div className="flex shrink-0 items-center justify-start">
            <motion.div

              className=" flex items-start  justify-center">
              <Link
                href={locale === "en" ? "/" : `/${locale}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(locale === "en" ? "/" : `/${locale}`);
                }}
                aria-label="Home"
                className="flex items-center justify-center"
              >
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  width={isMsmChannel ? 48 : 32}
                  height={isMsmChannel ? 48 : 32}
                  className={logoClassName}
                  style={{ height: "auto" }}
                />
              </Link>
            </motion.div>
          </div>

          <motion.div

            className="flex flex-1 items-center justify-center"
          >


            {menuData?.menuItems && menuData.menuItems.length > 0 ? (
              <div className="flex items-center">
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
                        className="transition-colors hover:text-msm-cyan aria-[current=page]:text-msm-cyan"
                        href={`${locale === "en" ? "" : `/${locale}`}/${item.slug}`}
                        aria-current={pathname.replace(/^\/en/, "") === `${locale === "en" ? "" : `/${locale}`}/${item.slug}` ? "page" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`${locale === "en" ? "" : `/${locale}`}/${item.slug}`);
                        }}
                      >
                        {item.displayName || item.title}
                      </Link>
                    </span>
                  ))}
              </div>
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

          <div className="relative flex shrink-0 items-center justify-end gap-1">
            {/* All Cases button only on case detail pages */}
            {isCaseDetailRoute && (
              <button
                type="button"
                className={`border  min-w-[80px] inline-block py-2 px-2 text-xxs font-bold cursor-pointer hover:text-violet-400 hover:border-violet-400 transition-colors`}
                onClick={() => setShowOverlay(true)}
              >
                All Cases
              </button>
            )}
          </div>


        </MotionGlassSurface>
      </nav>
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
            className="relative w-full max-w-[900px] max-h-[calc(100vh-4rem)]  flex flex-col bg-neutral-100 dark:bg-neutral-900 shadow-2xl overflow-y-auto"
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
                  Loading cases...
                </div>
              ) : casesLoadError ? (
                <div className="px-8 py-20 text-sm text-neutral-500">
                  {casesLoadError}
                </div>
              ) : caseStudies.length === 0 ? (
                <div className="px-8 py-20 text-sm text-neutral-500">
                  No cases available right now.
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
