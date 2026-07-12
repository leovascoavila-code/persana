import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { JournalSection } from "@/components/marketing/journal-section";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <JournalSection />
      </main>
      <footer className="border-t border-border px-6 py-10 text-center text-[12.5px] text-text-3 md:px-10">
        persana. — Editorial Noturno v2.0 · Spectral + Manrope (self-hosted) ·{" "}
        {new Date().getFullYear()}
      </footer>
    </>
  );
}
