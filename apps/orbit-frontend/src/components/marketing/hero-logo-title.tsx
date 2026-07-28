'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero title: the Orbit wordmark image as the H1, with a cinematic entrance
 * (blur/scale/rise) plus a slow continuous float and glow-breathe. The <img>
 * alt gives the H1 its accessible name. Reduced-motion renders it static.
 */
export function HeroLogoTitle() {
  const reduce = useReducedMotion();

  return (
    <motion.h1
      className="mb-6"
      initial={
        reduce
          ? false
          : { opacity: 0, y: 28, scale: 0.9, filter: 'blur(14px)' }
      }
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="orbit-hero-logo inline-block"
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <style>{HERO_LOGO_CSS}</style>
        <Image
          src="/orbit-logo.webp"
          alt="Orbit"
          width={258}
          height={112}
          priority
          className="orbit-hero-logo-img h-auto w-[260px] sm:w-[320px] md:w-[400px] lg:w-[460px]"
        />
      </motion.span>
    </motion.h1>
  );
}

const HERO_LOGO_CSS = `
.orbit-hero-logo-img {
  filter: drop-shadow(0 0 26px rgba(255, 86, 51, 0.35))
    drop-shadow(0 0 60px rgba(255, 176, 128, 0.2));
  animation: orbit-hero-glow 5.5s ease-in-out infinite alternate;
}
@keyframes orbit-hero-glow {
  0% {
    filter: drop-shadow(0 0 22px rgba(255, 86, 51, 0.3))
      drop-shadow(0 0 48px rgba(255, 176, 128, 0.16));
  }
  100% {
    filter: drop-shadow(0 0 40px rgba(255, 86, 51, 0.5))
      drop-shadow(0 0 80px rgba(255, 176, 128, 0.32));
  }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-hero-logo-img {
    animation: none;
    filter: drop-shadow(0 0 30px rgba(255, 86, 51, 0.4));
  }
}
`;
