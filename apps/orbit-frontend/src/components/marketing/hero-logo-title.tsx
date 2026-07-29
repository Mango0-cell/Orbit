'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title — the Orbit wordmark assembled from the Stitch "Logo Asset
 * Decomposition" pieces (separate O/r/b/i/t letters, saturation-keyed off the
 * sheet). Each letter reveals one-by-one (blur + fade + rise). Images are
 * `unoptimized` so their transparency stays pristine. Reduced-motion renders it
 * fully assembled. left/top/width/height are % of the wordmark box (560 x 205).
 */
const LETTERS = [
  { src: '/orbit2-o.webp', left: 0, top: 0, width: 33.75, height: 99.51, w: 306, h: 331 },
  { src: '/orbit2-r.webp', left: 33.93, top: 20.98, width: 16.61, height: 79.02, w: 133, h: 232 },
  { src: '/orbit2-b.webp', left: 42.32, top: 6.83, width: 29.82, height: 92.2, w: 239, h: 271 },
  { src: '/orbit2-i.webp', left: 70.36, top: 12.2, width: 12.5, height: 87.8, w: 101, h: 258 },
  { src: '/orbit2-t.webp', left: 79.46, top: 17.07, width: 20.54, height: 81.46, w: 165, h: 240 },
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
          width: 'clamp(210px, 32vw, 380px)',
          aspectRatio: '560 / 205',
          filter: 'drop-shadow(0 8px 30px rgba(255, 86, 51, 0.25))',
        }}
      >
        {/* Letters — reveal one-by-one. */}
        {LETTERS.map((L, i) => (
          <motion.span
            key={i}
            className="absolute z-10 block"
            style={{
              left: `${L.left}%`,
              top: `${L.top}%`,
              width: `${L.width}%`,
              height: `${L.height}%`,
            }}
            initial={
              reduce ? false : { opacity: 0, y: '-30%', filter: 'blur(10px)' }
            }
            animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.15 + i * 0.16, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <Image
              src={L.src}
              alt=""
              aria-hidden
              width={L.w}
              height={L.h}
              priority
              unoptimized
              className="h-full w-full object-fill"
            />
          </motion.span>
        ))}
      </span>
    </h1>
  );
}
