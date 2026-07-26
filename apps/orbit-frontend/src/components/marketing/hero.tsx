import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { BlurText } from '@/components/motion/blur-text';
import { FadeIn } from '@/components/motion/fade-in';
import { StarBorder } from '@/components/motion/star-border';
import { PlanetField } from '@/components/marketing/planet-field';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <PlanetField className="absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 pt-24 md:px-12 lg:grid-cols-2">
        <div className="flex flex-col items-start text-left">
          <BlurText
            text="Orbit"
            animateBy="words"
            delay={180}
            className="gradient-text mb-6 text-5xl font-bold leading-[1.05] tracking-tight drop-shadow-2xl md:text-6xl lg:text-7xl"
          />
          <FadeIn delay={0.15}>
            <p className="mb-12 max-w-xl text-body-lg text-on-surface-variant">
              Harness the power of an intelligent, decentralized network designed
              to withstand the extremes of deep space communication and stellar
              discovery.
            </p>
          </FadeIn>
          <FadeIn delay={0.3} className="flex flex-col gap-6 sm:flex-row">
            <StarBorder href="/signup" innerClassName="px-8 py-4 text-label-md font-bold">
              Initiate Sequence
              <MdRocketLaunch className="text-lg" aria-hidden />
            </StarBorder>
            <StarBorder
              href="#features"
              color="#ff5633"
              secondColor="#ffc080"
              innerClassName="px-8 py-4 text-label-md"
            >
              View Telemetry
              <MdInsights className="text-lg" aria-hidden />
            </StarBorder>
          </FadeIn>
        </div>

        {/* Right column — the planet shows through from PlanetField behind. */}
        <div aria-hidden className="hidden lg:block" />
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-50">
        <MdKeyboardArrowDown className="text-3xl text-primary" aria-hidden />
      </div>
    </section>
  );
}
