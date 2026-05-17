"use client";

import React, { createContext, useContext } from "react";
import { FooterMenu } from "@/types/menu.types";

const FooterMenuContext = createContext<FooterMenu | null>(null);

export function FooterMenuProvider({
  menu,
  children,
}: {
  menu?: FooterMenu | null;
  children: React.ReactNode;
}) {
  return (
    <FooterMenuContext.Provider value={menu || null}>
      {children}
    </FooterMenuContext.Provider>
  );
}

export function useFooterMenu() {
  return useContext(FooterMenuContext);
}
