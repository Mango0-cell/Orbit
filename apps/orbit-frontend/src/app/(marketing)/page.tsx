import Link from 'next/link';
import { FadeIn } from '@/components/motion/fade-in';

/** Landing — placeholder foundation. The real design is ported from Stitch next. */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
      <FadeIn className="flex flex-col items-center gap-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Event Horizon
        </span>
        <h1 className="font-display text-6xl font-bold tracking-tight text-on-surface md:text-8xl">
          Orbit
        </h1>
        <p className="max-w-xl font-body text-lg text-on-surface-muted">
          A social network among the stars. This landing page will be ported
          from the Stitch design.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="glass rounded-control px-5 py-2.5 text-sm font-medium text-on-surface transition hover:border-primary/40"
          >
            Log in
          </Link>
        </div>
      </FadeIn>
    </main>
  );
}
