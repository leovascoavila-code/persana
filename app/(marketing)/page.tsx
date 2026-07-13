import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { ModulesOverview } from "@/components/marketing/modules-overview";
import { JournalSection } from "@/components/marketing/journal-section";
import { TrustSection } from "@/components/marketing/trust-section";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <ModulesOverview />
        <JournalSection />
        <TrustSection />
      </main>
      <footer className="border-t border-border px-6 py-10 text-center text-[12.5px] text-text-3 md:px-10">
        persana. — SaaS Clínico da medicina personalizada · Minas Pharma ·{" "}
        {new Date().getFullYear()}
      </footer>
    </>
  );
}
