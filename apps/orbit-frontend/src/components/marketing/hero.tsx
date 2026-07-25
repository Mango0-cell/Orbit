import Link from 'next/link';
import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { FadeIn } from '@/components/motion/fade-in';

export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <FadeIn className="flex max-w-3xl flex-col items-center gap-6">
        <span className="rounded-control border border-primary/30 bg-primary/5 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          First AI-Native Cosmic Network
        </span>
        {/* SWAP SLOT: React Bits text animation (Split Text / Shiny Text) via orbit-reactbits. */}
        <h1 className="bg-gradient-to-b from-on-surface to-on-surface-muted bg-clip-text font-display text-6xl font-bold tracking-tight text-transparent md:text-8xl">
          Command The Void
        </h1>
        <p className="max-w-2xl font-body text-lg text-on-surface-muted">
          Harness the power of an intelligent, decentralized network designed to
          withstand the extremes of deep space communication and stellar
          discovery.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            <MdRocketLaunch className="h-4 w-4" /> Initiate Sequence
          </Link>
          <Link
            href="#features"
            className="glass inline-flex items-center gap-2 rounded-control px-5 py-3 text-sm font-medium text-on-surface transition hover:border-primary/40"
          >
            <MdInsights className="h-4 w-4" /> View Telemetry
          </Link>
        </div>
      </FadeIn>
      <MdKeyboardArrowDown
        className="absolute bottom-8 h-6 w-6 animate-bounce text-on-surface-muted"
        aria-hidden
      />
    </section>
  );
}
