'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';

/** Warm Supernova particle colors (coral / amber / gold). */
const COLORS = ['#ffd7a0', '#ffc080', '#ffb4a4', '#e9c400'] as const;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Spawn point on the planet's left limb (anchors the radiating spoke). */
  ox: number;
  oy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

/**
 * PlanetField — a fiery Supernova sphere anchored off the right edge, emitting
 * particles and connecting lines that radiate from its left limb toward the
 * content on the left. The planet is CSS (layered radial gradients); the
 * particles + constellation lines are drawn on a DPR-scaled 2D canvas with
 * additive blending. Reduced-motion renders a single static frame.
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

    // Planet geometry in CSS pixels (recomputed on resize) — mirrors the CSS:
    // size min(60vh, 560px), right: -6rem (96px), vertically centered.
    let cx = 0;
    let cy = 0;
    let radius = 0;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const computeGeometry = () => {
      const diameter = Math.min(height * 0.6, 560);
      radius = diameter / 2;
      const offRight = 96; // 6rem — the planet sits partly off the right edge
      cx = width + offRight - radius;
      cy = height / 2;
    };

    const spawn = (p: Particle) => {
      // Left hemisphere of the planet, biased toward the limb facing the content.
      const theta = Math.PI + rand(-0.95, 0.95);
      const ox = cx + Math.cos(theta) * radius;
      const oy = cy + Math.sin(theta) * radius;
      // Outward (surface-normal) direction + a little tangential spread.
      const spread = rand(-0.25, 0.25);
      const dirX = Math.cos(theta) - Math.sin(theta) * spread;
      const dirY = Math.sin(theta) + Math.cos(theta) * spread;
      const speed = rand(0.12, 0.42);
      p.ox = ox;
      p.oy = oy;
      p.x = ox;
      p.y = oy;
      p.vx = dirX * speed;
      p.vy = dirY * speed;
      p.maxLife = rand(340, 640);
      p.life = 0;
      p.size = rand(0.9, 2.4);
      p.color = COLORS[(Math.random() * COLORS.length) | 0];
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = width < 640 ? 46 : 90;
      particles = Array.from({ length: count }, () => {
        const p = {} as Particle;
        spawn(p);
        // Stagger initial age so a single (static) frame already looks alive.
        p.life = rand(0, p.maxLife);
        p.x = p.ox + p.vx * p.life;
        p.y = p.oy + p.vy * p.life;
        return p;
      });
    };

    const alphaFor = (p: Particle) => {
      const t = p.life / p.maxLife;
      const fadeIn = Math.min(1, t / 0.12);
      const fadeOut = Math.min(1, (1 - t) / 0.45);
      return Math.max(0, Math.min(fadeIn, fadeOut));
    };

    const SPOKE = 150; // radiating line length from the limb
    const LINK = 110; // constellation link distance

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;

      // Radiating spokes: each young particle stays tethered to its limb origin,
      // so the network visibly originates at the planet surface.
      for (const p of particles) {
        const dist = Math.hypot(p.x - p.ox, p.y - p.oy);
        if (dist >= SPOKE) continue;
        const a = (1 - dist / SPOKE) * alphaFor(p) * 0.5;
        if (a <= 0.01) continue;
        ctx.strokeStyle = `rgba(255,150,90,${a})`;
        ctx.beginPath();
        ctx.moveTo(p.ox, p.oy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // Constellation lines between nearby particles.
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist >= LINK) continue;
          const alpha =
            (1 - dist / LINK) * Math.min(alphaFor(a), alphaFor(b)) * 0.5;
          if (alpha <= 0.01) continue;
          ctx.strokeStyle = `rgba(255,150,90,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Glowing particles (soft radial blobs for bloom).
      for (const p of particles) {
        const a = alphaFor(p);
        if (a <= 0) continue;
        const r = p.size * 3;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, p.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = a;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        if (p.life >= p.maxLife || p.x < -24 || p.y < -24 || p.y > height + 24) {
          spawn(p);
        }
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
      computeGeometry();
      initParticles();
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
      {/* Fiery Supernova planet — anchored partly off the right edge. */}
      <div
        aria-hidden
        className={reduce ? 'planet-body' : 'planet-body pulse-anim'}
        style={{
          position: 'absolute',
          right: '-6rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'min(60vh, 560px)',
          height: 'min(60vh, 560px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 32% 42%, #ffd7a0 0%, #ff8a4c 34%, #ff5633 62%, #5c1403 100%)',
          boxShadow: '0 0 120px 20px rgba(255,86,51,0.45)',
          overflow: 'hidden',
        }}
      >
        {/* Slowly rotating surface texture. */}
        <div
          className={reduce ? undefined : 'animate-[spin_60s_linear_infinite]'}
          style={{
            position: 'absolute',
            inset: '-25%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 62% 30%, rgba(255,215,160,0.28), transparent 30%), radial-gradient(circle at 30% 70%, rgba(92,20,3,0.5), transparent 34%), conic-gradient(from 0deg, rgba(255,138,76,0.12), rgba(92,20,3,0.2), rgba(255,138,76,0.12))',
            mixBlendMode: 'overlay',
            opacity: 0.85,
          }}
        />
        {/* Bright rim / atmosphere along the left limb (facing the content). */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 6% 50%, rgba(255,215,160,0.55), transparent 24%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Particles + connecting lines emitted from the planet's left limb. */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
