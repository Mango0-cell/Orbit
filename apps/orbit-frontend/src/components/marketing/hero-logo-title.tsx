'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title — the real Orbit wordmark, sliced into its separate letters (each
 * slice keeps the logo's actual glow so reassembled they're pixel-identical to
 * orbit-logo.webp). On first load each letter reveals one-by-one (BlurText-style:
 * blur + fade + rise) and, while it appears, a glowing orbit ring spins around
 * that letter, then fades — leaving the clean logo. Reduced-motion is static.
 */
const LETTERS = [
  { src: '/orbit-part-o.webp', left: 0, width: 38.76, w: 100 },
  { src: '/orbit-part-r.webp', left: 38.76, width: 13.178, w: 34 },
  { src: '/orbit-part-b.webp', left: 51.938, width: 20.93, w: 54 },
  { src: '/orbit-part-i.webp', left: 72.868, width: 7.364, w: 19 },
  { src: '/orbit-part-t.webp', left: 80.233, width: 19.767, w: 51 },
];

export function HeroLogoTitle() {
  const reduce = useReducedMotion();

  return (
    <h1 className="orbit-logo relative mb-6">
      <span className="sr-only">Orbit</span>
      <span
        aria-hidden
        className="relative block select-none"
        style={{
          width: 'clamp(258px, 44vw, 480px)',
          aspectRatio: '258 / 112',
          filter: 'drop-shadow(0 8px 30px rgba(255, 86, 51, 0.28))',
        }}
      >
        {LETTERS.map((L, i) => {
          const start = 0.15 + i * 0.16;
          return (
            <span
              key={i}
              className="absolute top-0 h-full"
              style={{ left: `${L.left}%`, width: `${L.width}%` }}
            >
              {/* Orbit ring turning around this letter while it appears. */}
              {!reduce && (
                <motion.svg
                  viewBox="0 0 120 120"
                  fill="none"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[190%] w-[240%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                  style={{ transformOrigin: 'center' }}
                  initial={{ opacity: 0, rotate: -120 }}
                  animate={{ opacity: [0, 0.95, 0.9, 0], rotate: 250 }}
                  transition={{
                    duration: 1.5,
                    delay: start,
                    times: [0, 0.25, 0.7, 1],
                    ease: 'easeInOut',
                  }}
                >
                  <ellipse
                    cx="60"
                    cy="60"
                    rx="56"
                    ry="19"
                    transform="rotate(-18 60 60)"
                    stroke="#ffc080"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,150,60,0.8))' }}
                  />
                  <circle cx="116" cy="60" r="3.4" fill="#ffe1b0" />
                </motion.svg>
              )}

              {/* The letter itself — BlurText-style reveal. */}
              <motion.span
                className="block h-full w-full"
                initial={
                  reduce
                    ? false
                    : { opacity: 0, y: '-42%', filter: 'blur(12px)' }
                }
                animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.6, delay: start + 0.1, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Image
                  src={L.src}
                  alt=""
                  aria-hidden
                  width={L.w}
                  height={112}
                  priority
                  className="h-full w-full object-fill"
                />
              </motion.span>
            </span>
          );
        })}
      </span>
    </h1>
  );
}
