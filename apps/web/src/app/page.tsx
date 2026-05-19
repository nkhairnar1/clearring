import { Navbar } from '@/components/navbar';
import { BackToTop } from '@/components/back-to-top';
import { Hero } from '@/components/sections/hero';
import { TrustBadges } from '@/components/sections/trust-badges';
import { Problem } from '@/components/sections/problem';
import { LookupDemo } from '@/components/sections/lookup-demo';
import { Solution } from '@/components/sections/solution';
import { AppScreens } from '@/components/sections/app-screens';
import { GlassShowcase } from '@/components/sections/glass-showcase';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Business } from '@/components/sections/business';
import { Testimonials } from '@/components/sections/testimonials';
import { Privacy } from '@/components/sections/privacy';
import { FAQ } from '@/components/sections/faq';
import { Stats } from '@/components/sections/stats';
import { DownloadCTA } from '@/components/sections/download-cta';
import { Footer } from '@/components/sections/footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <Problem />
        <LookupDemo />
        <Solution />
        <AppScreens />
        <GlassShowcase />
        <Stats />
        <HowItWorks />
        <Business />
        <Testimonials />
        <Privacy />
        <FAQ />
        <DownloadCTA />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
