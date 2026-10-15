"use client";

import { useEffect, useRef } from "react";
import { COOKIEBOT_DECLARATION_SRC } from "@msm/lib/cookiebot";
import styles from "./CookieDeclaration.module.css";

export default function CookieDeclaration({ language }: { language: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // The vendor inserts its report beside this script. Keep it inside the
    // section, and execute it again when returning via client-side navigation.
    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.src = COOKIEBOT_DECLARATION_SRC;
    script.type = "text/javascript";
    script.async = true;
    script.dataset.culture = language.toUpperCase();
    container.appendChild(script);

    return () => container.replaceChildren();
  }, [language]);

  return <div ref={containerRef} className={styles.declaration} />;
}
