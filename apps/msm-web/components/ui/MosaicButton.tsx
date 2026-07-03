"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@1sp/utils/cn";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import MagneticButton from "./MagneticButton";

type ThreeModule = typeof import("three");
type ThreeMesh = import("three").Mesh<
  import("three").BufferGeometry,
  import("three").MeshStandardMaterial
>;

export type MosaicButtonSize = "sm" | "md" | "lg";

export type MosaicButtonProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  /** Keep the mosaic permanently filled (static mosaic look; also useful for previews). */
  defaultFilled?: boolean;
  fullWidth?: boolean;
  href?: string;
  magnetic?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  showArrow?: boolean;
  size?: MosaicButtonSize;
  text?: string;
  /** Lattice rows per button height — higher means smaller tiles. */
  tileRows?: number;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** Faint outline of the mosaic endstate behind the tiles. */
  wireframe?: boolean;
};

// The 15 fills of the MSM logo mark.
export const MOSAIC_PALETTE = [
  "#028FA3",
  "#02A8B2",
  "#03B8D4",
  "#05ABB5",
  "#039CAB",
  "#00A8CC",
  "#FAB312",
  "#F5991C",
  "#ED4033",
  "#F79B19",
  "#F27226",
  "#8F0031",
  "#D10DAB",
  "#D61E45",
  "#91198E",
];

const sizes: Record<MosaicButtonSize, string> = {
  sm: "pl-8 pr-4 py-2",
  md: "pl-12 pr-6 py-3",
  lg: "pl-16 pr-8 py-3.5",
};

const textSizes: Record<MosaicButtonSize, string> = {
  sm: "text-xxs",
  md: "text-xxs",
  lg: "text-xs",
};

const FLIP_DURATION = 0.42; // seconds per tile
const STAGGER_IN = 0.35;
const STAGGER_OUT = 0.28;
const RIPPLE_STAGGER = 0.22; // click ripple wavefront across the button
const RIPPLE_DURATION = 0.5; // seconds per tile spin
// atmospheric idle: random tiles flip in, linger, flip out
const AMBIENT_MAX = 3; // concurrent ambient tiles
const AMBIENT_SPAWN_MIN = 0.7; // seconds between spawn attempts
const AMBIENT_SPAWN_VAR = 1.8;
const AMBIENT_LINGER_MIN = 2.0; // seconds a tile stays up
const AMBIENT_LINGER_VAR = 3.0;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3);
}

