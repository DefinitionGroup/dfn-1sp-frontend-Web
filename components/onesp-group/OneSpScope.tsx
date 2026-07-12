import type { ReactNode } from "react";
import styles from "./OneSpScope.module.css";

type OneSpScopeProps = {
  children: ReactNode;
  groupId?: string;
};

/**
 * Visual boundary for canonical 1SP blocks embedded in another site.
 *
 * CSS Modules protect selector names; the local token reset additionally
 * protects Tailwind utilities from the host app's theme variables.
 */
export default function OneSpScope({ children, groupId }: OneSpScopeProps) {
  return (
    <div
      className={styles.root}
      data-onesp-component-group=""
      data-onesp-component-group-id={groupId || undefined}
    >
      {children}
    </div>
  );
}
