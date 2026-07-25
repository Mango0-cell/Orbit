import type { IconType } from 'react-icons';
import {
  MdAccountCircle,
  MdBolt,
  MdSatelliteAlt,
  MdTravelExplore,
} from 'react-icons/md';
import { Reveal } from '@/components/motion/reveal';
import { Card } from '@/components/ui/card';

const SYSTEMS: { icon: IconType; title: string; body: string }[] = [
  {
    icon: MdTravelExplore,
    title: 'Stellar Discovery',
    body: 'Map uncharted territories with AI-driven anomaly detection algorithms scanning the cosmic microwave background in real-time.',
  },
  {
    icon: MdSatelliteAlt,
    title: 'Comms Link',
    body: 'Quantum-entangled transmission protocols ensure zero-latency communication across lightyears.',
  },
  {
    icon: MdAccountCircle,
    title: 'Galactic Profile',
    body: 'Your universal identity, securely anchored to the decentralized ledger.',
  },
  {
    icon: MdBolt,
    title: 'Thermal Routing',
    body: 'Intelligently route data through high-energy celestial bodies to maximize transmission burst speeds.',
  },
];

export function CoreSystems() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <Reveal className="mb-12 text-center">
        <h2 className="font-display text-3xl font-semibold text-on-surface md:text-4xl">
          Core Systems
        </h2>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SYSTEMS.map(({ icon: Icon, title, body }) => (
          <Reveal key={title}>
            <Card className="flex h-full flex-col gap-4">
              <Icon className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="font-display text-lg font-semibold text-on-surface">
                {title}
              </h3>
              <p className="font-body text-sm text-on-surface-muted">{body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
