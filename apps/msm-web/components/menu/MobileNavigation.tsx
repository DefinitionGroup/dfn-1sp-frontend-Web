"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Plus, X } from "@phosphor-icons/react";
import type { MenuItem } from "@1sp/sanity-types/menu";
import CaseBrowser, { type NavigationCase } from "./CaseBrowser";
import styles from "./Navigation.module.css";

const MenuShader = dynamic(() => import("./MenuShader"), { ssr: false });

export default function MobileNavigation({ links, locale, channel, pathname, initialCases, reducedMotion, onClose }: {
  links: MenuItem[];
  locale: string;
  channel: string;
  pathname: string;
  initialCases: NavigationCase[];
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [casesOpen, setCasesOpen] = useState(false);
  const german = locale === "de";
  const prefix = locale === "en" ? "" : `/${locale}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    const scrollPosition = window.scrollY;
    const htmlOverflow = document.documentElement.style.overflow;
    const previous = { overflow: document.body.style.overflow, position: document.body.style.position, top: document.body.style.top, width: document.body.style.width };
    document.documentElement.style.overflow = "hidden";
    Object.assign(document.body.style, { overflow: "hidden", position: "fixed", top: `-${scrollPosition}px`, width: "100%" });
    const desktop = window.matchMedia("(min-width: 768px)");
    function onResize() { if (desktop.matches) onClose(); }
    desktop.addEventListener("change", onResize);
    return () => {
      desktop.removeEventListener("change", onResize);
      dialog.close();
      document.documentElement.style.overflow = htmlOverflow;
      Object.assign(document.body.style, previous);
      window.scrollTo({ top: scrollPosition, behavior: "instant" });
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <motion.dialog ref={dialogRef} id="msm-mobile-menu" aria-label={german ? "Hauptnavigation" : "Main navigation"} aria-modal="true" className={styles.mobileDialog}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button, input, select")).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      initial={reducedMotion ? false : { opacity: 0, clipPath: "polygon(0 0, 0% 0, 0 0%)" }}
      animate={{ opacity: 1, clipPath: "polygon(0 0, 200% 0, 0 200%)" }}
      exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}>
      <MenuShader reducedMotion={reducedMotion} />
      <div className={styles.mobileShell}>
        <div className={styles.mobileHeading}>
          <Link href={prefix || "/"} onClick={onClose} className={styles.mobileBrand} aria-label="MSM.digital home">
            <Image src="/units/MSM/msm_logo.svg" alt="" width={40} height={40} /><span>MSM.digital</span>
          </Link>
          <button ref={closeRef} type="button" className={styles.closeButton} onClick={onClose} aria-label={german ? "Menü schließen" : "Close menu"}><X size={25} weight="light" /></button>
        </div>
        <div className={styles.mobileBody}>
          <nav aria-label={german ? "Seiten" : "Pages"} className={styles.mobileLinks}>
            {links.map((item, index) => {
              const isCases = item.slug?.replace(/^\/+|\/+$/g, "") === "cases";
              const href = `${prefix}/${item.slug}`;
              return <motion.div key={item._key} className={styles.mobileRow} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.06 + index * 0.045, ease: [0.16, 1, 0.3, 1] }}>
                {isCases ? <>
                  <button type="button" className={styles.mobileDestination} aria-expanded={casesOpen} aria-controls="msm-mobile-cases" onClick={() => setCasesOpen((value) => !value)}>
                    {item.displayName || item.title}<Plus size={24} aria-hidden="true" className={casesOpen ? styles.rotated : ""} />
                  </button>
                  <AnimatePresence initial={false}>
                    {casesOpen && <motion.div id="msm-mobile-cases" initial={reducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} className={styles.caseAccordion}>
                      <CaseBrowser locale={locale} channel={channel} initialCases={initialCases} reducedMotion={reducedMotion} mobile onNavigate={onClose} />
                    </motion.div>}
                  </AnimatePresence>
                </> : <Link className={styles.mobileDestination} href={href} onClick={onClose} aria-current={pathname.replace(/^\/en(?=\/|$)/, "") === href ? "page" : undefined}>
                  {item.displayName || item.title}<ArrowUpRight size={24} aria-hidden="true" />
                </Link>}
              </motion.div>;
            })}
          </nav>
        </div>
        <div className={styles.mobileFooter}>
          <Link href={`${prefix}/contact`} onClick={onClose}>{german ? "Lass uns sprechen" : "Let’s talk"}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <a href="https://1sp.agency" target="_blank" rel="noopener noreferrer" aria-label="1SP Agency website (opens in a new tab)"><Image src="/ci/1sp-fulllogotype-blk.svg" alt="1SP Agency" width={58} height={31} className="brightness-0 invert" /></a>
        </div>
      </div>
    </motion.dialog>
  );
}
