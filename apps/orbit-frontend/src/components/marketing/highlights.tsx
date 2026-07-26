import { MdBolt, MdPublic, MdShield } from 'react-icons/md';
import type { IconType } from 'react-icons';
import { BorderGlow } from '@/components/motion/border-glow';

const STATS: { k: string; v: string; icon: IconType }[] = [
  { k: '99.999%', v: 'Uplink availability across the void', icon: MdPublic },
  { k: '0ms', v: 'Quantum-entangled transmission latency', icon: MdBolt },
  { k: '256-bit', v: 'Decentralized identity anchoring', icon: MdShield },
];

export function Highlights() {
  return (
    <section className="relative z-10 bg-surface-container-lowest px-4 py-24 md:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-14 text-center">
          <span className="text-label-sm uppercase tracking-widest text-secondary">
            Mission Telemetry
          </span>
          <h2 className="mt-3 text-4xl font-semibold text-on-surface md:text-5xl">
            Engineered for the edge of reality
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STATS.map(({ k, v, icon: Icon }) => (
            <BorderGlow
              key={k}
              glowColor="14 100 62"
              backgroundColor="#0e0e10"
              borderRadius={16}
              glowRadius={36}
              colors={['#ff5633', '#ffc080', '#e9c400']}
              className="h-full"
            >
              <div className="flex flex-col gap-3 p-8">
                <Icon className="text-3xl text-primary" aria-hidden />
                <p className="gradient-text text-5xl font-bold">{k}</p>
                <p className="text-body-md text-on-surface-variant">{v}</p>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
