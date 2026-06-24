"use client";

import React, { createContext, useContext } from "react";

type NavColor = "light" | "dark";

const NavColorContext = createContext<NavColor>("light");

export function NavColorProvider({
  color,
  children,
}: {
  color?: NavColor;
  children: React.ReactNode;
}) {
  return (
    <NavColorContext.Provider value={color || "light"}>
      {children}
    </NavColorContext.Provider>
  );
}

export function useNavColor() {
  return useContext(NavColorContext);
}
