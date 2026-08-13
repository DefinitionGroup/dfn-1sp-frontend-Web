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
uniform float uPixelRatio;

const vec3 PETROL = vec3(0.141, 0.369, 0.400);
const vec3 TEAL = vec3(0.600, 0.733, 0.729);
const vec3 MIST = vec3(0.859, 0.898, 0.898);
const vec3 BRIGHT = vec3(0.965, 0.980, 0.976);

float hash21(vec2 value) {
  value = fract(value * vec2(123.34, 456.21));
  value += dot(value, value + 45.32 + uSeed);
  return fract(value.x * value.y);
}

void main() {
  vec2 cellSize = vec2(15.0, 9.0) * uPixelRatio;
  vec2 cell = floor(gl_FragCoord.xy / cellSize);
  vec2 cellUv = fract(gl_FragCoord.xy / cellSize);
  float order = hash21(cell);

  // Each cell starts at a shuffled point in the reveal, then snaps on quickly.
  float localProgress = smoothstep(
    order * 0.80,
    order * 0.80 + 0.12,
    uProgress
  );

  // A narrow gutter keeps the rectangles legible while the field is assembling.
  vec2 inset = vec2(0.08, 0.12);
  float rectangle =
    step(inset.x, cellUv.x) *
    step(inset.y, cellUv.y) *
    step(cellUv.x, 1.0 - inset.x) *
    step(cellUv.y, 1.0 - inset.y);

  // Once every tile has arrived, the gutters close and the button reads as bright.
  float finish = smoothstep(0.86, 0.98, uProgress);
  float coverage = localProgress * mix(rectangle, 1.0, finish);
  float flash = smoothstep(0.0, 0.22, localProgress) *
    (1.0 - smoothstep(0.22, 0.72, localProgress));
  float variation = hash21(cell + vec2(17.0, 31.0));

  vec3 tileColor = mix(PETROL, TEAL, 0.35 + variation * 0.65);
  float brighten = smoothstep(0.72, 0.98, uProgress);
  tileColor = mix(tileColor, MIST, brighten * 0.82);
  tileColor = mix(tileColor, BRIGHT, flash * 0.24 + finish * 0.32);

  gl_FragColor = vec4(tileColor, coverage);
}
`;

type MosaicRevealProps = {
  active: boolean;
};

type MosaicState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  progressUniform: WebGLUniformLocation | null;
  seedUniform: WebGLUniformLocation | null;
  resolutionUniform: WebGLUniformLocation | null;
  pixelRatioUniform: WebGLUniformLocation | null;
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
      pixelRatioUniform: gl.getUniformLocation(program, "uPixelRatio"),
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
      gl.uniform1f(state.pixelRatioUniform, ratio);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const draw: FrameRequestCallback = (time) => {
      const current = stateRef.current;
      if (!current) return;

      const delta = Math.min((time - current.lastTime) / 1000, 0.05);
      current.lastTime = time;
      const speed = current.target > current.progress ? 7 : 20;
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
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      stateRef.current = null;
      drawRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    const draw = drawRef.current;
    if (!state || !draw) return;

    state.target = active ? 1 : 0;
    if (active) {
      state.gl.uniform1f(state.seedUniform, Math.random() * 1000);
    }

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
