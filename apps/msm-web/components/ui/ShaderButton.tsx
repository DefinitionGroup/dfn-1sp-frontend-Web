"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@1sp/utils/cn";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import MagneticButton from "./MagneticButton";

export type ShaderButtonVariant =
  | "cyan"
  | "teal"
  | "magenta"
  | "amber"
  | "red"
  | "ink";

export type ShaderButtonSize = "sm" | "md" | "lg";

export type ShaderTuningProps = {
  frequency?: number;
  mouseInfluence?: boolean;
  shaderOpacity?: number;
  speed?: number;
  strength?: number;
};

export type ShaderButtonProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  href?: string;
  magnetic?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  showArrow?: boolean;
  size?: ShaderButtonSize;
  text?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  variant?: ShaderButtonVariant;
} & ShaderTuningProps;

const SHADER_DEFAULTS = {
  frequency: 3.6,
  mouseInfluence: true,
  shaderOpacity: 1,
  speed: 0.75,
  strength: 0.72,
};

type Rgb = [number, number, number];

type Palette = {
  /** dark end of the base gradient */
  deep: Rgb;
  /** pointer ember while hovered */
  ember: Rgb;
  /** CSS background behind the canvas (no-WebGL / pre-mount fallback) */
  fallback: string;
  /** sonar ring base color */
  ringA: Rgb;
  /** sonar ring highlight color */
  ringB: Rgb;
  /** warm end of the base gradient */
  warm: Rgb;
};

// Palettes derived from the MSM brand colors in globals.css
// (msm-cyan #03b8d4, msm-teal #02a8b2, msm-magenta #d10dab,
//  msm-amber #f5991c, msm-red #d61e45, msm-paper #0a0c0d).
const PALETTES: Record<ShaderButtonVariant, Palette> = {
  cyan: {
    deep: [0.008, 0.1, 0.13],
    ember: [0.35, 0.95, 1.0],
    fallback: "#02323d",
    ringA: [0.3, 0.95, 1.0],
    ringB: [0.82, 1.0, 1.0],
    warm: [0.012, 0.36, 0.45],
  },
  teal: {
    deep: [0.006, 0.1, 0.11],
    ember: [0.3, 0.92, 0.95],
    fallback: "#02292d",
    ringA: [0.25, 0.92, 0.95],
    ringB: [0.78, 1.0, 1.0],
    warm: [0.01, 0.33, 0.37],
  },
  magenta: {
    deep: [0.14, 0.008, 0.12],
    ember: [1.0, 0.4, 0.9],
    fallback: "#3a0230",
    ringA: [1.0, 0.35, 0.88],
    ringB: [1.0, 0.84, 0.97],
    warm: [0.45, 0.03, 0.38],
  },
  amber: {
    deep: [0.16, 0.08, 0.008],
    ember: [1.0, 0.7, 0.28],
    fallback: "#3d2402",
    ringA: [1.0, 0.72, 0.22],
    ringB: [1.0, 0.93, 0.72],
    warm: [0.52, 0.28, 0.04],
  },
  red: {
    deep: [0.15, 0.01, 0.035],
    ember: [1.0, 0.34, 0.24],
    fallback: "#3a0410",
    ringA: [1.0, 0.38, 0.28],
    ringB: [1.0, 0.85, 0.68],
    warm: [0.48, 0.05, 0.11],
  },
  ink: {
    deep: [0.035, 0.04, 0.045],
    ember: [0.3, 0.85, 0.95],
    fallback: "#121212",
    ringA: [0.28, 0.85, 0.95],
    ringB: [0.72, 0.96, 1.0],
    warm: [0.1, 0.11, 0.12],
  },
};

const sizes: Record<ShaderButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-3.5",
};

const textSizes: Record<ShaderButtonSize, string> = {
  sm: "text-xxs",
  md: "text-xxs",
  lg: "text-xs",
};

