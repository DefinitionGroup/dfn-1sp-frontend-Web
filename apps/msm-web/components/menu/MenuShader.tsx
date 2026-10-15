"use client";

import { useEffect, useRef } from "react";
import { MOSAIC_PALETTE } from "../ui/MosaicButton";
import styles from "./Navigation.module.css";

// MosaicButton's hover signature at viewport scale: alternating triangle
// strips, a staggered half-turn, a small lift, and the same settling curves.
// Geometry and lighting run on the GPU; the navigation stays stationary.
const vertexShader = `
uniform float uTime;
uniform float uReducedMotion;
uniform float uTileHeight;
attribute vec2 aCenter;
attribute vec3 aColor;
attribute vec3 aBarycentric;
attribute float aAxis;
attribute float aDirection;
attribute float aDelay;
attribute float aSeed;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vBarycentric;
varying float vAlpha;
varying float vSeed;

float easeOutCubic(float p) {
  return 1.0 - pow(1.0 - p, 3.0);
}
float easeOutBack(float p) {
  float q = p - 1.0;
  return 1.0 + 2.70158 * q * q * q + 1.70158 * q * q;
}
void main() {
  float progress = mix(clamp((uTime - aDelay) / 0.85, 0.0, 1.0), 1.0, uReducedMotion);
  float scale = max(0.0001, easeOutBack(progress));
  float angle = (1.0 - easeOutCubic(progress)) * 3.141593 * aDirection;
  float lift = sin(progress * 3.141593) * uTileHeight * 0.4;

  // Unhurried 24-second cycles: each facet turns over six seconds, rests,
  // then settles back. No abrupt reset at the cycle boundary.
  float idleTime = max(0.0, uTime - 2.5);
  float cycle = mod(idleTime + aSeed * 24.0 - aDelay * 3.0, 24.0);
  float turn = smoothstep(0.0, 6.0, cycle) - smoothstep(9.0, 15.0, cycle);
  float idle = smoothstep(0.0, 3.0, idleTime) * (1.0 - uReducedMotion);
  angle += turn * 3.141593 * aDirection * idle;
  lift += sin(turn * 3.141593) * uTileHeight * 0.18 * idle;

  vec3 p = position * scale;
  float c = cos(angle);
  float s = sin(angle);
  if (aAxis < 0.5) {
    p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
    vNormal = vec3(0.0, -s, c);
  } else {
    p = vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
    vNormal = vec3(s, 0.0, c);
  }
  p.xy += aCenter;
  p.z += lift;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vColor = aColor;
  vBarycentric = aBarycentric;
  vAlpha = smoothstep(0.03, 0.3, progress);
  vSeed = aSeed;
}`;

const fragmentShader = `
uniform vec3 uPaper;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vBarycentric;
varying float vAlpha;
varying float vSeed;
void main() {
  vec3 key = normalize(vec3(-0.35, 0.65, 1.0));
  float light = 0.48 + 0.52 * abs(dot(normalize(vNormal), key));
  float edge = smoothstep(0.0, 0.025, min(vBarycentric.x, min(vBarycentric.y, vBarycentric.z)));
  // Logo colors remain an atmosphere behind the white navigation and cyan
  // actions. Mix in linear space so neither pale nor warm facets flare up.
  float strength = 0.055 + vSeed * 0.04;
  vec3 color = mix(uPaper, vColor * light, strength * (0.85 + edge * 0.15));
  gl_FragColor = vec4(color, vAlpha);
  #include <colorspace_fragment>
}`;

