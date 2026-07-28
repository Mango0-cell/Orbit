'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title — the Orbit wordmark assembled from the Stitch "Logo Asset
 * Decomposition" pieces (the separate O/r/b/i/t letter assets). On first load
 * each letter reveals one-by-one (blur + fade + rise) and, while it appears, the
 * Planet Ring asset orbits around that letter, then fades — leaving the clean
 * wordmark. Reduced-motion renders the assembled wordmark with no orbits.
 *
 * left/top/width/height are % of the wordmark box (587 x 201), computed from the
 * baseline-aligned assembly of the extracted glyphs.
 */
const LETTERS = [
  { src: '/orbit2-o.webp', left: 0, top: 0, width: 30.15, height: 97.0, w: 177, h: 195 },
  { src: '/orbit2-r.webp', left: 32.2, top: 17.4, width: 15.16, height: 82.1, w: 89, h: 165 },
  { src: '/orbit2-b.webp', left: 45.14, top: 8.46, width: 24.19, height: 89.05, w: 142, h: 179 },
  { src: '/orbit2-i.webp', left: 69.68, top: 12.44, width: 10.73, height: 87.56, w: 63, h: 176 },
  { src: '/orbit2-t.webp', left: 81.77, top: 16.92, width: 18.23, height: 82.09, w: 107, h: 165 },
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
          width: 'clamp(300px, 48vw, 560px)',
          aspectRatio: '587 / 201',
          filter: 'drop-shadow(0 8px 30px rgba(255, 86, 51, 0.25))',
        }}
      >
        {LETTERS.map((L, i) => {
          const start = 0.15 + i * 0.18;
          return (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${L.left}%`,
                top: `${L.top}%`,
                width: `${L.width}%`,
                height: `${L.height}%`,
                perspective: '600px',
              }}
            >
              {/* Planet-Ring orbit that surrounds + turns around this letter. */}
              {!reduce && (
                <motion.img
                  src="/orbit2-ring.webp"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-auto max-w-none"
                  style={{ width: '175%', x: '-50%', y: '-50%', transformOrigin: 'center' }}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: [0, 0.9, 0.85, 0], rotateY: 200 }}
                  transition={{
                    duration: 1.5,
                    delay: start,
                    times: [0, 0.25, 0.65, 1],
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* The letter itself — reveals with a blur/fade/rise. */}
              <motion.span
                className="absolute inset-0 z-10 block"
                initial={
                  reduce ? false : { opacity: 0, y: '-30%', filter: 'blur(10px)' }
                }
                animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.6, delay: start + 0.15, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Image
                  src={L.src}
                  alt=""
                  aria-hidden
                  width={L.w}
                  height={L.h}
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
