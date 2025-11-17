"use client";

import React from "react";
import DebugBadge from "./DebugBadge";

type WithDebugBadgeOptions = {
  badgeClassName?: string;
};

export function withDebugBadge<T extends React.ComponentType<any>>(
  Component: T,
  name?: string,
  options: WithDebugBadgeOptions = {}
) {
  type P = React.ComponentProps<T>;
  const Wrapped: React.FC<P> = (props: P) => {
    const label = name || (Component.displayName || (Component as any).name || "Component");
    return (
      <>
      <DebugBadge name={label} badgeClassName={options.badgeClassName}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        
      </DebugBadge>{React.createElement(Component as any, props)}
      </>
    );
  };
  Wrapped.displayName = `withDebugBadge(${name || (Component as any).displayName || (Component as any).name || "Component"})`;
  return Wrapped as unknown as T;
}
