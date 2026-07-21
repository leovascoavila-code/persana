/**
 * Contrato do CRM Pipeline (Onda 4 Slice 1) — funil por estagio + fila de risco.
 *
 * Espelha o router /crm (030): GET /pipeline (funil + fila), POST /pacientes/{pid}/
 * avaliar-risco (regras explicaveis -> risco alto vira work_item, D-6). Risco por
 * REGRAS legiveis (sem ML): cada ponto carrega um motivo. Deslogado = MOCK_*.
 */
import { fmtDia } from "@/lib/planos";

export { fmtDia };

export type RiskBand = "baixo" | "medio" | "alto";

export interface FunilEstagio {
  lifecycle_stage: string;
  n: number;
}

export interface RiscoPaciente {
  patient_id: string;
  paciente: string;
  risk_score: number;
  risk_band: RiskBand;
  risk_reasons: string[];
  next_best_action: string | null;
  atualizado_em: string;
}

export interface Pipeline {
  funil: FunilEstagio[];
  fila_risco: RiscoPaciente[];
}

export const STAGE_LABEL: Record<string, string> = {
  lead: "lead",
  novo: "novo",
  ativo: "ativo",
  em_tratamento: "em tratamento",
  acompanhamento: "acompanhamento",
  em_risco: "em risco",
  inativo: "inativo",
  reativacao: "reativação",
  alta: "alta",
  perdido: "perdido",
};

export function stageLabel(s: string): string {
  return STAGE_LABEL[s] ?? s;
}

export function riskBadge(b: RiskBand): "danger" | "warn" | "ok" {
  if (b === "alto") return "danger";
  if (b === "medio") return "warn";
  return "ok";
}

export const RISK_LABEL: Record<RiskBand, string> = {
  alto: "alto",
  medio: "médio",
  baixo: "baixo",
};

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_PIPELINE: Pipeline = {
  funil: [
    { lifecycle_stage: "acompanhamento", n: 18 },
    { lifecycle_stage: "em_tratamento", n: 12 },
    { lifecycle_stage: "novo", n: 9 },
    { lifecycle_stage: "em_risco", n: 5 },
    { lifecycle_stage: "reativacao", n: 3 },
    { lifecycle_stage: "alta", n: 2 },
  ],
  fila_risco: [
    {
      patient_id: "mock-p1",
      paciente: "Maria Souza",
      risk_score: 90,
      risk_band: "alto",
      risk_reasons: [
        "sem consulta nos últimos 60 dias",
        "plano ativo sem retorno agendado",
        "receita vencida",
      ],
      next_best_action: "renovar receita",
      atualizado_em: "2026-07-21T09:00:00Z",
    },
    {
      patient_id: "mock-p2",
      paciente: "Carlos Drummond",
      risk_score: 45,
      risk_band: "medio",
      risk_reasons: ["sem consulta registrada", "sem consentimento de contato para follow-up"],
      next_best_action: "agendar retorno",
      atualizado_em: "2026-07-21T08:10:00Z",
    },
    {
      patient_id: "mock-p3",
      paciente: "Ana Lúcia Ferreira",
      risk_score: 25,
      risk_band: "medio",
      risk_reasons: ["plano ativo sem retorno agendado"],
      next_best_action: "agendar retorno",
      atualizado_em: "2026-07-20T16:40:00Z",
    },
  ],
};
