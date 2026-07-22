/**
 * Contrato de PROMs (Onda 4) — desfecho relatado pelo paciente.
 *
 * Espelha o router /prom: GET /instrumentos, POST /aplicar (score determinístico →
 * threshold gera tarefa; PHQ-9 item 9 = crítico), GET /pacientes/{pid}/serie
 * (score no tempo + tendência). Instrumentos: PHQ-9/GAD-7/AUDIT/SCOFF. Deslogado = MOCK_*.
 */
import { fmtDia } from "@/lib/planos";

export { fmtDia };

export interface Instrumento {
  slug: string;
  nome: string;
  itens: string[];
  item_max: number;
}

export interface PromResultado {
  response_id: string;
  instrumento: string;
  score: number;
  faixa: string;
  interpretacao: string;
  critico: boolean;
  escalado: boolean;
  work_item_id: string | null;
}

export interface SeriePonto {
  id: string;
  quando: string;
  score: number | null;
  faixa: string | null;
}

export interface Serie {
  patient_id: string;
  instrumento: string;
  serie: SeriePonto[];
  tendencia: string;
}

/** faixa (escala de SINTOMA: maior = pior) → cor semântica */
export function faixaBadge(faixa: string | null): "ok" | "warn" | "danger" | "neutral" {
  if (!faixa) return "neutral";
  if (["grave", "moderada_grave", "nocivo", "provavel_dependencia", "rastreio_positivo"].includes(faixa))
    return "danger";
  if (["moderada", "risco"].includes(faixa)) return "warn";
  return "ok";
}

export function tendenciaBadge(t: string): "ok" | "danger" | "neutral" {
  if (t === "melhorando") return "ok";
  if (t === "piorando") return "danger";
  return "neutral";
}

/** legenda da escala de resposta por item_max do instrumento */
export function escalaLegenda(itemMax: number): string {
  if (itemMax === 1) return "0 = não · 1 = sim";
  if (itemMax === 3) return "0 nenhum · 1 vários dias · 2 mais da metade · 3 quase todo dia";
  if (itemMax === 4) return "0 nunca … 4 diariamente";
  return `0 … ${itemMax}`;
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_INSTRUMENTOS: Instrumento[] = [
  { slug: "phq9", nome: "PHQ-9", itens: Array.from({ length: 9 }, (_, i) => `phq9.${i + 1}`), item_max: 3 },
  { slug: "gad7", nome: "GAD-7", itens: Array.from({ length: 7 }, (_, i) => `gad7.${i + 1}`), item_max: 3 },
  { slug: "audit", nome: "AUDIT", itens: Array.from({ length: 10 }, (_, i) => `audit.${i + 1}`), item_max: 4 },
  { slug: "scoff", nome: "SCOFF", itens: Array.from({ length: 5 }, (_, i) => `scoff.${i + 1}`), item_max: 1 },
];

export const MOCK_SERIE: Serie = {
  patient_id: "mock-p1",
  instrumento: "phq9",
  serie: [
    { id: "s1", quando: "2026-06-05T10:00:00Z", score: 18, faixa: "moderada_grave" },
    { id: "s2", quando: "2026-06-20T10:00:00Z", score: 14, faixa: "moderada" },
    { id: "s3", quando: "2026-07-05T10:00:00Z", score: 9, faixa: "leve" },
    { id: "s4", quando: "2026-07-20T10:00:00Z", score: 6, faixa: "leve" },
  ],
  tendencia: "melhorando",
};
