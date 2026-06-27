"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ForwardedRef, HTMLAttributes, ReactNode } from "react";
import styles from "./glass-surface.module.css";

type Channel = "R" | "G" | "B";
type BlendMode = CSSProperties["mixBlendMode"];

type GlassSurfaceStyle = CSSProperties & {
  "--filter-id": string;
  "--glass-frost": number;
  "--glass-saturation": number;
};

type GlassSurfaceProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "style"> & {
  backgroundOpacity?: number;
  blur?: number;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  blueOffset?: number;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  displace?: number;
  distortionScale?: number;
  greenOffset?: number;
  height?: number | string;
  mixBlendMode?: BlendMode;
  opacity?: number;
  redOffset?: number;
  saturation?: number;
  style?: CSSProperties;
  tintBlendMode?: BlendMode;
  tintColor?: string;
  tintOpacity?: number;
  width?: number | string;
  xChannel?: Channel;
  yChannel?: Channel;
};

export const menuGlassSurfaceProps = {
  backgroundOpacity: 0.21,
  blur: 122,
  borderWidth: 2.22,
  brightness: 12,
  displace: 2.8,
  distortionScale: -255,
  opacity: 0.326,
  saturation: 2.15,
  tintBlendMode: "multiply" as const,
  tintColor: "var(--color-black)",
  tintOpacity: 0.42,
};

export const cardGlassSurfaceProps = {
  ...menuGlassSurfaceProps,
  borderRadius: 42,
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function supportsSVGFilters(filterId: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isWebkit || isFirefox) {
    return false;
  }

  const div = document.createElement("div");
  div.style.backdropFilter = `url(#${filterId})`;

  return div.style.backdropFilter !== "";
}

export const GlassSurface = forwardRef(function GlassSurface({
  backgroundOpacity = 0,
  blur = 11,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  blueOffset = 20,
  children,
  className = "",
  contentClassName,
  displace = 0,
  distortionScale = -180,
  greenOffset = 10,
  height = 80,
  mixBlendMode = "difference",
  opacity = 0.93,
  redOffset = 0,
  saturation = 1,
  style = {},
  tintBlendMode = "normal",
  tintColor = "transparent",
  tintOpacity = 0,
  width = 200,
  xChannel = "R",
  yChannel = "G",
  ...props
}: GlassSurfaceProps, forwardedRef: ForwardedRef<HTMLDivElement>) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    feImageRef.current?.setAttribute("href", generateDisplacementMap());
  };

  useEffect(() => {
    updateDisplacementMap();

    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (!ref.current) {
        return;
      }

      ref.current.setAttribute("scale", (distortionScale + offset).toString());
      ref.current.setAttribute("xChannelSelector", xChannel);
      ref.current.setAttribute("yChannelSelector", yChannel);
    });

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
  }, [width, height]);

  useEffect(() => {
    setSvgSupported(supportsSVGFilters(filterId));
  }, [filterId]);

  // Set backdrop-filter inline (not via the CSS `var(--filter-id)`) purely for
  // reliability — both paths compute identically here, inline just can't be
  // defeated by cascade/specificity surprises.
  //
  // CRITICAL: do NOT prepend `blur(...)`. The aquamed reference applies only
  // `url(#id) saturate(...)`; a leading backdrop blur smears the backdrop into
  // a flat frost *before* the displacement map runs, so the chromatic
  // refraction has no edges left to bend and the glass reads as a dull panel.
  // The filter chain already ends in a small feGaussianBlur (`displace`) for
  // softness — that's the only blur the effect needs.
  const backdropFilterValue = svgSupported
    ? `url(#${filterId}) saturate(${saturation})`
    : undefined;

  const containerStyle: GlassSurfaceStyle = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": backgroundOpacity,
    "--glass-saturation": saturation,
    "--filter-id": `url(#${filterId})`,
    ...(backdropFilterValue
      ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
      : {}),
  };

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      {...props}
      className={cx(
        "relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out",
        svgSupported ? styles.svg : styles.fallback,
        styles.focusable,
        className,
      )}
      style={containerStyle}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispRed"
              scale={distortionScale + redOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispGreen"
              scale={distortionScale + greenOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispBlue"
              scale={distortionScale + blueOffset}
              xChannelSelector={xChannel}
              yChannelSelector={yChannel}
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation={displace} />
          </filter>
        </defs>
      </svg>

      {tintOpacity > 0 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          style={{
            backgroundColor: tintColor,
            mixBlendMode: tintBlendMode,
            opacity: tintOpacity,
          }}
        />
      ) : null}

      <div
        className={cx(
          "relative z-10 flex h-full w-full rounded-[inherit]",
          contentClassName ?? "items-center justify-center p-2",
        )}
      >
        {children}
      </div>
    </div>
  );
});

export default GlassSurface;
