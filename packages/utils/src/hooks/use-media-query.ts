"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    const updateMatches = (event?: MediaQueryListEvent) => {
      setMatches(event?.matches ?? mediaQueryList.matches);
    };

    updateMatches();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", updateMatches);
      return () => mediaQueryList.removeEventListener("change", updateMatches);
    }

    mediaQueryList.addListener(updateMatches);
    return () => mediaQueryList.removeListener(updateMatches);
  }, [query]);

  return matches;
}
