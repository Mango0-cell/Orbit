import { cn } from '@/lib/utils/cn';

/** Orbit wordmark with a small orbital mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-primary"
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
          strokeOpacity="0.55"
          transform="rotate(-30 12 12)"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-on-surface">
        Orbit
      </span>
    </span>
  );
}
