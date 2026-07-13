"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { cn } from "@1sp/utils/cn";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";

const Strands = dynamic(() => import("./Strands"), { ssr: false });

/**
 * FLZR pill button — violet aurora WebGL shader that follows the pointer,
 * spring hover/press physics, mono telemetry label, pronounced radius.
 *
 * The legacy two-element roll variants (violetsmall, limesmall, …) are
 * accepted and normalised onto the new { variant, size } system so existing
 * call sites keep working.
 */

type LegacyVariant =
  | "default"
  | "black"
  | "glass"
  | "lime"
  | "violet"
  | "violetsmall"
  | "violetsmallrounded"
  | "limesmall"
  | "ghost"
  | "outline"
  | "strands"
  | "compact";

type Variant = "violet" | "dark" | "glass" | "ghost" | "strands";
type Size = "sm" | "md" | "lg";

interface Button2Props {
  text?: string;
  className?: string;
  href?: string;
  variant?: LegacyVariant;
  size?: Size;
  magnetic?: boolean;
  [key: string]: unknown;
}

/** Map legacy variant strings to the new system */
function normalize(variant: LegacyVariant): { variant: Variant; size: Size } {
  switch (variant) {
    case "violet":
    case "lime":
      return { variant: "violet", size: "md" };
    case "violetsmall":
    case "violetsmallrounded":
    case "limesmall":
      return { variant: "violet", size: "sm" };
    case "black":
      return { variant: "dark", size: "md" };
    case "glass":
      return { variant: "glass", size: "md" };
    case "strands":
      return { variant: "strands", size: "md" };
    case "ghost":
    case "outline":
      return { variant: "ghost", size: "md" };
    case "compact":
      return { variant: "ghost", size: "sm" };
    case "default":
    default:
      return { variant: "glass", size: "md" };
  }
}

/* ------------------------------------------------------------------ */
/* WebGL aurora shader                                                 */
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;   /* 0..1, y up */
uniform float u_hover;  /* 0..1 */
uniform float u_press;  /* 0..1 */
uniform float u_dark;   /* 0 = violet base, 1 = ink base */

