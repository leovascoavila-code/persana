/**
 * Princípio de ouro — o invariante do SaaS Clínico: a IA estrutura, o médico
 * decide. Mesmo mundo editorial "Journal" (grafite + brand como fio condutor).
 */
export function JournalSection() {
  return (
    <section className="bg-journal-bg px-6 py-[88px] md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-journal-accent">
          Princípio de ouro
        </div>
        <h2 className="max-w-[680px] font-serif text-[38px] font-semibold leading-[1.15] tracking-[-0.01em] text-text-1">
          A IA estrutura. O médico decide.
        </h2>
        <p className="mt-4 max-w-[640px] font-serif text-[19px] leading-[1.6] text-text-2">
          Nenhuma escrita clínica oficial acontece sem o ato do médico. O
          copiloto lê exames, sugere protocolos da biblioteca curada e redige
          rascunhos — mas prontuário, protocolo e receita só existem quando o
          médico revisa, aprova e assina. Cada sugestão é rastreável à sua fonte.
        </p>

        {/* Bloco de citação / manifesto */}
        <figure className="relative mt-10 overflow-hidden rounded-lg border-l-2 border-brand-500 bg-journal-quote px-12 py-[52px]">
          <blockquote className="relative z-10 max-w-[660px] font-serif text-[29px] font-medium leading-[1.4] text-text-1">
            &ldquo;A melhor tecnologia clínica desaparece no atendimento — o que
            fica é o médico com mais tempo para o paciente e menos para a
            papelada.&rdquo;
          </blockquote>
          <figcaption className="relative z-10 mt-5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-brand-300">
            Persana · Princípio de produto
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
