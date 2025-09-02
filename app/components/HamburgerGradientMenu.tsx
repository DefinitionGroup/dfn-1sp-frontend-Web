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
  innerRef: React.RefObject<HTMLDivElement | null>;
  items: MenuItem[];
  onClose: () => void;
  firstLinkRef: React.RefObject<HTMLAnchorElement | null>;
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
      {/* Fullscreen animated gradient backdrop */}
      <FullscreenGradientBackdrop onClose={onClose} />
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

// Legacy GradientOverlay removed in favor of responsive fullscreen variant

/**
 * New fullscreen gradient backdrop (no explicit numeric width/height sizing).
 * Uses inset-0 layers, radial-gradients sized by viewport automatically and animated via scale/opacity.
 */
function FullscreenGradientBackdrop({ onClose }: { onClose: () => void }) {
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
      animate(breathe, [null, 0.85, 1.05, 0.9, 1], {
        duration: 24,
        repeat: Infinity,
        ease: "easeInOut",
      });
    })();
  }, [isPresent, breathe]);

  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      onClick={onClose}>
      {/* Dim layer */}
      <motion.div
        className="absolute inset-0 bg-neutral-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      {/* Large breathing radial field (covers viewport without explicit sizing) */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: [0.5, 0.75, 0.55, 0.7],
          rotate: [0, 25, -10, 0],
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          scale: breathe,
          background:
            "radial-gradient(circle at 35% 40%, rgba(90,255,80,0.85), rgba(40,130,20,0.05) 65%)",
          filter: "blur(220px)",
        }}
      />
      {/* Accent layer top-left */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.35, 0.25, 0.3] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 10% 15%, rgba(200,50,30,0.85), rgba(255,60,40,0.05) 60%)",
          filter: "blur(260px)",
        }}
      />
      {/* Accent layer bottom-right */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.3, 0.2, 0.25] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          background:
            "radial-gradient(circle at 85% 80%, rgba(60,220,255,0.6), rgba(40,120,180,0.05) 55%)",
          filter: "blur(200px)",
        }}
      />
    </div>
  );
}

/* ------------------ Gradient Backdrop (adapted) ------------------ */
// ...existing code...
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
      animate(breathe, [null, 0.9, 1.05, 0.9, 1], {
        duration: 22,
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
        className="absolute inset-0 bg-neutral-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Core expanding pulse */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        initial={{
          scale: 0,
          opacity: 0.2,
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,0,140,0.9), rgba(255,70,40,0.15) 70%)",
          filter: "blur(130px)",
        }}
        animate={{
          scale: 2,
          opacity: 0.1,
          transition: {
            duration: 2.2,
            opacity: { duration: 2.2, ease: "easeOut" },
          },
        }}
        exit={{
          scale: 0,
          opacity: 0,
          transition: { duration: 0.5 },
        }}
        style={{
          width: 180,
          height: 180,
          left: "50%",
          top: "55%",
          marginLeft: -90,
          marginTop: -90,
        }}
      />

      {/* Primary breathing field */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.75, 0.9, 0.7, 0.85],
          rotate: [0, 25, -10, 0],
          x: ["0%", "12%", "-1%", "0%"],
          y: ["0%", "-11%", "2%", "0%"],
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          scale: breathe,
          width: "95vmax",
          height: "195vmax",
          top: "-70vmax",
          left: "-70vmax",
          background:
            "radial-gradient(circle at 40% 45%, rgba(90,255,60,0.9), rgba(40,255,20,0.15) 60%)",
          filter: "blur(240px)",
          opacity: 0.5,
        }}
      />

      {/* Secondary field */}
      <motion.div
        className="absolute rounded-full "
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.6, 0.85, 0.55, 0.75],
          rotate: [0, -30, 15, 0],
          x: ["0%", "-3%", "1%", "0%"],
          y: ["0%", "1%", "-2%", "0%"],
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          scale: breathe,
          width: "20vmax",
          height: "20vmax",
          bottom: "-50vmax",
          right: "-60vmax",
          background:
            "radial-gradient(circle at 55% 60%, rgba(110,255,80,0.85), rgba(40,210,25,0.1) 70%)",
          filter: "blur(160px)",
          opacity: 0.7,
        }}
      />

      {/* Accent orb 1 */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        initial={{ scale: 0.6, opacity: 1 }}
        animate={{
          scale: [0.6, 2.95, 0.7, 2.9, 0.6],
          opacity: [0.25, 0.45, 0.35, 0.5, 0.25],
          x: ["0%", "8%", "-4%", "6%", "0%"],
          y: ["0%", "-6%", "4%", "-3%", "0%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
        style={{
          top: "25%",
          left: "10%",
          width: 120,
          height: 10,
          background:
            "radial-gradient(circle at 50% 50%, rgba(1050,250,120,0.9), rgba(70,255,30,0.05) 70%)",
          filter: "blur(222px)",
        }}
      />

      {/* Accent orb 2 */}
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 2.85, 0.6, 2.9, 0.5],
          opacity: [0.18, 0.4, 0.25, 0.42, 0.18],
          x: ["0%", "-6%", "5%", "-3%", "0%"],
          y: ["0%", "5%", "-4%", "3%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
        style={{
          bottom: "22%",
          right: "18%",
          width: 460,
          height: 460,
          background:
            "radial-gradient(circle at 55% 45%, rgba(120,255,0,0.85), rgba(40,255,25,0.05) 70%)",
          filter: "blur(95px)",
        }}
      />
    </div>
  );
}
// ...existing code...

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
