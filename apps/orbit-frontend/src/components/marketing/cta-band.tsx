import Link from 'next/link';
import { MdGroupAdd } from 'react-icons/md';
import { Reveal } from '@/components/motion/reveal';

export function CtaBand() {
  return (
    <section id="community" className="px-6 py-24">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-card border border-primary/15 bg-surface-elevated/40 px-8 py-16 text-center backdrop-blur-xl">
        <h2 className="font-display text-4xl font-bold text-on-surface">
          Join the Constellation
        </h2>
        <p className="max-w-xl font-body text-on-surface-muted">
          Establish your node in the network. Enter your transmission
          coordinates to receive early access protocols.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110"
        >
          <MdGroupAdd className="h-4 w-4" /> Establish Link
        </Link>
      </Reveal>
    </section>
  );
}
