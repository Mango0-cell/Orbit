'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

/** Smoke palettes: warm fits the theme; teal mirrors the reference recording. */
const PALETTES = {
  warm: {
    core: [0.5, 0.13, 0.03],
    edge: [1.0, 0.5, 0.16],
    hot: [1.0, 0.85, 0.45],
  },
  teal: {
    core: [0.05, 0.4, 0.42],
    edge: [0.2, 0.85, 0.95],
    hot: [0.75, 1.0, 0.95],
  },
} as const;

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_src;
uniform vec3 u_core;
uniform vec3 u_edge;
uniform vec3 u_hot;

float hash(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.55; for (int i = 0; i < 6; i++){ v += a * noise(p); p *= 1.9; a *= 0.55; } return v; }

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 P = vec2(uv.x * aspect, uv.y);
  vec2 S = vec2(u_src.x * aspect, u_src.y);
  float t = u_time * 0.085;

  vec2 rel = P - S;
  float along = -rel.x;      // leftward distance from the source
  float across = rel.y;

  // Domain-warped turbulence — the billowing of the smoke.
  float w1 = fbm(P * 1.7 + vec2(t * 1.1, t * 0.4));
  float w2 = fbm(P * 1.9 + vec2(w1 * 2.0 - t * 0.7, w1 * 1.7 + t * 0.3));
  float turb = fbm(P * 3.4 + vec2(w2 * 2.2, -t * 1.4));

  // The plume: a centerline that drifts and a width that grows as it trails.
  float drift = (w2 - 0.5) * 0.6 * smoothstep(0.0, 0.5, along)
              + 0.09 * sin(along * 3.4 - t * 2.0) * smoothstep(0.03, 0.45, along);
  float centered = across - drift;
  float halfW = 0.05 + along * 0.46;
  float aN = centered / max(halfW, 0.02);
  float band = exp(-aN * aN * 1.3);                 // soft gaussian smoke profile

  // Present left of the source, brightest near it, dissipating as it trails.
  float alongFade = smoothstep(-0.05, 0.05, along) * smoothstep(1.5, 0.05, along);
  float smoke = band * alongFade * (0.3 + 0.95 * turb);

  vec3 col = u_core * smoke * 1.25;
  col += u_edge * pow(smoke, 1.6) * 1.5;
  col += u_hot * pow(smoke, 3.5) * (0.5 + turb);
  // Hot wispy filaments close to the source.
  col += u_hot * band * alongFade * pow(turb, 4.0) * smoothstep(0.55, 0.0, along) * 0.9;
  col += u_core * band * alongFade * 0.14;           // faint outer haze

  // Black hole: a dark absence right at the source (sits behind the planet).
  float bh = smoothstep(0.17, 0.02, length(rel));
  col *= 1.0 - bh * 0.92;

  gl_FragColor = vec4(col, 1.0);
}`;

/**
 * RibbonBackground — a smoke trail emanating from a source point (the "black
 * hole" that sits behind the planet), billowing leftward across the hero so the
 * planet appears to emit it. WebGL, domain-warped turbulence. `source` is the
 * emission point in 0..1 UV. Reduced-motion renders a single static frame.
 */
export function RibbonBackground({
  className,
  variant = 'warm',
  source = [0.87, 0.53],
}: {
  className?: string;
  variant?: keyof typeof PALETTES;
  source?: [number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const pal = PALETTES[variant];
    gl.uniform3fv(gl.getUniformLocation(prog, 'u_core'), pal.core as unknown as number[]);
    gl.uniform3fv(gl.getUniformLocation(prog, 'u_edge'), pal.edge as unknown as number[]);
    gl.uniform3fv(gl.getUniformLocation(prog, 'u_hot'), pal.hot as unknown as number[]);
    gl.uniform2f(gl.getUniformLocation(prog, 'u_src'), source[0], source[1]);

    let raf = 0;
    const startT = performance.now();
    const draw = (now: number) => {
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);
      gl.viewport(0, 0, w, h);
      if (uTime) gl.uniform1f(uTime, (now - startT) / 1000);
      if (uRes) gl.uniform2f(uRes, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(startT);

    return () => {
      cancelAnimationFrame(raf);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduce, variant, source]);

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none overflow-hidden', className)}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
