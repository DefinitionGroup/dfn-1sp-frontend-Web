"use client";

import React from "react";
import DebugBadge from "./DebugBadge";

export function withDebugBadge<T extends React.ComponentType<any>>(
  Component: T,
  name?: string
) {
  type P = React.ComponentProps<T>;
  const Wrapped: React.FC<P> = (props: P) => {
    const label = name || (Component.displayName || (Component as any).name || "Component");
    return (
      <DebugBadge name={label}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {React.createElement(Component as any, props)}
      </DebugBadge>
    );
  };
  Wrapped.displayName = `withDebugBadge(${name || (Component as any).displayName || (Component as any).name || "Component"})`;
  return Wrapped as unknown as T;
}
