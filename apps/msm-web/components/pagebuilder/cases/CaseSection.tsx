"use client";

import type { ReactNode } from "react";
import Badgemodule from "@msm/components/ui/Badgemodule";
import EditorialReveal from "@msm/components/ui/EditorialReveal";
import { hasVisibleText } from "@1sp/utils/text-content";
import styles from "./CaseDetail.module.css";

/** One badge rail and reading column for every MSM case narrative block. */
export default function CaseSection({ title, badgeText, badgeSubtitle, children }: {
  title?: string;
  badgeText?: string;
  badgeSubtitle?: string;
  children: ReactNode;
}) {
  const label = hasVisibleText(badgeText) ? badgeText : title;
  const distinctTitle = hasVisibleText(title) && title !== label;
  return (
    <div className={styles.narrativeRow}>
      <div className={styles.badgeRail}>
        {hasVisibleText(label) && <Badgemodule text={label!} subtitle={badgeSubtitle || ""}
          titleAs={distinctTitle ? "p" : "h2"} className={styles.sectionBadge} />}
      </div>
      <EditorialReveal className={styles.narrativeBody}>
        {distinctTitle && <h2 className={styles.heading}>{title}</h2>}
        {children}
      </EditorialReveal>
    </div>
  );
}
