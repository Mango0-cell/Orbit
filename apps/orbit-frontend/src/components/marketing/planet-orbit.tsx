'use client';

import type { CSSProperties } from 'react';
import { ColorBends } from '@/components/motion/color-bends';

/**
 * PlanetOrbit — the planet's orbit ring rendered with React Bits ColorBends.
 * A ColorBends field is masked into a tilted elliptical ring (SVG stroke mask)
 * centred on the planet, so the flowing Supernova colors show ONLY within the
 * orbit band. `half` splits the ring so it can wrap the planet: render `back`
 * behind the planet and `front` in front (favicon-style Saturn wrap).
 */
type Half = 'back' | 'front' | 'full';

function maskFor(half: Half): string {
  // Luminance mask: black = hidden, white = shown. Black bg hides everything,
  // the white ellipse stroke reveals the ring band, a black rect re-hides a half.
  const cut =
    half === 'back'
      ? "<rect x='0' y='50' width='100' height='51' fill='black'/>"
      : half === 'front'
        ? "<rect x='0' y='-1' width='100' height='51' fill='black'/>"
        : '';
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>" +
    "<rect width='100' height='100' fill='black'/>" +
    "<ellipse cx='50' cy='50' rx='47' ry='15' transform='rotate(-20 50 50)' " +
    "fill='none' stroke='white' stroke-width='7'/>" +
    cut +
    '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function PlanetOrbit({
  half = 'full',
  className,
}: {
  half?: Half;
  className?: string;
}) {
  const mask = maskFor(half);
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        left: '93%',
        top: '55%',
        transform: 'translate(-50%, -50%)',
        width: 'min(180vh, 100vw)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        maskMode: 'luminance',
        WebkitMaskMode: 'luminance',
      } as CSSProperties}
    >
      <ColorBends
        colors={['#ff5633', '#ffc080', '#e9c400', '#ff8a4c']}
        rotation={90}
        speed={0.16}
        scale={1.1}
        frequency={1}
        warpStrength={1}
        iterations={2}
        intensity={2.4}
        bandWidth={5}
        noise={0.04}
        mouseInfluence={0}
        parallax={0}
        transparent
      />
    </div>
  );
}
