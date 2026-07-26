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
          className="orbit-logo-img h-8 w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06] md:h-9"
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
  filter: drop-shadow(0 0 0 rgba(255, 128, 80, 0));
  transition: filter 0.3s ease, transform 0.3s ease;
}
.orbit-logo-link:hover .orbit-logo-img,
.orbit-logo-link:focus-visible .orbit-logo-img {
  animation: orbit-logo-breathe 2.4s ease-in-out infinite alternate;
}
@keyframes orbit-logo-breathe {
  0% {
    filter: brightness(1.08) drop-shadow(0 0 10px rgba(255, 176, 128, 0.4))
      drop-shadow(0 0 20px rgba(255, 86, 51, 0.25));
  }
  100% {
    filter: brightness(1.18) drop-shadow(0 0 22px rgba(255, 176, 128, 0.65))
      drop-shadow(0 0 36px rgba(255, 86, 51, 0.4));
  }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-logo-link:hover .orbit-logo-img,
  .orbit-logo-link:focus-visible .orbit-logo-img {
    animation: none;
    filter: brightness(1.1) drop-shadow(0 0 14px rgba(255, 176, 128, 0.5));
  }
}
`;
