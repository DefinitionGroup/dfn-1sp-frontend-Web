"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uResolution;
uniform float uProgress;
uniform float uSeed;
uniform float uCellPx;

const vec3 PETROL = vec3(0.141, 0.369, 0.400);
const vec3 TEAL = vec3(0.600, 0.733, 0.729);
const vec3 MIST = vec3(0.859, 0.898, 0.898);

float hash21(vec2 value) {
  value = fract(value * vec2(123.34, 456.21));
  value += dot(value, value + 45.32 + uSeed);
  return fract(value.x * value.y);
}

void main() {
  float cellPx = max(uCellPx, 1.0);
  vec2 cell = floor(gl_FragCoord.xy / cellPx);
  vec2 cellUv = fract(gl_FragCoord.xy / cellPx);

  // WebGL y is up, so flip the row to travel top-left → bottom-right.
  float cols = ceil(uResolution.x / cellPx);
  float rows = ceil(uResolution.y / cellPx);
  float rowFromTop = rows - 1.0 - cell.y;
  float wave = (cell.x + rowFromTop) / max(cols + rows - 2.0, 1.0);

  float window = 0.30;
  float start = wave * (1.0 - window);
  float local = smoothstep(start, start + window, uProgress);
  float eased = 1.0 - pow(1.0 - local, 3.0);

  vec2 centered = cellUv - 0.5;
  float aa = 1.0 / cellPx;
  // A grown tile spans past its own cell, so the softened edges of two
  // neighbours overlap into full coverage instead of a half-alpha seam.
  float halfSpan = eased * (0.5 + aa * 2.0);
  float coverage =
    smoothstep(halfSpan + aa, halfSpan - aa, abs(centered.x)) *
    smoothstep(halfSpan + aa, halfSpan - aa, abs(centered.y));

  float variation = hash21(cell + vec2(17.0, 31.0));
  vec3 tileColor = mix(PETROL, TEAL, 0.50 + variation * 0.28);
  // Per-tile variation resolves into one flat surface, leaving no grid behind.
  float brighten = smoothstep(0.45, 1.0, uProgress);
  tileColor = mix(tileColor, MIST, brighten);

  gl_FragColor = vec4(tileColor, coverage);
}
`;

type MosaicRevealProps = {
  active: boolean;
};

const TILE_ROWS = 5;

type MosaicState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  progressUniform: WebGLUniformLocation | null;
  seedUniform: WebGLUniformLocation | null;
  resolutionUniform: WebGLUniformLocation | null;
  cellPxUniform: WebGLUniformLocation | null;
  progress: number;
  target: number;
  frame: number;
  lastTime: number;
  running: boolean;
};

function createShader(
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

export default function MosaicReveal({ active }: MosaicRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<MosaicState | null>(null);
  const drawRef = useRef<FrameRequestCallback | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      premultipliedAlpha: false,
    });

    if (!gl) {
      setFailed(true);
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
      setFailed(true);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setFailed(true);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const state: MosaicState = {
      gl,
      program,
      progressUniform: gl.getUniformLocation(program, "uProgress"),
      seedUniform: gl.getUniformLocation(program, "uSeed"),
      resolutionUniform: gl.getUniformLocation(program, "uResolution"),
      cellPxUniform: gl.getUniformLocation(program, "uCellPx"),
      progress: 0,
      target: 0,
      frame: 0,
      lastTime: performance.now(),
      running: false,
    };
    stateRef.current = state;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(state.resolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(state.cellPxUniform, canvas.height / TILE_ROWS);
      gl.uniform1f(state.seedUniform, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const draw: FrameRequestCallback = (time) => {
      const current = stateRef.current;
      if (!current) return;

      const delta = Math.min((time - current.lastTime) / 1000, 0.05);
      current.lastTime = time;
      const speed = current.target > current.progress ? 5.2 : 20;
      current.progress +=
        (current.target - current.progress) * (1 - Math.exp(-speed * delta));

      if (Math.abs(current.target - current.progress) < 0.002) {
        current.progress = current.target;
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(current.progressUniform, current.progress);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (current.progress !== current.target) {
        current.frame = requestAnimationFrame(draw);
      } else {
        current.running = false;
        current.frame = 0;
      }
    };

    drawRef.current = draw;

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(state.frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // React Strict Mode reuses this canvas for its setup/cleanup/setup check.
      // Release our resources without permanently losing that shared context.
      stateRef.current = null;
      drawRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    const draw = drawRef.current;
    if (!state || !draw) return;

    state.target = active ? 1 : 0;

    if (!state.running && state.progress !== state.target) {
      state.running = true;
      state.lastTime = performance.now();
      state.frame = requestAnimationFrame(draw);
    }
  }, [active]);

  if (failed) {
    return <div className="h-full w-full bg-renaissance-mist" aria-hidden="true" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      aria-hidden="true"
    />
  );
}
