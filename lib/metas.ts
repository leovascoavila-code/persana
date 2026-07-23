/** Metas da clínica + alertas de desvio (S.19). */

export type Sentido = "maior" | "menor";

export type MetaCatalogo = {
  metrica: string;
  rotulo: string;
  unidade: string;
  sentido: Sentido;
  alvo: number | null;
  sentido_definido: Sentido;
  ativo: boolean;
};

export type Desvio = {
  metrica: string;
  rotulo: string;
  unidade: string;
  sentido: Sentido;
  alvo: number;
  real: number;
  no_alvo: boolean;
  desvio_pct: number | null;
  work_item_id?: string | null;
};

export type DesviosResult = {
  competencia: string;
  metas_avaliadas: number;
  fora_do_alvo: number;
  alertas_criados: number;
  desvios: Desvio[];
};

export function fmtMetaValor(v: number | null, unidade: string): string {
  if (v === null || v === undefined) return "—";
  if (unidade.includes("centavos"))
    return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  if (unidade === "%") return `${v}%`;
  return `${v}`;
}

export function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const MOCK_CATALOGO: MetaCatalogo[] = [
  { metrica: "consultas", rotulo: "Consultas/mês", unidade: "n", sentido: "maior", alvo: 80, sentido_definido: "maior", ativo: true },
  { metrica: "protocolos_ativos", rotulo: "Protocolos ativos", unidade: "n", sentido: "maior", alvo: 40, sentido_definido: "maior", ativo: true },
  { metrica: "funil_conversao_pct", rotulo: "Conversão consulta→protocolo", unidade: "%", sentido: "maior", alvo: 45, sentido_definido: "maior", ativo: true },
  { metrica: "adesao_media_pct", rotulo: "Adesão média", unidade: "%", sentido: "maior", alvo: 70, sentido_definido: "maior", ativo: true },
  { metrica: "honorarios_centavos", rotulo: "Honorários/mês", unidade: "R$ centavos", sentido: "maior", alvo: 4000000, sentido_definido: "maior", ativo: true },
  { metrica: "no_show_pct", rotulo: "No-show", unidade: "%", sentido: "menor", alvo: 12, sentido_definido: "menor", ativo: true },
  { metrica: "automacao_cobertura_pct", rotulo: "Cobertura de automação", unidade: "%", sentido: "maior", alvo: 80, sentido_definido: "maior", ativo: true },
  { metrica: "churn", rotulo: "Churn (protocolos abandonados)", unidade: "n", sentido: "menor", alvo: 3, sentido_definido: "menor", ativo: true },
];

export const MOCK_DESVIOS: DesviosResult = {
  competencia: "2026-06",
  metas_avaliadas: 8,
  fora_do_alvo: 2,
  alertas_criados: 2,
  desvios: [
    { metrica: "consultas", rotulo: "Consultas/mês", unidade: "n", sentido: "maior", alvo: 80, real: 74, no_alvo: false, desvio_pct: -7.5 },
    { metrica: "protocolos_ativos", rotulo: "Protocolos ativos", unidade: "n", sentido: "maior", alvo: 40, real: 39, no_alvo: false, desvio_pct: -2.5 },
    { metrica: "funil_conversao_pct", rotulo: "Conversão consulta→protocolo", unidade: "%", sentido: "maior", alvo: 45, real: 46, no_alvo: true, desvio_pct: 2.2 },
    { metrica: "adesao_media_pct", rotulo: "Adesão média", unidade: "%", sentido: "maior", alvo: 70, real: 72, no_alvo: true, desvio_pct: 2.9 },
    { metrica: "honorarios_centavos", rotulo: "Honorários/mês", unidade: "R$ centavos", sentido: "maior", alvo: 4000000, real: 4185000, no_alvo: true, desvio_pct: 4.6 },
    { metrica: "no_show_pct", rotulo: "No-show", unidade: "%", sentido: "menor", alvo: 12, real: 11, no_alvo: true, desvio_pct: 8.3 },
    { metrica: "automacao_cobertura_pct", rotulo: "Cobertura de automação", unidade: "%", sentido: "maior", alvo: 80, real: 83, no_alvo: true, desvio_pct: 3.8 },
    { metrica: "churn", rotulo: "Churn (protocolos abandonados)", unidade: "n", sentido: "menor", alvo: 3, real: 3, no_alvo: true, desvio_pct: 0 },
  ],
};
