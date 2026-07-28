'use client';

import { motion, useReducedMotion } from 'motion/react';
import { MetallicPaint } from '@/components/motion/metallic-paint';

/**
 * Hero title — the Orbit wordmark rendered as React Bits MetallicPaint
 * (liquid-metal shader over the black-fill silhouette, which keeps the 'O' ring
 * decorative asset). On first load the whole mark performs a BlurText-style
 * "discover": it drops in from the top, unblurring and fading up, while the
 * decorative "Grand Orbital Swoosh" draws itself in behind it. The liquid metal
 * then shimmers in a burst every 5 seconds. Reduced-motion renders it static.
 */
export function HeroLogoTitle() {
  const reduce = useReducedMotion();

  // BlurText-style entrance (direction: top) applied to the whole mark.
  const enter = reduce
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } }
    : {
        initial: { opacity: 0, y: -44, filter: 'blur(12px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1] as const,
          delay: 0.15,
        },
      };

  return (
    <div
      className="orbit-logo relative mb-6 select-none"
      style={{
        width: 'clamp(258px, 44vw, 480px)',
        aspectRatio: '320 / 174',
        filter: 'drop-shadow(0 8px 30px rgba(255, 86, 51, 0.28))',
      }}
    >
      <h1 className="sr-only">Orbit</h1>

      {/* Decorative "Grand Orbital Swoosh" — draws in behind the wordmark. */}
      <svg
        aria-hidden
        viewBox="0 0 480 220"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[135%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <defs>
          <linearGradient id="orbit-swoosh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5633" />
            <stop offset="0.5" stopColor="#ffc080" />
            <stop offset="1" stopColor="#e9c400" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="240"
          cy="110"
          rx="228"
          ry="64"
          transform="rotate(-16 240 110)"
          stroke="url(#orbit-swoosh)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,86,51,0.5))' }}
        />
      </svg>

      {/* Liquid-metal wordmark (shimmer pulses every 5s). */}
      <motion.div aria-hidden className="h-full w-full" {...enter}>
        <MetallicPaint
          imageSrc="/orbit-logo-silhouette.png"
          className="block h-full w-full"
          speed={0.5}
          liquid={0.7}
          scale={4}
          refraction={0.014}
          blur={0.015}
          brightness={1.5}
          contrast={0.55}
          fresnel={1}
          patternSharpness={1}
          waveAmplitude={1}
          noiseScale={0.5}
          chromaticSpread={2}
          distortion={1}
          contour={0.2}
          lightColor="#fff2e0"
          darkColor="#4a1403"
          tintColor="#ffb060"
        />
      </motion.div>
    </div>
  );
}
