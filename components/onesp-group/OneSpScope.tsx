import type { ReactNode } from "react";
import styles from "./OneSpScope.module.css";

type OneSpScopeProps = {
  children: ReactNode;
  groupId?: string;
  fullWidth?: boolean;
};

/**
 * Visual boundary for canonical 1SP blocks embedded in another site.
 *
 * CSS Modules protect selector names; the local token reset additionally
 * protects Tailwind utilities from the host app's theme variables.
 */
export default function OneSpScope({
  children,
  groupId,
  fullWidth = false,
}: OneSpScopeProps) {
  return (
    <div
      className={`${styles.root} ${fullWidth ? styles.fullWidth : ""}`}
      data-onesp-component-group=""
      data-onesp-component-group-id={groupId || undefined}
    >
      {children}
    </div>
  );
}
