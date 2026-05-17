"use client";

import React, { createContext, useContext } from "react";
import { NavbarMenu } from "@1sp/sanity-types/menu";

interface NavbarMenuContextValue {
  menu: NavbarMenu | null;
  hasCaseStudies: boolean;
  hasServices: boolean;
}

const NavbarMenuContext = createContext<NavbarMenuContextValue | null>(null);

export function NavbarMenuProvider({
  menu,
  hasCaseStudies = false,
  hasServices = false,
  children,
}: {
  menu?: NavbarMenu | null;
  hasCaseStudies?: boolean;
  hasServices?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavbarMenuContext.Provider
      value={{
        menu: menu || null,
        hasCaseStudies,
        hasServices,
      }}
    >
      {children}
    </NavbarMenuContext.Provider>
  );
}

export function useNavbarMenu() {
  return useContext(NavbarMenuContext);
}
