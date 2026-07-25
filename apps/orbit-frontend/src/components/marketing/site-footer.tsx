import { Logo } from './logo';

const FOOTER_LINKS = [
  'Privacy Policy',
  'Terms of Service',
  'Contact Support',
  'API Documentation',
];

export function SiteFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-6 border-t border-primary/10 bg-surface-container-lowest px-4 py-12 md:flex-row md:px-12">
      <Logo />
      <div className="flex flex-wrap justify-center gap-6">
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            className="text-body-md text-on-surface-variant transition-colors hover:text-tertiary"
          >
            {label}
          </a>
        ))}
      </div>
      <p className="text-body-md text-on-surface-variant">
        © 2026 Orbit Aerospace. All rights reserved.
      </p>
    </footer>
  );
}
