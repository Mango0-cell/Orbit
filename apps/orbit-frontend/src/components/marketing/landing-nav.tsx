import Link from 'next/link';
import { Logo } from './logo';

const LINKS = ['Features', 'Discovery', 'Community', 'About'];

export function LandingNav() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-surface/70 px-4 py-4 backdrop-blur-xl md:px-12">
      <Logo />
      <div className="hidden items-center gap-6 md:flex">
        {LINKS.map((label) => (
          <Link
            key={label}
            href="#"
            className="text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden text-label-md text-on-surface-variant transition-colors hover:text-on-surface md:block"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="thermal-glow rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-6 py-2 text-label-md text-on-primary-container transition-opacity hover:opacity-80"
        >
          Launch Journey
        </Link>
      </div>
    </nav>
  );
}
