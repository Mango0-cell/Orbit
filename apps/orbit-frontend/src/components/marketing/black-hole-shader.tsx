'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Black-hole / accretion-disk WebGL shader (Supernova crimson-orange-gold),
 * ported from the Stitch landing hero. Renders a single static frame for
 * reduced-motion users; otherwise animates.
 */
const VERT = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;
#define PI 3.14159265359

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);

  float holeSize = 0.15;
  float holeEdge = 0.02;
  float hole = 1.0 - smoothstep(holeSize - holeEdge, holeSize + holeEdge, radius);

  float speed = u_time * 0.8;
  float swirl = angle + 2.0 / (radius + 0.1) - speed;

  float particles = 0.0;
  for (float i = 0.0; i < 3.0; i++) {
    float scale = 10.0 + i * 5.0;
    vec2 p_uv = vec2(radius * scale, swirl * scale / (PI * 2.0));
    float n = hash(floor(p_uv));
    float p = smoothstep(0.9, 1.0, n);
    p *= smoothstep(holeSize, holeSize + 0.1, radius);
    p *= smoothstep(0.8, 0.4, radius);
    particles += p;
  }

  vec3 color1 = vec3(1.0, 0.2, 0.0);
  vec3 color2 = vec3(1.0, 0.5, 0.0);
  vec3 color3 = vec3(1.0, 0.8, 0.1);

  float colorCycle = fract(u_time * 0.1 + radius * 0.5);
  vec3 glowColor = mix(color1, color2, smoothstep(0.0, 0.5, colorCycle));
  glowColor = mix(glowColor, color3, smoothstep(0.5, 1.0, colorCycle));

  float diskGlow = 0.03 / abs(radius - holeSize - 0.05 * sin(swirl * 3.0 + u_time));
  diskGlow *= smoothstep(0.0, 0.2, radius);

  float eventHorizon = 0.01 / abs(radius - holeSize);
  eventHorizon = clamp(eventHorizon, 0.0, 1.0);

  vec3 finalColor = glowColor * (diskGlow + particles * 0.5 + eventHorizon);
  finalColor *= (1.0 - hole);

  float stars = pow(hash(uv * 100.0), 50.0) * 0.5;
  finalColor += stars * (1.0 - hole);

  gl_FragColor = vec4(finalColor, 1.0);
}`;

export function BlackHoleShader({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl =
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return;

    const compile = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
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
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
        mouse.y =
          (1 - (event.clientY - rect.top) / rect.height) * canvas.height;
      }
    };
    window.addEventListener('mousemove', onMove);

    const syncSize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(syncSize)
        : null;
    ro?.observe(canvas);
    syncSize();

    let raf = 0;
    const draw = (t: number) => {
      if (!ro) syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      ro?.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduce]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
