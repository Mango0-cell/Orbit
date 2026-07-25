'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/* Minimal mat4 helpers */
type M4 = Float32Array;
const m4 = {
  create: (): M4 => new Float32Array(16),
  identity: (o: M4): M4 => {
    o.fill(0);
    o[0] = o[5] = o[10] = o[15] = 1;
    return o;
  },
  perspective: (
    o: M4,
    fovy: number,
    aspect: number,
    near: number,
    far: number,
  ): M4 => {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    o.fill(0);
    o[0] = f / aspect;
    o[5] = f;
    o[10] = (far + near) * nf;
    o[11] = -1;
    o[14] = 2 * far * near * nf;
    return o;
  },
  multiply: (o: M4, a: M4, b: M4): M4 => {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        r[i * 4 + j] =
          a[j] * b[i * 4] +
          a[4 + j] * b[i * 4 + 1] +
          a[8 + j] * b[i * 4 + 2] +
          a[12 + j] * b[i * 4 + 3];
    o.set(r);
    return o;
  },
  translate: (o: M4, a: M4, [x, y, z]: [number, number, number]): M4 => {
    if (o !== a) o.set(a);
    o[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    o[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    o[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    o[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    return o;
  },
  rotate: (o: M4, a: M4, rad: number, axis: 'x' | 'y'): M4 => {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const r = m4.identity(m4.create());
    if (axis === 'y') {
      r[0] = c;
      r[2] = -s;
      r[8] = s;
      r[10] = c;
    } else {
      r[5] = c;
      r[6] = s;
      r[9] = -s;
      r[10] = c;
    }
    return m4.multiply(o, a, r);
  },
};

const CUBE_POS = new Float32Array([
  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1,
  -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1,
  1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1,
  -1, 1, 1, -1, 1, -1,
]);
const CUBE_NORM = new Float32Array([
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 1, 0,
  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
]);
const CUBE_IDX = new Uint16Array([
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
  15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
]);

const VERT = `attribute vec4 a_position; attribute vec3 a_normal;
uniform mat4 u_matrix; uniform mat4 u_model;
varying vec3 v_normal; varying vec3 v_position;
void main(){ gl_Position = u_matrix * a_position; v_normal = mat3(u_model) * a_normal; v_position = a_position.xyz; }`;

const FRAG = `precision mediump float;
varying vec3 v_normal; varying vec3 v_position;
uniform vec3 u_light; uniform vec3 u_color; uniform float u_time;
void main(){
  vec3 n = normalize(v_normal);
  float light = clamp(dot(n, normalize(u_light)), 0.0, 1.0);
  vec3 color = u_color * 0.28 + u_color * light * 0.72;
  float s1 = sin(u_time * 0.6 + v_position.x * 1.5);
  float s2 = sin(u_time * 0.9 + v_position.y * 1.5);
  color += vec3(s1, s2, s1 * 0.5) * 0.06;
  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * Full-page animated background: a slowly rotating, mouse-reactive Supernova cube
 * (WebGL) with a warm glow. Reduced-motion users get a single static frame.
 * (Reconstructed from the React Bits particle-hero — shader fixed, retinted, typed.)
 */
export function ParticleHero() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
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

    const bind = (data: BufferSource, target: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(target, b);
      gl.bufferData(target, data, gl.STATIC_DRAW);
      return b;
    };
    const posBuf = bind(CUBE_POS, gl.ARRAY_BUFFER);
    const normBuf = bind(CUBE_NORM, gl.ARRAY_BUFFER);
    bind(CUBE_IDX, gl.ELEMENT_ARRAY_BUFFER);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    const aNorm = gl.getAttribLocation(prog, 'a_normal');
    const uMatrix = gl.getUniformLocation(prog, 'u_matrix');
    const uModel = gl.getUniformLocation(prog, 'u_model');
    const uLight = gl.getUniformLocation(prog, 'u_light');
    const uColor = gl.getUniformLocation(prog, 'u_color');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', onMove);

    const proj = m4.create();
    const view = m4.create();
    const model = m4.create();
    const mv = m4.create();
    const mvp = m4.create();

    const render = (rot: number, time: number) => {
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
      gl.enableVertexAttribArray(aNorm);
      gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

      m4.perspective(proj, Math.PI / 4, w / h, 0.1, 100);
      m4.translate(view, m4.identity(view), [0, 0, -6]);
      m4.identity(model);
      m4.rotate(model, model, rot + mouse.x * 0.6, 'y');
      m4.rotate(model, model, rot * 0.6 + mouse.y * 0.6, 'x');
      m4.multiply(mv, view, model);
      m4.multiply(mvp, proj, mv);

      gl.uniformMatrix4fv(uMatrix, false, mvp);
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniform3fv(uLight, [0.5, 0.7, 0.6]);
      gl.uniform3fv(uColor, [1.0, 0.42, 0.16]);
      gl.uniform1f(uTime, time);
      gl.drawElements(gl.TRIANGLES, CUBE_IDX.length, gl.UNSIGNED_SHORT, 0);
    };

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      render(t * 0.4, t);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    loop(start);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <canvas ref={ref} className="h-full w-full opacity-70" />
      <div className="absolute left-1/2 top-1/3 h-[65vh] w-[65vh] -translate-x-1/2 rounded-full bg-primary-container/15 blur-[150px]" />
      <div className="absolute bottom-0 right-[-5%] h-[45vh] w-[45vh] rounded-full bg-secondary/10 blur-[130px]" />
    </div>
  );
}
