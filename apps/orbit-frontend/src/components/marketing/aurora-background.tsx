'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/** Warm Supernova aurora vs. the recording's teal — swap with `variant`. */
const PALETTES = {
  warm: { c1: [1.0, 0.82, 0.34], c2: [1.0, 0.4, 0.1], c3: [0.5, 0.11, 0.04] },
  teal: {
    c1: [0.62, 1.0, 0.92],
    c2: [0.11, 0.62, 0.92],
    c3: [0.02, 0.16, 0.45],
  },
} as const;

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

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
  float t = u_time * 0.12;

  float w1 = fbm(p * 2.5 + vec2(t, t * 0.6));
  float w2 = fbm(p * 2.5 + vec2(w1 * 2.0 - t * 0.8, w1 * 2.0 + t * 0.4));
  float flow = fbm(p * 1.8 + vec2(w2 * 2.5, w2 * 2.0 - t));

  float centerY = 0.5 + 0.18 * sin(uv.x * 2.5 + t * 1.5) + (w2 - 0.5) * 0.6;
  float ribbon = smoothstep(0.42, 0.0, abs(uv.y - centerY)) * smoothstep(0.25, 0.9, flow);
  float core = pow(ribbon, 2.0);

  vec3 col = mix(u_c3, u_c2, ribbon);
  col = mix(col, u_c1, core);
  col *= ribbon * 1.6;
  col += u_c3 * flow * flow * 0.06;

  gl_FragColor = vec4(col, 1.0);
}`;

export function AuroraBackground({
  variant = 'warm',
}: {
  variant?: keyof typeof PALETTES;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
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
    gl.uniform3fv(
      gl.getUniformLocation(prog, 'u_c1'),
      pal.c1 as unknown as number[],
    );
    gl.uniform3fv(
      gl.getUniformLocation(prog, 'u_c2'),
      pal.c2 as unknown as number[],
    );
    gl.uniform3fv(
      gl.getUniformLocation(prog, 'u_c3'),
      pal.c3 as unknown as number[],
    );

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
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <canvas ref={ref} className="h-full w-full opacity-80" />
    </div>
  );
}
