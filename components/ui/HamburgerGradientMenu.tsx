"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import AuroraShaderBackground from "./AuroraShaderBackground";
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
    subitems: [{ label: "All case studies", href: "/cases" }],
  },
  {
    label: "Services",
    href: "/services",
    subitems: [{ label: "What we do", href: "/services" }],
  },
  {
    label: "Our Family",
    href: "/our-family",
    subitems: [{ label: "What we do", href: "/our-family" }],
  },

  {
    label: "Contact",
    href: "/contact",
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
    <div className="fixed top-0 left-0 w-full md:hidden z-[9999] flex items-center justify-between h-24">
      <div className="pointer-events-auto  mt-2 ml-2 inline-block">
        <HamburgerButton
          open={open}
          onClick={toggle}
          className=""
          ariaControls="gradient-menu-panel"
        />
      </div>
      <Link
        className="hover:text-lime-400   pointer-events-auto"
        href={"/"}
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      >
        <Image
          src={imageLogo}
          alt="1SP Logo"
          width={60}
          height={60}
          className="object-contain md:hidden  block mr-8 top-1 relative sm:right-4 w-[60px] h-auto"
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
      transition={{ duration: 0.35, ease: [0.59, 0, 0.35, 1] }}
      aria-modal="true"
      role="dialog"
      aria-label="Main navigation overlay"
    >
      <AuroraShaderBackground onClose={onClose} />
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
            className="    h-full p-8 md:p-12 max-w-4xl"
          >
            <div className="mb-8 flex items-start justify-between gap-6">
              <div className="flex flex-col text-left text-neutral-100">
                <h2 className="text-2xl md:text-2xl font-aspekta leading-none tracking-tight">
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
                  transition={{
                    duration: 0.45,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="group    border-b-1 border-white/50   pb-2 md:px-6 md:py-5 "
                >
                  <div className="flex items-center justify-between ">
                    <Link
                      href={item.href}
                      ref={idx === 0 ? firstLinkRef : undefined}
                      className="text-xl md:text-2xl tracking-tight text-neutral-50 hover:text-lime-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-xl transition-colors"
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
                      className="mb-2 flex flex-wrap gap-2 md:gap-3"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.04,
                          },
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
                  Copyright 2026 1SP GmbH
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
          className="mt-6 text-7xl fixed top-0 font-extralight uppercase tracking-wide text-neutral-100 hover:text-white focus:outline-none hover:rotate-45 transition focus-visible:ring-2 focus-visible:ring-lime-400 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.2653 9.26531L12.5306 12L15.2653 14.7347C15.3357 14.8051 15.3752 14.9005 15.3752 15C15.3752 15.0995 15.3357 15.1949 15.2653 15.2653C15.195 15.3357 15.0995 15.3752 15 15.3752C14.9005 15.3752 14.8051 15.3357 14.7347 15.2653L12 12.5306L9.26532 15.2653C9.19495 15.3357 9.09952 15.3752 9 15.3752C8.90049 15.3752 8.80506 15.3357 8.73469 15.2653C8.66433 15.1949 8.6248 15.0995 8.6248 15C8.6248 14.9005 8.66433 14.8051 8.73469 14.7347L11.4694 12L8.73469 9.26531C8.66433 9.19495 8.6248 9.09951 8.6248 9C8.6248 8.90049 8.66433 8.80505 8.73469 8.73469C8.80506 8.66432 8.90049 8.62479 9 8.62479C9.09952 8.62479 9.19495 8.66432 9.26532 8.73469L12 11.4694L14.7347 8.73469C14.7695 8.69985 14.8109 8.67221 14.8564 8.65335C14.9019 8.6345 14.9507 8.62479 15 8.62479C15.0493 8.62479 15.0981 8.6345 15.1436 8.65335C15.1891 8.67221 15.2305 8.69985 15.2653 8.73469C15.3002 8.76953 15.3278 8.81089 15.3467 8.85641C15.3655 8.90194 15.3752 8.95073 15.3752 9C15.3752 9.04927 15.3655 9.09806 15.3467 9.14359C15.3278 9.18911 15.3002 9.23047 15.2653 9.26531ZM21.375 12C21.375 13.8542 20.8252 15.6668 19.795 17.2085C18.7649 18.7502 17.3007 19.9518 15.5877 20.6614C13.8746 21.3709 11.9896 21.5566 10.171 21.1949C8.35246 20.8331 6.682 19.9402 5.37088 18.6291C4.05976 17.318 3.16688 15.6475 2.80514 13.829C2.44341 12.0104 2.62906 10.1254 3.33863 8.41234C4.04821 6.69929 5.24982 5.23511 6.79153 4.20497C8.33324 3.17483 10.1458 2.625 12 2.625C14.4856 2.62773 16.8686 3.61633 18.6261 5.37389C20.3837 7.13145 21.3723 9.51443 21.375 12ZM20.625 12C20.625 10.2941 20.1192 8.62658 19.1714 7.20821C18.2237 5.78983 16.8767 4.68434 15.3006 4.03154C13.7246 3.37873 11.9904 3.20793 10.3174 3.54073C8.64426 3.87352 7.10744 4.69498 5.90121 5.9012C4.69498 7.10743 3.87353 8.64426 3.54073 10.3173C3.20793 11.9904 3.37874 13.7246 4.03154 15.3006C4.68435 16.8767 5.78984 18.2237 7.20821 19.1714C8.62658 20.1192 10.2941 20.625 12 20.625C14.2867 20.6225 16.4791 19.713 18.0961 18.0961C19.713 16.4791 20.6225 14.2867 20.625 12Z"
              fill="white"
            />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
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
      className={`m-3 sm:m-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-sm backdrop-blur-lgaa bg-black/22  ${className}`}
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sm:w-6 sm:h-6"
      >
        <path
          d="M20.625 12C20.625 12.0995 20.5855 12.1948 20.5152 12.2652C20.4448 12.3355 20.3495 12.375 20.25 12.375H3.75C3.65054 12.375 3.55516 12.3355 3.48484 12.2652C3.41451 12.1948 3.375 12.0995 3.375 12C3.375 11.9005 3.41451 11.8052 3.48484 11.7348C3.55516 11.6645 3.65054 11.625 3.75 11.625H20.25C20.3495 11.625 20.4448 11.6645 20.5152 11.7348C20.5855 11.8052 20.625 11.9005 20.625 12ZM3.75 6.375H20.25C20.3495 6.375 20.4448 6.33549 20.5152 6.26517C20.5855 6.19484 20.625 6.09946 20.625 6C20.625 5.90054 20.5855 5.80516 20.5152 5.73484C20.4448 5.66451 20.3495 5.625 20.25 5.625H3.75C3.65054 5.625 3.55516 5.66451 3.48484 5.73484C3.41451 5.80516 3.375 5.90054 3.375 6C3.375 6.09946 3.41451 6.19484 3.48484 6.26517C3.55516 6.33549 3.65054 6.375 3.75 6.375ZM20.25 17.625H3.75C3.65054 17.625 3.55516 17.6645 3.48484 17.7348C3.41451 17.8052 3.375 17.9005 3.375 18C3.375 18.0995 3.41451 18.1948 3.48484 18.2652C3.55516 18.3355 3.65054 18.375 3.75 18.375H20.25C20.3495 18.375 20.4448 18.3355 20.5152 18.2652C20.5855 18.1948 20.625 18.0995 20.625 18C20.625 17.9005 20.5855 17.8052 20.5152 17.7348C20.4448 17.6645 20.3495 17.625 20.25 17.625Z"
          fill="white"
        />
      </svg>
    </button>
  );
}
