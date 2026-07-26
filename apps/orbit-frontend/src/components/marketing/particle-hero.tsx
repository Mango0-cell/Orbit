'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const COLORS = ['#ff5633', '#ffb4a4', '#ffc080', '#e9c400'];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
};

/**
 * Full-page animated background: a drifting, mouse-reactive Supernova particle
 * field with faint constellation links + warm glow. Static for reduced-motion.
 */
export function ParticleHero() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let parts: Particle[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 15000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };
    resize();

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMove);
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    const LINK = 130;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(255,120,70,${(1 - dist / LINK) * 0.14})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of parts) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110 && dist > 0) {
          const f = (1 - dist / 110) * 0.25;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      ro?.disconnect();
    };
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <canvas ref={ref} className="h-full w-full" />
      <div className="absolute left-1/2 top-1/3 h-[65vh] w-[65vh] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[150px]" />
      <div className="absolute bottom-0 right-[-5%] h-[45vh] w-[45vh] rounded-full bg-secondary/10 blur-[130px]" />
    </div>
  );
}
