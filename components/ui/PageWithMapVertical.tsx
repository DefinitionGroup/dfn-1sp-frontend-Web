"use client";

import { useEffect, useState } from "react";
import LineMinimap, { NavPoint } from "./MapVertical";
interface PageWithMapVerticalProps {
  children: React.ReactNode;
}

export default function PageWithMapVertical({
  children,
}: PageWithMapVerticalProps) {
  const [navPoints, setNavPoints] = useState<NavPoint[]>([]);

  // Collect section IDs and custom nav names from DOM
  const collectPageIds = () => {
    setTimeout(() => {
      const allElements = document.querySelectorAll("[id]");
      const points: NavPoint[] = [];

      allElements.forEach((element) => {
        const id = element.id;

        // Check if element is inside a footer
        const isInFooter = element.closest("footer") !== null;

        if (
          id &&
          !id.startsWith("headlessui-") &&
          !id.startsWith("radix-") &&
          !id.startsWith("__") &&
          !id.startsWith("_") &&
          id !== "_R_" &&
          id.length > 2 &&
          !/^\d+$/.test(id) &&
          !/^\d+-\d+$/.test(id) && // Exclude timestamp-like IDs (e.g., 1762951177499-0)
          id !== "root" &&
          !isInFooter // Exclude footer elements
        ) {
          // Check for custom navpoint name in data attribute
          const customName = element.getAttribute("data-navpoint-name");
          points.push({
            id: id,
            name: customName || id,
          });
        }
      });

      setNavPoints(points);
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
