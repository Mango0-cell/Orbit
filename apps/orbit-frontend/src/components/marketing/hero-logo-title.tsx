'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';

/**
 * Hero title — a crisp, vector "Orbit" wordmark (real font, sharp at any size)
 * rendered as the H1. On first load it performs a "lazy discover": each letter
 * flips/blurs up one-by-one, a Saturn orbit ring draws itself in behind the
 * word, and a warm liquid-metal sheen sweeps across the letters on a loop.
 * The aria-label carries the accessible name; letters are decorative.
 * Reduced-motion renders it fully formed and still.
 */
const LETTERS = ['O', 'r', 'b', 'i', 't'];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: '0.5em', rotateX: -78, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroLogoTitle() {
  const reduce = useReducedMotion();

  return (
    <motion.h1
      aria-label="Orbit"
      className="orbit-logo relative mb-6 inline-block select-none"
      initial={reduce ? false : 'hidden'}
      animate="visible"
      variants={reduce ? undefined : container}
    >
      <style>{LOGO_CSS}</style>

      {/* Saturn orbit ring, drawn in behind the wordmark */}
      <svg
        aria-hidden
        viewBox="0 0 400 160"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[128%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <defs>
          <linearGradient id="orbit-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5633" />
            <stop offset="0.5" stopColor="#ffc080" />
            <stop offset="1" stopColor="#e9c400" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="200"
          cy="80"
          rx="188"
          ry="50"
          transform="rotate(-14 200 80)"
          stroke="url(#orbit-ring-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.1 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,86,51,0.5))' }}
        />
      </svg>

      {/* Wordmark — per-letter liquid-metal reveal */}
      <span aria-hidden className="orbit-word flex items-baseline">
        {LETTERS.map((ch, i) => (
          <motion.span
            key={i}
            className="orbit-letter"
            variants={reduce ? undefined : letter}
            style={{ animationDelay: `${i * 0.16}s` }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </motion.h1>
  );
}

const LOGO_CSS = `
.orbit-logo { line-height: 1; }
.orbit-word {
  perspective: 700px;
  filter: drop-shadow(0 6px 22px rgba(255, 86, 51, 0.28));
}
.orbit-letter {
  display: inline-block;
  transform-origin: bottom center;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: clamp(3.5rem, 9vw, 7.5rem);
  background-image:
    linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.92) 48%, rgba(255, 255, 255, 0.35) 53%, transparent 62%),
    linear-gradient(180deg, #fff2e0 0%, #ffd7a0 20%, #ffb4a4 40%, #ff5633 54%, #ffb4a4 66%, #ffd7a0 82%, #e9c400 100%);
  background-size: 280% 100%, 100% 100%;
  background-repeat: no-repeat;
  background-position: 180% 0, 0 0;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: orbit-metal-sheen 3.8s linear infinite;
}
@keyframes orbit-metal-sheen {
  0% { background-position: 180% 0, 0 0; }
  100% { background-position: -120% 0, 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-letter {
    animation: none;
    background-position: 0 0, 0 0;
  }
}
`;
