import { Children, isValidElement, type ReactNode } from "react";

export function hasVisibleText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasVisibleNode(node: ReactNode): boolean {
  return Children.toArray(node).some((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child).trim().length > 0;
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      return hasVisibleNode(child.props.children);
    }

    return false;
  });
}