const SONAR_VERTEX = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Sonar / heartbeat beacon: calm tinted base, expanding lub-dub ping rings,
// rim shimmer, pointer ember on hover. Palette comes in via uniforms so a
// single program serves every color variant.
const SONAR_FRAGMENT = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_hover;
uniform float u_intensity;
uniform float u_freq;
uniform float u_phase;
uniform vec3 u_deep;
uniform vec3 u_warm;
uniform vec3 u_ringA;
uniform vec3 u_ringB;
uniform vec3 u_ember;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float ping(float d, float phase, float maxD, float sharp) {
  // eased expansion: rings launch quickly, then glide out — reads more fluid
  float eased = 1.0 - (1.0 - phase) * (1.0 - phase);
  float r = eased * maxD;
  float band = exp(-pow((d - r) * sharp, 2.0));
  float fade = 1.0 - phase;
  return band * fade * fade;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float aspect = u_res.x / u_res.y;
  float t = u_time;

  // pings emanate from the left part of the pill and sweep rightwards
  vec2 origin = vec2((0.16 - 0.5) * aspect, 0.0);
  float d = length(p - origin);
  float maxD = length(vec2(0.5 * aspect - origin.x, 0.5)) * 1.05;

  vec3 col = mix(u_deep, u_warm, clamp(0.25 + uv.x * 0.45 + (1.0 - uv.y) * 0.35, 0.0, 1.0));

  // slow breathing glow
  col += u_warm * 0.1 * (0.5 + 0.5 * sin(t * 0.6));

  // heartbeat sonar: paired lub-dub pings; phase is accumulated on the CPU
  // so tempo changes on hover never make pings skip ahead
  float phase = fract(u_phase);
  float phase2 = fract(u_phase - 0.12);
  float rightward = smoothstep(-0.08, 0.14, p.x - origin.x);
  float labelCalm = 0.55 + 0.45 * smoothstep(0.04, 0.24, length(p));
  float rings = (ping(d, phase, maxD, 26.0 - 7.0 * u_hover) + ping(d, phase2, maxD, 34.0 - 9.0 * u_hover) * 0.5)
    * rightward * labelCalm;
  vec3 ringCol = mix(u_ringA, u_ringB, rings);
  col += ringCol * rings * (0.35 + 1.25 * u_hover) * u_intensity;

  // fine concentric shimmer toward the rim
  float ripple = 0.5 + 0.5 * sin(d * u_freq * 22.0 - t * 1.4);
  col += u_warm * 1.15 * ripple * smoothstep(0.28, 0.75, d / maxD) * 0.16;

  // pointer ember while hovered
  vec2 pp = (u_pointer - 0.5) * vec2(aspect, -1.0);
  float pd = length(p - pp);
  col += u_ember * exp(-pd * pd * 9.0) * 0.22 * u_hover;

  // top sheen and bottom shade for a polished pill
  col += vec3(1.0, 0.98, 0.95) * smoothstep(0.55, 1.0, uv.y) * 0.06;
  col *= 1.0 - 0.18 * smoothstep(0.35, 0.0, uv.y);

  // keep the label zone slightly darker for contrast
  col *= 1.0 - 0.06 * (1.0 - smoothstep(0.05, 0.2, length(p)));

  // film grain against banding
  col += (hash(gl_FragCoord.xy + fract(t) * 61.0) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type SonarParams = {
  frequency: number;
  mouseInfluence: boolean;
  palette: Palette;
  speed: number;
  strength: number;
};

type SonarInstance = {
  active: boolean;
  ctx: CanvasRenderingContext2D;
  height: number;
  hover: number;
  params: SonarParams;
  phase: number;
  pointer: { x: number; y: number };
  root: HTMLElement;
  visible: boolean;
  width: number;
};

// One shared WebGL context renders every button and blits into each button's
// own 2D canvas. Browsers cap live WebGL contexts (~16 per page), so a
// context per button would get evicted on pages with many buttons
// (carousels, galleries).
class SonarRenderer {
  private static instance: SonarRenderer | null = null;

  static get(): SonarRenderer | null {
    if (typeof window === "undefined") return null;
    if (!SonarRenderer.instance) {
      const renderer = new SonarRenderer();
      if (!renderer.ok) return null;
      SonarRenderer.instance = renderer;
    }
    return SonarRenderer.instance;
  }

  ok = false;
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private instances = new Set<SonarInstance>();
  private raf: number | null = null;
  private lastNow = 0;
  private start = 0;
  private reduceMotion = false;
  private contextLost = false;

  private constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1;
    this.canvas.height = 1;
    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.contextLost = true;
    });
    this.canvas.addEventListener("webglcontextrestored", () => {
      this.contextLost = !this.initGl();
    });
    this.ok = this.initGl();
    if (!this.ok) return;
    this.start = performance.now();
    this.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.addEventListener(
      "pointermove",
      (event) => {
        for (const inst of this.instances) {
          if (!inst.params.mouseInfluence) continue;
          const rect = inst.root.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          inst.pointer = {
            x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
          };
        }
      },
      { passive: true },
    );
  }

  private initGl(): boolean {
    const gl = this.canvas.getContext("webgl", {
      antialias: true,
      depth: false,
      preserveDrawingBuffer: true,
      stencil: false,
    });
    if (!gl) return false;

    const vert = compileShader(gl, gl.VERTEX_SHADER, SONAR_VERTEX);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, SONAR_FRAGMENT);
    const program = gl.createProgram();
    if (!vert || !frag || !program) return false;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const name of [
      "u_res",
      "u_time",
      "u_pointer",
      "u_hover",
      "u_intensity",
      "u_freq",
      "u_phase",
      "u_deep",
      "u_warm",
      "u_ringA",
      "u_ringB",
      "u_ember",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    this.gl = gl;
    return true;
  }

  register(inst: SonarInstance) {
    this.instances.add(inst);
    // paint immediately so the button is never blank while waiting for the
    // first animation frame (hidden tabs pause requestAnimationFrame)
    if (!this.contextLost && inst.width >= 1 && inst.height >= 1) {
      this.draw(inst, performance.now());
    }
    if (this.raf === null) {
      this.lastNow = 0;
      this.raf = window.requestAnimationFrame(this.loop);
    }
  }

  unregister(inst: SonarInstance) {
    this.instances.delete(inst);
    if (this.instances.size === 0 && this.raf !== null) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  private loop = (now: number) => {
    this.raf = window.requestAnimationFrame(this.loop);
    const gl = this.gl;
    if (!gl || this.contextLost) return;

    const dt =
      this.lastNow === 0 ? 0.016 : Math.min((now - this.lastNow) / 1000, 0.05);
    this.lastNow = now;

    for (const inst of this.instances) {
      // advance state even offscreen so pings stay in phase when scrolled back
      const { speed } = inst.params;
      inst.hover += ((inst.active ? 1 : 0) - inst.hover) * 0.12;
      // ping period in seconds (at speed 1): unhurried at rest, quicker on hover
      const period = 5.5 - 1.9 * inst.hover;
      inst.phase = (inst.phase + (dt * speed) / period) % 1;

      if (!inst.visible || inst.width < 1 || inst.height < 1) continue;
      if (this.reduceMotion && inst.hover < 0.001 && inst.phase > 0.02) continue;
      this.draw(inst, now);
    }
  };

  private draw(inst: SonarInstance, now: number) {
    const gl = this.gl;
    if (!gl) return;
    const u = this.uniforms;
    const { frequency, palette, speed, strength } = inst.params;
    const { width, height } = inst;

    // grow-only shared framebuffer; viewport bottom-left corner is the
    // region that drawImage reads back from the composited canvas bottom
    if (this.canvas.width < width) this.canvas.width = width;
    if (this.canvas.height < height) this.canvas.height = height;
    gl.viewport(0, 0, width, height);

    const t = 0.4 + ((now - this.start) / 1000) * speed * 0.65;
    gl.uniform2f(u.u_res, width, height);
    gl.uniform1f(u.u_time, t);
    gl.uniform2f(u.u_pointer, inst.pointer.x, inst.pointer.y);
    gl.uniform1f(u.u_hover, inst.hover);
    gl.uniform1f(u.u_intensity, strength);
    gl.uniform1f(u.u_freq, frequency);
    gl.uniform1f(u.u_phase, inst.phase);
    gl.uniform3f(u.u_deep, ...palette.deep);
    gl.uniform3f(u.u_warm, ...palette.warm);
    gl.uniform3f(u.u_ringA, ...palette.ringA);
    gl.uniform3f(u.u_ringB, ...palette.ringB);
    gl.uniform3f(u.u_ember, ...palette.ember);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // WebGL viewport origin is bottom-left → region sits at the bottom of
    // the canvas image when read by drawImage
    inst.ctx.clearRect(0, 0, width, height);
    inst.ctx.drawImage(
      this.canvas,
      0,
      this.canvas.height - height,
      width,
      height,
      0,
      0,
      width,
      height,
    );
  }
}

