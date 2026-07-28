import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { FadeIn } from '@/components/motion/fade-in';
import { StarBorder } from '@/components/motion/star-border';
import { PlanetField } from '@/components/marketing/planet-field';
import { ColorBends } from '@/components/motion/color-bends';
import { HeroLogoTitle } from '@/components/marketing/hero-logo-title';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Flowing warm "orbit" bands, centred on the planet so they round it. */}
      <div aria-hidden className="absolute inset-0 z-0">
        <ColorBends
          colors={['#ff5633', '#ffc080', '#e9c400', '#ff8a4c']}
          rotation={ -500 }
          speed={0.14}
          scale={1.1}
          frequency={1}
          warpStrength={1}
          iterations={2}
          intensity={1.35}
          bandWidth={6}
          noise={0.05}
          mouseInfluence={0.4}
          parallax={0.4}
          transparent
        />
      </div>
      <PlanetField className="absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 pt-24 md:px-12 lg:grid-cols-2">
        <div className="flex flex-col items-start text-left">
          <HeroLogoTitle />
          <FadeIn delay={0.95}>
            <p className="mb-12 max-w-xl text-body-lg text-on-surface-variant">
              Harness the power of an intelligent, decentralized network designed
              to withstand the extremes of deep space communication and stellar
              discovery.
            </p>
          </FadeIn>
          <FadeIn delay={1.2} className="flex flex-col gap-6 sm:flex-row">
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
