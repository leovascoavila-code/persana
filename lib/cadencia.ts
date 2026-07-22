/**
 * Contrato de Cadências (Onda 4 Slice 2) — fila de disparo + check-in + adesão.
 *
 * Espelha o router /cadencia (031/032/033): GET /pendentes (fila), POST /dispatch
 * (envia via WhatsApp per-tenant), GET /provider-configs, POST /checkin (4 perguntas
 * → escalona work_item se negativo), GET /pacientes/{pid}/adesao (real×esperado).
 * Touchpoint = deep-link only; consent-gated. Deslogado = MOCK_*.
 */
import { fmtDia } from "@/lib/planos";

export { fmtDia };

export type Canal = "whatsapp" | "email" | "sms";

export interface Pendente {
  id: string;
  patient_id: string;
  tipo: string;
  canal: Canal;
  finalidade: string;
  agendado_para: string;
  deep_link: string | null;
}

export interface DispatchResultado {
  enviados: number;
  falhas: number;
  sem_template: number;
  sem_destino: number;
  processados: number;
}

export interface MsgProvider {
  id: string;
  canal: string;
  provider: string;
  phone_id: string | null;
  is_default: boolean;
  sandbox: boolean;
  ativo: boolean;
}

export interface CheckinResultado {
  id: string;
  escalado: boolean;
  work_item_id: string | null;
}

export interface Adesao {
  patient_id: string;
  esperado_por_ciclo: number;
  real: { feito: number; parcial: number; nao_feito: number };
  checkins: number;
  taxa_adesao: number | null;
}

export const TIPO_LABEL: Record<string, string> = {
  consulta_lembrete: "lembrete de consulta",
  checkin: "check-in",
  renovacao: "renovação",
  resgate_noshow: "resgate no-show",
  boas_vindas: "boas-vindas",
};

export function tipoLabel(t: string): string {
  return TIPO_LABEL[t] ?? t;
}

export function canalBadge(c: string): "brand" | "accent" | "neutral" {
  if (c === "whatsapp") return "brand";
  if (c === "email") return "accent";
  return "neutral";
}

export const ADESAO_LABEL: Record<string, string> = {
  feito: "fez",
  parcial: "parcial",
  nao_feito: "não fez",
};

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_PENDENTES: Pendente[] = [
  {
    id: "mock-tp1",
    patient_id: "mock-p1",
    tipo: "renovacao",
    canal: "whatsapp",
    finalidade: "transacional",
    agendado_para: "2026-07-21T12:00:00Z",
    deep_link: "/portal/renovar",
  },
  {
    id: "mock-tp2",
    patient_id: "mock-p2",
    tipo: "checkin",
    canal: "whatsapp",
    finalidade: "adesao",
    agendado_para: "2026-07-21T13:30:00Z",
    deep_link: "/portal/checkin",
  },
  {
    id: "mock-tp3",
    patient_id: "mock-p3",
    tipo: "consulta_lembrete",
    canal: "email",
    finalidade: "agenda",
    agendado_para: "2026-07-21T15:00:00Z",
    deep_link: "/portal/agenda",
  },
];

export const MOCK_PROVIDERS: MsgProvider[] = [
  {
    id: "mock-mp1",
    canal: "whatsapp",
    provider: "meta_cloud",
    phone_id: "123456789",
    is_default: true,
    sandbox: true,
    ativo: true,
  },
];

export const MOCK_ADESAO: Adesao = {
  patient_id: "mock-p1",
  esperado_por_ciclo: 6,
  real: { feito: 3, parcial: 1, nao_feito: 1 },
  checkins: 5,
  taxa_adesao: 0.7,
};
