"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@1sp/utils/cn";
import { MOSAIC_PALETTE } from "./MosaicButton";

// Portrait frame in MosaicButton's language. A slow shader field sits behind
// the logo's triangle lattice, drawn as outlines only; single outlines flip in
// and out in logo colours. On hover the lattice fills from the pointer with
// the button's flip: half turn, overshooting scale, staggered wavefront.
// Everything sits behind the portrait, so transparent cutouts stay in front.

const FLIP_DURATION = 0.42; // seconds per tile, as MosaicButton
// The button's wavefront (0.35 s) crosses ~150 px; a portrait is several
// times larger, so the wave is slower to read as a fluid sweep.
const STAGGER_IN = 0.6;
const STAGGER_OUT = 0.42;
const OUTLINE_MAX = 5; // concurrent ambient outlines
const OUTLINE_SPAWN_MIN = 0.35; // seconds between spawns
const OUTLINE_SPAWN_VAR = 1.1;
const OUTLINE_LINGER_MIN = 1.6; // seconds an outline stays lit
const OUTLINE_LINGER_VAR = 2.6;
const LATTICE_ALPHA = 0.085;
const OUTLINE_WIDTH = 0.75; // css px; hairline accents, not shapes
const OUTLINE_ALPHA = 0.45;
const SHADER_FPS = 30;
const SHADER_SCALE = 0.5; // the field is soft; render it at half size

