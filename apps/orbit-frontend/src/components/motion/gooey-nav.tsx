'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

/**
 * React Bits GooeyNav, tuned into a pronounced ferrofluid effect: a strong
 * blur+contrast goo filter merges a stretching metaball pill with a burst of
 * liquid droplet particles, and the resting pill idles with a slow living
 * wobble. Supernova colors (coral/amber/gold/crimson) throughout.
 */
export interface GooeyNavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
}

export function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 18,
  particleDistances = [90, 10],
  particleR = 120,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 4, 3, 2],
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getXY = (
    distance: number,
    pointIndex: number,
    totalPoints: number,
  ): [number, number] => {
    const angle =
      ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1.1 + noise(0.3),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    // Skip the droplet burst entirely for reduced-motion users (the CSS
    // media query below also hides `.particle`, this just avoids the
    // unnecessary DOM churn of creating/removing them).
    if (prefersReducedMotion()) return;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, particleDistances, particleR);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--gooey-color-${p.color}, #ffc080)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => element.classList.add('active'));
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            /* already removed */
          }
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const activate = (liEl: HTMLElement, index: number) => {
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(liEl);
    if (filterRef.current) {
      filterRef.current
        .querySelectorAll('.particle')
        .forEach((p) => p.remove());
      makeParticles(filterRef.current);
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      // force reflow so the text re-animation restarts
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
  };

  const handleClick = (e: MouseEvent<HTMLLIElement>, index: number) =>
    activate(e.currentTarget, index);

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Space would otherwise scroll the page; Enter is left to the browser's
    // native <a href> navigation — only the visual pill gets triggered here.
    if (e.key === ' ') e.preventDefault();
    const liEl = e.currentTarget.parentElement;
    if (liEl) activate(liEl, index);
  };

  // Mark the effect layer "ready" one frame after mount so the pill's very
  // first layout doesn't slide in from (0,0) — only later moves stretch.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      containerRef.current?.classList.add('is-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi as HTMLElement);
      textRef.current?.classList.add('active');
    }
    const ro = new ResizeObserver(() => {
      const li = navRef.current?.querySelectorAll('li')[activeIndex];
      if (li) updateEffectPosition(li as HTMLElement);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeIndex]);

  return (
    <>
      <style>{GOOEY_CSS}</style>
      <div className="gooey-nav relative" ref={containerRef}>
        <nav>
          <ul ref={navRef}>
            {items.map((item, index) => (
              <li
                key={item.label}
                className={activeIndex === index ? 'active' : ''}
                onClick={(e) => handleClick(e, index)}
              >
                <a href={item.href} onKeyDown={(e) => handleKeyDown(e, index)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect filter" ref={filterRef} aria-hidden />
        <span className="effect text" ref={textRef} aria-hidden />
      </div>
    </>
  );
}

const GOOEY_CSS = `
.gooey-nav {
  --gooey-color-1: #ffb4a4;
  --gooey-color-2: #ffc080;
  --gooey-color-3: #e9c400;
  --gooey-color-4: #ff5633;
}
.gooey-nav nav ul {
  display: flex; gap: 0.5rem; list-style: none; padding: 0; margin: 0;
  position: relative; z-index: 3;
}
.gooey-nav nav ul li {
  position: relative; cursor: pointer; padding: 0.4rem 1rem;
  border-radius: 9999px; color: #e9bdb3; transition: color 0.35s ease;
  font-size: 0.875rem; font-weight: 500;
}
.gooey-nav nav ul li a { display: inline-block; color: inherit; text-decoration: none; }
.gooey-nav nav ul li.active { color: #1a0d09; text-shadow: none; }
.gooey-nav nav ul li.active::after {
  content: ''; position: absolute; inset: 0; border-radius: 9999px;
  background: var(--gooey-color-2);
  background-image: radial-gradient(circle at 30% 30%, var(--gooey-color-2), var(--gooey-color-4) 130%);
  z-index: -1;
  animation: gooey-wobble 4.6s ease-in-out infinite;
  transform-origin: center;
}

/* The effect layer tracks the active <li>'s box via inline left/top/width/
   height set from JS; only transition it once mounted so the pill doesn't
   fly in from the corner on first paint. The overshoot easing + the goo
   filter below is what reads as a stretching metaball sliding between items. */
.gooey-nav .effect {
  position: absolute; opacity: 1; pointer-events: none; display: grid;
  place-items: center; z-index: 1;
}
.gooey-nav.is-ready .effect {
  transition:
    left 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
    top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.65s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.5s ease;
}
.gooey-nav .effect.text {
  color: #1a0d09; font-size: 0.875rem; font-weight: 500;
  transition: color 0.35s ease;
}
.gooey-nav .effect.filter {
  filter: blur(9px) contrast(28) blur(0);
  mix-blend-mode: lighten;
}
.gooey-nav .effect.filter::before {
  content: ''; position: absolute; inset: -75px; z-index: -2; background: transparent;
}
.gooey-nav .effect.filter::after {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle at 35% 30%, var(--gooey-color-2), var(--gooey-color-4) 130%);
  transform: scale(0); opacity: 0; z-index: -1; border-radius: 9999px;
}
.gooey-nav .effect.active::after {
  animation:
    gooey-pill var(--time, 600ms) cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    gooey-wobble 4.6s ease-in-out var(--time, 600ms) infinite;
}
@keyframes gooey-pill {
  0% { transform: scale(0.4, 0.7); opacity: 0.5; }
  55% { transform: scale(1.45, 0.82); opacity: 1; }
  75% { transform: scale(0.9, 1.08); opacity: 1; }
  100% { transform: scale(1, 1); opacity: 1; }
}
@keyframes gooey-wobble {
  0%, 100% { transform: scale(1, 1) translate(0, 0); }
  25% { transform: scale(1.035, 0.965) translate(1px, -0.5px); }
  50% { transform: scale(0.965, 1.035) translate(-1px, 0.5px); }
  75% { transform: scale(1.02, 0.98) translate(0.5px, -0.5px); }
}
.gooey-nav .particle, .gooey-nav .point {
  display: block; opacity: 0; width: 26px; height: 26px; border-radius: 9999px;
  transform-origin: center;
}
.gooey-nav .particle {
  position: absolute; top: calc(50% - 13px); left: calc(50% - 13px);
  animation: gooey-particle calc(var(--time)) ease 1 -350ms;
}
.gooey-nav .point { background: var(--color); opacity: 1; animation: gooey-point calc(var(--time)) ease 1 -350ms; }
@keyframes gooey-particle {
  0% { transform: rotate(0deg) translate(var(--start-x), var(--start-y)); opacity: 1; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
  70% { transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)); opacity: 1; animation-timing-function: ease; }
  85% { transform: rotate(calc(var(--rotate) * 0.66)) translate(var(--end-x), var(--end-y)); opacity: 1; }
  100% { transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)); opacity: 0; }
}
@keyframes gooey-point {
  0% { transform: scale(0); opacity: 0; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
  25% { transform: scale(calc(var(--scale) * 0.25)); }
  38% { opacity: 1; }
  65% { transform: scale(var(--scale)); opacity: 1; animation-timing-function: ease; }
  85% { transform: scale(var(--scale)); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .gooey-nav .particle, .gooey-nav .effect.filter { display: none; }
  .gooey-nav .effect,
  .gooey-nav .effect.active::after,
  .gooey-nav nav ul li.active::after {
    transition: none !important;
    animation: none !important;
  }
}
`;
