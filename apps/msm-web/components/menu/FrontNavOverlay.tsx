"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { CaretDown, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { GlassSurface, menuGlassSurfaceProps } from "../ui/glass-surface";
import type { NavbarMenu } from "@1sp/sanity-types/menu";
import CaseBrowser, { type NavigationCase } from "./CaseBrowser";
import MobileNavigation from "./MobileNavigation";
import styles from "./Navigation.module.css";

interface FrontNavOverlayProps {
  className?: string;
  color?: "light" | "dark";
  menuData?: NavbarMenu | null;
  channel?: string;
  locale?: string;
  hasCaseStudies?: boolean;
  hasServices?: boolean;
  initialCaseStudies?: NavigationCase[];
}

const EMPTY_CASES: NavigationCase[] = [];
// Preserve the incumbent refractive glass and animate the glass itself:
// a transformed ancestor would change its backdrop root and lose refraction.
const msmNavGlassSurfaceProps = { ...menuGlassSurfaceProps, distortionScale: -340, tintOpacity: 0.39 };
const MotionGlassSurface = motion.create(GlassSurface);

function OneSpAgencyLink({ reduceMotion }: { reduceMotion: boolean }) {
  return <motion.a href="https://1sp.agency" target="_blank" rel="noopener noreferrer" aria-label="1SP Agency website (opens in a new tab)" data-onesp-agency=""
    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    className="fixed right-3 top-3 z-[100000] flex h-14 w-[3.75rem] items-center justify-center bg-black text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-msm-cyan md:right-4 md:top-4 md:h-16 md:w-[7.5rem]">
    <Image src="/ci/1sp-fulllogotype-blk.svg" alt="" width={58} height={31} className="h-auto w-[34px] brightness-0 invert md:w-[58px]" />
  </motion.a>;
}

