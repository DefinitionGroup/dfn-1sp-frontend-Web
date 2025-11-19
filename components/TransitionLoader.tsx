"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TransitionLoader() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        background: "rgba(0, 0, 0, 0.02)",
        animation: "fadeIn 0.15s ease-in",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-lime-400/30">
        <div
          className="h-full bg-lime-400"
          style={{
            animation: "loadingBar 2s ease-in-out infinite",
            width: "0%",
          }}
        />
      </div>
    </div>
  );
}
