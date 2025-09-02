"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useIsPresent,
} from "motion/react";
import Link from "next/link";

/**
 * Menu items config
 */
interface MenuItem {
  label: string;
  href: string;
  internal?: boolean;
}
interface HamburgerGradientMenuProps {
  items?: MenuItem[];
  buttonClassName?: string;
  panelClassName?: string;
}

const DEFAULT_ITEMS: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "What we do", href: "/whatwedo" },
  { label: "Contact", href: "/contact" },
];

export default function HamburgerGradientMenu({
  items = DEFAULT_ITEMS,
  buttonClassName = "",
  panelClassName = "",
}: HamburgerGradientMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        // Simple focus trap
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

  // Focus first link on open
  useEffect(() => {
    if (open && firstLinkRef.current) {
      setTimeout(() => firstLinkRef.current?.focus(), 10);
    }
  }, [open]);

  // Prevent body scroll when open
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
    <div className="relative z-[2000]">
      <HamburgerButton
        open={open}
        onClick={toggle}
        className={buttonClassName}
        ariaControls="gradient-menu-panel"
      />
      <AnimatePresence>
        {open && (
          <OverlayRoot
            id="gradient-menu-panel"
            innerRef={panelRef}
            items={items}
            onClose={() => setOpen(false)}
            firstLinkRef={firstLinkRef}
            panelClassName={panelClassName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------ Overlay Root ------------------ */

function OverlayRoot({
  id,
  innerRef,
  items,
  onClose,
  firstLinkRef,
  panelClassName,
}: {
  id: string;
  innerRef: React.RefObject<HTMLDivElement>;
  items: MenuItem[];
  onClose: () => void;
  firstLinkRef: React.RefObject<HTMLAnchorElement>;
  panelClassName?: string;
}) {
  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: [0.59, 0, 0.35, 1] }}
      aria-modal="true"
      role="dialog"
      aria-label="Main navigation overlay">
      <GradientBackdrop onClose={onClose} />
      <motion.div
        ref={innerRef}
        id={id}
        className={`absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 text-center ${
          panelClassName || ""
        }`}
        initial={{ y: 40, opacity: 0, scale: 0.975 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <nav className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08 + idx * 0.05,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}>
              <Link
                href={item.href}
                ref={idx === 0 ? firstLinkRef : undefined}
                className="text-3xl md:text-5xl font-medium tracking-tight text-neutral-50 hover:text-lime-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-sm transition-colors"
                onClick={onClose}>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <motion.button
          onClick={onClose}
          className="mt-6 text-sm uppercase tracking-wide text-neutral-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ delay: 0.25 }}>
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------ Gradient Backdrop (adapted) ------------------ */

function GradientBackdrop({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const breathe = useMotionValue(0);
  const isPresent = useIsPresent();

  useEffect(() => {
    if (!isPresent) {
      animate(breathe, 0, { duration: 0.4, ease: "easeInOut" });
      return;
    }
    (async () => {
      await animate(breathe, 1, {
        duration: 0.6,
        ease: [0, 0.55, 0.45, 1],
      });
      animate(breathe, [null, 0.8, 1], {
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
      });
    })();
  }, [isPresent, breathe]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onClick={onClose}
      aria-hidden="true">
      {/* Base dark veil */}
      <motion.div
        className="absolute inset-0 bg-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Expanding circle burst */}
      <motion.div
        className="absolute rounded-full"
        initial={{
          scale: 0,
          opacity: 1,
          backgroundColor: "rgb(233, 167, 160)",
          filter: "blur(25px)",
        }}
        animate={{
          scale: 10,
          opacity: 0.25,
          backgroundColor: "rgb(246, 63, 42)",
          transition: {
            duration: 0.75,
            opacity: { duration: 0.75, ease: "easeInOut" },
          },
        }}
        exit={{
          scale: 0,
          opacity: 0,
          transition: { duration: 0.45 },
        }}
        style={{
          width: 160,
          height: 160,
          left: "50%",
          top: "60%",
          marginLeft: -80,
          marginTop: -80,
        }}
      />
      {/* Breathing gradient blobs */}
      <motion.div
        className="absolute rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          scale: breathe,
          width: "180vmax",
          height: "180vmax",
          top: "-60vmax",
          left: "-60vmax",
          background: "rgb(246,63,42)",
          filter: "blur(120px)",
          opacity: 0.6,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          scale: breathe,
          width: "160vmax",
          height: "160vmax",
          bottom: "-40vmax",
          right: "-50vmax",
          background: "rgb(243,92,76)",
          filter: "blur(220px)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}

/* ------------------ Hamburger Button ------------------ */

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
      className={`relative w-12 h-12 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-md ${className}`}>
      <span className="sr-only">Menu</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-[2px] w-6 bg-neutral-100 dark:bg-neutral-100 rounded-full"
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
