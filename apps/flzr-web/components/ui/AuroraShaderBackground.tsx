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
  
  // Simplex noise for organic movement
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
  
  // Metaball function - returns influence based on distance
  float metaball(vec2 p, vec2 center, float radius) {
    float d = length(p - center);
    return radius * radius / (d * d + 0.001);
  }
  
  // Organic movement path for each ball
  vec2 getBallPosition(float index, float time) {
    float t = time * 0.3;
    float phase = index * 2.094; // 2π/3 offset for each ball
    
    // Different movement patterns based on index
    if (index < 1.0) {
      // Ball 1: Large circular orbit with noise
      float nx = snoise(vec2(t * 0.5, index)) * 0.3;
      float ny = snoise(vec2(t * 0.5 + 100.0, index)) * 0.3;
      return vec2(
        sin(t * 0.7 + phase) * 0.6 + nx,
        cos(t * 0.5 + phase) * 0.5 + ny
      );
    } else if (index < 2.0) {
      // Ball 2: Figure-8 pattern
      float nx = snoise(vec2(t * 0.4, index + 10.0)) * 0.25;
      float ny = snoise(vec2(t * 0.4 + 50.0, index + 10.0)) * 0.25;
      return vec2(
        sin(t * 0.6) * 0.7 + nx,
        sin(t * 1.2) * 0.4 + ny
      );
    } else if (index < 3.0) {
      // Ball 3: Elliptical orbit
      float nx = snoise(vec2(t * 0.6, index + 20.0)) * 0.2;
      float ny = snoise(vec2(t * 0.6 + 30.0, index + 20.0)) * 0.2;
      return vec2(
        cos(t * 0.8 + phase) * 0.5 + nx,
        sin(t * 0.4 + phase) * 0.6 + ny
      );
    } else if (index < 4.0) {
      // Ball 4: Wandering with more noise
      float nx = snoise(vec2(t * 0.3, index + 30.0)) * 0.6;
      float ny = snoise(vec2(t * 0.35 + 70.0, index + 30.0)) * 0.5;
      return vec2(nx, ny);
    } else if (index < 5.0) {
      // Ball 5: Slow drift
      float nx = snoise(vec2(t * 0.25, index + 40.0)) * 0.5;
      float ny = snoise(vec2(t * 0.3 + 90.0, index + 40.0)) * 0.4;
      return vec2(
        sin(t * 0.3) * 0.4 + nx,
        cos(t * 0.25) * 0.5 + ny
      );
    } else {
      // Ball 6: Counter-rotating
      float nx = snoise(vec2(t * 0.45, index + 50.0)) * 0.3;
      float ny = snoise(vec2(t * 0.5 + 110.0, index + 50.0)) * 0.3;
      return vec2(
        cos(t * 0.9 + phase) * 0.55 + nx,
        sin(t * 0.7 + phase) * 0.45 + ny
      );
    }
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    float t = u_time;
    
    // Calculate metaball field
    float field = 0.0;
    float violetField = 0.0;
    float blueField = 0.0;
    
    // Define ball properties: position, radius, color type (0=violet, 1=blue)
    // Violet balls
    vec2 ball1 = getBallPosition(0.0, t);
    vec2 ball2 = getBallPosition(1.0, t);
    vec2 ball3 = getBallPosition(2.0, t);
    
    // Blue balls
    vec2 ball4 = getBallPosition(3.0, t);
    vec2 ball5 = getBallPosition(4.0, t);
    vec2 ball6 = getBallPosition(5.0, t);
    
    // Ball sizes with subtle pulsing
    float size1 = 0.35 + sin(t * 0.7) * 0.15;
    float size2 = 0.30 + sin(t * 0.9 + 1.0) * 0.04;
    float size3 = 0.25 + sin(t * 0.6 + 2.0) * 0.03;
    float size4 = 0.32 + sin(t * 0.8 + 0.5) * 0.04;
    float size5 = 0.28 + sin(t * 0.5 + 1.5) * 0.05;
    float size6 = 0.22 + sin(t * 1.0 + 2.5) * 0.03;
    
    // Calculate violet metaballs
    violetField += metaball(p, ball1, size1);
    violetField += metaball(p, ball2, size2);
    violetField += metaball(p, ball3, size3);
    
    // Calculate blue metaballs
    blueField += metaball(p, ball4, size4);
    blueField += metaball(p, ball5, size5);
    blueField += metaball(p, ball6, size6);
    
    // Total field for threshold
    field = violetField * blueField;
    
    // Colors
    vec3 violetColor = vec3(0, 1.0, 0.5);      // Bright violet
    vec3 blueColor = vec3(0, 2, 0);      // Vibrant blue
    vec3 bgColor = vec3(0,0,1);     // Dark gray background
    
    // Metaball threshold and smoothing for soft, blurry edges
    float threshold = 5.0;
    float softness = 3.2;
    
    // Calculate color mixing based on field contributions
    float totalField = violetField + blueField + 0.001;
    float violetRatio = violetField / totalField;
    float blueRatio = blueField / totalField;
    
    // Mix colors based on field dominance
    vec3 ballColor = violetColor * violetRatio + blueColor * blueRatio;
    
    // Soft metaball edge with blur
    float alpha = smoothstep(threshold - softness, threshold + softness * 11.5, field);
    
    // Add glow around the metaballs
    float glow = smoothstep(threshold - softness * 2.5, threshold, field) * 0.814;
    vec3 glowColor = ballColor * glow;
    
    // Inner brightness boost
    float innerBright = smoothstep(threshold, threshold + softness * 2.0, field);
    ballColor = mix(ballColor, ballColor * 1.4, innerBright * 1.2);
    
    // Compose final color
    vec3 finalColor = mix(bgColor + glowColor, ballColor, alpha);
    
    // Add subtle noise texture to break up banding
    float noise = snoise(p * 1150.0 + t * 1.5) * 0.11;
    finalColor += noise;
    
    // Subtle vignette
    float vignette = 1.0 - length(p) * 0.25;
    vignette = smoothstep(0.0, 1.0, vignette);
    finalColor *= vignette * 0.95 + 0.01;
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(0.99));
    
    gl_FragColor = vec4(finalColor, 0.5);
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
        style={{ background: "#1e1e24" }}
      />
      {/* Subtle overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.13) 0%, rgba(0,0,0,0.63) 100%)",
        }}
      />
    </div>
  );
}
