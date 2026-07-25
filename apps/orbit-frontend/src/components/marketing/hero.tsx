import Link from 'next/link';
import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { BlackHoleShader } from './black-hole-shader';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24">
      <div className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen">
        <BlackHoleShader className="block h-full w-full" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-12">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-label-sm uppercase tracking-widest text-on-secondary">
          <span className="pulse-anim h-2 w-2 rounded-full bg-on-secondary" />
          First AI-Native Cosmic Network
        </span>
        <h1 className="mb-6 text-headline-xl-mobile text-on-surface drop-shadow-2xl md:text-headline-xl">
          <span className="gradient-text font-bold">Command</span>
          <br /> The Void
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-body-lg text-on-surface-variant">
          Harness the power of an intelligent, decentralized network designed to
          withstand the extremes of deep space communication and stellar
          discovery.
        </p>
        <div className="flex flex-col gap-6 sm:flex-row">
          <Link
            href="/signup"
            className="thermal-glow thermal-glow-hover flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-8 py-4 text-label-md font-bold text-on-primary-container transition-all duration-300"
          >
            Initiate Sequence
            <MdRocketLaunch className="text-lg" aria-hidden />
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center gap-2 rounded-full border border-primary px-8 py-4 text-label-md text-primary transition-colors duration-300 hover:bg-primary/10"
          >
            View Telemetry
            <MdInsights className="text-lg" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <MdKeyboardArrowDown className="text-3xl text-primary" aria-hidden />
      </div>
    </section>
  );
}
