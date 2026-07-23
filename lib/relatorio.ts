/** Relatório mensal da clínica (S.19) — diagnóstico executivo. */

export type Recomendacao = { titulo: string; prioridade: "alta" | "media" | "baixa" };

export type MetricasRelatorio = {
  competencia: string;
  escopo: string;
  consultas: number;
  protocolos_ativos: number;
  protocolos_iniciados: number;
  funil_conversao_pct: number | null;
  adesao_media_pct: number | null;
  honorarios_centavos: number;
  consultas_agendadas: number;
  no_show_pct: number | null;
  churn: number;
  automacao_cobertura_pct: number | null;
  fonte_receita: string;
};

export type Relatorio = {
  id: string;
  competencia: string;
  escopo: string;
  medico_id: string | null;
  metricas: MetricasRelatorio;
  narrativa: string;
  recomendacoes: Recomendacao[];
  status: "rascunho" | "aprovado";
  origem_narrativa: "ia" | "fallback";
  criado_em: string;
  aprovado_em: string | null;
};

export type RelatorioItem = {
  id: string;
  competencia: string;
  escopo: string;
  status: string;
  origem_narrativa: string;
  criado_em: string;
  aprovado_em: string | null;
};

export function fmtBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function pct(v: number | null): string {
  return v === null || v === undefined ? "—" : `${v}%`;
}

export const PRIORIDADE_BADGE: Record<string, "danger" | "warn" | "neutral"> = {
  alta: "danger",
  media: "warn",
  baixa: "neutral",
};

export function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const MOCK_RELATORIO: Relatorio = {
  id: "mock",
  competencia: "2026-06",
  escopo: "clinica",
  medico_id: null,
  metricas: {
    competencia: "2026-06",
    escopo: "clinica",
    consultas: 74,
    protocolos_ativos: 39,
    protocolos_iniciados: 34,
    funil_conversao_pct: 46,
    adesao_media_pct: 72,
    honorarios_centavos: 4185000,
    consultas_agendadas: 88,
    no_show_pct: 11,
    churn: 3,
    automacao_cobertura_pct: 83,
    fonte_receita: "honorarios_servico_proprio",
  },
  narrativa:
    "Junho consolidou o ritmo da clínica: 74 consultas documentadas, 46% convertendo em protocolo e adesão média de 72% — ambos acima da meta. Os honorários de serviço próprio somaram R$ 41.850, com no-show controlado em 11%. A cobertura de automação (83%) reduziu a carga operacional da equipe. O ponto de atenção é o churn de 3 protocolos, concentrado no fim de ciclo.",
  recomendacoes: [
    { titulo: "Antecipar reavaliação nos protocolos a 30 dias do fim para reter os 3 em risco", prioridade: "alta" },
    { titulo: "Elevar conversão consulta→protocolo de 46% para 55% revisando a apresentação ao paciente", prioridade: "media" },
    { titulo: "Manter cobertura de automação acima de 80% habilitando novos consentimentos", prioridade: "baixa" },
  ],
  status: "rascunho",
  origem_narrativa: "ia",
  criado_em: "2026-07-01T09:00:00Z",
  aprovado_em: null,
};

export const MOCK_LISTA: RelatorioItem[] = [
  { id: "mock", competencia: "2026-06", escopo: "clinica", status: "rascunho", origem_narrativa: "ia", criado_em: "2026-07-01T09:00:00Z", aprovado_em: null },
  { id: "m2", competencia: "2026-05", escopo: "clinica", status: "aprovado", origem_narrativa: "ia", criado_em: "2026-06-01T09:00:00Z", aprovado_em: "2026-06-02T10:00:00Z" },
];
