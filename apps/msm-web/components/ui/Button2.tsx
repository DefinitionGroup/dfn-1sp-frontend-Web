"use client";
import MosaicButton, { type MosaicButtonSize } from "./MosaicButton";

interface Button2Props {
  text?: string;
  className?: string;
  href?: string;
  variant?: "default" | "black" | "violet" | "violetsmall" | "violetsmallrounded" | "limesmall" | "ghost";
  magnetic?: boolean;
}

// Legacy Button2 variants mapped onto the generic MosaicButton. The corner
// tile color stays random (per mount) like the logo mosaic; variants only
// influence sizing.
const sizeMap: Record<NonNullable<Button2Props["variant"]>, MosaicButtonSize> = {
  default: "md",
  black: "md",
  ghost: "md",
  violet: "md",
  violetsmall: "sm",
  violetsmallrounded: "sm",
  limesmall: "sm",
};

function Button2({ text, className, href, variant = "default", magnetic = true }: Button2Props) {
  return (
    <MosaicButton
      className={className}
      href={href}
      magnetic={magnetic}
      size={sizeMap[variant] ?? "md"}
      text={text}
    />
  );
}

export default Button2;
