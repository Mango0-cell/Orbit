import { MdAutoAwesome, MdBolt, MdHub } from 'react-icons/md';
import { DisplayCards } from '@/components/motion/display-cards';
import type { DisplayCardProps } from '@/components/motion/display-cards';

const cards: DisplayCardProps[] = [
  {
    icon: <MdAutoAwesome className="size-5 text-primary" aria-hidden />,
    title: 'Stellar Feed',
    description: 'AI-curated cosmic signals',
    date: 'Live now',
    iconClassName: 'text-primary',
    titleClassName: 'text-primary',
    className:
      "grayscale-[65%] transition-all duration-700 [grid-area:stack] before:absolute before:inset-0 before:rounded-xl before:bg-background/60 before:transition-opacity before:duration-700 before:content-[''] hover:-translate-y-12 hover:grayscale-0 hover:before:opacity-0",
  },
  {
    icon: <MdHub className="size-5 text-secondary" aria-hidden />,
    title: 'Constellations',
    description: 'Communities that orbit you',
    date: 'Trending',
    iconClassName: 'text-secondary',
    titleClassName: 'text-secondary',
    className:
      "translate-x-14 translate-y-10 grayscale-[65%] transition-all duration-700 [grid-area:stack] before:absolute before:inset-0 before:rounded-xl before:bg-background/60 before:transition-opacity before:duration-700 before:content-[''] hover:-translate-y-1 hover:grayscale-0 hover:before:opacity-0",
  },
  {
    icon: <MdBolt className="size-5 text-tertiary" aria-hidden />,
    title: 'Signal Boost',
    description: 'Thermal-routed, zero-latency',
    date: 'Now',
    iconClassName: 'text-tertiary',
    titleClassName: 'text-tertiary',
    className:
      'translate-x-28 translate-y-20 transition-all duration-700 [grid-area:stack] hover:translate-y-10',
  },
];

export function Showcase() {
  return (
    <section className="relative z-10 bg-background px-4 py-24 md:px-12">
      <div className="mx-auto grid max-w-[1440px] items-center gap-16 lg:grid-cols-2">
        <div>
          <span className="text-label-md font-semibold uppercase tracking-widest text-primary">
            The Exhibition
          </span>
          <h2 className="mb-6 mt-4 text-4xl font-semibold text-on-surface md:text-5xl">
            Every signal, curated by intelligence.
          </h2>
          <p className="mb-8 max-w-md text-body-lg text-on-surface-variant">
            Orbit reads the noise of deep space so you don&apos;t have to. Feeds
            that assemble themselves, communities that find their own gravity,
            and transmissions that route around the heat — all in one console.
          </p>
          <ul className="space-y-3 text-body-md text-on-surface-variant">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Adaptive ranking tuned to your trajectory
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Self-forming constellations of like minds
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              Burst-speed delivery, wherever you drift
            </li>
          </ul>
        </div>
        <div className="flex min-h-[360px] w-full items-center justify-center py-10">
          <DisplayCards cards={cards} />
        </div>
      </div>
    </section>
  );
}