function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function easeOutBack(p: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

type Tile = {
  /** absolute ms until which this tile stays up as an ambient accent */
  ambientUntil: number;
  axis: "x" | "y";
  color: string;
  cx: number;
  cy: number;
  /** current stagger delay (s), recomputed from the hover origin */
  delay: number;
  dir: 1 | -1;
  /** per-tile randomness folded into every recomputed delay */
  jitter: number;
  mesh?: ThreeMesh;
  p: number;
  /** css-pixel coords, y down */
  pts: [number, number][];
  /** absolute ms when this tile's click-ripple spin starts; -1 = inactive */
  rippleAt: number;
};

// Rebuild the logo's triangle lattice at button scale: the mark is an
// equilateral lattice (column width = 0.866 × row height, matching the
// SVG's 6.353 / 7.336 grid). Column strips are tiled by alternating
// left/right pointing triangles stepping half a row.
function buildLattice(
  cssW: number,
  cssH: number,
  rows: number,
  rand: () => number,
  filled: boolean,
): Tile[] {
  const triH = cssH / rows;
  const triW = triH * 0.866;
  const step = triH / 2;
  const cols = Math.ceil(cssW / triW) + 1;
  const slots = Math.ceil(cssH / step) + 1;
  const maxDist = Math.hypot(cssW, cssH) || 1;
  const tiles: Tile[] = [];

  for (let i = 0; i < cols; i += 1) {
    const xL = i * triW;
    const xR = xL + triW;
    for (let k = -1; k <= slots; k += 1) {
      const yB = cssH - k * step;
      if (yB < 0 || yB - triH > cssH) continue;
      const right = (((i + k) % 2) + 2) % 2 === 0;
      const pts: [number, number][] = right
        ? [
            [xL, yB],
            [xL, yB - triH],
            [xR, yB - triH / 2],
          ]
        : [
            [xR, yB],
            [xR, yB - triH],
            [xL, yB - triH / 2],
          ];
      const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
      const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
      // initial fill radiates from left-center; hover events recompute
      // delays from the actual pointer origin
      const dist = Math.hypot(cx, cssH / 2 - cy) / maxDist;
      tiles.push({
        ambientUntil: 0,
        axis: rand() < 0.5 ? "x" : "y",
        color: MOSAIC_PALETTE[Math.floor(rand() * MOSAIC_PALETTE.length)],
        cx,
        cy,
        delay: dist * STAGGER_IN,
        dir: rand() < 0.5 ? 1 : -1,
        jitter: rand(),
        p: filled ? 1 : 0,
        pts,
        rippleAt: -1,
      });
    }
  }
  return tiles;
}

type MosaicInstance = {
  ambientNext: number;
  camera?: import("three").PerspectiveCamera;
  cssH: number;
  cssW: number;
  ctx: CanvasRenderingContext2D;
  hover: boolean;
  hoverChangedAt: number;
  needsBuild: boolean;
  pinned: boolean;
  pxH: number;
  pxW: number;
  scene?: import("three").Scene;
  seed: number;
  tileRows: number;
  tiles: Tile[];
  visible: boolean;
};

// One shared three.js renderer blits every button into its own small 2D
// canvas — browsers cap live WebGL contexts (~16 per page), so a context
// per button gets evicted on pages full of buttons. three.js itself is
// loaded lazily on the first mount to keep it out of the initial bundle.
class MosaicRenderer {
  private static instance: MosaicRenderer | null = null;

  static get(): MosaicRenderer | null {
    if (typeof window === "undefined") return null;
    if (!MosaicRenderer.instance) {
      MosaicRenderer.instance = new MosaicRenderer();
    }
    return MosaicRenderer.instance;
  }

  reduceMotion = false;

  private canvas: HTMLCanvasElement;
  private three: ThreeModule | null = null;
  private renderer: import("three").WebGLRenderer | null = null;
  private readyPromise: Promise<void> | null = null;
  private instances = new Set<MosaicInstance>();
  private raf: number | null = null;
  private lastNow = 0;
  private contextLost = false;

  private constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.contextLost = true;
    });
    this.canvas.addEventListener("webglcontextrestored", () => {
      this.contextLost = false;
    });
    this.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }

  private ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = import("three")
        .then((three) => {
          const renderer = new three.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: this.canvas,
            powerPreference: "low-power",
            preserveDrawingBuffer: true,
          });
          renderer.setClearColor(0x000000, 0);
          renderer.setScissorTest(true);
          this.three = three;
          this.renderer = renderer;
        })
        .catch(() => {
          this.three = null;
          this.renderer = null;
        });
    }
    return this.readyPromise;
  }

  register(inst: MosaicInstance) {
    this.instances.add(inst);
    void this.ensureReady().then(() => {
      if (!this.instances.has(inst) || !this.three) return;
      this.buildScene(inst);
      // immediate idle frame — hidden tabs pause requestAnimationFrame
      this.renderInstance(inst);
      if (this.raf === null) {
        this.lastNow = 0;
        this.raf = window.requestAnimationFrame(this.loop);
      }
    });
  }

  unregister(inst: MosaicInstance) {
    this.instances.delete(inst);
    this.disposeScene(inst);
    if (this.instances.size === 0 && this.raf !== null) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  private disposeScene(inst: MosaicInstance) {
    for (const tile of inst.tiles) {
      if (tile.mesh) {
        tile.mesh.geometry.dispose();
        tile.mesh.material.dispose();
        tile.mesh = undefined;
      }
    }
    inst.scene = undefined;
    inst.camera = undefined;
  }

  buildScene(inst: MosaicInstance) {
    const three = this.three;
    if (!three) return;
    this.disposeScene(inst);

    const { cssW, cssH } = inst;
    const scene = new three.Scene();
    // intensities are in physical units (three r155+): ~π× the legacy values
    scene.add(new three.AmbientLight(0xffffff, 1.7));
    const key = new three.DirectionalLight(0xffffff, 1.55);
    key.position.set(cssW * 0.35, cssH * 0.8, cssH * 2.2);
    scene.add(key);

    const fov = 30;
    const camera = new three.PerspectiveCamera(fov, cssW / cssH, 1, cssH * 12);
    camera.position.set(
      0,
      0,
      cssH / 2 / Math.tan((fov * Math.PI) / 360),
    );

    for (const tile of inst.tiles) {
      const cxW = tile.cx - cssW / 2;
      const cyW = cssH / 2 - tile.cy;
      const positions = new Float32Array(
        tile.pts.flatMap(([x, y]) => [
          x - cssW / 2 - cxW,
          cssH / 2 - y - cyW,
          0,
        ]),
      );
      const geometry = new three.BufferGeometry();
      geometry.setAttribute(
        "position",
        new three.BufferAttribute(positions, 3),
      );
      geometry.computeVertexNormals();
      const material = new three.MeshStandardMaterial({
        color: new three.Color(tile.color),
        metalness: 0.18,
        roughness: 0.55,
        side: three.DoubleSide,
      });
      const mesh = new three.Mesh(geometry, material);
      mesh.position.set(cxW, cyW, 0);
      tile.mesh = mesh;
      scene.add(mesh);
    }

    inst.scene = scene;
    inst.camera = camera;
    inst.needsBuild = false;
  }

  private loop = (now: number) => {
    this.raf = window.requestAnimationFrame(this.loop);
    if (!this.three || this.contextLost) return;

    const dt =
      this.lastNow === 0 ? 0.016 : Math.min((now - this.lastNow) / 1000, 0.05);
    this.lastNow = now;

    for (const inst of this.instances) {
      if (inst.needsBuild) this.buildScene(inst);
      if (!inst.scene) continue;

      const elapsed = (now - inst.hoverChangedAt) / 1000;
      let changed = false;

      // atmospheric idle: pop a random tile in a fresh logo color; it
      // lingers a few seconds, then flips back out
      if (
        !inst.hover &&
        !inst.pinned &&
        inst.visible &&
        !this.reduceMotion &&
        now >= inst.ambientNext
      ) {
        inst.ambientNext =
          now + (AMBIENT_SPAWN_MIN + Math.random() * AMBIENT_SPAWN_VAR) * 1000;
        const active = inst.tiles.reduce(
          (n, t) => n + (t.ambientUntil > now ? 1 : 0),
          0,
        );
        if (active < AMBIENT_MAX) {
          const idle = inst.tiles.filter(
            (t) => t.p === 0 && t.ambientUntil <= now,
          );
          if (idle.length > 0) {
            const tile = idle[Math.floor(Math.random() * idle.length)];
            tile.color =
              MOSAIC_PALETTE[Math.floor(Math.random() * MOSAIC_PALETTE.length)];
            tile.mesh?.material.color.set(tile.color);
            tile.delay = 0;
            tile.ambientUntil =
              now +
              (AMBIENT_LINGER_MIN + Math.random() * AMBIENT_LINGER_VAR) * 1000;
            changed = true;
          }
        }
      }

      for (const tile of inst.tiles) {
        if (tile.rippleAt >= 0) changed = true;
        const target =
          inst.hover || inst.pinned || tile.ambientUntil > now ? 1 : 0;
        if (tile.p === target) continue;
        if (this.reduceMotion) {
          tile.p = target;
          changed = true;
          continue;
        }
        if (elapsed < tile.delay) continue;
        const dp = dt / FLIP_DURATION;
        tile.p =
          target > tile.p
            ? Math.min(1, tile.p + dp)
            : Math.max(0, tile.p - dp);
        changed = true;
      }

      if (changed && inst.visible) this.renderInstance(inst, now);
    }
  };

  renderInstance(inst: MosaicInstance, nowArg?: number) {
    const renderer = this.renderer;
    if (!renderer || !inst.scene || !inst.camera || this.contextLost) return;
    const { pxW, pxH, cssH } = inst;
    if (pxW < 1 || pxH < 1) return;
    const now = nowArg ?? performance.now();

    // grow-only shared framebuffer
    if (this.canvas.width < pxW || this.canvas.height < pxH) {
      renderer.setSize(
        Math.max(this.canvas.width, pxW),
        Math.max(this.canvas.height, pxH),
        false,
      );
    }
    renderer.setViewport(0, 0, pxW, pxH);
    renderer.setScissor(0, 0, pxW, pxH);

    const lift = (cssH / 2) * 0.5;
    for (const tile of inst.tiles) {
      const mesh = tile.mesh;
      if (!mesh) continue;
      const p = tile.p;
      mesh.visible = p > 0.002;
      if (!mesh.visible) continue;
      const s = Math.max(0.0001, easeOutBack(p));
      const r = (1 - easeOutCubic(p)) * Math.PI * tile.dir;
      const rx = tile.axis === "x" ? r : 0;
      let ry = tile.axis === "y" ? r : 0;
      let z = Math.sin(Math.min(1, p) * Math.PI) * lift;

      // click ripple: a fast full spin sweeping out from the click point
      if (tile.rippleAt >= 0 && !this.reduceMotion) {
        const q = (now - tile.rippleAt) / (RIPPLE_DURATION * 1000);
        if (q >= 1) {
          tile.rippleAt = -1;
        } else if (q > 0) {
          ry += easeInOutCubic(q) * Math.PI * 2 * tile.dir;
          z += Math.sin(q * Math.PI) * lift * 0.6;
        }
      } else if (tile.rippleAt >= 0 && this.reduceMotion) {
        tile.rippleAt = -1;
      }

      mesh.scale.setScalar(s);
      mesh.rotation.set(rx, ry, 0);
      mesh.position.z = z;
    }

    renderer.render(inst.scene, inst.camera);

    // WebGL viewport origin is bottom-left → region sits at the bottom of
    // the canvas image when read by drawImage
    inst.ctx.clearRect(0, 0, pxW, pxH);
    inst.ctx.drawImage(
      this.canvas,
      0,
      this.canvas.height - pxH,
      pxW,
      pxH,
      0,
      0,
      pxW,
      pxH,
    );
  }
}

