'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title — the real Orbit wordmark, sliced into its separate letters (each
 * slice keeps the logo's actual glow + ring/swoosh fragment, so reassembled
 * they're pixel-identical to orbit-logo.webp). On first load each letter does a
 * BlurText-style "discover": it drops in from the top one-by-one, unblurring and
 * fading up. The sr-only H1 carries the accessible name. Reduced-motion is static.
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
        {LETTERS.map((L, i) => (
          <motion.span
            key={i}
            className="absolute top-0 h-full"
            style={{ left: `${L.left}%`, width: `${L.width}%` }}
            initial={
              reduce ? false : { opacity: 0, y: '-40%', filter: 'blur(12px)' }
            }
            animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: 0.6,
                    delay: 0.15 + i * 0.13,
                    ease: [0.22, 1, 0.36, 1],
                  }
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
        ))}
      </span>
    </h1>
  );
}
