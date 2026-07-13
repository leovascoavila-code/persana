import Link from "next/link";
import { modulesByGroup } from "@/lib/modules";

/** Descritor curto por grupo (ancorado nos módulos reais de lib/modules.ts). */
const GRUPO_DESC: Record<string, string> = {
  "Jornada clínica":
    "Do cadastro à consulta gravada, com prontuário versionado e assinado.",
  "Exames & dados":
    "Extração de exames por IA, tendências longitudinais e interoperabilidade FHIR.",
  "Motor terapêutico":
    "Protocolos da biblioteca curada, fórmulas magistrais e dietas com evidência.",
  "Prescrição & farmácia":
    "Prescrição digital assinada (MEMED) e ponte com a manipulação.",
  Plataforma: "Multi-tenant com RLS, RBAC, MFA e base de conhecimento.",
  "Planejados (spec v3)":
    "No roadmap: dashboard de ROI, automações e WhatsApp da clínica.",
};

export function ModulesOverview() {
  const grupos = modulesByGroup();

  return (
    <section id="jornada" className="scroll-mt-20 px-6 py-[88px] md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent-300">
          Como funciona
        </div>
        <h2 className="max-w-[680px] font-serif text-[38px] font-semibold leading-[1.15] tracking-[-0.01em] text-text-1">
          Um módulo para cada etapa do cuidado
        </h2>
        <p className="mt-4 max-w-[620px] text-[17px] leading-[1.6] text-text-2">
          Tudo o que o Persana faz — e o que está no roadmap — organizado em seis
          frentes. Cada módulo é apoio à decisão: sugere e estrutura, o médico
          aprova.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {grupos.map(({ grupo, modules }) => (
            <div
              key={grupo}
              className="flex h-full flex-col rounded-lg border border-border bg-bg-1 p-5"
            >
              <h3 className="font-serif text-[19px] font-semibold text-text-1">
                {grupo}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-3">
                {GRUPO_DESC[grupo]}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <li
                    key={m.slug}
                    className="rounded-full border border-border bg-bg-2 px-2.5 py-1 text-[12px] text-text-2"
                  >
                    {m.nome}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/modulos"
            className="text-sm font-semibold text-brand-300 transition-colors hover:text-brand-400"
          >
            Ver todos os módulos e o status atual &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
