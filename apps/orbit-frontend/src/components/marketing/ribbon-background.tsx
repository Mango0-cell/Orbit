'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

/** Ribbon palettes: teal matches the reference recording; warm fits the theme. */
const PALETTES = {
  teal: {
    core: [0.08, 0.62, 0.55],
    edge: [0.32, 0.95, 0.98],
    hot: [0.75, 1.0, 0.92],
  },
  warm: {
    core: [0.62, 0.16, 0.04],
    edge: [1.0, 0.55, 0.2],
    hot: [1.0, 0.86, 0.42],
  },
} as const;

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_res;
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
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.09;

  // Domain-warped flow — the liquid undulation of the ribbon.
  float w1 = fbm(p * 1.5 + vec2(t, t * 0.5));
  float w2 = fbm(p * 1.6 + vec2(w1 * 1.8 - t * 0.6, w1 * 1.6 + t * 0.3));
  float flow = fbm(p * 3.2 + vec2(w2 * 2.2, -t * 1.3));

  // Wavy centerline + breathing half-width → an undulating horizontal band.
  float center = 0.5 + 0.17 * sin(uv.x * 2.6 + t * 1.8) + (w2 - 0.5) * 0.55;
  float halfW = 0.15 + 0.09 * sin(uv.x * 3.4 - t * 1.4) + (w1 - 0.5) * 0.14;
  float d = abs(uv.y - center) / max(halfW, 0.03);

  float band = smoothstep(1.0, 0.0, d);       // 1 at core → 0 at edge
  float core = pow(band, 1.7);
  float rim = smoothstep(0.30, 0.95, band) * smoothstep(1.0, 0.7, band); // glowing edges

  vec3 col = u_core * core * 1.1;
  col += u_edge * rim * 1.5;
  col += u_hot * pow(core, 3.0) * (0.5 + flow);
  col += u_core * smoothstep(2.0, 0.0, d) * 0.12; // outer halo

  // Bias toward the right so the hero copy on the left stays readable.
  col *= smoothstep(0.02, 0.42, uv.x) * 0.85 + 0.15;
  col *= 0.55 + 0.65 * band;

  gl_FragColor = vec4(col, 1.0);
}`;

/**
 * RibbonBackground — a flowing liquid-light ribbon (WebGL): an undulating
 * luminous band with glowing edges that morphs across the hero. Rendered
 * behind the particle-globe planet as a separate, self-contained layer.
 * `variant='teal'` mirrors the reference recording; `'warm'` fits the theme.
 * Reduced-motion renders a single static frame.
 */
export function RibbonBackground({
  className,
  variant = 'warm',
}: {
  className?: string;
  variant?: keyof typeof PALETTES;
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
  }, [reduce, variant]);

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none overflow-hidden', className)}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
