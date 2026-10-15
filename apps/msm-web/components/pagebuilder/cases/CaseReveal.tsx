"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

const CONTENT_TARGETS = "p, h2, h3, h4, h5, h6, li, footer, [data-case-reveal-target]";

/** Observe reading units, not their potentially viewport-tall CMS container. */
export default function CaseReveal({ children, className, content = false }: {
  children: ReactNode;
  className?: string;
  content?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(new WeakSet<Element>());
  const finish = useRef(() => {});
  const refresh = useRef(() => {});
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const getItems = () => {
      const candidates = Array.from(root.querySelectorAll<HTMLElement>(CONTENT_TARGETS));
      return content
        ? candidates.filter((item) => item.closest("[data-case-reveal]") === root &&
            // A list item (or explicit action) owns its children: never animate twice.
            !candidates.some((parent) => parent !== item && parent.contains(item)))
        : Array.from(root.children) as HTMLElement[];
    };
    let items = getItems();
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | undefined;

    const settle = (item: HTMLElement) => {
      seen.current.add(item);
      item.dataset.caseRevealState = "complete";
      observer?.unobserve(item);
      animations.get(item)?.cancel();
      animations.delete(item);
    };
    finish.current = () => items.forEach(settle);

    // Rendered copy stays readable before hydration and when motion is disabled.
    if (reduced || !window.IntersectionObserver || !Element.prototype.animate) {
      finish.current();
      return;
    }
    items.forEach((item) => {
      item.dataset.caseRevealState = seen.current.has(item) ? "complete" : "pending";
    });

    refresh.current = () => {
      const next = getItems();
      items.filter((item) => !next.includes(item)).forEach(settle);
      next.filter((item) => !items.includes(item)).forEach((item) => {
        item.dataset.caseRevealState = seen.current.has(item) ? "complete" : "pending";
        if (!seen.current.has(item)) observer?.observe(item);
      });
      items = next;
    };

    const observe = () => {
      observer?.disconnect();
      const inset = Math.min(120, Math.round(window.innerHeight * 0.15));
      observer = new IntersectionObserver((entries) => {
        const entering = new Set(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target));
        // Only stagger this visible batch. Offscreen paragraphs keep their own trigger.
        items.filter((item) => entering.has(item) && !seen.current.has(item)).forEach((item, index) => {
          seen.current.add(item);
          observer?.unobserve(item);
          item.dataset.caseRevealState = "running";
          const animation = item.animate([
            { opacity: 0.4, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0px)" },
          ], {
            duration: 600,
            delay: Math.min(index * 90, 270),
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
            fill: "backwards",
          });
          animations.set(item, animation);
          animation.onfinish = () => settle(item);
        });
      }, { rootMargin: `0px 0px -${inset}px 0px`, threshold: 0 });
      items.filter((item) => !seen.current.has(item)).forEach((item) => observer!.observe(item));
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
      animations.forEach((animation, item) => {
        animation.cancel();
        item.dataset.caseRevealState = "complete";
      });
      finish.current = () => {};
      refresh.current = () => {};
    };
  }, [content, reduced]);

  // CMS edits may add reading units. Ordinary parent renders must not cancel motion.
  useEffect(() => { refresh.current(); });

  return <div ref={ref} className={className} data-case-reveal={content ? "content" : "group"}
    onFocusCapture={() => finish.current()}>
    {Children.toArray(children).map((child, index) => <div key={index} className="w-full min-w-0">{child}</div>)}
  </div>;
}
