import { CosmicBackground } from '@/components/marketing/cosmic-background';
import { LandingNav } from '@/components/marketing/landing-nav';
import { Hero } from '@/components/marketing/hero';
import { SupernovaSection } from '@/components/marketing/supernova-section';
import { CoreSystems } from '@/components/marketing/core-systems';
import { CtaBand } from '@/components/marketing/cta-band';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function LandingPage() {
  return (
    <>
      <CosmicBackground />
      <LandingNav />
      <main>
        <Hero />
        <SupernovaSection />
        <CoreSystems />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
