"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ComponentLoader from "@flzr/components/ui/ComponentLoader";
import type { ShowtimeGallery as ShowtimeGalleryType } from "@/types/sanity.types";

const ShowtimeGallery = dynamic(() => import("../pg-ShowtimeGallery"), {
  loading: () => <ComponentLoader />,
  ssr: false,
});

export default function DeferredShowtimeGalleryShell({
  data,
}: {
  data: ShowtimeGalleryType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const placeholderMinHeight = `${Math.max((data.steps?.length ?? 1) * 95, 240)}vh`;

  useEffect(() => {
    if (shouldRender) return;

    const node = ref.current;
    if (!node) return;

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
      { rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref}>
      {shouldRender ? (
        <ShowtimeGallery data={data} />
      ) : (
        <div style={{ minHeight: placeholderMinHeight }} aria-hidden="true" />
      )}
    </div>
  );
}
