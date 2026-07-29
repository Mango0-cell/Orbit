'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

/**
 * React Bits GooeyNav — a faithful port of the original ferrofluid nav (true
 * `blur(7px) contrast(100)` metaball goo + droplet burst + scaling pill), with
 * two changes for this project: (1) all selectors are scoped under `.gooey-nav`
 * so the global `li::after` / `.particle` rules can't leak onto other lists,
 * and (2) it's retinted to the Supernova palette. Accessible (`<a href>` +
 * keyboard) and reduced-motion safe.
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
  particleCount = 10,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
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

  const createParticle = (
    i: number,
    t: number,
    d: [number, number],
    r: number,
  ) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    if (prefersReducedMotion()) return; // CSS also hides them; skip DOM churn.
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
        particle.style.setProperty(
          '--color',
          `var(--gooey-color-${p.color}, #ffc080)`,
        );
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

  const activate = (anchorEl: HTMLElement, index: number) => {
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(anchorEl);
    if (filterRef.current) {
      filterRef.current.querySelectorAll('.particle').forEach((p) => p.remove());
      makeParticles(filterRef.current);
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth; // force reflow to restart the anim
      textRef.current.classList.add('active');
    }
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, index: number) =>
    activate(e.currentTarget, index);

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // Space would scroll the page; Enter is left to native <a href> navigation.
    if (e.key === ' ') e.preventDefault();
    activate(e.currentTarget, index);
  };

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
        <nav
          className="relative flex"
          style={{ transform: 'translate3d(0,0,0.01px)' }}
        >
          <ul ref={navRef}>
            {items.map((item, index) => (
              <li
                key={item.label}
                className={activeIndex === index ? 'active' : ''}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
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
  --gooey-pill: #ffc080;
}
.gooey-nav nav ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  padding: 0 0.5rem;
  margin: 0;
  position: relative;
  z-index: 3;
  color: #e9bdb3;
}
.gooey-nav nav ul li {
  position: relative;
  cursor: pointer;
  border-radius: 9999px;
  color: #e9bdb3;
  transition: color 0.3s ease;
}
.gooey-nav nav ul li a {
  display: inline-block;
  padding: 0.4em 1em;
  color: inherit;
  text-decoration: none;
  outline: none;
  font-size: 0.875rem;
  font-weight: 500;
}
.gooey-nav nav ul li::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: var(--gooey-pill);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
  z-index: -1;
}
.gooey-nav nav ul li.active {
  color: #1a0d09;
  text-shadow: none;
}
.gooey-nav nav ul li.active::after {
  opacity: 1;
  transform: scale(1);
}
.gooey-nav .effect {
  position: absolute;
  opacity: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 500;
}
.gooey-nav .effect.text {
  color: #e9bdb3;
  transition: color 0.3s ease;
}
.gooey-nav .effect.text.active {
  color: #1a0d09;
}
.gooey-nav .effect.filter {
  filter: blur(7px) contrast(100) blur(0);
  mix-blend-mode: lighten;
}
.gooey-nav .effect.filter::before {
  content: '';
  position: absolute;
  inset: -75px;
  z-index: -2;
  background: black;
}
.gooey-nav .effect.filter::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gooey-pill);
  transform: scale(0);
  opacity: 0;
  z-index: -1;
  border-radius: 9999px;
}
.gooey-nav .effect.active::after {
  animation: gooey-pill 0.3s ease both;
}
@keyframes gooey-pill {
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.gooey-nav .particle,
.gooey-nav .point {
  display: block;
  opacity: 0;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  transform-origin: center;
}
.gooey-nav .particle {
  --time: 5s;
  position: absolute;
  top: calc(50% - 8px);
  left: calc(50% - 8px);
  animation: gooey-particle calc(var(--time)) ease 1 -350ms;
}
.gooey-nav .point {
  background: var(--color);
  opacity: 1;
  animation: gooey-point calc(var(--time)) ease 1 -350ms;
}
@keyframes gooey-particle {
  0% {
    transform: rotate(0deg) translate(var(--start-x), var(--start-y));
    opacity: 1;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  70% {
    transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
    opacity: 1;
    animation-timing-function: ease;
  }
  85% {
    transform: rotate(calc(var(--rotate) * 0.66)) translate(var(--end-x), var(--end-y));
    opacity: 1;
  }
  100% {
    transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
    opacity: 1;
  }
}
@keyframes gooey-point {
  0% {
    transform: scale(0);
    opacity: 0;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  25% {
    transform: scale(calc(var(--scale) * 0.25));
  }
  38% {
    opacity: 1;
  }
  65% {
    transform: scale(var(--scale));
    opacity: 1;
    animation-timing-function: ease;
  }
  85% {
    transform: scale(var(--scale));
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gooey-nav .particle,
  .gooey-nav .effect.filter {
    display: none;
  }
  .gooey-nav nav ul li::after {
    transition: none;
  }
}
`;
