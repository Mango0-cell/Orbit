---
name: orbit-design-system
description: The Orbit frontend design system — the "Event Horizon" Tailwind v4 @theme tokens (cosmic dark palette, typography, radii, glassmorphism, motion tokens) and the reusable UI primitives (Button/Input/Field/Card/Avatar/Badge) built on cn(). Use when defining or changing design tokens, theming, or building/using a shared UI primitive. Trigger words: design system, design tokens, theme, tailwind theme, primitive, Button, Card, Avatar, Event Horizon, glassmorphism, dark mode, palette.
---

# orbit-design-system — Event Horizon tokens & primitives

The single source of visual truth for `@orbit/orbit-frontend`. Read with `orbit-frontend`
(Stitch source) and `frontend-design:frontend-design` / `ui-ux-pro-max`. **Dark-first.**

## Tokens → Tailwind v4 `@theme` (in `src/app/global.css`)

Define everything as `@theme { --color-… --font-… --radius-… }` so it becomes Tailwind utilities
(`bg-surface`, `text-primary`, `rounded-card`, `font-display`).

- **Palette (dark):** `surface #111415`, elevated surface, `on-surface #e2e2e4`,
  primary **Cosmic Cyan `#00ffff`**, secondary **Nebula Purple**, plus muted / border / success / danger.
- **Type:** **Space Grotesk** (display/headline), **Hanken Grotesk** (body), **JetBrains Mono**
  (labels/metadata) — loaded via `next/font/google` in the root layout and exposed as `--font-*` vars.
- **Radii:** controls `8px`, cards `24px`.
- **Glass:** translucent surface + `backdrop-blur(20px)`, 1px gradient border, hover glow
  (ship as a `.glass` utility / component).
- **Motion tokens:** `--duration-fast/base/slow`, `--ease-out/emphasized` (consumed by `orbit-motion`).

## Primitives (`components/ui/`) — build once, reuse everywhere

`Button` (primary / ghost / glass), `Input` + `Field`, `Card` (glass), `Avatar`, `Badge`.
Compose classes with **`cn()`** (`lib/utils/cn.ts` = `clsx` + `tailwind-merge`). Keep them Server
Components unless they need client hooks.

## Rules

- **Never hardcode** a hex/px that a token covers — reference the token.
- Dark-first (add light later). **WCAG AA** contrast. `focus-visible` ring in Cosmic Cyan.
- Touch targets ≥ 44px. Responsive: mobile 4-col / desktop 12-col.

## Definition of Done

Tokens live in `@theme` · primitives use tokens + `cn()` · a11y + responsive · build green.
**Do not push.**
