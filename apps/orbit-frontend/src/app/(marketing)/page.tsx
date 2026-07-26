import { AuroraBackground } from '@/components/marketing/aurora-background';
import { Starfield } from '@/components/marketing/starfield';
import { LandingNav } from '@/components/marketing/landing-nav';
import { Hero } from '@/components/marketing/hero';
import { SupernovaSection } from '@/components/marketing/supernova-section';
import { Highlights } from '@/components/marketing/highlights';
import { CoreSystems } from '@/components/marketing/core-systems';
import { CtaBand } from '@/components/marketing/cta-band';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function LandingPage() {
  return (
    <>
      <AuroraBackground />
      <Starfield />
      <LandingNav />
      <main>
        <Hero />
        <SupernovaSection />
        <Highlights />
        <CoreSystems />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