// Flat 2D paint of the resting state — shown instantly on mount and kept
// as the fallback if WebGL/three never becomes available.
function paintIdleFrame(inst: MosaicInstance) {
  const { ctx, pxW, pxH, cssW } = inst;
  if (pxW < 1 || pxH < 1 || cssW < 1) return;
  const scale = pxW / cssW;
  ctx.clearRect(0, 0, pxW, pxH);
  for (const tile of inst.tiles) {
    if (tile.p < 0.999) continue;
    ctx.fillStyle = tile.color;
    ctx.beginPath();
    ctx.moveTo(tile.pts[0][0] * scale, tile.pts[0][1] * scale);
    ctx.lineTo(tile.pts[1][0] * scale, tile.pts[1][1] * scale);
    ctx.lineTo(tile.pts[2][0] * scale, tile.pts[2][1] * scale);
    ctx.closePath();
    ctx.fill();
  }
}

export type MosaicActions = {
  /** trigger a click ripple from a point in button-local css px */
  ripple: (x: number, y: number) => void;
  /** set hover state; origin (css px) defaults to left-center */
  setHover: (hover: boolean, x?: number, y?: number) => void;
};

type WireframeState = { h: number; polys: string[]; w: number };

type MosaicCanvasProps = {
  actionsRef: RefObject<MosaicActions | null>;
  defaultFilled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  seed: number;
  tileRows: number;
  wireframe: boolean;
};

