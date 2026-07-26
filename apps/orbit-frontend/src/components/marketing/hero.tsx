import Link from 'next/link';
import {
  MdInsights,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md';
import { BlurText } from '@/components/motion/blur-text';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-12">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-label-sm uppercase tracking-widest text-on-secondary">
          <span className="pulse-anim h-2 w-2 rounded-full bg-on-secondary" />
          First AI-Native Cosmic Network
        </span>
        <BlurText
          text="Command The Void"
          animateBy="words"
          delay={180}
          className="gradient-text mb-6 justify-center text-5xl font-bold leading-[1.05] tracking-tight drop-shadow-2xl md:text-6xl lg:text-7xl"
        />
        <p className="mx-auto mb-12 max-w-2xl text-body-lg text-on-surface-variant">
          Harness the power of an intelligent, decentralized network designed to
          withstand the extremes of deep space communication and stellar
          discovery.
        </p>
        <div className="flex flex-col gap-6 sm:flex-row">
          <Link
            href="/signup"
            className="thermal-glow thermal-glow-hover flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary-container to-secondary-container px-8 py-4 text-label-md font-bold text-on-primary-container transition-all duration-300"
          >
            Initiate Sequence
            <MdRocketLaunch className="text-lg" aria-hidden />
          </Link>
          <Link
            href="#features"
            className="flex items-center justify-center gap-2 rounded-md border border-primary px-8 py-4 text-label-md text-primary transition-colors duration-300 hover:bg-primary/10"
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
