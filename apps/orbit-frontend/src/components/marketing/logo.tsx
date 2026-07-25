import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/** Orbit brand: the real accretion-ring mark + wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/orbit-mark.webp"
        alt=""
        width={36}
        height={36}
        priority
        className="h-9 w-9 object-contain"
        aria-hidden
      />
      <span className="text-headline-md font-bold tracking-tighter text-primary">
        Orbit
      </span>
    </span>
  );
}
