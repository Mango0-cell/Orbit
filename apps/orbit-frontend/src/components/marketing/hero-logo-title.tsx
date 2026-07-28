'use client';

import { motion, useReducedMotion } from 'motion/react';
import { MetallicPaint } from '@/components/motion/metallic-paint';

/**
 * Hero title — the Orbit wordmark rendered as React Bits MetallicPaint
 * (liquid-metal WebGL shader over the black-fill silhouette). On first load it
 * performs a "lazy discover": a left→right clip wipe uncovers the logo in
 * letter-width steps while it fades/scales in. The sr-only H1 carries the
 * accessible name. Reduced-motion shows it fully formed and still.
 */
export function HeroLogoTitle() {
  const reduce = useReducedMotion();

  const revealProps = reduce
    ? { initial: false as const, animate: { opacity: 1, scale: 1, clipPath: 'inset(0 0% 0 0)' } }
    : {
        initial: { opacity: 0, scale: 0.94, clipPath: 'inset(0 100% 0 0)' },
        animate: {
          opacity: 1,
          scale: 1,
          clipPath: [
            'inset(0 100% 0 0)',
            'inset(0 78% 0 0)',
            'inset(0 58% 0 0)',
            'inset(0 38% 0 0)',
            'inset(0 18% 0 0)',
            'inset(0 0% 0 0)',
          ],
        },
        transition: {
          opacity: { duration: 0.5 },
          scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
          clipPath: {
            duration: 1.7,
            ease: 'easeOut' as const,
            times: [0, 0.18, 0.38, 0.58, 0.78, 1],
          },
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
      <motion.div aria-hidden className="h-full w-full" {...revealProps}>
        <MetallicPaint
          imageSrc="/orbit-logo-silhouette.png"
          className="block h-full w-full"
          speed={0.35}
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
