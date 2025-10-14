"use client";

import { useEffect } from "react";

export function StegaErrorHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Intercept console.error
    console.error = (...args) => {
      const message = args[0];

      // Suppress stega-related errors
      if (
        typeof message === "string" &&
        (message.includes("Failed to decode stega") ||
          message.includes("Unexpected end of JSON input") ||
          message.includes("Encoded data has invalid length") ||
          message.includes("is not valid JSON") ||
          message.includes("stega"))
      ) {
        return;
      }

      originalConsoleError.apply(console, args);
    };

    // Intercept console.warn for stega warnings
    console.warn = (...args) => {
      const message = args[0];

      if (typeof message === "string" && message.includes("stega")) {
        return;
      }

      originalConsoleWarn.apply(console, args);
    };

    // Clean up on unmount
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return null;
}