export default function FrontNavOverlay({ className = "", color = "light", menuData, channel = "msmWeb", locale = "en", hasCaseStudies = false, hasServices = false, initialCaseStudies = EMPTY_CASES }: FrontNavOverlayProps) {
  const pathname = usePathname() || "";
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  // Stable for the dialog's scroll-lock lifecycle; this repo's React types predate useEffectEvent.
  const closeMobileMenu = React.useCallback(() => setShowMobileMenu(false), []);
  const [showCases, setShowCases] = React.useState(false);
  const mobileTrigger = React.useRef<HTMLButtonElement>(null);
  const casesTrigger = React.useRef<HTMLButtonElement>(null);
  const casesPanel = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusOnOpen = React.useRef(false);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [hasInitialAnimationCompleted, setHasInitialAnimationCompleted] = React.useState(false);
  const lastScrollY = React.useRef(0);
  const prefix = locale === "en" ? "" : `/${locale}`;
  const german = locale === "de";
  const links = (menuData?.menuItems?.length ? menuData.menuItems : [
    { _key: "cases", slug: "cases", title: "Cases" },
    { _key: "services", slug: "services", title: german ? "Leistungen" : "Services" },
    { _key: "contact", slug: "contact", title: german ? "Kontakt" : "Contact" },
    { _key: "units", slug: "units", title: "Units" },
  ]).filter((item) => item.slug && (!item.slug.includes("cases") || hasCaseStudies) && (!item.slug.includes("services") || hasServices));
  const isCaseDetailRoute = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?cases\/[^/]+/.test(pathname);
  const isBarVisible = isNavVisible || showMobileMenu || showCases;
  const logoUrl = channel === "msmWeb" ? "/units/MSM/msm_logo.svg" : color === "dark" ? "/ci/1sp-fulllogotype-blk.svg" : "/ci/1sp-fulllogotype.svg";
  const textColor = color === "dark" ? "text-neutral-800" : "text-neutral-50";

  function clearClose() { if (closeTimer.current) clearTimeout(closeTimer.current); }
  function closeCases() { clearClose(); setShowCases(false); }
  function openCases() { clearClose(); setShowCases(true); }
  function scheduleClose(event: React.PointerEvent) {
    if (event.pointerType !== "mouse" || casesPanel.current?.contains(document.activeElement)) return;
    clearClose();
    closeTimer.current = setTimeout(() => setShowCases(false), 180);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => setHasInitialAnimationCompleted(true), 1700);
    return () => clearTimeout(timer);
  }, []);
  React.useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  React.useLayoutEffect(() => {
    if (!showCases) return;
    const trigger = casesTrigger.current;
    const panel = casesPanel.current;
    if (!trigger || !panel) return;

    function positionPanel() {
      if (!trigger || !panel) return;
      const bounds = trigger.getBoundingClientRect();
      const width = panel.offsetWidth;
      const centeredLeft = bounds.left + bounds.width / 2 - width / 2;
      // Center on Cases, shifting only enough to retain a 16px viewport gutter.
      panel.style.left = `${Math.max(16, Math.min(centeredLeft, document.documentElement.clientWidth - width - 16))}px`;
    }

    positionPanel();
    const observer = new ResizeObserver(positionPanel);
    observer.observe(trigger);
    observer.observe(panel);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", positionPanel);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionPanel);
    };
  }, [showCases, pathname, hasInitialAnimationCompleted]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hasInitialAnimationCompleted && !reduceMotion) return;
    if (Math.abs(latest - lastScrollY.current) > 10) {
      setIsNavVisible(latest <= 100 || latest < lastScrollY.current);
      lastScrollY.current = latest;
    }
  });

  React.useEffect(() => {
    if (!showCases) return;
    if (focusOnOpen.current) {
      casesPanel.current?.querySelector<HTMLInputElement>("input")?.focus();
      focusOnOpen.current = false;
    }
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (!casesPanel.current?.contains(target) && !casesTrigger.current?.contains(target)) setShowCases(false);
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowCases(false);
        casesTrigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [showCases]);

  return <>
    <motion.nav aria-label="Main navigation" aria-hidden={!isBarVisible} inert={!isBarVisible} data-nav-state={isBarVisible ? "visible" : "hidden"}
      initial={false} animate={{ y: isBarVisible ? 0 : -100 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className={`fixed left-3 right-[5rem] top-3 z-[99999] flex h-14 items-center justify-between border border-white/20 bg-msm-paper/90 px-3 text-msm-ink md:hidden ${isBarVisible ? "" : "pointer-events-none"}`}>
      <Link href={prefix || "/"} aria-label="MSM.digital home" className="flex min-h-11 min-w-11 items-center"><Image src={logoUrl} alt="" width={30} height={30} /></Link>
      <button ref={mobileTrigger} type="button" aria-expanded={showMobileMenu} aria-controls="msm-mobile-menu" aria-label={german ? "Menü öffnen" : "Open menu"}
        onClick={() => { closeCases(); setShowMobileMenu(true); }} className="flex min-h-11 items-center gap-3 px-2 text-xs uppercase tracking-wider">
        <span>{german ? "Menü" : "Menu"}</span><span aria-hidden="true" className="grid gap-1"><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /></span>
      </button>
    </motion.nav>
    <OneSpAgencyLink reduceMotion={reduceMotion} />
    <nav ref={navRef} aria-label="Main navigation" aria-hidden={!isBarVisible} inert={!isBarVisible} data-nav-state={isBarVisible ? "visible" : "hidden"}
      className={`floating-nav hidden fixed left-4 right-[9.5rem] top-4 z-[99999] h-16 md:block ${isBarVisible ? "" : "pointer-events-none"} ${textColor} ${className}`}>
      <MotionGlassSurface key={hasInitialAnimationCompleted ? "settled" : "intro"} {...msmNavGlassSurfaceProps} borderRadius={0} contentClassName="w-full items-center justify-between gap-3 px-4 py-2 lg:gap-6 lg:px-6" width="100%" height="100%"
        initial={hasInitialAnimationCompleted || reduceMotion ? false : { opacity: 0, scale: 1, y: 0, clipPath: "inset(0% 49.9% 0% 49.9%)" }}
        animate={hasInitialAnimationCompleted || reduceMotion ? { opacity: isBarVisible ? 1 : 0, y: isBarVisible ? 0 : -100, scale: 1, clipPath: "inset(0%)" } : { opacity: [0, 1, 1], scale: [1, 1, 1], clipPath: ["inset(0% 49% 0% 49%)", "inset(0% 49% 0% 49%)", "inset(0%)"] }}
        transition={hasInitialAnimationCompleted || reduceMotion ? { duration: reduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] } : { duration: 1, delay: 0.7 }}>
        <Link href={prefix || "/"} aria-label="Home" className="flex shrink-0 items-center justify-center"><Image src={logoUrl} alt="MSM Logo" width={48} height={48} className="h-auto object-contain" /></Link>
        <div className="flex flex-1 items-center justify-center gap-4 lg:gap-8">
          {links.map((item) => item.slug?.replace(/^\/+|\/+$/g, "") === "cases" ? <button key={item._key} ref={casesTrigger} type="button" aria-expanded={showCases} aria-controls="msm-desktop-cases"
            className="flex min-h-11 items-center gap-2 whitespace-nowrap text-xs tracking-wide transition-colors hover:text-msm-cyan aria-expanded:text-msm-cyan"
            onPointerEnter={(event) => { if (event.pointerType === "mouse") openCases(); }} onPointerLeave={scheduleClose}
            onClick={(event) => { clearClose(); if (event.detail === 0 || (event.nativeEvent as PointerEvent).pointerType !== "mouse") setShowCases((value) => !value); else openCases(); }}
            onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); if (showCases) casesPanel.current?.querySelector<HTMLInputElement>("input")?.focus(); else { focusOnOpen.current = true; openCases(); } } }}>
            {item.displayName || item.title}<motion.span animate={{ rotate: showCases ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}><CaretDown size={13} aria-hidden="true" /></motion.span>
          </button> : <Link key={item._key} href={`${prefix}/${item.slug}`} onClick={closeCases} aria-current={pathname.replace(/^\/en(?=\/|$)/, "") === `${prefix}/${item.slug}` ? "page" : undefined} className="flex min-h-11 items-center whitespace-nowrap text-xs tracking-wide transition-colors hover:text-msm-cyan aria-[current=page]:text-msm-cyan">{item.displayName || item.title}</Link>)}
        </div>
        {isCaseDetailRoute && <Link href={`${prefix}/cases`} className="inline-flex min-h-11 shrink-0 items-center border border-current px-3 text-xs transition-colors hover:text-msm-cyan">{german ? "Alle Cases" : "All cases"}</Link>}
      </MotionGlassSurface>
    </nav>
    <AnimatePresence>
      {showCases && <motion.div ref={casesPanel} id="msm-desktop-cases" role="region" aria-label={german ? "Case Studies" : "Case studies"} className={`${styles.desktopPanel} hidden md:block`}
        initial={reduceMotion ? false : { opacity: 0, transform: "translateY(16px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={{ opacity: 0, transform: reduceMotion ? "translateY(0px)" : "translateY(16px)", transition: { duration: reduceMotion ? 0 : 0.18, ease: [0.4, 0, 1, 1] } }}
        transition={{ type: "tween", duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        onPointerEnter={clearClose} onPointerLeave={scheduleClose}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node) && !casesTrigger.current?.contains(event.relatedTarget as Node)) closeCases(); }}>
        <button type="button" className={styles.desktopClose} aria-label={german ? "Cases schließen" : "Close case studies"} onClick={() => { closeCases(); casesTrigger.current?.focus(); }}><X size={20} /></button>
        <CaseBrowser locale={locale} channel={channel} initialCases={initialCaseStudies} reducedMotion={reduceMotion} onNavigate={closeCases} />
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {showMobileMenu && <MobileNavigation key="mobile" links={links} locale={locale} channel={channel} pathname={pathname} initialCases={initialCaseStudies} reducedMotion={reduceMotion} onClose={closeMobileMenu} />}
    </AnimatePresence>
  </>;
}
