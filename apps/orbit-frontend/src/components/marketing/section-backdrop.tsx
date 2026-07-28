import { cn } from '@/lib/utils/cn';
import { ColorBends } from '@/components/motion/color-bends';

/** Supernova palette for the animated section backdrops. */
const SUPERNOVA = ['#ff5633', '#ffc080', '#e9c400', '#ff8a4c'];

/**
 * SectionBackdrop — a subtle Supernova-tinted ColorBends field, positioned to
 * sit behind a section's content (over the section's own background). Reusable:
 * drop `<SectionBackdrop />` as the first child of any `relative` section.
 */
export function SectionBackdrop({
  className,
  opacity = 0.3,
  speed = 0.12,
  rotation = 90,
}: {
  className?: string;
  opacity?: number;
  speed?: number;
  rotation?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      style={{ opacity }}
    >
      <ColorBends
        colors={SUPERNOVA}
        rotation={rotation}
        speed={speed}
        scale={1.5}
        frequency={1}
        warpStrength={1}
        iterations={2}
        intensity={1.0}
        bandWidth={7}
        noise={0.05}
        mouseInfluence={0}
        parallax={0}
        transparent
      />
    </div>
  );
}
