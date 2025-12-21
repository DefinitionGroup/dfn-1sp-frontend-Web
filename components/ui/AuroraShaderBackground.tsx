"use client";

import { useEffect, useRef, useCallback } from "react";

interface AuroraShaderBackgroundProps {
  onClose?: () => void;
  className?: string;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  
  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    float t = u_time * 0.15;
    
    // Create flowing aurora bands
    float noise1 = fbm(vec2(p.x * 0.8 + t * 0.3, p.y * 1.2 + t * 0.2));
    float noise2 = fbm(vec2(p.x * 1.2 - t * 0.2, p.y * 0.6 + t * 0.4));
    float noise3 = fbm(vec2(p.x * 0.5 + t * 0.5, p.y * 1.5 - t * 0.3));
    
    // Aurora wave pattern
    float wave1 = sin(p.x * 2.0 + noise1 * 3.0 + t) * 0.5 + 0.5;
    float wave2 = sin(p.x * 1.5 - noise2 * 2.5 + t * 1.3) * 0.5 + 0.5;
    float wave3 = sin(p.x * 3.0 + noise3 * 2.0 - t * 0.8) * 0.5 + 0.5;
    
    // Vertical gradient for aurora positioning
    float verticalGrad = smoothstep(-0.2, 0.8, p.y + noise1 * 0.5);
    float verticalGrad2 = smoothstep(-0.5, 0.6, p.y + noise2 * 0.4);
    
    // Aurora colors - vibrant greens, blues, and purples with lime accent
    vec3 color1 = vec3(0.2, 1.0, 0.5);   // Bright green (lime-ish)
    vec3 color2 = vec3(0.1, 0.6, 1.0);   // Cyan blue
    vec3 color3 = vec3(0.6, 0.2, 0.9);   // Purple
    vec3 color4 = vec3(0.9, 0.4, 0.7);   // Pink
    vec3 color5 = vec3(0.3, 0.9, 0.6);   // Mint green
    
    // Mix colors based on noise and position
    vec3 aurora = vec3(0.0);
    
    // Layer 1 - Main green aurora
    float intensity1 = wave1 * verticalGrad * (0.6 + noise1 * 0.4);
    intensity1 *= smoothstep(0.3, 0.7, noise1 + 0.5);
    aurora += mix(color1, color5, noise2 * 0.5 + 0.5) * intensity1 * 0.8;
    
    // Layer 2 - Blue/cyan streaks
    float intensity2 = wave2 * verticalGrad2 * (0.5 + noise2 * 0.5);
    intensity2 *= smoothstep(0.2, 0.6, noise2 + 0.4);
    aurora += mix(color2, color3, noise1 * 0.5 + 0.5) * intensity2 * 0.6;
    
    // Layer 3 - Purple/pink accents
    float intensity3 = wave3 * smoothstep(-0.3, 0.5, p.y + noise3 * 0.6) * (0.4 + noise3 * 0.4);
    intensity3 *= smoothstep(0.1, 0.5, noise3 + 0.3);
    aurora += mix(color3, color4, noise3 * 0.5 + 0.5) * intensity3 * 0.5;
    
    // Add subtle glow/bloom effect
    float glow = fbm(p * 0.5 + t * 0.1) * 0.3 + 0.2;
    aurora += aurora * glow * 0.5;
    
    // Add shimmer/sparkle effect
    float shimmer = snoise(p * 20.0 + t * 2.0) * 0.5 + 0.5;
    shimmer = pow(shimmer, 8.0) * 0.3;
    aurora += vec3(shimmer) * verticalGrad * 0.4;
    
    // Dark background with subtle gradient
    vec3 bgColor = mix(
      vec3(0.02, 0.02, 0.05),
      vec3(0.05, 0.08, 0.15),
      uv.y * 0.5 + noise1 * 0.2
    );
    
    // Final composition
    vec3 finalColor = bgColor + aurora;
    
    // Add vignette
    float vignette = 1.0 - length(p) * 0.4;
    vignette = smoothstep(0.0, 1.0, vignette);
    finalColor *= vignette * 0.9 + 0.1;
    
    // Tone mapping and gamma correction
    finalColor = finalColor / (finalColor + vec3(1.0));
    finalColor = pow(finalColor, vec3(0.9));
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

export default function AuroraShaderBackground({
  onClose,
  className = "",
}: AuroraShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    []
  );

  const createProgram = useCallback(
    (
      gl: WebGLRenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    programRef.current = program;

    // Set up geometry (full-screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // Handle resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation loop
    const render = () => {
      if (!gl || !program) return;

      gl.useProgram(program);

      const time = (Date.now() - startTimeRef.current) / 1000;
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, [createShader, createProgram]);

  return (
    <div
      className={`absolute inset-0 pointer-events-auto ${className}`}
      onClick={onClose}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ background: "#050510" }}
      />
      {/* Subtle overlay for better text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
        }}
      />
    </div>
  );
}
