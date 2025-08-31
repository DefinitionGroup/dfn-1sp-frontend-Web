"use client";
import React from "react";
import { motion } from "motion/react";

interface ArrowBigProps {
  size?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}

function ArrowBig({
  size = 129,
  color = "black",
  animate = false,
  className,
}: ArrowBigProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 129 129"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <motion.path
        d="M26.4307 0.0185535L124.594 0.0185492C125.595 0.0185492 126.556 0.416323 127.264 1.12437C127.972 1.83241 128.37 2.79273 128.37 3.79406L128.37 101.957C128.37 102.959 127.972 103.919 127.264 104.627C126.556 105.335 125.595 105.733 124.594 105.733C123.593 105.733 122.632 105.335 121.924 104.627C121.216 103.919 120.819 102.959 120.819 101.957L120.819 12.9119L6.44879 127.282C5.74035 127.99 4.7795 128.388 3.77761 128.388C2.77573 128.388 1.81488 127.99 1.10644 127.282C0.397995 126.573 -1.21331e-07 125.612 -1.65125e-07 124.611C-2.08919e-07 123.609 0.397995 122.648 1.10644 121.939L115.476 7.56958L26.4307 7.56958C25.4294 7.56958 24.4691 7.17181 23.761 6.46376C23.053 5.75571 22.6552 4.79539 22.6552 3.79407C22.6552 2.79274 23.053 1.83242 23.761 1.12437C24.4691 0.416327 25.4294 0.0185536 26.4307 0.0185535Z"
        stroke={color}
        strokeWidth="0.5"
        fill="none"
        initial={animate ? { pathLength: 0 } : {}}
        animate={animate ? { pathLength: 1 } : {}}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  );
}

export default ArrowBig;
