import { Reveal } from '@/components/motion/reveal';

export function SupernovaSection() {
  return (
    <section id="about" className="mx-auto max-w-4xl px-6 py-32 text-center">
      <Reveal className="flex flex-col items-center gap-6">
        <h2 className="font-display text-4xl font-semibold text-on-surface md:text-5xl">
          Forged in the heart of a Supernova.
        </h2>
        <p className="max-w-2xl font-body text-lg text-on-surface-muted">
          Traditional networks fail at the edge of the known universe. Orbit
          utilizes advanced gravitational node clustering to maintain unyielding
          connections across the void. It is not just a network; it is a
          fundamental shift in how we process and transmit reality.
        </p>
      </Reveal>
    </section>
  );
}