type SonarShaderProps = ShaderTuningProps & {
  active: boolean;
  palette: Palette;
  rootRef: RefObject<HTMLDivElement | null>;
};

function SonarShader({
  active,
  frequency = SHADER_DEFAULTS.frequency,
  mouseInfluence = SHADER_DEFAULTS.mouseInfluence,
  palette,
  rootRef,
  shaderOpacity = SHADER_DEFAULTS.shaderOpacity,
  speed = SHADER_DEFAULTS.speed,
  strength = SHADER_DEFAULTS.strength,
}: SonarShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instRef = useRef<SonarInstance | null>(null);

  useEffect(() => {
    if (instRef.current) instRef.current.active = active;
  }, [active]);

  useEffect(() => {
    const inst = instRef.current;
    if (inst) {
      inst.params = { frequency, mouseInfluence, palette, speed, strength };
    }
  }, [frequency, mouseInfluence, palette, speed, strength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const renderer = SonarRenderer.get();
    if (!renderer) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const inst: SonarInstance = {
      active: false,
      ctx,
      height: 0,
      hover: 0,
      params: { frequency, mouseInfluence, palette, speed, strength },
      phase: 0,
      pointer: { x: 0.5, y: 0.5 },
      root,
      visible: true,
      width: 0,
    };
    instRef.current = inst;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      inst.width = Math.max(1, Math.floor(root.clientWidth * dpr));
      inst.height = Math.max(1, Math.floor(root.clientHeight * dpr));
      if (canvas.width !== inst.width || canvas.height !== inst.height) {
        canvas.width = inst.width;
        canvas.height = inst.height;
      }
    };
    resize();
    const resizeObserver = new window.ResizeObserver(resize);
    resizeObserver.observe(root);

    const io = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        inst.visible = entry.isIntersecting;
      }
    });
    io.observe(root);

    renderer.register(inst);

    return () => {
      renderer.unregister(inst);
      resizeObserver.disconnect();
      io.disconnect();
      instRef.current = null;
    };
    // registration is mount-only; live params flow through instRef above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-1 h-full w-full rounded-[inherit]"
      style={{ opacity: shaderOpacity }}
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
    </div>
  );
}

