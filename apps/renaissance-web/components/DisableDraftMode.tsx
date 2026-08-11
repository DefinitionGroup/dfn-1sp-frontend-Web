"use client";

import { useVisualEditingEnvironment } from "next-sanity/hooks";
import Link from "next/link";
export function DisableDraftMode() {
  const environment = useVisualEditingEnvironment();

  // Only show the toggle when previewing outside the Presentation Tool —
  // inside the Studio iframe/window, Presentation manages draft mode itself.
  if (
    environment === "presentation-iframe" ||
    environment === "presentation-window"
  ) {
    return null;
  }

  return (
    <Link
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 bg-gray-50 px-4 py-2"
    >
      Disable Draft Mode
    </Link>
  );
}
