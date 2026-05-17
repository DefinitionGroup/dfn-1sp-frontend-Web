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

  const collectPageIds = () => {
    const points = Array.from(
      document.querySelectorAll<HTMLElement>("[data-navpoint-name][id]")
    ).map((element) => ({
      id: element.id,
      name: element.getAttribute("data-navpoint-name") || element.id,
    }));

    const uniquePoints = points.filter(
      (point, index, array) => array.findIndex((item) => item.id === point.id) === index
    );

    setNavPoints(uniquePoints);
  };

  useEffect(() => {
    const idleCallback =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(collectPageIds)
        : null;
    const timeoutId = window.setTimeout(collectPageIds, 800);
    const finalPassId = window.setTimeout(collectPageIds, 1800);
    window.addEventListener("load", collectPageIds);

    return () => {
      if (idleCallback !== null) {
        window.cancelIdleCallback(idleCallback);
      }
      window.clearTimeout(timeoutId);
      window.clearTimeout(finalPassId);
      window.removeEventListener("load", collectPageIds);
    };
  }, []);

  return (
    <>
      <LineMinimap navPoints={navPoints} />
      {children}
    </>
  );
}