// Inset glass sheen: raised at rest, pressed-in on hover.
const SHEEN_CLASS =
  "pointer-events-none absolute inset-0 z-2 rounded-[inherit] transition-shadow duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2),inset_0_-2px_2px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.12)] group-hover/shader-btn:shadow-[inset_0_2px_3px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(0,0,0,0.3),inset_0_3px_6px_rgba(0,0,0,0.25),inset_0_-1px_0_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(0,0,0,0.18)]";

export default function ShaderButton({
  ariaLabel,
  children,
  className,
  frequency,
  fullWidth = false,
  href,
  magnetic = false,
  mouseInfluence,
  onClick,
  shaderOpacity,
  showArrow = true,
  size = "md",
  speed,
  strength,
  text,
  type = "button",
  variant = "cyan",
}: ShaderButtonProps) {
  const [active, setActive] = useState(false);
  // Measured via an absolutely positioned div: clientWidth/ResizeObserver
  // report 0 for the inline-flex anchor/button element itself.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useOptimizedTransitionRouter();
  const palette = PALETTES[variant] ?? PALETTES.cyan;
  const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);

  const classes = cn(
    "group/shader-btn relative inline-flex cursor-pointer items-center justify-between gap-6 overflow-hidden rounded-full font-medium tracking-wider text-white transition-transform duration-200 hover:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-msm-cyan focus:ring-offset-2 focus:ring-offset-msm-paper",
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const activate = () => setActive(true);
  const deactivate = () => setActive(false);

  const inner = (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" ref={rootRef} />
      <SonarShader
        active={active}
        frequency={frequency}
        mouseInfluence={mouseInfluence}
        palette={palette}
        rootRef={rootRef}
        shaderOpacity={shaderOpacity}
        speed={speed}
        strength={strength}
      />
      <span aria-hidden className={SHEEN_CLASS} />
      <span
        className={cn(
          "relative z-10 inline-flex flex-1 items-center justify-between gap-6",
          textSizes[size],
        )}
      >
        <span>{children ?? text}</span>
        {showArrow ? (
          <ArrowRightIcon
            className="-rotate-45 shrink-0 transition-transform duration-200 group-hover/shader-btn:rotate-0"
            size={14}
            weight="bold"
          />
        ) : null}
      </span>
    </>
  );

  const interaction = {
    onBlur: deactivate,
    onFocus: activate,
    onMouseEnter: activate,
    onMouseLeave: deactivate,
    onPointerEnter: activate,
    onPointerLeave: deactivate,
  };

  const element = href ? (
    <Link
      aria-label={ariaLabel}
      className={classes}
      href={href}
      style={{ backgroundColor: palette.fallback }}
      {...(isExternal
        ? { rel: "noopener noreferrer nofollow", target: "_blank" }
        : {
            onClick: (e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              onClick?.(e);
              router.push(href);
            },
          })}
      {...(isExternal && onClick ? { onClick } : {})}
      {...interaction}
    >
      {inner}
    </Link>
  ) : (
    <button
      aria-label={ariaLabel}
      className={classes}
      onClick={onClick}
      style={{ backgroundColor: palette.fallback }}
      type={type}
      {...interaction}
    >
      {inner}
    </button>
  );

  if (magnetic) {
    return (
      <MagneticButton className={cn("inline-block w-fit", fullWidth && "w-full")}>
        {element}
      </MagneticButton>
    );
  }

  return element;
}
