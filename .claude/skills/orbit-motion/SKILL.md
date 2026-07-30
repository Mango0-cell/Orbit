---
name: orbit-motion
description: Build animated & interactive components in the Orbit Next.js frontend using motion (framer-motion), GSAP, and WebGL (ogl/three + @react-three/fiber). Covers client-component boundaries, reduced-motion accessibility, 60fps performance, lazy-loaded WebGL, and reusable motion primitives (FadeIn/Reveal/Stagger/Parallax/Magnetic). Use when adding any animation, transition, parallax, scroll effect, or animated background. Trigger words: animation, animated, motion, transition, framer-motion, gsap, parallax, scroll reveal, stagger, WebGL, shader background.
---

# orbit-motion — animated & interactive components

Read `CLAUDE.md §3` (frontend stack) + the `orbit-design-system` skill (motion tokens).
For pasted React Bits components use `orbit-reactbits`. Aesthetic direction from
`frontend-design:frontend-design`.

## Stack (installed in `@orbit/orbit-frontend`)

- **motion** (`import { motion } from 'motion/react'`) — component / layout / gesture / scroll
  animations. **Default choice** for UI.
- **gsap** — complex imperative timelines, sequenced/scroll-driven choreography, SVG morphs.
- **ogl** / **three** + **@react-three/fiber** — WebGL backgrounds & shaders. **Heavy** — use
  only when the design calls for it.

## Non-negotiable rules

1. **Animations are client components.** Any file importing motion / gsap / ogl / three or React
   hooks starts with `'use client'`. Keep them **leaf** components so pages stay Server Components.
2. **Respect reduced motion.** Gate non-essential motion behind `prefers-reduced-motion`
   (`useReducedMotion()` from motion, or the `useReducedMotion` hook in `hooks/`). Always ship a
   static fallback — never an empty/broken frame.
3. **Animate only `transform` and `opacity`** for 60fps. Don't animate layout/box props
   (width/height/top/left). Use `will-change` sparingly and remove it after the animation.
4. **Lazy-load WebGL.** Import ogl/three backgrounds via `next/dynamic(..., { ssr: false })`;
   never render them for reduced-motion users; pause the loop when offscreen or the tab is hidden.

## Reusable primitives (`components/motion/`)

Build once, reuse: `FadeIn`, `Reveal` (in-view via `whileInView`), `Stagger` + `StaggerItem`,
`Parallax`, `Magnetic`. Drive all durations/easings from the design-system **motion tokens**
(`--duration-*`, `--ease-*`) — no magic numbers.

## Definition of Done

`'use client'` only where needed · reduced-motion honored with a fallback · transform/opacity only ·
WebGL lazy + offscreen-paused · uses motion tokens · `npx nx build orbit-frontend` green.
**Do not push.**
