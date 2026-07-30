'use client';

import Link from 'next/link';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface StarBorderProps {
  /** Label + optional icon. */
  children: ReactNode;
  /** Extra classes on the outer (border) box. */
  className?: string;
  /** Extra classes on the inner dark content box (padding, text size, gap…). */
  innerClassName?: string;
  /** Leading star color (default: Supernova amber). */
  color?: string;
  /** Trailing star color (default: Supernova crimson). */
  secondColor?: string;
  /** One full orbit of the traveling star blobs, e.g. '6s'. */
  speed?: string;
  /** Visible border thickness in px (the sliver of star glow around the inner box). */
  thickness?: number;
  /** Render as a Link when set; otherwise renders a <button>. */
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

/**
 * React Bits StarBorder, retinted to Supernova and squared off. Two traveling
 * radial-gradient "star" blobs orbit a rounded-md border behind a dark inner
 * content box — no flat gradient fill. Works as a `<Link href>` or a
 * `<button type="submit">`; reduced-motion freezes the stars into a static
 * glow instead of stopping the component from rendering.
 */
export function StarBorder({
  children,
  className,
  innerClassName,
  color = '#ffc080',
  secondColor = '#ff5633',
  speed = '6s',
  thickness = 1,
  href,
  type = 'button',
  disabled,
  onClick,
  target,
  rel,
  ...rest
}: StarBorderProps) {
  const ariaLabel = rest['aria-label'];

  // Speed is driven purely by CSS custom properties; reduced-motion users
  // get `animation: none` from the media query below regardless of this
  // value, which avoids relying on a fragile "0s duration" trick.
  const style = {
    '--star-border-speed': speed,
    '--star-border-color': color,
    '--star-border-color-2': secondColor,
    padding: `${thickness}px`,
  } as CSSProperties;

  const chrome = (
    <>
      <span
        className="star-border-blob star-border-blob-top"
        aria-hidden="true"
      />
      <span
        className="star-border-blob star-border-blob-bottom"
        aria-hidden="true"
      />
      <span className={cn('star-border-inner', innerClassName)}>
        {children}
      </span>
    </>
  );

  const outerClassName = cn('star-border-container', className);

  return (
    <>
      <style>{STAR_BORDER_CSS}</style>
      {href ? (
        <Link
          href={href}
          className={outerClassName}
          style={style}
          target={target}
          rel={rel}
          aria-label={ariaLabel}
        >
          {chrome}
        </Link>
      ) : (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={outerClassName}
          style={style}
          aria-label={ariaLabel}
        >
          {chrome}
        </button>
      )}
    </>
  );
}

const STAR_BORDER_CSS = `
.star-border-container {
  position: relative;
  display: inline-block;
  border-radius: 0.5rem;
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
  text-decoration: none;
  border: none;
  background: rgba(94, 63, 56, 0.35);
}
.star-border-blob {
  position: absolute;
  width: 300%;
  height: 50%;
  border-radius: 50%;
  opacity: 0.7;
  z-index: 0;
}
.star-border-blob-top {
  top: -11px;
  left: -250%;
  background: radial-gradient(circle, var(--star-border-color, #ffc080), transparent 10%);
  animation: star-border-movement-top var(--star-border-speed, 6s) linear infinite alternate;
}
.star-border-blob-bottom {
  bottom: -11px;
  right: -250%;
  background: radial-gradient(circle, var(--star-border-color-2, #ff5633), transparent 10%);
  animation: star-border-movement-bottom var(--star-border-speed, 6s) linear infinite alternate;
}
@keyframes star-border-movement-top {
  0% { transform: translate(0%, 0%); opacity: 1; }
  100% { transform: translate(100%, 0%); opacity: 0; }
}
@keyframes star-border-movement-bottom {
  0% { transform: translate(0%, 0%); opacity: 1; }
  100% { transform: translate(-100%, 0%); opacity: 0; }
}
.star-border-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--color-surface, #131315);
  color: var(--color-on-surface, #e5e1e4);
  transition: background-color 0.25s ease, transform 0.15s ease;
}
.star-border-container:hover .star-border-inner {
  background: var(--color-surface-container-low, #1c1b1e);
}
.star-border-container:active .star-border-inner {
  transform: scale(0.98);
}
.star-border-container:focus-visible {
  outline: 2px solid var(--star-border-color, #ffc080);
  outline-offset: 2px;
}
.star-border-container:disabled,
.star-border-container[aria-disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .star-border-blob {
    animation: none !important;
    opacity: 0.55;
  }
}
`;
