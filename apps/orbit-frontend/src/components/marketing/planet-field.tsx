'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

/** Supernova point colors (coral / amber / gold / bright). */
const COLORS = ['#ffd7a0', '#ffc080', '#ffb4a4', '#ff8a4c', '#e9c400'] as const;

type P3 = { x: number; y: number; z: number; color: string };
type Emitter = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
};

/**
 * PlanetField — a rotating "planet" built from a sphere of glowing points wired
 * together by a proximity line-network (a constellation globe), with particles
 * that stream outward off its surface. Anchored at the right of the hero so the
 * text sits to its left. Canvas 2D with a projected 3D sphere + additive glow.
 * Reduced-motion draws a single static frame.
 */
export function PlanetField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Sphere geometry (screen space, recomputed on resize).
    let cx = 0;
    let cy = 0;
    let R = 0;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ── Build the sphere: evenly-spread points via a Fibonacci lattice. ──
    const N = 260;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const nodes: P3[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2; // 1 → -1
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * GOLDEN;
      nodes.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      });
    }

    // Rotation is rigid, so proximity pairs are constant — precompute once.
    const LINK = 0.46; // unit-sphere chord distance threshold
    const pairs: [number, number][] = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        if (dx * dx + dy * dy + dz * dz < LINK * LINK) pairs.push([i, j]);
      }
    }

    // Particles streaming off the surface.
    const emitters: Emitter[] = [];
    const spawnEmitter = (e: Emitter) => {
      const n = nodes[(Math.random() * N) | 0];
      e.x = n.x;
      e.y = n.y;
      e.z = n.z;
      const s = rand(0.004, 0.011);
      e.vx = n.x * s;
      e.vy = n.y * s;
      e.vz = n.z * s;
      e.maxLife = rand(70, 150);
      e.life = 0;
      e.color = n.color;
    };
    for (let i = 0; i < 40; i++) {
      const e = {} as Emitter;
      spawnEmitter(e);
      e.life = rand(0, e.maxLife);
      emitters.push(e);
    }

    // Rotation state.
    const TILT = -0.42; // fixed lean on X
    let angle = 0;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    // Rotate a unit point by current Y-angle then fixed X-tilt.
    const rotate = (x: number, y: number, z: number, ca: number, sa: number) => {
      const rx = x * ca + z * sa;
      const rz = -x * sa + z * ca;
      const ry = y * cosT - rz * sinT;
      const rz2 = y * sinT + rz * cosT;
      return { x: rx, y: ry, z: rz2 };
    };

    // Perspective projection → screen. Returns [sx, sy, depth 0..1 (1=near)].
    const FOV = 2.6;
    const project = (x: number, y: number, z: number) => {
      const persp = FOV / (FOV - z);
      return {
        sx: cx + x * R * persp,
        sy: cy + y * R * persp,
        depth: (z + 1) / 2,
        persp,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);

      // Soft planet core glow behind the network.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.15);
      core.addColorStop(0, 'rgba(255,120,60,0.16)');
      core.addColorStop(0.5, 'rgba(255,86,51,0.07)');
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Project all nodes once.
      const proj = nodes.map((n) => {
        const r = rotate(n.x, n.y, n.z, ca, sa);
        return { ...project(r.x, r.y, r.z), z: r.z };
      });

      // Network lines (depth-faded).
      ctx.lineWidth = 1;
      for (const [i, j] of pairs) {
        const a = proj[i];
        const b = proj[j];
        const d = (a.depth + b.depth) / 2;
        const alpha = d * d * 0.5;
        if (alpha < 0.02) continue;
        ctx.strokeStyle = `rgba(255,150,90,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      // Nodes (glowing dots, brighter/larger when near the camera).
      for (let i = 0; i < N; i++) {
        const p = proj[i];
        const size = (0.7 + p.depth * 1.9) * p.persp;
        const a = 0.25 + p.depth * 0.75;
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, size * 3);
        g.addColorStop(0, nodes[i].color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = a;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Emitted particles streaming outward off the surface.
      for (const e of emitters) {
        const r = rotate(e.x, e.y, e.z, ca, sa);
        const p = project(r.x, r.y, r.z);
        const t = e.life / e.maxLife;
        const a = Math.max(0, Math.sin(t * Math.PI)) * (0.3 + p.depth * 0.7);
        if (a <= 0.02) continue;
        const size = 1.4 * p.persp;
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, size * 3);
        g.addColorStop(0, e.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = a;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      angle += 0.0016;
      for (const e of emitters) {
        e.x += e.vx;
        e.y += e.vy;
        e.z += e.vz;
        e.life += 1;
        const rad = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
        if (e.life >= e.maxLife || rad > 2.1) spawnEmitter(e);
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Anchor the planet toward the lower-right, a touch smaller.
      R = Math.min(height * 0.50, width * 0.28, 325);
      cx = width > 900 ? width * 0.93 : width * 0.62;
      cy = height * 0.55;
      if (reduce) draw();
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduce) raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduce]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
    </div>
  );
}
