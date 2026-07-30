import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { FadeIn } from '@/components/motion/fade-in';
import { StarBorder } from '@/components/motion/star-border';
import { PlanetField } from '@/components/marketing/planet-field';
import { OrbitBends } from '@/components/marketing/orbit-bends';
import { HeroLogoTitle } from '@/components/marketing/hero-logo-title';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Orbit ribbon (ColorBends flowing along the orbit): far half behind… */}
      <OrbitBends half="back" className="z-0" />
      <PlanetField className="absolute inset-0 z-[1]" />
      {/* …near half in front of the planet, completing the Saturn-style wrap. */}
      <OrbitBends half="front" className="z-[2]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 pt-24 md:px-12 lg:grid-cols-2">
        <div className="flex flex-col items-start text-left">
          <HeroLogoTitle />
          <FadeIn delay={0.95}>
            <p className="mb-12 max-w-xl text-body-lg text-on-surface-variant">
              Harness the power of an intelligent, decentralized network
              designed to withstand the extremes of deep space communication and
              stellar discovery.
            </p>
          </FadeIn>
          <FadeIn delay={1.2} className="flex flex-col gap-6 sm:flex-row">
            <StarBorder
              href="/signup"
              innerClassName="px-8 py-4 text-label-md font-bold"
            >
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
