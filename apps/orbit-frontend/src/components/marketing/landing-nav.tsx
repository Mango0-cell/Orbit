import Link from 'next/link';
import { Logo } from './logo';
import { GooeyNav } from '@/components/motion/gooey-nav';
import { StarBorder } from '@/components/motion/star-border';

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Discovery', href: '#features' },
  { label: 'Community', href: '#' },
  { label: 'About', href: '#' },
];

export function LandingNav() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between overflow-hidden border-b border-white/10 bg-surface/70 px-4 py-4 backdrop-blur-xl md:px-12">
      <Logo />
      <div className="hidden items-center md:flex">
        <GooeyNav items={LINKS} />
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden text-label-md text-on-surface-variant transition-colors hover:text-on-surface md:block"
        >
          Login
        </Link>
        <StarBorder href="/signup" innerClassName="px-6 py-2 text-label-md">
          Launch Journey
        </StarBorder>
      </div>
    </nav>
  );
}
