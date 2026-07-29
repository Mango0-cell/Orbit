'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * OrbitBends — the planet's orbit ring rendered as a ColorBends ribbon whose
 * colors FLOW ALONG the orbit. The ColorBends color-blend formula is remapped to
 * the ellipse's polar coords (angle around the ring = the flow axis, radial =
 * across the band), so the bands stream around the same orbit path that already
 * wraps the planet. `half` splits it (front/back) so it wraps the planet like a
 * Saturn ring. Reduced-motion renders one static frame.
 */
type Half = 'back' | 'front' | 'full';

// Supernova app palette — warm only (crimson → orange → amber → coral); the
// greenish gold is left out of the ribbon flow so it stays fiery, not olive.
const WARM = ['#ff5633', '#ff8a4c', '#ffc080', '#ffb4a4'];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision highp float;
uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_aspect;
uniform float u_time, u_rx, u_ry, u_tilt, u_thickness, u_half;
uniform float u_speed, u_freq, u_bandWidth, u_intensity, u_around, u_across, u_shine;
uniform int u_ncol;
uniform vec3 u_colors[8];

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;      // 0..1 (y up)
  // Full-screen canvas: the orbit is placed here, centred on the planet, in
  // aspect-corrected (height-relative) units — no container edge to clip it.
  vec2 p = (uv - u_center) * vec2(u_aspect, 1.0);
  float ct = cos(-u_tilt), st = sin(-u_tilt);
  vec2 pr = vec2(p.x * ct - p.y * st, p.x * st + p.y * ct);
  vec2 e = vec2(pr.x / u_rx, pr.y / u_ry);   // ellipse space: |e|=1 on centerline
  float r = length(e);
  float theta = atan(e.y, e.x);              // -pi..pi around the ring
  float across = r - 1.0;
  // Wide opaque core + soft edges → the ribbon is solid enough to occlude.
  float band = smoothstep(u_thickness, u_thickness * 0.6, abs(across));
  if (band <= 0.001) discard;

  float t = u_time * u_speed;
  // Flow ALONG the ring: primary axis = angle (streams around), secondary = across.
  vec2 q = vec2(theta * u_around + t, across * u_across);

  // Organic ColorBends warp field → drives shimmer + the specular sheen.
  vec2 rr = sin(1.5 * (q.yx * u_freq) + 2.0 * cos(q * u_freq));
  float m = length(rr + sin(5.0 * rr.y * u_freq - 3.0 * t) / 4.0);
  float cover = 1.0 - exp(-u_bandWidth / exp(u_bandWidth * m));

  // Flowing warm color: a NORMALIZED pick across the palette that cycles around
  // the ring (crimson→orange→amber→gold→coral). Normalizing keeps it saturated
  // instead of summing to a muddy olive.
  float fi = fract(theta * (u_around * 0.15915) + t * 0.12 + m * 0.08);
  vec3 flow = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_ncol) break;
    float center = (float(i) + 0.5) / float(u_ncol);
    float dd = abs(fract(fi - center + 0.5) - 0.5);   // circular distance
    float w = pow(max(0.0, 1.0 - dd * float(u_ncol)), 2.0);
    flow += u_colors[i] * w;
    wsum += w;
  }
  flow /= max(wsum, 0.001);

  vec3 col = flow * u_intensity * (0.7 + 0.5 * band);  // brighter down the spine
  float shine = pow(cover, 2.0) * band;                // tighter sheen, flows where field peaks
  col += vec3(1.0, 0.86, 0.55) * shine * u_shine;      // warm-gold specular glint (added after)
  col = clamp(col, 0.0, 1.25);
  // Front half is opaque so it HIDES the planet with the ribbon's shape.
  float alpha = band;

  // Wrap split along the ring's tilted MAJOR AXIS (pr.y = the near/far divider,
  // crossing the ellipse at its edge-on endpoints). pr.y < 0 = near (FRONT of the
  // planet); pr.y > 0 = far (BEHIND). Each half stays FULLY opaque up to the
  // divider and overlaps slightly past it, so the two halves meet with no gap.
  if (u_half > 0.5) alpha *= 1.0 - smoothstep(0.0, 0.05, pr.y);        // front (near)
  else if (u_half < -0.5) alpha *= 1.0 - smoothstep(0.0, 0.05, -pr.y); // back (far)

  gl_FragColor = vec4(col, alpha);
}`;

export function OrbitBends({
  half = 'full',
  className,
}: {
  half?: Half;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // over: keeps warm colors true
    gl.clearColor(0, 0, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = U('u_time');
    const uRes = U('u_res');
    const uAspect = U('u_aspect');
    const rgb = WARM.map(hexToRgb);
    gl.uniform1i(U('u_ncol'), rgb.length);
    for (let i = 0; i < rgb.length; i++) {
      gl.uniform3fv(U(`u_colors[${i}]`), rgb[i]);
    }
    // Orbit centred on the planet (uv, bottom-up), radii in height-relative units.
    gl.uniform2f(U('u_center'), 0.93, 0.45);
    gl.uniform1f(U('u_rx'), 0.9);
    gl.uniform1f(U('u_ry'), 0.22);
    gl.uniform1f(U('u_tilt'), (-20 * Math.PI) / 180);
    gl.uniform1f(U('u_thickness'), 0.2);
    gl.uniform1f(U('u_half'), half === 'front' ? 1 : half === 'back' ? -1 : 0);
    gl.uniform1f(U('u_speed'), 0.28);
    gl.uniform1f(U('u_freq'), 1);
    gl.uniform1f(U('u_bandWidth'), 6);
    gl.uniform1f(U('u_intensity'), 1.35);
    gl.uniform1f(U('u_around'), 3.0);
    gl.uniform1f(U('u_across'), 0.6);
    gl.uniform1f(U('u_shine'), 0.7);

    let raf = 0;
    const startT = performance.now();
    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uTime) gl.uniform1f(uTime, (now - startT) / 1000);
      if (uRes) gl.uniform2f(uRes, w, h);
      if (uAspect) gl.uniform1f(uAspect, w / h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(startT);

    return () => {
      cancelAnimationFrame(raf);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduce, half]);

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
