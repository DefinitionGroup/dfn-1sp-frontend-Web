"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useIsPresent,
} from "motion/react";
import { Link } from "next-view-transitions";
import { useOptimizedTransitionRouter } from "@/hooks/use-optimized-transition-router";
import FrontNavOverlay from "../menu/FrontNavOverlay";
import Image from "next/image";
import { useFooterMenu } from "../menu/FooterMenuContext";

interface MenuItem {
  label: string;
  href: string;
  internal?: boolean;
  subitems?: {
    label: string;
    href: string;
  }[];
}
interface HamburgerGradientMenuProps {
  items?: MenuItem[];
  buttonClassName?: string;
  panelClassName?: string;
  color?: "light" | "dark";
}

const DEFAULT_ITEMS: MenuItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Cases",
    href: "/cases",
    subitems: [
      { label: "All case studies", href: "/cases" },
  
    ],
  },
  {
    label: "Services",
    href: "/services",
    subitems: [
      { label: "What we do", href: "/services" },
  
    ],
  },
  {
    label: "Our Family",
    href: "/our-family",
    subitems: [
      { label: "What we do", href: "/our-family" },
  
    ],
  },

  {
    label: "Contact",
    href: "/contact",
    subitems: [
      { label: "Start a project", href: "/contact" },
      { label: "Say hello", href: "/contact" },
    ],
  },
];

