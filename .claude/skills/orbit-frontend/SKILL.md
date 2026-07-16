---
name: orbit-frontend
description: Replicate a Stitch-designed screen into the Orbit Next.js frontend (App Router + React 19 + Tailwind v4) using the Stitch MCP and the "Event Horizon" design tokens. Use when building or porting a UI screen/component from the Stitch "Cosmic Home Feed" project. Wire to services via REST/WS base URLs from env. Trigger words: frontend, UI, screen, component, Stitch, layout, Next.js page, design.
---

# orbit-frontend — Stitch design → Next.js + Tailwind

Read `CLAUDE.md §3` (frontend stack). Invoke `frontend-design:frontend-design` (aesthetic
direction), `ui-ux-pro-max:ui-ux-pro-max`, `vercel:nextjs`, and `vercel:react-best-practices`.
Review with `ecc:typescript-reviewer`.

## Source of truth — Stitch MCP
- Project: **Cosmic Home Feed** — `projects/2502185355208638569` (design system **"Event Horizon"**).
- Read the screen before coding: `mcp__stitch__list_screens` → `mcp__stitch__get_screen`
  (and `mcp__stitch__get_project` for tokens / DESIGN.md; `mcp__stitch__get_screenshot` for reference).
- This skill **ports** Stitch designs to Next.js. Do **not** edit Stitch designs from code
  unless the user asks.

## Design tokens (Event Horizon — keep consistent)
Dark mode. surface `#111415`, primary **Cosmic Cyan `#00ffff`**, secondary **Nebula Purple**,
on-surface `#e2e2e4`. Fonts: **Space Grotesk** (headline), **Hanken Grotesk** (body),
**JetBrains Mono** (labels/metadata). Glassmorphism: translucent surfaces + `backdrop-blur(20px)`,
1px gradient borders, glow on hover. Radii 8px (controls) / 24px (cards). Map these to Tailwind v4
theme tokens in `apps/orbit-frontend/src/app/global.css`.

## Steps
1. Pull the target screen + tokens from Stitch (MCP).
2. Build the screen under `apps/orbit-frontend/src/app/...` (App Router). Componentize; reuse tokens.
3. Data: call services through env base URLs (`NEXT_PUBLIC_USERS_API`, `NEXT_PUBLIC_CONTENT_API`,
   `NEXT_PUBLIC_NOTIFICATIONS_API`, `NEXT_PUBLIC_CHAT_WS`). No secrets client-side.
4. Responsive per the design (mobile 4-col / desktop 12-col) and accessible (a11y from ui-ux-pro-max).
5. Test (Jest + Testing Library); `ecc:typescript-reviewer`.

## Definition of Done
Matches the Stitch screen + Event Horizon tokens · responsive + a11y · wired via env ·
tests green. **Do not push.**
