import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppPreview } from "./app-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-[70px] pb-10 text-center md:px-10">
      {/* glow sutil: verde (brand) + azul (accent), discreto */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[38%] top-[-260px] h-[520px] w-[760px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand-wash), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[64%] top-[-240px] h-[480px] w-[720px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-wash), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent-500)_30%,transparent)] bg-accent-wash px-[15px] py-1.5 text-[13px] text-accent-300">
          ✦ SaaS Clínico · Medicina Personalizada
        </div>

        <h1 className="mx-auto max-w-[860px] font-serif text-[42px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[54px] md:text-[64px]">
          Do exame à prescrição, num só{" "}
          <em className="italic font-medium text-brand-300">fluxo</em>.
        </h1>

        <p className="mx-auto mt-6 max-w-[600px] text-[19px] leading-[1.55] text-text-2">
          Persana é o copiloto clínico da medicina personalizada: anamnese,
          exames, protocolos e prescrição digital conectados. A IA estrutura e
          sugere — o médico revisa, aprova e assina.
        </p>

        <div className="mt-[34px] flex flex-wrap justify-center gap-3.5">
          <Button asChild size="lg">
            <Link href="/modulos">Ver os módulos</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#jornada">Como funciona</Link>
          </Button>
        </div>

        <p className="mt-[30px] text-[13px] text-text-3">
          Prontuário versionado · Assinatura ICP-Brasil (MEMED) · LGPD por
          construção
        </p>

        <AppPreview />
      </div>
    </section>
  );
}
