"use client";
import React, { createContext, useContext, useState } from "react";

type NavbarVariant = "light" | "dark";

interface NavbarVariantContextType {
  variant: NavbarVariant;
  setVariant: (variant: NavbarVariant) => void;
}

const NavbarVariantContext = createContext<NavbarVariantContextType>({
  variant: "light",
  setVariant: () => {},
});

export function NavbarVariantProvider({
  children,
  initialVariant = "light",
}: {
  children: React.ReactNode;
  initialVariant?: NavbarVariant;
}) {
  const [variant, setVariant] = useState<NavbarVariant>(initialVariant);

  return (
    <NavbarVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </NavbarVariantContext.Provider>
  );
}

export function useNavbarVariant() {
  return useContext(NavbarVariantContext);
}
