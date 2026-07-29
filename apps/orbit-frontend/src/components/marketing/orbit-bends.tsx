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

// Colors sampled directly from the Orbit logo (orbit-logo.webp), hue-ordered
// into its real fiery ramp: deep red → red-orange → orange → amber → pale gold.
const WARM = ['#d7733dc6', '#e47230d5', '#eb8643bb'];

// Opacity of the ribbon at 8 evenly-spaced points AROUND the ring (n = 0..1,
// where n≈0/1 is the far-left tip, n≈0.25 the near/front-bottom, n≈0.5 the right,
// n≈0.75 the far/back-top). Edit any stop to manage that part's opacity. The
// shader interpolates smoothly between stops.
const OPACITY_STOPS = [0.6, 0.7, 1.2, 2.3, 2.2, 0.55, 0.6, 0.6, 1.6];

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
uniform float u_speed, u_freq, u_bandWidth, u_intensity, u_around, u_across, u_shine, u_opacity;
uniform int u_ncol;
uniform vec3 u_colors[8];
uniform float u_op[8];   // per-part opacity around the ring (8 stops)

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
  // Per-part opacity: interpolate the 8 stops around the ring by n (position
  // around the ellipse, 0..1). Tent weights blend the two nearest stops, so each
  // stop controls its part of the ribbon and transitions are smooth.
  float n = (theta + 3.14159265) / 6.2831853;   // 0..1 around the ring
  float opNum = 0.0, opDen = 0.0;
  for (int i = 0; i < 8; i++) {
    float c = float(i) / 7.0;
    float wgt = max(0.0, 1.0 - abs(n - c) * 7.0);
    opNum += u_op[i] * wgt;
    opDen += wgt;
  }
  float op = (opNum / max(opDen, 0.001)) * u_opacity;
  float alpha = band * op;

  // Front/back crossfade along the ring (pr.y: -u_ry near/front → +u_ry far/back).
  // The FRONT layer stays FULLY opaque across the whole near side (pr.y <= 0), so
  // where it crosses the planet it sits ON TOP of it; it only hands off to the
  // blurred BACK layer past the edge-on crossover (pr.y > 0), where the blur then
  // intensifies toward the far side.
  float blurAmt = smoothstep(0.0, u_ry, pr.y);     // 0 across the near side, 1 at back
  if (u_half > 0.5) alpha *= 1.0 - blurAmt;        // front layer — solid over the near side
  else if (u_half < -0.5) alpha *= blurAmt;        // back layer — far side, blurred

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
    // Per-part opacity stops around the ring.
    gl.uniform1fv(U('u_op'), new Float32Array(OPACITY_STOPS));
    // Orbit centred on the planet (uv, bottom-up), radii in height-relative units.
    gl.uniform2f(U('u_center'), 0.93, 0.45);
    gl.uniform1f(U('u_rx'), 0.8);
    gl.uniform1f(U('u_ry'), 0.20);
    gl.uniform1f(U('u_tilt'), (18 * Math.PI) / 180);
    gl.uniform1f(U('u_thickness'), 0.2);
    gl.uniform1f(U('u_half'), half === 'front' ? 1 : half === 'back' ? -1 : 0);
    gl.uniform1f(U('u_speed'), -1.8); // negative = clockwise (matches the planet's rotation)
    gl.uniform1f(U('u_freq'), 1);
    gl.uniform1f(U('u_bandWidth'), 6);
    gl.uniform1f(U('u_intensity'), 1.0);
    gl.uniform1f(U('u_around'), 3.0);
    gl.uniform1f(U('u_across'), 0.6);
    gl.uniform1f(U('u_shine'), 0.3);
    // Overall scale; per-part opacity is managed by OPACITY_STOPS in the shader.
    gl.uniform1f(U('u_opacity'), 1.0);
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
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        // Whole ribbon is blurred, intensifying front→back: the front layer
        // carries a soft base blur, the back layer a much heavier one. Combined
        // with the shader's front→back alpha crossfade, the blur ramps up toward
        // the back so it clearly reads as receding behind the planet.
        filter: half === 'back' ? 'blur(10px)' : 'blur(4px)',
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
