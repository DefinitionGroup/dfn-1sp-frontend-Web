"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react";

interface ScrollToTopProps {
  /** Scroll threshold in pixels before button appears */
  threshold?: number;
  /** Custom className for additional styling */
  className?: string;
}

export default function ScrollToTop({
  threshold = 300,
  className = "",
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Check initial position
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 p-3  
            bg-neutral-900 dark:bg-neutral-100 
            text-white dark:text-neutral-900
            shadow-lg hover:shadow-xl
            hover:scale-110 active:scale-95
            transition-all duration-200 ease-out
            cursor-pointer
            ${className}`}
          style={{ zIndex: 9999 }}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon size={16} weight="regular" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
