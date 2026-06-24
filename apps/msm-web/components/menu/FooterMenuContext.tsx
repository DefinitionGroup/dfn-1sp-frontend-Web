"use client";

import React, { createContext, useContext } from "react";
import { FooterMenu } from "@1sp/sanity-types/menu";

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
