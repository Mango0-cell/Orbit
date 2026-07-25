import Link from 'next/link';
import { Logo } from './logo';

const FOOTER_LINKS = [
  'Privacy Policy',
  'Terms of Service',
  'Contact Support',
  'API Documentation',
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Logo />
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {FOOTER_LINKS.map((label) => (
            <li key={label}>
              <Link
                href="#"
                className="font-body text-sm text-on-surface-muted transition hover:text-on-surface"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-on-surface-muted">
          © 2026 Orbit Aerospace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
