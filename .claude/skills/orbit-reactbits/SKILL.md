---
name: orbit-reactbits
description: Adapt React Bits (reactbits.dev) component prompts/code into the Orbit frontend — take the TS+Tailwind variant, install the right animation dep, re-tokenize to Event Horizon, add 'use client', a reduced-motion fallback, and dynamic-import WebGL. Use when the user pastes a React Bits component/prompt or asks for a React Bits background/text animation (Aurora, Silk, Threads, Beams, Split Text, Shiny Text, etc.). Trigger words: React Bits, reactbits, component prompt, paste component, animated background, Aurora, Silk, Threads, Beams, Split Text.
---

# orbit-reactbits — adapt React Bits into Orbit

Use when the user pastes a **React Bits** (reactbits.dev) component prompt/code, or requests a
React Bits background / text animation. Pair with `orbit-motion` (rules) and
`orbit-design-system` (tokens).

## What React Bits is

Open-source animated React components. Categories: **Text Animations**, **Animations**,
**Components**, **Backgrounds**. Each ships in 4 variants — **JS/TS × Tailwind/CSS**.
**Always take the `TS + Tailwind` variant.**

## Getting a component

- **Copy-paste** the TS+Tailwind code from reactbits.dev, **or**
- **CLI**: `npx jsrepo add <reactbits-url>` or the shadcn form `npx shadcn@latest add <url>`.
- Deps by category (**already installed**: motion, gsap, ogl, three, @react-three/fiber):
  text/animations → **motion** (some **gsap**); backgrounds → **ogl** or
  **three/@react-three/fiber**. A few use **matter-js** / **react-icons** — install per-component.

## Adaptation checklist (run for EVERY pasted component)

1. Place at `apps/orbit-frontend/src/components/motion/<Name>.tsx`; add `'use client'`.
2. **Re-tokenize** — replace hardcoded hex/px with Event Horizon tokens (Cosmic Cyan,
   Nebula Purple, surface, radii 8/24) via Tailwind classes or CSS vars. No stray hex left.
3. **Type it** — type every prop, drop `any`, keep the export PascalCase and named after the source.
4. **Reduced motion** — add a static fallback (see `orbit-motion` rule 2).
5. **WebGL** (backgrounds) — wrap in `next/dynamic(..., { ssr: false })`, pause offscreen/hidden,
   skip entirely for reduced-motion. Confirm the peer (`three`/`ogl`) resolves.
6. **Verify** — `npx nx build orbit-frontend` + a render smoke test; review with
   `ecc:typescript-reviewer`.

## Definition of Done

TS+Tailwind variant · re-tokenized to Event Horizon · `'use client'` · reduced-motion fallback ·
WebGL lazy-loaded · fully typed · build green. **Do not push.**
