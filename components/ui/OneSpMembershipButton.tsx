"use client";

import localFont from "next/font/local";
import Button2 from "./Button2";
import styles from "./OneSpMembershipButton.module.css";

const font = localFont({src: "../../app/fonts/AspektaVF.woff2", display: "swap"});

/** The network link uses the canonical 1SP button, independent of its host brand. */
export default function OneSpMembershipButton({eyebrow}: {
  eyebrow?: string;
}) {
  return <div className={`${styles.root} ${font.className}`} data-onesp-membership="" data-button-variant="minimenu">
    <Button2 href="https://1sp.agency" text="1SP.agency" eyebrow={eyebrow?.trim() || "proud member of"}
      variant="minimenu" magnetic={false} />
  </div>;
}
