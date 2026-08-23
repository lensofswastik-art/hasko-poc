import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatsStrip } from "@/components/stats-strip";
import { IndustrySection } from "@/components/industry-section";
import { MachineFinder } from "@/components/machine-finder";
import { IntegratedLines } from "@/components/integrated-lines";
import { Proof } from "@/components/proof";
import { PartsService } from "@/components/parts-service";
import { WhyHeavyBuilt } from "@/components/why-heavy-built";
import { Resources } from "@/components/resources";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex flex-col">
        <SiteHeader />
      </div>

      <main>
        <Hero />
        <StatsStrip />
        <IndustrySection />
        <Suspense fallback={null}>
          <MachineFinder />
        </Suspense>
        <IntegratedLines />
        <Proof />
        <PartsService />
        <WhyHeavyBuilt />
        <Resources />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
