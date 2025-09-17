"use client";

import { motion } from "motion/react";
import { ReactNode, ButtonHTMLAttributes } from "react";

const arrowIcon = "/8dfaedadc761d9f7c3e2635e641b6f6c8227ece8.svg";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onTransitionEnd"
  > {
  children: ReactNode;
  variant?: "default" | "lime" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const buttonVariants = {
  default:
    "bg-[#121212] text-[#f4f4f4] border-[#f4f4f4] border-b hover:bg-neutral-800 active:bg-neutral-900",
  lime: "bg-[#afff40] text-[#121212] hover:bg-lime-300 active:bg-lime-500",
  outline:
    "border-2 border-[#f4f4f4] text-[#f4f4f4] bg-transparent hover:bg-[#f4f4f4] hover:text-[#121212]",
  ghost: "text-[#f4f4f4] hover:bg-[#f4f4f4]/10 active:bg-[#f4f4f4]/20",
};

const buttonSizes = {
  sm: "px-2 py-2 text-[10px]",
  md: "px-2.5 pt-[11px] pb-4 text-[11px]",
  lg: "px-4 py-3 text-sm",
};

export default function Button({
  children,
  variant = "default",
  size = "md",
  showArrow = true,
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "relative inline-flex items-center justify-between font-['Aspekta_Variable'] font-normal leading-[1.45] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#f4f4f4] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-50 disabled:cursor-not-allowed";

  const combinedClasses = `${baseClasses} ${buttonVariants[variant]} ${
    buttonSizes[size]
  } ${fullWidth ? "w-full" : ""} ${className}`;

  return (
    <motion.button
      className={combinedClasses}
      disabled={disabled || isLoading}
      whileHover={{
        scale: disabled || isLoading ? 1 : 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: disabled || isLoading ? 1 : 0.98,
        transition: { duration: 0.1 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      {...props}>
      {/* Content */}
      <motion.span
        className="flex-1 text-left"
        variants={{
          initial: { opacity: 1, x: 0 },
          loading: { opacity: 0.7, x: isLoading ? 10 : 0 },
        }}
        animate={isLoading ? "loading" : "initial"}
        transition={{ duration: 0.2 }}>
        {/* Loading Spinner */}
        {isLoading && (
          <motion.div
            className="w-3 h-3 border border-current border-t-transparent rounded-full inline-block mr-2"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        {children}
      </motion.span>

      {/* Arrow Icon */}
      {showArrow && !isLoading && (
        <motion.div
          className="w-[13px] h-[13px] ml-8 flex-shrink-0"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}>
          <img
            src={arrowIcon}
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}
    </motion.button>
  );
}

// Export additional button variants for specific use cases
export function DefaultButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="default" {...props} />;
}

export function LimeButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="lime" {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="outline" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="ghost" {...props} />;
}
