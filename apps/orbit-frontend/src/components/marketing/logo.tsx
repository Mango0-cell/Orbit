import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/** Orbit brand: the full coral wordmark image, with a soft thermal hover glow. */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <style>{LOGO_CSS}</style>
      <Link
        href="/"
        aria-label="Orbit — home"
        className={cn(
          'orbit-logo-link group inline-flex items-center rounded-md',
          className,
        )}
      >
        <Image
          src="/orbit-logo.webp"
          alt="Orbit"
          width={258}
          height={112}
          priority
          className="orbit-logo-img h-8 w-auto object-contain md:h-9"
        />
      </Link>
    </>
  );
}

const LOGO_CSS = `
.orbit-logo-link { outline: none; }
.orbit-logo-link:focus-visible {
  outline: 2px solid var(--color-secondary, #ffc080);
  outline-offset: 4px;
}
.orbit-logo-img {
  transition: filter 0.25s ease;
}
.orbit-logo-link:hover .orbit-logo-img,
.orbit-logo-link:focus-visible .orbit-logo-img {
  filter: brightness(1.18);
}
`;
