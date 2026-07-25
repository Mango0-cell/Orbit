import { cn } from '@/lib/utils/cn';

/** Orbit wordmark with a small orbital mark (both nav & footer render it in primary). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 text-primary"
        fill="none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4"
          stroke="currentColor"
          strokeOpacity="0.6"
          transform="rotate(-30 12 12)"
        />
      </svg>
      <span className="text-headline-md font-bold tracking-tighter text-primary">
        Orbit
      </span>
    </span>
  );
}