const vec3 VIOLET   = vec3(0.486, 0.361, 1.0);   /* #7c5cff */
const vec3 LAVENDER = vec3(0.839, 0.800, 1.0);   /* #d6ccff */
const vec3 WHITE    = vec3(1.0, 1.0, 1.0);
const vec3 INK      = vec3(0.075, 0.063, 0.098); /* #131019 */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
vec2 hash2(vec2 p) {
  return fract(
    sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) *
      43758.5453
  );
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);

  /* plain base colour — no gradient */
  vec3 base = mix(VIOLET, INK, u_dark);
  vec3 col = base;

  /* faint halo under the pointer so sparkles have a stage */
  float d = distance(p, m);
  col = mix(col, LAVENDER, exp(-d * d * 6.0) * u_hover * 0.18);

  /* sparkle field — hashed grid, each cell twinkles near the pointer */
  float density = 11.0;
  vec2 g = p * density;
  vec2 id = floor(g);
  vec2 f = fract(g);
  float reach = 9.0 / (1.0 + u_press * 2.5); /* press = wider burst */

  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 2; j++) {
      vec2 o = vec2(float(i), float(j));
      vec2 cid = id + o;
      vec2 jitter = hash2(cid) * 0.8 + 0.1;
      float rnd = hash(cid);

      /* twinkle: sharp sine pulses at per-cell speed/phase */
      float tw = pow(0.5 + 0.5 * sin(u_time * (4.0 + 5.0 * rnd) + rnd * 6.2831), 5.0);

      /* proximity of this sparkle to the pointer */
      vec2 world = (cid + jitter) / density;
      float pd = distance(world, m);
      float prox = exp(-pd * pd * reach);

      /* round glint with sharp falloff */
      float sd = length(jitter + o - f);
      float glint = exp(-sd * sd * 70.0) * tw * prox;

      col += mix(LAVENDER, WHITE, tw) * glint * (1.6 + u_press * 1.2) * u_hover;
    }
  }

  /* film grain, keeps flat fills organic */
  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233)) + u_time) * 43758.5453);
  col += (grain - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface AuroraState {
  gl: WebGLRenderingContext;
  uniforms: Record<string, WebGLUniformLocation | null>;
  raf: number;
  running: boolean;
  mouse: { x: number; y: number };
  hover: { v: number; target: number };
  press: { v: number; target: number };
  dark: boolean;
  start: number;
}

function AuroraCanvas({
  dark,
  active,
  pressed,
  mouseRef,
  className,
}: {
  dark: boolean;
  active: boolean;
  pressed: boolean;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AuroraState | null>(null);
  const loopRef = useRef<FrameRequestCallback | null>(null);
  const [failed, setFailed] = useState(false);

  const teardown = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    cancelAnimationFrame(s.raf);
    s.gl.getExtension("WEBGL_lose_context")?.loseContext();
    stateRef.current = null;
  }, []);

  // Lazy init: only build the GL context once the button is first hovered.
  useEffect(() => {
    if (!active || stateRef.current || failed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uniforms: AuroraState["uniforms"] = {};
    for (const name of ["u_res", "u_time", "u_mouse", "u_hover", "u_press", "u_dark"]) {
      uniforms[name] = gl.getUniformLocation(prog, name);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);

    const state: AuroraState = {
      gl,
      uniforms,
      raf: 0,
      running: false,
      mouse: { x: 0.5, y: 0.5 },
      hover: { v: 0, target: 1 },
      press: { v: 0, target: 0 },
      dark,
      start: performance.now(),
    };
    stateRef.current = state;

    const frame = (now: number) => {
      const s = stateRef.current;
      if (!s) return;
      // smooth pointer + state easing (no allocation in the loop)
      s.mouse.x += (mouseRef.current.x - s.mouse.x) * 0.3;
      s.mouse.y += (mouseRef.current.y - s.mouse.y) * 0.3;
      s.hover.v += (s.hover.target - s.hover.v) * 0.16;
      s.press.v += (s.press.target - s.press.v) * 0.35;

      const g = s.gl;
      g.uniform2f(s.uniforms.u_res, canvas.width, canvas.height);
      g.uniform1f(s.uniforms.u_time, (now - s.start) / 1000);
      g.uniform2f(s.uniforms.u_mouse, s.mouse.x, 1 - s.mouse.y);
      g.uniform1f(s.uniforms.u_hover, s.hover.v);
      g.uniform1f(s.uniforms.u_press, s.press.v);
      g.uniform1f(s.uniforms.u_dark, s.dark ? 1 : 0);
      g.drawArrays(g.TRIANGLES, 0, 3);

      // keep rendering while visible or still settling back to rest
      if (s.hover.target > 0 || s.hover.v > 0.01) {
        s.raf = requestAnimationFrame(frame);
      } else {
        s.running = false;
      }
    };
    loopRef.current = frame;
    state.running = true;
    state.raf = requestAnimationFrame(frame);
    // No cleanup here: the GL context survives hover cycles and is torn
    // down only on unmount (dedicated effect below). Returning teardown
    // from this effect would lose the context on every pointer-leave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, failed, dark]);

  // Drive hover/press targets; restart the loop when re-entering.
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    s.hover.target = active ? 1 : 0;
    s.press.target = pressed ? 1 : 0;
    s.dark = dark;
    if (active && !s.running && loopRef.current) {
      s.running = true;
      s.raf = requestAnimationFrame(loopRef.current);
    }
  }, [active, pressed, dark]);

  useEffect(() => teardown, [teardown]);

  if (failed) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

const sizeStyles: Record<Size, { pill: string; icon: number }> = {
  sm: { pill: "h-9 pl-4 pr-3 text-[13px] gap-2", icon: 14 },
  md: { pill: "h-11 pl-5 pr-4 text-sm gap-2.5", icon: 16 },
  lg: { pill: "h-14 pl-7 pr-5 text-base gap-3", icon: 18 },
};

const variantStyles: Record<
  Variant,
  { pill: string; label: string; restBg: string }
> = {
  violet: {
    pill: "",
    label: "text-white",
    restBg: "bg-violet-500",
  },
  dark: {
    pill: "",
    label: "text-neutral-50",
    restBg: "bg-neutral-900",
  },
  glass: {
    pill: "backdrop-blur-md transition-colors duration-300",
    label: "text-white",
    restBg: "bg-white/10",
  },
  ghost: {
    pill: "",
    label: "text-neutral-900",
    restBg: "bg-transparent",
  },
  strands: {
    pill: "isolate",
    label: "text-white",
    restBg: "bg-neutral-900",
  },
};

function Button2({
  text,
  className,
  href,
  variant = "default",
  size,
  // magnetic is accepted for call-site compatibility but intentionally
  // unused — magnetic hover is disabled system-wide.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  magnetic,
  ...rest
}: Button2Props) {
  const norm = normalize(variant);
  const v = norm.variant;
  const s: Size = size ?? norm.size;

  const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);
  const router = useOptimizedTransitionRouter();
  const reducedMotion = useReducedMotion();

  const pillRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hasActivatedStrands, setHasActivatedStrands] = useState(false);
  const strandsPointerX = useMotionValue(0);
  const strandsPointerY = useMotionValue(0);
  const strandsX = useSpring(strandsPointerX, {
    stiffness: 115,
    damping: 18,
    mass: 0.85,
  });
  const strandsY = useSpring(strandsPointerY, {
    stiffness: 115,
    damping: 18,
    mass: 0.85,
  });

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = pillRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - r.left) / r.width;
    mouseRef.current.y = (e.clientY - r.top) / r.height;
    strandsPointerX.set((mouseRef.current.x - 0.5) * 18);
    strandsPointerY.set((mouseRef.current.y - 0.5) * 10);
  }, [strandsPointerX, strandsPointerY]);

  const shaderActive = hovered && !reducedMotion;

  const content = (
    <motion.div
      ref={pillRef}
      onHoverStart={() => {
        setHovered(true);
        if (v === "strands" || v === "violet" || v === "glass") {
          setHasActivatedStrands(true);
        }
      }}
      onHoverEnd={() => {
        setHovered(false);
        setPressed(false);
        strandsPointerX.set(0);
        strandsPointerY.set(0);
      }}
      onPointerMove={onPointerMove}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 550, damping: 26, mass: 0.7 }}
      className={cn(
        "group/flzrbtn relative inline-flex w-full items-center justify-between overflow-hidden rounded-full cursor-pointer select-none",
        sizeStyles[s].pill,
        variantStyles[v].pill,
        variantStyles[v].restBg,
        hovered && v === "glass" && "bg-violet-500",
      )}
      style={{ willChange: reducedMotion ? undefined : "transform" }}
    >
      {/* pointer-reactive violet aurora */}
      {!reducedMotion &&
        v !== "strands" &&
        v !== "violet" &&
        v !== "glass" && (
        <AuroraCanvas
          dark={v === "dark"}
          active={shaderActive}
          pressed={pressed}
          mouseRef={mouseRef}
        />
      )}

      {(v === "strands" || v === "violet" || v === "glass") && (
        <motion.div
          className={cn(
            "pointer-events-none absolute -inset-x-3 -inset-y-2 z-0 overflow-hidden rounded-[inherit]",
          )}
          initial={false}
          animate={
            reducedMotion
              ? { opacity: hovered ? 1 : 0 }
              : hovered
                ? {
                    opacity: 1,
                    clipPath: "inset(0% 0% 0% 0% round 999px)",
                  }
                : {
                    opacity: 0,
                    clipPath: "inset(0% 100% 0% 0% round 999px)",
                  }
          }
          transition={{
            opacity: { duration: hovered ? 0.42 : 0.24, ease: "easeOut" },
            clipPath: {
              duration: hovered ? 0.72 : 0.28,
              ease: [0.25, 0.8, 0.25, 1],
            },
          }}
          style={
            reducedMotion
              ? undefined
              : { x: strandsX, y: strandsY, willChange: "transform, opacity, clip-path" }
          }
        >
          {hasActivatedStrands ? (
            reducedMotion ? (
              <div className="h-full w-full bg-[linear-gradient(110deg,#131019,#7c5cff_55%,#131019)]" />
            ) : (
              <Strands
                active={hovered}
                colors={["#7C5CFF", "#D6CCFF", "#FFFFFF"]}
                count={2}
                speed={0.95}
                amplitude={0.8}
                waviness={1.55}
                thickness={0.72}
                glow={3.4}
                taper={2.4}
                spread={1.05}
                intensity={0.95}
                saturation={1.35}
                opacity={1}
                scale={5}
                glass={false}
              />
            )
          ) : null}
        </motion.div>
      )}

      <span
        className={cn(
          "font-aspekta font-semibold relative z-10 transition-colors duration-200 whitespace-nowrap",
          variantStyles[v].label,
          hovered && v === "ghost" && "text-white",
          hovered && (v === "strands" || v === "violet" || v === "glass") &&
            "text-violet-500",
        )}
      >
        {text}
      </span>
      <ArrowRightIcon
        size={sizeStyles[s].icon}
        weight="bold"
        className={cn(
          "relative z-10 transition-[rotate,translate] duration-300",
          hovered ? "rotate-0 translate-x-0.5" : "-rotate-45",
          variantStyles[v].label,
          hovered && v === "ghost" && "text-white",
          hovered && (v === "strands" || v === "violet" || v === "glass") &&
            "text-violet-500",
        )}
        style={{ transitionTimingFunction: "var(--ease-flzr-overshoot)" }}
      />
    </motion.div>
  );

  const linkProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer nofollow" }
    : {};

  return (
    <div className={cn("inline-block w-fit", className)}>
      <Link
        href={href || "#"}
        className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-flzr-violet)] focus-visible:ring-offset-2"
        {...linkProps}
        onClick={
          isExternal
            ? undefined
            : (e) => {
                e.preventDefault();
                if (href) router.push(href);
              }
        }
        {...rest}
      >
        {content}
      </Link>
    </div>
  );
}

export default Button2;
