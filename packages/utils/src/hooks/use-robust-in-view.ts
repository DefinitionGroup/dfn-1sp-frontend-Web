"use client";

import { RefObject, useEffect, useLayoutEffect, useState } from "react";

interface UseRobustInViewOptions {
  once?: boolean;
  amount?: number;
  margin?: string;
  mobileAmount?: number;
  mobileMargin?: string;
  fallbackVisibleAfterMs?: number;
}

const MOBILE_MEDIA_QUERY = "(max-width: 767px), (pointer: coarse)";

function isElementNearViewport(
  element: Element,
  overscanViewportRatio: number
): boolean {
  if (typeof window === "undefined") return false;

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const overscan = viewportHeight * overscanViewportRatio;

  return rect.top <= viewportHeight + overscan && rect.bottom >= -overscan;
}

export function useRobustInView<T extends Element>(
  ref: RefObject<T | null>,
  {
    once = true,
    amount = 0.12,
    margin = "0px 0px 72px 0px",
    mobileAmount = 0.01,
    mobileMargin = "0px 0px 160px 0px",
    fallbackVisibleAfterMs = 900,
  }: UseRobustInViewOptions = {}
) {
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateMobile = (event?: MediaQueryListEvent) => {
      setIsMobile(event?.matches ?? mediaQuery.matches);
    };

    updateMobile();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMobile);
      return () => mediaQuery.removeEventListener("change", updateMobile);
    }

    mediaQuery.addListener(updateMobile);
    return () => mediaQuery.removeListener(updateMobile);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    const overscanViewportRatio = isMobile ? 0.45 : 0.2;
    const syncCheck = () => {
      if (isElementNearViewport(element, overscanViewportRatio)) {
        setIsInView(true);
        return true;
      }

      if (!once) setIsInView(false);
      return false;
    };

    syncCheck();

    if (typeof IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== element) continue;

          if (entry.isIntersecting || entry.intersectionRatio >= (isMobile ? mobileAmount : amount)) {
            setIsInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsInView(false);
          }
        }
      },
      {
        root: null,
        rootMargin: isMobile ? mobileMargin : margin,
        threshold: isMobile ? mobileAmount : amount,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [amount, isMobile, margin, mobileAmount, mobileMargin, once, ref]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    const overscanViewportRatio = isMobile ? 0.45 : 0.2;

    const evaluatePosition = () => {
      frame = 0;

      if (isElementNearViewport(element, overscanViewportRatio)) {
        setIsInView(true);
      } else if (!once) {
        setIsInView(false);
      }
    };

    const requestEvaluate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(evaluatePosition);
    };

    const timeoutId = window.setTimeout(requestEvaluate, fallbackVisibleAfterMs);

    window.addEventListener("scroll", requestEvaluate, { passive: true });
    window.addEventListener("resize", requestEvaluate);
    window.addEventListener("orientationchange", requestEvaluate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", requestEvaluate);
      window.removeEventListener("resize", requestEvaluate);
      window.removeEventListener("orientationchange", requestEvaluate);
    };
  }, [fallbackVisibleAfterMs, isMobile, once, ref]);

  return { isInView, isMobile };
}
