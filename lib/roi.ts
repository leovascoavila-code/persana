/** Contratos do Dashboard ROI + North Star (SaaS S.15/S.18).
 * GUARDA S.16.3: honorários = serviço próprio da clínica; NUNCA receita da
 * farmácia, NUNCA ganho do médico vinculado a volume prescrito. */

export type Sentido = "maior" | "menor";

export type NorthStarMetric = {
  id: string;
  nome: string;
  unidade: string;
  valor: number | null;
  alvo: number | null;
  sentido: Sentido;
};

export type RoiDashboard = {
  medico_id: string | null;
  horas_economizadas_mes: number | null;
  baseline_pos_consulta_min: number;
  consultas_mes: number;
  protocolos_ativos: number;
  honorarios_mes_centavos: number;
  honorarios_mes_anterior_centavos: number;
  crescimento_honorarios_pct: number | null;
  renovacoes_mes: number;
  pacientes_retidos_crm: number;
  adesao_media_pct: number | null;
  tempo_consulta_min: number | null;
  guarda_s16_3: string;
};

export const MOCK_DASHBOARD: RoiDashboard = {
  medico_id: "demo",
  horas_economizadas_mes: 18.5,
  baseline_pos_consulta_min: 15,
  consultas_mes: 74,
  protocolos_ativos: 39,
  honorarios_mes_centavos: 4_185_000,
  honorarios_mes_anterior_centavos: 3_620_000,
  crescimento_honorarios_pct: 15.6,
  renovacoes_mes: 12,
  pacientes_retidos_crm: 7,
  adesao_media_pct: 72.4,
  tempo_consulta_min: 4.2,
  guarda_s16_3: "honorarios = servico proprio da clinica; nunca farmacia",
};

export const MOCK_NORTH_STAR: NorthStarMetric[] = [
  { id: "N1", nome: "Tempo de consulta documentada", unidade: "min", valor: 4.2, alvo: 5, sentido: "menor" },
  { id: "N2", nome: "Conversão consulta → protocolo", unidade: "%", valor: 46, alvo: 40, sentido: "maior" },
  { id: "N3", nome: "Adesão ao protocolo", unidade: "%", valor: 72, alvo: 70, sentido: "maior" },
  { id: "N4", nome: "Renovação / recompra", unidade: "%", valor: 55, alvo: 50, sentido: "maior" },
  { id: "N5", nome: "Cobertura de automação", unidade: "%", valor: 83, alvo: 80, sentido: "maior" },
  { id: "N6", nome: "Honorários recorrentes/mês", unidade: "R$", valor: 41850, alvo: null, sentido: "maior" },
];

/** centavos → "R$ 41.850,00" (pt-BR). */
export function fmtBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmtNum(v: number | null, casas = 1): string {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("pt-BR", { maximumFractionDigits: casas });
}

/** Uma métrica bate o alvo? (respeita o sentido: menor-é-melhor vs maior). */
export function bateAlvo(m: NorthStarMetric): boolean | null {
  if (m.valor === null || m.alvo === null) return null;
  return m.sentido === "menor" ? m.valor <= m.alvo : m.valor >= m.alvo;
}

/** Progresso 0–100 para a barra (clampa; sentido menor inverte). */
export function progresso(m: NorthStarMetric): number | null {
  if (m.valor === null || m.alvo === null || m.alvo === 0) return null;
  const raw = m.sentido === "menor" ? m.alvo / m.valor : m.valor / m.alvo;
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}
