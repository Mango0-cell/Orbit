import Link from 'next/link';
import { Logo } from './logo';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#discovery', label: 'Discovery' },
  { href: '#community', label: 'Community' },
  { href: '#about', label: 'About' },
];

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-body text-sm text-on-surface-muted transition hover:text-on-surface"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-body text-sm text-on-surface-muted transition hover:text-on-surface"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Launch Journey
          </Link>
        </div>
      </nav>
    </header>
  );
}
