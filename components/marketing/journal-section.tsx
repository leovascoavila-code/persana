/**
 * Journal — mundo editorial, recolorido (PLANO §1.2): grafite + brand,
 * no lugar do creme/vinho. Brand entra só como fio condutor (rule + kicker).
 */
export function JournalSection() {
  return (
    <section className="bg-journal-bg px-6 py-[88px] md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-journal-accent">
          Persana Journal
        </div>
        <h2 className="max-w-[620px] font-serif text-[38px] font-semibold leading-[1.15] tracking-[-0.01em] text-text-1">
          Ideias em progresso
        </h2>
        <p className="mt-4 max-w-[600px] font-serif text-[19px] leading-[1.6] text-text-2">
          Onde o Persana fala como uma editora — relatórios, guias e ensaios
          sobre o trabalho que flui. Escrito em Spectral, com o ritmo de uma boa
          publicação.
        </p>

        {/* Bloco de citação / manifesto */}
        <figure className="relative mt-10 overflow-hidden rounded-lg border-l-2 border-brand-500 bg-journal-quote px-12 py-[52px]">
          <blockquote className="relative z-10 max-w-[640px] font-serif text-[29px] font-medium leading-[1.4] text-text-1">
            &ldquo;As melhores ferramentas desaparecem no uso — o que fica é a
            sensação de que o trabalho, enfim, fluiu.&rdquo;
          </blockquote>
          <figcaption className="relative z-10 mt-5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-brand-300">
            Persana · Manifesto de produto
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
