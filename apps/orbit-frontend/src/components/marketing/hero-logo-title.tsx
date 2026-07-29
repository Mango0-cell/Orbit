'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title — the Orbit wordmark assembled from the Stitch "Logo Asset
 * Decomposition" pieces (separate O/r/b/i/t letters, saturation-keyed off the
 * sheet). Each letter reveals one-by-one (blur + fade + rise). Two orbits from
 * the sheet are then drawn slowly and softly, layered in front of the letters:
 * the Planet Ring around the O, and the Grand Orbital Swoosh over the last
 * letters. Images are `unoptimized` so their transparency stays pristine.
 * Reduced-motion renders it fully assembled. left/top/width/height are % of the
 * wordmark box (560 x 205).
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
      <style>{ORBIT_CSS}</style>
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
        {/* Letters — reveal one-by-one, behind the orbits. */}
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

        {/* Planet Ring — drawn slowly around the O, in front. */}
        <div
          className={`orbit-draw absolute ${reduce ? '' : 'orbit-animate'}`}
          style={{
            left: '17%',
            top: '49%',
            width: '52%',
            zIndex: 20,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
            animationDelay: '0.5s',
          }}
        >
          <Image
            src="/orbit2-ring.webp"
            alt=""
            aria-hidden
            width={371}
            height={277}
            unoptimized
            className="h-auto w-full"
          />
        </div>

        {/* Grand Orbital Swoosh — drawn slowly over the last letters, in front. */}
        <div
          className={`orbit-draw absolute ${reduce ? '' : 'orbit-animate'}`}
          style={{
            left: '74%',
            top: '50%',
            width: '64%',
            zIndex: 20,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
            animationDelay: '1.25s',
          }}
        >
          <Image
            src="/orbit2-swoosh.webp"
            alt=""
            aria-hidden
            width={465}
            height={312}
            unoptimized
            className="h-auto w-full"
          />
        </div>
      </span>
    </h1>
  );
}

const ORBIT_CSS = `
@property --orbit-draw {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
.orbit-draw {
  --orbit-draw: 100%;
  -webkit-mask-image: conic-gradient(from -90deg, #000 var(--orbit-draw), transparent 0);
  mask-image: conic-gradient(from -90deg, #000 var(--orbit-draw), transparent 0);
}
.orbit-animate {
  animation: orbit-draw-kf 2.6s cubic-bezier(0.33, 0, 0.2, 1) both;
}
@keyframes orbit-draw-kf {
  0% { --orbit-draw: 0%; opacity: 0; }
  12% { opacity: 1; }
  100% { --orbit-draw: 100%; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-animate { animation: none; --orbit-draw: 100%; }
}
`;