function MosaicCanvas({
  actionsRef,
  defaultFilled,
  rootRef,
  seed,
  tileRows,
  wireframe,
}: MosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wire, setWire] = useState<WireframeState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const renderer = MosaicRenderer.get();
    const ctx = canvas.getContext("2d");
    if (!renderer || !ctx) return;

    const inst: MosaicInstance = {
      ambientNext: performance.now() + 400 + Math.random() * 1200,
      cssH: 0,
      cssW: 0,
      ctx,
      hover: false,
      hoverChangedAt: performance.now(),
      needsBuild: false,
      pinned: defaultFilled,
      pxH: 0,
      pxW: 0,
      seed,
      tileRows,
      tiles: [],
      visible: true,
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      inst.cssW = Math.max(1, root.clientWidth);
      inst.cssH = Math.max(1, root.clientHeight);
      inst.pxW = Math.floor(inst.cssW * dpr);
      inst.pxH = Math.floor(inst.cssH * dpr);
      if (canvas.width !== inst.pxW || canvas.height !== inst.pxH) {
        canvas.width = inst.pxW;
        canvas.height = inst.pxH;
      }
      inst.tiles = buildLattice(
        inst.cssW,
        inst.cssH,
        tileRows,
        mulberry32(seed),
        defaultFilled,
      );
      inst.needsBuild = true;
      paintIdleFrame(inst);
      renderer.renderInstance(inst);
      if (wireframe) {
        setWire({
          h: inst.cssH,
          polys: inst.tiles.map((t) =>
            t.pts.map(([x, y]) => `${x},${y}`).join(" "),
          ),
          w: inst.cssW,
        });
      }
    };
    resize();
    const resizeObserver = new window.ResizeObserver(() => {
      resize();
      if (inst.needsBuild) {
        renderer.buildScene(inst);
        renderer.renderInstance(inst);
      }
    });
    resizeObserver.observe(root);

    const io = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        inst.visible = entry.isIntersecting;
      }
    });
    io.observe(root);

    // recompute stagger delays from the actual pointer origin so the
    // mosaic grows from wherever the cursor enters (and drains from
    // wherever it leaves); keyboard focus uses left-center as origin
    const setHover = (hover: boolean, x?: number, y?: number) => {
      inst.hover = hover;
      inst.hoverChangedAt = performance.now();
      const ox = x ?? 0;
      const oy = y ?? inst.cssH / 2;
      const maxDist = Math.hypot(inst.cssW, inst.cssH) || 1;
      const stagger = hover ? STAGGER_IN : STAGGER_OUT;
      for (const tile of inst.tiles) {
        const dist = Math.hypot(tile.cx - ox, tile.cy - oy) / maxDist;
        tile.delay = dist * stagger + tile.jitter * 0.07;
      }
    };

    const ripple = (x: number, y: number) => {
      const now = performance.now();
      const maxDist = Math.hypot(inst.cssW, inst.cssH) || 1;
      for (const tile of inst.tiles) {
        const dist = Math.hypot(tile.cx - x, tile.cy - y) / maxDist;
        tile.rippleAt = now + dist * RIPPLE_STAGGER * 1000;
      }
    };

    actionsRef.current = { ripple, setHover };
    renderer.register(inst);

    return () => {
      actionsRef.current = null;
      renderer.unregister(inst);
      resizeObserver.disconnect();
      io.disconnect();
    };
  }, [rootRef, actionsRef, seed, tileRows, defaultFilled, wireframe]);

  return (
    <>
      {wireframe && wire ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${wire.w} ${wire.h}`}
        >
          {wire.polys.map((points, i) => (
            <polygon
              fill="none"
              key={i}
              points={points}
              stroke="#f4f4f4"
              strokeOpacity={0.03}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 h-full w-full"
      >
        <canvas className="block h-full w-full" ref={canvasRef} />
      </div>
    </>
  );
}

export default function MosaicButton({
  ariaLabel,
  children,
  className,
  defaultFilled = false,
  fullWidth = false,
  href,
  magnetic = false,
  onClick,
  showArrow = true,
  size = "md",
  text,
  tileRows = 2,
  type = "button",
  wireframe = true,
}: MosaicButtonProps) {
  // Measured via an absolutely positioned div: clientWidth/ResizeObserver
  // report 0 for the inline-flex anchor/button element itself.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<MosaicActions | null>(null);
  const router = useOptimizedTransitionRouter();
  const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);

  // one random tile arrangement per mount (stable across re-renders)
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  const classes = cn(
    "group/mosaic-btn relative inline-flex cursor-pointer items-center overflow-hidden bg-msm-surface font-medium tracking-wider text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-msm-cyan focus:ring-offset-2 focus:ring-offset-msm-paper",
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const el = rootRef.current;
    if (!el) return undefined;
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const inner = (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" ref={rootRef} />
      <MosaicCanvas
        actionsRef={actionsRef}
        defaultFilled={defaultFilled}
        rootRef={rootRef}
        seed={seed}
        tileRows={tileRows}
        wireframe={wireframe}
      />
      {/* scrim keeps the label readable once the mosaic fills in */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-2 bg-black/30 transition-opacity duration-500",
          defaultFilled
            ? "opacity-100"
            : "opacity-0 group-hover/mosaic-btn:opacity-100",
        )}
      />
      <span
        className={cn(
          "relative z-10 inline-flex flex-1 items-center justify-between gap-6",
          textSizes[size],
        )}
      >
        <span>{children ?? text}</span>
        {showArrow ? (
          <ArrowRightIcon
            className="-rotate-45 shrink-0 transition-transform duration-200 group-hover/mosaic-btn:rotate-0"
            size={14}
            weight="bold"
          />
        ) : null}
      </span>
    </>
  );

  const interaction = {
    onBlur: () => actionsRef.current?.setHover(false),
    onFocus: () => actionsRef.current?.setHover(true),
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      const p = localPoint(e);
      if (p) actionsRef.current?.ripple(p.x, p.y);
    },
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      const p = localPoint(e);
      actionsRef.current?.setHover(true, p?.x, p?.y);
    },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
      const p = localPoint(e);
      actionsRef.current?.setHover(false, p?.x, p?.y);
    },
  };

  const element = href ? (
    <Link
      aria-label={ariaLabel}
      className={classes}
      href={href}
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