export default function HamburgerGradientMenu({
  items = DEFAULT_ITEMS,
  color = "light",
  buttonClassName = "md:hidden",
  panelClassName = "",
}: HamburgerGradientMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const router = useOptimizedTransitionRouter();
  const footerMenu = useFooterMenu();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const focusables =
          panelRef.current.querySelectorAll<HTMLElement>("a,button");
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && firstLinkRef.current) {
      setTimeout(() => firstLinkRef.current?.focus(), 10);
    }
  }, [open]);

  const imageLogo =
    color === "dark"
      ? "/ci/1sp-fulllogotype-blk.svg"
      : "/ci/1sp-fulllogotype.svg";

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  return (
    <div className="fixed top-0 w-full z-[2000]">
      <HamburgerButton
        open={open}
        onClick={toggle}
        className={buttonClassName}
        ariaControls="gradient-menu-panel"
      />
      <Link
        className="hover:text-lime-400"
        href={"/"}
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      >
        <Image
          src={imageLogo}
          alt="1SP Logo"
          width={90}
          height={90}
          className="object-contain md:hidden absolute top-0 right-10 w-[90px] h-[90px] "
        />
      </Link>
      <AnimatePresence>
        {open && (
          <OverlayRoot
            key="gradient-menu-overlay"
            id="gradient-menu-panel"
            innerRef={panelRef}
            items={items}
            onClose={() => setOpen(false)}
            firstLinkRef={firstLinkRef}
            panelClassName={panelClassName}
            imageLogo={imageLogo}
            socialLinks={footerMenu?.socialLinks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OverlayRoot({
  id,
  innerRef,
  items,
  onClose,
  firstLinkRef,
  panelClassName,
  imageLogo,
  socialLinks,
}: {
  id: string;
  innerRef: React.RefObject<HTMLDivElement | null>;
  items: MenuItem[];
  onClose: () => void;
  firstLinkRef: React.RefObject<HTMLAnchorElement | null>;
  panelClassName?: string;
  imageLogo: string;
  socialLinks?: {
    _key?: string;
    name?: string;
    url?: string;
    icon?: {
      secure_url?: string;
    };
  }[];
}) {
  return (
    <motion.div
      className="fixed inset-0 overflow-hidden backdrop-blur-md pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 }, scale: 0 }}
      transition={{ duration: 0.0135, ease: [0.59, 0, 0.35, 1] }}
      aria-modal="true"
      role="dialog"
      aria-label="Main navigation overlay"
    >
      <FullscreenGradientBackdrop onClose={onClose} />
      <motion.div
        ref={innerRef}
        id={id}
        className={`pointer-events-auto absolute inset-0 flex flex-col items-start justify-center gap-10 px-6 text-left ${panelClassName || ""}`}
        initial={{ y: 40, opacity: 0, scale: 0.975 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-neutral-100 pointer-events-auto"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={imageLogo}
            alt="1SP Logo"
            width={190}
            height={190}
            className="object-contain "
          />
          <span className="text-xs uppercase -tracking-[0.25em] text-neutral-200">
            1SP
          </span>
        </motion.div>

        <div className="container mx-auto pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/5  backdrop-blur-2xl  h-full p-8 md:p-12 max-w-4xl"
          >
            <div className="mb-8 flex items-center justify-between gap-6">
              <div className="flex flex-col text-left text-neutral-100">
                <span className="text-xxs font-bold uppercase -tracking-[0.03em] text-neutral-100">
                  Navigation
                </span>
                <h2 className="text-3xl md:text-4xl font-aspekta leading-none tracking-tight">
                  Jump into our world
                </h2>
              </div>
              <motion.div
                className="md:hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Image
                  src={imageLogo}
                  alt="1SP Logo"
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-[0_0_24px_rgba(0,0,0,0.35)]"
                />
              </motion.div>
            </div>

            <motion.nav
              className="flex flex-col gap-2 text-left text-neutral-50"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
            >
              {items.map((item, idx) => (
                <motion.div
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="group    border-b-1 border-white/50  py-4 md:px-6 md:py-5 "
                >
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={item.href}
                      ref={idx === 0 ? firstLinkRef : undefined}
                      className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-50 hover:text-lime-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-sm transition-colors"
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                    <span className="text-xxs uppercase -tracking-[0.05em] font-bold  text-white">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {item.subitems && item.subitems.length > 0 && (
                    <motion.ul
                      className="mt-3 flex flex-wrap gap-2 md:gap-3"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05, delayChildren: 0.04 },
                        },
                      }}
                    >
                      {item.subitems.map((sub) => (
                        <motion.li
                          key={sub.href + sub.label}
                          variants={{
                            hidden: { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <Link
                            href={sub.href}
                            className="text-sm text-white hover:text-lime-200  py-2  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                            onClick={onClose}
                          >
                            {sub.label}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              ))}
            </motion.nav>

            <motion.div
              className="mt-10 pt-6 flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center justify-between text-neutral-100">
                <span className="text-xs uppercase -tracking-[0.03em]">
                  Follow us
                </span>
                <span className="text-xs text-neutral-300">
                  Copyright 2025 1SP GmbH
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {(socialLinks && socialLinks.length > 0
                  ? socialLinks.filter((s) => !!s?.url)
                  : [
                      {
                        _key: "meta",
                        name: "Meta",
                        url: "#",
                        icon: { secure_url: "/MetaLogo.svg" },
                      },
                      {
                        _key: "instagram",
                        name: "Instagram",
                        url: "#",
                        icon: { secure_url: "/InstagramLogo.svg" },
                      },
                      {
                        _key: "tiktok",
                        name: "TikTok",
                        url: "#",
                        icon: { secure_url: "/TiktokLogo.svg" },
                      },
                      {
                        _key: "linkedin",
                        name: "LinkedIn",
                        url: "#",
                        icon: { secure_url: "/LinkedinLogo.svg" },
                      },
                    ]
                ).map((social) => (
                  <Link
                    key={social._key || social.name || social.url}
                    href={social.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 transition hover:border-lime-300 hover:bg-white/10"
                    aria-label={social.name || "social link"}
                  >
                    {social.icon?.secure_url ? (
                      <Image
                        src={social.icon.secure_url}
                        alt={social.name || "social"}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <span className="text-sm text-neutral-100">
                        {social.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <FrontNavOverlay />
        <motion.button
          onClick={onClose}
          className="mt-6 text-7xl fixed top-0 font-extralight uppercase tracking-wide text-neutral-100 hover:text-white focus:outline-none hover:rotate-45 transition focus-visible:ring-2 focus-visible:ring-lime-400 rounded-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          +
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function FullscreenGradientBackdrop({ onClose }: { onClose: () => void }) {
  const breathe = useMotionValue(0);
  const isPresent = useIsPresent();

  useEffect(() => {
    if (!isPresent) {
      animate(breathe, 0, { duration: 0.4, ease: "easeInOut" });
      return;
    }
    (async () => {
      await animate(breathe, 1, { duration: 0.6, ease: [0, 0.55, 0.45, 1] });
      animate(breathe, [null, 0.85, 1.05, 0.9, 1], {
        duration: 24,
        repeat: Infinity,
        ease: "easeInOut",
      });
    })();
  }, [isPresent, breathe]);

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      aria-hidden="true"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute inset-0 mix-blend-screen aspect-square"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0.5, 0.75, 0.55, 0.7], rotate: [0, 25, -30, -20] }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          scale: breathe,
          background:
            "radial-gradient(130% 85% at 82% 6%, rgba(255,170,96,0.9),  rgba(30,110,240,0.15) 55%, rgba(10,40,120,1) 99%)",
          filter: "blur(110px)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen aspect-square"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.35, 0.25, 0.3], rotate: [22, -25, 30, 0] }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(65% 70% at 10% 18%, rgba(70,255,175,1),  rgba(0 ,250,20,1) 90%)",
          filter: "blur(110px)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen aspect-square"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.35, 0.25, 0.3], rotate: [122, 25, 130, 0] }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(65% 70% at 10% 18%, rgba(70,255,175,1),  rgba(0 ,250,20,1) 90%)",
          filter: "blur(110px)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, rotate: [122, 75, 90, 0] }}
        animate={{ opacity: 1, rotate: [22, -25, 30, 0] }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{
          background:
            "radial-gradient(78% 72% at 82% 82%, rgba(85,135,255,0.85), rgba(40,210,255,0.38) 50%, rgba(12,40,140,0.08) 78%), radial-gradient(60% 60% at 64% 38%, rgba(255,125,210,0.35), rgba(255,255,255,0.08) 55%, rgba(120,40,140,0.04) 75%)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}

function HamburgerButton({
  open,
  onClick,
  className = "",
  ariaControls,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
  ariaControls?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Toggle navigation menu"
      aria-expanded={open}
      aria-controls={ariaControls}
      onClick={onClick}
      className={`relative top-14 left-4 w-12 h-12 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-md ${className}`}
    >
      <span className="sr-only">Menu</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-[1.5px] w-6 bg-neutral-100 dark:bg-neutral-100 rounded-full"
          initial={false}
          animate={
            open
              ? i === 0
                ? { y: 0, rotate: 45 }
                : i === 1
                  ? { opacity: 0 }
                  : { y: 0, rotate: -45 }
              : { y: (i - 1) * 6, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </button>
  );
}
