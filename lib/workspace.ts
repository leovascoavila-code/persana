/**
 * Contrato do workspace "Hoje" (Onda 1 do plano Sakana).
 *
 * Espelha `GET /workspace/today` (saas-clinico, modules/workspace.py) e as
 * transições POST /workspace/items/{id}/(done|snooze|dismiss). Deslogado
 * renderiza MOCK_*; logado busca o real via /api/poc — o shape é este.
 *
 * Quarentena: pendência INSTRUMENTAL nunca vem em work_items — é bloco
 * separado (GET /instrumento/pendentes), rotulado não-diagnóstico.
 */
import type { AgendaAppointment } from "@/lib/agenda";

export type WorkItemPrioridade = "low" | "normal" | "high" | "urgent";
export type WorkItemStatus = "open" | "snoozed" | "done" | "dismissed";
export type WorkItemTipo =
  | "lab_confirmation"
  | "document_draft"
  | "red_flag"
  | "no_followup";

export interface WorkItem {
  id: string;
  domain: "clinical" | "crm" | "financeiro";
  tipo: WorkItemTipo;
  prioridade: WorkItemPrioridade;
  status: WorkItemStatus;
  patient_id: string | null;
  paciente: string | null;
  source_type: string;
  source_id: string;
  titulo: string;
  resumo: string | null;
  due_at: string | null;
  snoozed_until: string | null;
  quick_actions: { key: string; label: string }[];
  criado_em: string;
}

export interface WorkspaceToday {
  data: string;
  agenda: AgendaAppointment[];
  work_items: WorkItem[];
}

export interface InstrumentoPendente {
  id: string;
  patient_id: string;
  paciente: string | null;
  metodo: string;
  dispositivo: string | null;
  data_sessao: string | null;
}

export const TIPO_LABEL: Record<WorkItemTipo, string> = {
  lab_confirmation: "Exames a confirmar",
  document_draft: "Documento em rascunho",
  red_flag: "Red flag",
  no_followup: "Sem retorno agendado",
};

export const PRIORIDADE_LABEL: Record<WorkItemPrioridade, string> = {
  urgent: "urgente",
  high: "alta",
  normal: "normal",
  low: "baixa",
};

/** urgência ordena a fila no front igual ao ORDER BY do backend */
export function ordenarItens(itens: WorkItem[]): WorkItem[] {
  const peso: Record<WorkItemPrioridade, number> = {
    urgent: 0,
    high: 1,
    normal: 2,
    low: 3,
  };
  return [...itens].sort(
    (a, b) =>
      peso[a.prioridade] - peso[b.prioridade] ||
      a.criado_em.localeCompare(b.criado_em)
  );
}

/** "2026-07-21T13:00:00Z" -> "21/07" (split por string; sem Date/locale) */
export function fmtDia(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  void y;
  return `${d}/${m}`;
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_TODAY: WorkspaceToday = {
  data: "2026-07-21",
  agenda: [
    {
      id: "mock-a1",
      patient_id: "mock-p1",
      paciente: "Ana Lúcia Ferreira",
      medico_id: "mock-m1",
      resource_id: null,
      tipo: "consulta",
      inicio: "2026-07-21T12:00:00Z",
      fim: "2026-07-21T13:00:00Z",
      status: "confirmado",
      observacao: null,
    },
    {
      id: "mock-a2",
      patient_id: "mock-p2",
      paciente: "Carlos Drummond",
      medico_id: "mock-m1",
      resource_id: null,
      tipo: "retorno",
      inicio: "2026-07-21T14:30:00Z",
      fim: "2026-07-21T15:00:00Z",
      status: "marcado",
      observacao: null,
    },
  ],
  work_items: [
    {
      id: "mock-w1",
      domain: "clinical",
      tipo: "red_flag",
      prioridade: "urgent",
      status: "open",
      patient_id: "mock-p3",
      paciente: "Maria Souza",
      source_type: "red_flag_event",
      source_id: "mock-rf",
      titulo: "Red flag aberta",
      resumo: "PHQ-9 acima do limiar na última resposta",
      due_at: null,
      snoozed_until: null,
      quick_actions: [{ key: "open", label: "Avaliar" }],
      criado_em: "2026-07-21T09:00:00Z",
    },
    {
      id: "mock-w2",
      domain: "clinical",
      tipo: "lab_confirmation",
      prioridade: "high",
      status: "open",
      patient_id: "mock-p1",
      paciente: "Ana Lúcia Ferreira",
      source_type: "lab_exam",
      source_id: "mock-ex",
      titulo: "Exames pendentes de confirmação",
      resumo: "3 analito(s) extraído(s) por IA aguardando confirmação",
      due_at: null,
      snoozed_until: null,
      quick_actions: [{ key: "open", label: "Revisar" }],
      criado_em: "2026-07-21T08:10:00Z",
    },
    {
      id: "mock-w3",
      domain: "clinical",
      tipo: "no_followup",
      prioridade: "normal",
      status: "open",
      patient_id: "mock-p2",
      paciente: "Carlos Drummond",
      source_type: "treatment_plan",
      source_id: "mock-tp",
      titulo: "Paciente sem retorno agendado",
      resumo: "Plano de tratamento ativo sem próxima consulta",
      due_at: null,
      snoozed_until: null,
      quick_actions: [{ key: "open", label: "Agendar" }],
      criado_em: "2026-07-20T16:40:00Z",
    },
  ],
};

export const MOCK_INSTRUMENTAL: InstrumentoPendente[] = [
  {
    id: "mock-s1",
    patient_id: "mock-p1",
    paciente: "Ana Lúcia Ferreira",
    metodo: "body_scan",
    dispositivo: "Body Scan",
    data_sessao: "2026-07-19T10:00:00Z",
  },
];
