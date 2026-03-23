"use client";

import { useEffect, useRef, useState } from "react";

interface DeferredSectionProps {
  children: React.ReactNode;
  rootMargin?: string;
  fallbackHeightClassName?: string;
}

export default function DeferredSection({
  children,
  rootMargin = "1200px 0px",
  fallbackHeightClassName = "min-h-[25vh] md:min-h-[40vh]",
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, shouldRender]);

  return (
    <div ref={ref}>
      {shouldRender ? (
        children
      ) : (
        <div className={fallbackHeightClassName} aria-hidden="true" />
      )}
    </div>
  );
}