const VERTEX = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uSeed;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y) * 1.6 + uSeed * 17.0;
  float t = uTime * 0.045;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 1.7 * q + vec2(t * 0.6, -t * 0.4));
  // Paper Black lit by the logo's teal, magenta and amber.
  vec3 paper = vec3(0.039, 0.047, 0.051);
  vec3 teal = vec3(0.008, 0.561, 0.639);
  vec3 magenta = vec3(0.569, 0.098, 0.557);
  vec3 amber = vec3(0.949, 0.447, 0.149);
  vec3 hue = mix(teal, magenta, smoothstep(0.35, 0.75, q.x));
  hue = mix(hue, amber, smoothstep(0.62, 0.92, f) * 0.45);
  float glow = smoothstep(0.25, 0.95, f);
  float rise = smoothstep(0.7, 0.0, uv.y); // light pooling behind the shoulders
  gl_FragColor = vec4(paper + hue * (glow * 0.26 + rise * 0.1), 1.0);
}`;

type Point = [number, number];

type Tri = {
  axis: 0 | 1;
  cx: number;
  cy: number;
  delay: number;
  jitter: number;
  /** ambient outline: start ms (-1 = idle) and the ms it starts to fade */
  outlineAt: number;
  outlineColor: string;
  outlineUntil: number;
  /** hover fill progress 0..1 */
  p: number;
  pts: Point[];
  rgb: [number, number, number];
};

type Instance = {
  ambientNext: number;
  bg: HTMLCanvasElement;
  bgCtx: CanvasRenderingContext2D;
  bgH: number;
  bgW: number;
  cssH: number;
  cssW: number;
  dpr: number;
  fg: HTMLCanvasElement;
  fgCtx: CanvasRenderingContext2D;
  hover: boolean;
  hoverAt: number;
  lastShader: number;
  needsDraw: boolean;
  needsShader: boolean;
  reduced: boolean;
  seed: number;
  tris: Tri[];
  visible: boolean;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutBack = (p: number) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const pick = (rand: () => number) => MOSAIC_PALETTE[Math.floor(rand() * MOSAIC_PALETTE.length)];

// MosaicButton's lattice: column strips of alternating left/right pointing
// equilateral triangles stepping half a row (column width = 0.866 × height).
function buildLattice(cssW: number, cssH: number, seed: number, filled: boolean): Tri[] {
  const rand = mulberry32(seed);
  const rows = Math.min(9, Math.max(5, Math.round(cssH / 58)));
  const triH = cssH / rows;
  const triW = triH * 0.866;
  const step = triH / 2;
  const cols = Math.ceil(cssW / triW) + 1;
  const slots = Math.ceil(cssH / step) + 1;
  const tris: Tri[] = [];
  for (let i = 0; i < cols; i += 1) {
    const xL = i * triW;
    const xR = xL + triW;
    for (let k = -1; k <= slots; k += 1) {
      const yB = cssH - k * step;
      if (yB < 0 || yB - triH > cssH) continue;
      const right = (((i + k) % 2) + 2) % 2 === 0;
      const pts: Point[] = right
        ? [[xL, yB], [xL, yB - triH], [xR, yB - triH / 2]]
        : [[xR, yB], [xR, yB - triH], [xL, yB - triH / 2]];
      const color = pick(rand);
      tris.push({
        axis: rand() < 0.5 ? 0 : 1,
        cx: (pts[0][0] + pts[1][0] + pts[2][0]) / 3,
        cy: (pts[0][1] + pts[1][1] + pts[2][1]) / 3,
        delay: 0,
        jitter: rand(),
        outlineAt: -1,
        outlineColor: color,
        outlineUntil: 0,
        p: filled ? 1 : 0,
        pts,
        rgb: toRgb(color),
      });
    }
  }
  return tris;
}

// Traces a tile mid-flip: overshooting scale about its centroid and a half
// turn about its own axis, foreshortened to a squash. Returns the squash.
function traceFlip(ctx: CanvasRenderingContext2D, tri: Tri, q: number, k: number) {
  const s = Math.max(0.0001, easeOutBack(q));
  const squash = Math.cos((1 - easeOutCubic(q)) * Math.PI);
  ctx.beginPath();
  tri.pts.forEach(([x, y], i) => {
    let dx = (x - tri.cx) * s;
    let dy = (y - tri.cy) * s;
    if (tri.axis === 0) dy *= squash;
    else dx *= squash;
    const px = (tri.cx + dx) * k;
    const py = (tri.cy + dy) * k;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  return squash;
}

function outlineLevel(tri: Tri, now: number) {
  if (tri.outlineAt < 0) return 0;
  const span = FLIP_DURATION * 1000;
  const out = (now - tri.outlineUntil) / span;
  if (out >= 1) {
    tri.outlineAt = -1;
    return 0;
  }
  return out > 0 ? 1 - out : clamp01((now - tri.outlineAt) / span);
}

function drawTiles(inst: Instance, now: number) {
  const { fgCtx: ctx, fg, dpr: k, tris } = inst;
  ctx.clearRect(0, 0, fg.width, fg.height);

  // hover fills, lit by how square-on the facet faces the viewer
  for (const tri of tris) {
    if (tri.p <= 0.002) continue;
    const squash = traceFlip(ctx, tri, tri.p, k);
    const light = (0.56 + 0.44 * Math.abs(squash)) * (squash < 0 ? 0.78 : 1);
    const [r, g, b] = tri.rgb;
    ctx.globalAlpha = smoothstep(0.03, 0.3, tri.p);
    ctx.fillStyle = `rgb(${(r * light) | 0},${(g * light) | 0},${(b * light) | 0})`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // the lattice itself, outlines only
  ctx.beginPath();
  for (const tri of tris) {
    ctx.moveTo(tri.pts[0][0] * k, tri.pts[0][1] * k);
    ctx.lineTo(tri.pts[1][0] * k, tri.pts[1][1] * k);
    ctx.lineTo(tri.pts[2][0] * k, tri.pts[2][1] * k);
    ctx.closePath();
  }
  ctx.lineWidth = k;
  ctx.strokeStyle = `rgba(244,244,244,${LATTICE_ALPHA})`;
  ctx.stroke();

  // ambient outlines flipping in and out in logo colours
  ctx.lineWidth = OUTLINE_WIDTH * k;
  ctx.lineJoin = "round";
  for (const tri of tris) {
    const level = outlineLevel(tri, now);
    if (level <= 0.002) continue;
    traceFlip(ctx, tri, level, k);
    ctx.globalAlpha = smoothstep(0.02, 0.4, level) * OUTLINE_ALPHA;
    ctx.strokeStyle = tri.outlineColor;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// One WebGL context shared by every portrait: browsers evict contexts past
// ~16 per page, and galleries hold more portraits than that. Each frame the
// field renders into the shared canvas and is copied into the tile's own 2D
// canvas, as MosaicButton does with its tiles.
class PortraitRenderer {
  private static instance: PortraitRenderer | null = null;

  static get(): PortraitRenderer | null {
    if (typeof window === "undefined") return null;
    PortraitRenderer.instance ??= new PortraitRenderer();
    return PortraitRenderer.instance;
  }

  private canvas = document.createElement("canvas");
  private gl: WebGLRenderingContext | null = null;
  private uniforms: { res: WebGLUniformLocation | null; seed: WebGLUniformLocation | null; time: WebGLUniformLocation | null } | null = null;
  private instances = new Set<Instance>();
  private raf: number | null = null;
  private lastNow = 0;
  private contextLost = false;

  private constructor() {
    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.contextLost = true;
    });
    this.canvas.addEventListener("webglcontextrestored", () => {
      this.contextLost = false;
      this.gl = null;
      this.setup();
      for (const inst of this.instances) inst.needsShader = true;
    });
    this.setup();
  }

  private setup() {
    const gl = this.canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power", preserveDrawingBuffer: true });
    if (!gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // one oversized triangle covers the viewport
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = {
      res: gl.getUniformLocation(program, "uRes"),
      seed: gl.getUniformLocation(program, "uSeed"),
      time: gl.getUniformLocation(program, "uTime"),
    };
    this.gl = gl;
  }

  register(inst: Instance) {
    this.instances.add(inst);
    if (this.raf === null) {
      this.lastNow = 0;
      this.raf = window.requestAnimationFrame(this.loop);
    }
  }

  unregister(inst: Instance) {
    this.instances.delete(inst);
    if (this.instances.size === 0 && this.raf !== null) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  private loop = (now: number) => {
    this.raf = window.requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const dt = this.lastNow === 0 ? 0.016 : Math.min((now - this.lastNow) / 1000, 0.05);
    this.lastNow = now;
    for (const inst of this.instances) {
      if (!inst.visible) continue;
      if (this.step(inst, now, dt) || inst.needsDraw) {
        drawTiles(inst, now);
        inst.needsDraw = false;
      }
      const due = !inst.reduced && now - inst.lastShader >= 1000 / SHADER_FPS;
      if (due || inst.needsShader) {
        this.drawField(inst, now);
        inst.lastShader = now;
        inst.needsShader = false;
      }
    }
  };

  private step(inst: Instance, now: number, dt: number) {
    let changed = false;
    if (!inst.hover && !inst.reduced && now >= inst.ambientNext) {
      inst.ambientNext = now + (OUTLINE_SPAWN_MIN + Math.random() * OUTLINE_SPAWN_VAR) * 1000;
      const active = inst.tris.reduce((n, t) => n + (t.outlineAt >= 0 ? 1 : 0), 0);
      const idle = active < OUTLINE_MAX ? inst.tris.filter((t) => t.outlineAt < 0 && t.p === 0) : [];
      if (idle.length > 0) {
        const tri = idle[Math.floor(Math.random() * idle.length)];
        tri.outlineColor = pick(Math.random);
        tri.outlineAt = now;
        tri.outlineUntil = now + (FLIP_DURATION + OUTLINE_LINGER_MIN + Math.random() * OUTLINE_LINGER_VAR) * 1000;
      }
    }
    const elapsed = (now - inst.hoverAt) / 1000;
    const target = inst.hover ? 1 : 0;
    for (const tri of inst.tris) {
      if (tri.outlineAt >= 0) changed = true;
      if (tri.p === target) continue;
      changed = true;
      if (inst.reduced) {
        tri.p = target;
        continue;
      }
      if (elapsed < tri.delay) continue;
      const dp = dt / FLIP_DURATION;
      tri.p = target > tri.p ? Math.min(1, tri.p + dp) : Math.max(0, tri.p - dp);
    }
    return changed;
  }

  drawField(inst: Instance, now: number) {
    const { gl, uniforms } = this;
    if (!gl || !uniforms || this.contextLost || inst.bgW < 1 || inst.bgH < 1) return;
    if (this.canvas.width < inst.bgW || this.canvas.height < inst.bgH) {
      this.canvas.width = Math.max(this.canvas.width, inst.bgW);
      this.canvas.height = Math.max(this.canvas.height, inst.bgH);
    }
    gl.viewport(0, 0, inst.bgW, inst.bgH);
    gl.uniform2f(uniforms.res, inst.bgW, inst.bgH);
    gl.uniform1f(uniforms.seed, (inst.seed % 1000) / 1000);
    gl.uniform1f(uniforms.time, inst.reduced ? 12 : now / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // the viewport sits at the bottom of the shared canvas image
    inst.bgCtx.drawImage(this.canvas, 0, this.canvas.height - inst.bgH, inst.bgW, inst.bgH, 0, 0, inst.bgW, inst.bgH);
  }
}

export type MosaicPortraitProps = {
  className?: string;
  /** Stable key (e.g. the person's name) so each portrait keeps its own lattice and field. */
  seedKey?: string;
};

/**
 * Drop inside a `relative` portrait container, before the image. The image
 * must stack above it (`z-[1]`). Hover and keyboard focus on the container
 * fill the mosaic from the pointer.
 */
export default function MosaicPortrait({ className, seedKey }: MosaicPortraitProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const fgRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion() ?? false;
  const [randomSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const seed = seedKey ? hashSeed(seedKey) : randomSeed;

  useEffect(() => {
    const root = rootRef.current;
    const bg = bgRef.current;
    const fg = fgRef.current;
    const host = root?.parentElement;
    const renderer = PortraitRenderer.get();
    const bgCtx = bg?.getContext("2d");
    const fgCtx = fg?.getContext("2d");
    if (!root || !bg || !fg || !host || !renderer || !bgCtx || !fgCtx) return;

    const inst: Instance = {
      ambientNext: performance.now() + 300 + Math.random() * 900,
      bg, bgCtx, bgH: 0, bgW: 0, cssH: 0, cssW: 0, dpr: 1,
      fg, fgCtx, hover: false, hoverAt: 0, lastShader: 0,
      needsDraw: true, needsShader: true, reduced, seed, tris: [], visible: true,
    };

    const resize = () => {
      const cssW = root.clientWidth;
      const cssH = root.clientHeight;
      if (cssW < 1 || cssH < 1) return;
      inst.cssW = cssW;
      inst.cssH = cssH;
      inst.dpr = Math.min(2, window.devicePixelRatio || 1);
      fg.width = Math.round(cssW * inst.dpr);
      fg.height = Math.round(cssH * inst.dpr);
      inst.bgW = bg.width = Math.max(1, Math.round(cssW * SHADER_SCALE));
      inst.bgH = bg.height = Math.max(1, Math.round(cssH * SHADER_SCALE));
      inst.tris = buildLattice(cssW, cssH, seed, inst.hover);
      inst.needsDraw = true;
      inst.needsShader = true;
    };
    resize();

    // stagger from wherever the pointer enters, drain toward where it leaves;
    // keyboard focus grows from the centre
    const setHover = (hover: boolean, x?: number, y?: number) => {
      if (inst.hover === hover) return;
      inst.hover = hover;
      inst.hoverAt = performance.now();
      const ox = x ?? inst.cssW / 2;
      const oy = y ?? inst.cssH / 2;
      const maxDist = Math.hypot(inst.cssW, inst.cssH) || 1;
      const stagger = hover ? STAGGER_IN : STAGGER_OUT;
      for (const tri of inst.tris) {
        tri.delay = (Math.hypot(tri.cx - ox, tri.cy - oy) / maxDist) * stagger + tri.jitter * 0.07;
        if (hover) tri.outlineAt = -1;
      }
    };
    const local = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };
    const onEnter = (e: PointerEvent) => setHover(true, ...local(e));
    const onLeave = (e: PointerEvent) => setHover(false, ...local(e));
    const onFocusIn = () => setHover(true);
    const onFocusOut = (e: FocusEvent) => {
      if (!host.contains(e.relatedTarget as Node | null)) setHover(false);
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("focusin", onFocusIn);
    host.addEventListener("focusout", onFocusOut);

    const resizeObserver = new window.ResizeObserver(resize);
    resizeObserver.observe(root);
    const io = new window.IntersectionObserver((entries) => {
      for (const entry of entries) inst.visible = entry.isIntersecting;
    });
    io.observe(root);
    renderer.register(inst);

    return () => {
      renderer.unregister(inst);
      resizeObserver.disconnect();
      io.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("focusin", onFocusIn);
      host.removeEventListener("focusout", onFocusOut);
    };
  }, [reduced, seed]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden bg-msm-paper", className)}
      ref={rootRef}
    >
      <canvas className="absolute inset-0 block h-full w-full" ref={bgRef} />
      <canvas className="absolute inset-0 block h-full w-full" ref={fgRef} />
    </div>
  );
}