function sample(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export default function MenuShader({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let teardown: (() => void) | undefined;

    async function initialize() {
      const three = await import("three");
      if (disposed) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new three.WebGLRenderer({ canvas: canvas!, alpha: false, antialias: true, powerPreference: "low-power" });
      } catch {
        return; // The dialog's Paper Black field remains the fallback.
      }
      renderer.setClearColor("#0a0c0d", 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(30, 1, 1, 12000);
      const material = new three.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uReducedMotion: { value: reducedMotion ? 1 : 0 },
          uTileHeight: { value: 80 },
          uPaper: { value: new three.Color("#0a0c0d") },
        },
        side: three.DoubleSide,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new three.Mesh(new three.BufferGeometry(), material);
      mesh.frustumCulled = false; // Tile centers are applied by the vertex shader.
      scene.add(mesh);

      let width = 0;
      let height = 0;
      let elapsed = 0;
      let previous = 0;
      let frame = 0;
      let contextLost = false;

      function draw() {
        material.uniforms.uTime.value = elapsed;
        renderer.render(scene, camera);
      }

      function resize() {
        const nextWidth = Math.max(1, canvas!.clientWidth);
        const nextHeight = Math.max(1, canvas!.clientHeight);
        if (width === nextWidth && height === nextHeight) return;
        width = nextWidth;
        height = nextHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = height / 2 / Math.tan(Math.PI / 12);
        camera.far = height * 12;
        camera.updateProjectionMatrix();

        const tileHeight = Math.max(64, Math.min(94, height / 11));
        const tileWidth = tileHeight * 0.866;
        const step = tileHeight / 2;
        const diagonal = Math.hypot(width, height);
        const positions: number[] = [];
        const centers: number[] = [];
        const colors: number[] = [];
        const barycentrics: number[] = [];
        const axes: number[] = [];
        const directions: number[] = [];
        const delays: number[] = [];
        const seeds: number[] = [];

        for (let column = 0; column <= Math.ceil(width / tileWidth); column++) {
          for (let slot = -1; slot <= Math.ceil(height / step) + 1; slot++) {
            const left = column * tileWidth;
            const right = left + tileWidth;
            const bottom = height - slot * step;
            const points = ((column + slot) % 2 + 2) % 2 === 0
              ? [[left, bottom], [left, bottom - tileHeight], [right, bottom - tileHeight / 2]]
              : [[right, bottom], [right, bottom - tileHeight], [left, bottom - tileHeight / 2]];
            const cx = (points[0][0] + points[1][0] + points[2][0]) / 3;
            const cy = (points[0][1] + points[1][1] + points[2][1]) / 3;
            const key = column * 97 + slot * 17;
            const seed = sample(key);
            const color = new three.Color(MOSAIC_PALETTE[Math.floor(seed * MOSAIC_PALETTE.length)]);
            // Same radial stagger as the hover, with the origin pinned to
            // the viewport's top-left and a longer, quieter wavefront.
            const delay = Math.min(1, Math.hypot(cx, cy) / diagonal) * 1.5 + sample(key + 4) * 0.07;
            points.forEach(([x, y], vertex) => {
              positions.push(x - cx, cy - y, 0);
              centers.push(cx - width / 2, height / 2 - cy);
              colors.push(color.r, color.g, color.b);
              barycentrics.push(vertex === 0 ? 1 : 0, vertex === 1 ? 1 : 0, vertex === 2 ? 1 : 0);
              axes.push(sample(key + 1) < 0.5 ? 0 : 1);
              directions.push(sample(key + 2) < 0.5 ? -1 : 1);
              delays.push(delay);
              seeds.push(seed);
            });
          }
        }

        const geometry = new three.BufferGeometry();
        geometry.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("aCenter", new three.Float32BufferAttribute(centers, 2));
        geometry.setAttribute("aColor", new three.Float32BufferAttribute(colors, 3));
        geometry.setAttribute("aBarycentric", new three.Float32BufferAttribute(barycentrics, 3));
        geometry.setAttribute("aAxis", new three.Float32BufferAttribute(axes, 1));
        geometry.setAttribute("aDirection", new three.Float32BufferAttribute(directions, 1));
        geometry.setAttribute("aDelay", new three.Float32BufferAttribute(delays, 1));
        geometry.setAttribute("aSeed", new three.Float32BufferAttribute(seeds, 1));
        mesh.geometry.dispose();
        mesh.geometry = geometry;
        material.uniforms.uTileHeight.value = tileHeight;
        draw();
      }

      function render(now: number) {
        if (disposed || document.hidden || contextLost) return;
        if (!previous || now - previous >= 1000 / 30) {
          elapsed += previous ? Math.min((now - previous) / 1000, 0.1) : 0;
          previous = now;
          draw();
        }
        frame = requestAnimationFrame(render);
      }

      function visibility() {
        cancelAnimationFrame(frame);
        previous = 0;
        if (!document.hidden && !reducedMotion && !contextLost) frame = requestAnimationFrame(render);
      }
      function lost(event: Event) {
        event.preventDefault();
        contextLost = true;
        cancelAnimationFrame(frame);
      }
      function restored() {
        contextLost = false;
        draw();
        visibility();
      }

      const observer = new ResizeObserver(resize);
      observer.observe(canvas!);
      resize();
      visibility();
      document.addEventListener("visibilitychange", visibility);
      canvas!.addEventListener("webglcontextlost", lost);
      canvas!.addEventListener("webglcontextrestored", restored);
      teardown = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        canvas!.removeEventListener("webglcontextlost", lost);
        canvas!.removeEventListener("webglcontextrestored", restored);
        mesh.geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    }

    void initialize().catch(() => {});
    return () => { disposed = true; teardown?.(); };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={styles.shader} aria-hidden="true" />;
}
