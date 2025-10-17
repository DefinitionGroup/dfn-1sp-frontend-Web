"use client";

import { useEffect, useState } from "react";
import LineMinimap from "./MapVertical";

interface PageWithMapVerticalProps {
  children: React.ReactNode;
}

export default function PageWithMapVertical({
  children,
}: PageWithMapVerticalProps) {
  const [navPoints, setNavPoints] = useState<string[]>([]);

  // Collect section IDs from DOM, filtering out framework/internal IDs.
  const collectPageIds = () => {
    setTimeout(() => {
      const allElements = document.querySelectorAll("[id]");
      const ids: string[] = [];

      allElements.forEach((element) => {
        const id = element.id;
        if (
          id &&
          !id.startsWith("headlessui-") &&
          !id.startsWith("radix-") &&
          !id.startsWith("__") &&
          !id.startsWith("_") &&
          id !== "_R_" &&
          id.length > 2 &&
          !/^\d+$/.test(id) &&
          id !== "root"
        ) {
          ids.push(id);
        }
      });

      const uniqueIds = [...new Set(ids)];
      setNavPoints(uniqueIds);
    }, 500);
  };

  useEffect(() => {
    collectPageIds();

    // Re-run collection when DOM changes (e.g., async content).
    const observer = new MutationObserver(() => {
      collectPageIds();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <LineMinimap navPoints={navPoints} />
      {children}
    </>
  );
}
