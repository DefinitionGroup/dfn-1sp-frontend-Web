"use client";

import {
  motion,
  useSpring,
  useMotionValueEvent,
  useScroll,
  MotionValue,
  useMotionValue,
  AnimatePresence,
} from "motion/react";
import * as React from "react";
import { clamp } from "../lib/clamp";
export const LINE_GAP = 6;
export const LINE_WIDTH = 1;
export const LINE_COUNT = 50;
export const LINE_HEIGHT = 4;  // Now used as widtwh for horizontal bars
export const LINE_HEIGHT_ACTIVE =10;  // Now used as width for active horizontal bars

export const LINE_STEP = LINE_WIDTH + LINE_GAP;  // Now vertical step between bars
export const MIN = 0;
export const MAX_HEIGHT = LINE_COUNT * LINE_WIDTH + (LINE_COUNT - 1) * LINE_GAP;  // Total height of the vertical stack

// Controls scroll speed (higher = faster)
// Set to 1 for no smoothing at all
export const SCROLL_SMOOTHING = 1;

// Transformer constants
export const DEFAULT_INTENSITY = 7;
export const DISTANCE_LIMIT = 28;

// Linear interpolation function for smooth transitions
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export default function LineMinimap({ navPoints }: { navPoints: string[] }) {
  const scrollY = useScrollY(MAX_HEIGHT);
  const { mouseX, onMouseMove, onMouseLeave } = useMouseX();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // // Auto-hide navPoints after 2 seconds
  // React.useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;

  //   if (isHovered) {
  //     timeoutId = setTimeout(() => {
  //       setIsHovered(false);
  //     }, 2000);
  //   }

  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   };
  // }, [isHovered]);

  // Calculate proportional positions for navPoints along the 50 lines
  // Add space for an invisible navpoint at the end by using navPoints.length + 1
  const navPointPositions = navPoints.map((_, i) => {
    const totalPositions = navPoints.length + 1; // Add 1 for invisible navpoint at end
    if (totalPositions === 1) return 0;
    return Math.round((i * (LINE_COUNT - 1)) / (totalPositions - 1));
  });

  return (
    <div
      className="fixed top-0 left-6 z-50  w-[40px] flex flex-col  justify-center h-[100vh]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative "
        onPointerMove={onMouseMove}
        onPointerLeave={onMouseLeave}
      >  <div className="absolute -bottom-[40px] left-[12px] text-white text-[7px] font-medium leading-none  -rotate-90 origin-bottom-left">
        Scroll to Navigate
        </div>
        <div className="flex flex-col items-start" style={{ gap: LINE_GAP }}>
          {[...Array(LINE_COUNT)].map((_, i) => {
            const navPointIndex = navPointPositions.indexOf(i);
            const isNavPoint = navPointIndex !== -1;
            const navPointId = isNavPoint ? navPoints[navPointIndex] : undefined;

            return (
              <div key={i} className="relative">
                <Line
                  index={i}
                  scrollY={scrollY}
                  mouseX={mouseX}
                  active={isActive(i, LINE_COUNT)}
                />
                <AnimatePresence>
                  {isNavPoint && isHovered && (
                    <NavPoint
                      id={navPointId!}
                      index={i}
                      navPointIndex={navPointIndex}
                      scrollY={scrollY}
                      mouseX={mouseX}
                      onClick={() => handleNavClick(navPointId!)}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <Indicator y={scrollY} />
      </motion.div>
    </div>
  );
}

function Line({
  active,
  mouseX,
  scrollY,
  index,
}: {
  active?: boolean;
  hovered?: boolean;
  mouseX: MotionValue<number>;
  scrollY: MotionValue<number>;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scaleX = useSpring(1, { damping: 45, stiffness: 600 });
  const centerY = index * LINE_STEP + LINE_WIDTH / 2;

  useProximity(scaleX, {
    ref,
    baseValue: 1,
    mouseX,
    scrollY,
    centerY,
  });

  return (
    <motion.div
      ref={ref}
      className={active ? "bg-lime-500" : "bg-neutral-200"}
      style={{
        height: LINE_WIDTH,
        width: active ? LINE_HEIGHT_ACTIVE : LINE_HEIGHT,
        scaleX,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        opacity: { delay: index * 0.02, duration: 0.12 },
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    />
  );
}

function NavPoint({
  id,
  mouseX,
  scrollY,
  index,
  navPointIndex,
  onClick,
}: {
  id: string;
  mouseX: MotionValue<number>;
  scrollY: MotionValue<number>;
  index: number;
  navPointIndex: number;
  onClick: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scaleX = useSpring(1, { damping: 45, stiffness: 600 });
  const centerY = index * LINE_STEP + LINE_WIDTH / 2;



  return (
    <motion.div
      ref={ref}
      className="absolute -top-2 z-50 left-4 bg-gray-900 text-gray-200 hover:bg-gray-200 hover:text-gray-800! font-normal cursor-pointer pointer-events-auto flex px-2 py-1 items-center justify-start rounded-xl"
      style={{

        width: LINE_HEIGHT_ACTIVE + 64, // Make it wider to accommodate text
        scaleX,

      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        opacity: { delay: navPointIndex * 0.05, duration: 0.2 },
        x: { delay: navPointIndex * 0.05, duration: 0.3, type: "spring", stiffness: 300, damping: 25 },
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      onClick={onClick}
    >
      <span className=" text-[8px] font-semibold tracking-wider ml-2 ">
        {id}
      </span>
    </motion.div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function transformScale(
  distance: number,
  initialValue: number,
  baseValue: number,
  intensity: number
) {
  if (Math.abs(distance) > DISTANCE_LIMIT) {
    return initialValue;
  }
  const normalizedDistance = initialValue - Math.abs(distance) / DISTANCE_LIMIT;
  const scaleFactor = normalizedDistance * normalizedDistance;
  return baseValue + intensity * scaleFactor;
}

export interface ProximityOptions {
  ref: React.RefObject<HTMLElement | null>;
  baseValue: number;
  mouseX: MotionValue<number>;
  scrollY: MotionValue<number>;
  centerY: number;
  intensity?: number;
  reset?: boolean;
  transformer?: (
    distance: number,
    initialValue: number,
    baseValue: number,
    intensity: number
  ) => number;
}

export function useProximity(
  value: MotionValue<number>,
  {
    ref,
    baseValue,
    mouseX,
    scrollY,
    centerY,
    intensity = DEFAULT_INTENSITY,
    reset = true,
    transformer = transformScale,
  }: ProximityOptions
) {
  const initialValueRef = React.useRef<number>(null);

  React.useEffect(() => {
    if (!initialValueRef.current) {
      initialValueRef.current = value.get();
    }
  }, []);

  useMotionValueEvent(mouseX, "change", (latest) => {
    const rect = ref.current!.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const distance = latest - centerY;
    value.set(
      transformer(distance, initialValueRef.current!, baseValue, intensity)
    );
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const initialValue = initialValueRef.current!;
    const distance = latest - centerY;
    const targetScale = transformer(
      distance,
      initialValue,
      baseValue,
      intensity
    );

    if (reset) {
      const currentVelocity = Math.abs(scrollY.getVelocity());
      const velocityThreshold = 300;
      const velocityFactor = Math.min(1, currentVelocity / velocityThreshold);
      const lerped = lerp(initialValue, targetScale, velocityFactor);
      value.set(lerped);
    } else {
      value.set(targetScale);
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////


export function useScrollY(max: number = MAX_HEIGHT) {
  const scrollY = useSpring(0, {
    stiffness: 500,
    damping: 40,
    // Lower mass for faster response
    mass: 0.8,
  });

  const { scrollY: pageScrollY } = useScroll();
  const targetY = React.useRef(0);

  // State to hold the total scrollable height
  const [totalHeight, setTotalHeight] = React.useState(0);

  // Update total height on mount and window resize
  React.useEffect(() => {
    const updateHeight = () => {
      setTotalHeight(document.body.scrollHeight - window.innerHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useMotionValueEvent(pageScrollY, "change", (latest) => {
    if (totalHeight > 0) {
      // Map the scroll position proportionally to the full page height
      targetY.current = clamp((latest / totalHeight) * max, [0, max]);
    }
  });

  useRequestAnimationFrame(() => {
    const currentY = scrollY.get();
    const smoothY = lerp(currentY, targetY.current, SCROLL_SMOOTHING);
    // Only update if there's a meaningful difference
    if (Math.abs(smoothY - currentY) > 0.01) {
      scrollY.set(smoothY);
    }
  });

  return scrollY;
}

export function useMouseX() {
  const mouseX = useMotionValue<number>(0);

  function onPointerMove(e: React.PointerEvent) {
    mouseX.set(e.clientX);
  }

  function onPointerLeave() {
    mouseX.set(0);
  }

  return { mouseX, onMouseMove: onPointerMove, onMouseLeave: onPointerLeave };
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function useRequestAnimationFrame(callback: () => void) {
  const requestRef = React.useRef<number | null>(null);

  const animate = () => {
    callback();
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function isActive(index: number, count: number): boolean {
  // First and last ticks are always active
  if (index === 0 || index === count - 1) return true;
  // Calculate the step size between active ticks
  const step = count / (Math.floor(count / LINE_GAP) + 1);
  // Check if this index is close to a multiple of the step
  return Math.abs(index % step) < 0.5 || Math.abs((index % step) - step) < 0.5;
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function Indicator({ y }: { y: MotionValue<number> }) {
  return (
    <motion.div
      className="flex bg-lime-500 h-[1px] rounded-full items-center absolute w-[32px]! -top-0"
      style={{ y }}
    >
      <svg
        width="6"
        height="7"
        viewBox="0 0 6 7"
        fill="none"
        className="-translate-x-2 "
      >
        <path
          d="M6 3.54688L0.75 0.515786L0.75 6.57796L6 3.54688Z"
          fill="  var(--color-lime-500) "

        />
      </svg>
    </motion.div>
  );
}
