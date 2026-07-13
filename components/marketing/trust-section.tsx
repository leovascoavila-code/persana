const ITENS = [
  {
    titulo: "Multi-tenant com RLS FORCE",
    desc: "Cada clínica isolada por Row-Level Security no banco. App conecta sem superusuário; tenant por transação.",
  },
  {
    titulo: "LGPD por construção",
    desc: "Consentimento com hash sha256, CPF cifrado em repouso (Fernet) e exclusão sob demanda.",
  },
  {
    titulo: "Assinatura ICP-Brasil",
    desc: "Prescrição digital via MEMED com assinatura qualificada; verificação server-side anti-forjadura.",
  },
  {
    titulo: "Prontuário com não-repúdio",
    desc: "Escrita oficial só por ato assinado do médico. Prontuário versionado com hash, auditável ponta a ponta.",
  },
];

export function TrustSection() {
  return (
    <section id="seguranca" className="scroll-mt-20 border-t border-border px-6 py-[80px] md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent-300">
          Segurança & compliance
        </div>
        <h2 className="max-w-[620px] font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-text-1">
          Feito para dado clínico desde o primeiro commit
        </h2>

        <div className="mt-9 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
          {ITENS.map((i) => (
            <div key={i.titulo}>
              <h3 className="text-[15px] font-semibold text-text-1">
                {i.titulo}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-text-2">
                {i.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
