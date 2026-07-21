/**
 * Contrato da Análise Instrumental (BIO).
 *
 * Espelha os payloads de GET /instrumento/scans/{id},
 * /instrumento/paciente/{pid}/scans e /instrumento/entitlement/me do backend
 * (saas-clinico, modules/instrumento.py — LIVE no VPS desde 18/07). Deslogado
 * ou sem dado real: MOCK_SCAN (ilustrativo). Ao ligar no endpoint, só o fetch
 * muda; o shape é este.
 *
 * NÃO-DIAGNÓSTICO: leitura de instrumento de bem-estar; a leitura clínica é do
 * médico. O único uso defensável é a comparação intra-paciente ao longo do
 * tempo — nunca contra "faixa normal populacional" como se fosse exame.
 */

export type Metodo = "bioressonancia_qrma" | "body_scan" | "bioimpedancia";

export interface InstrumentReading {
  grupo: string | null;
  item: string;
  valor_num: number | null;
  unidade: string | null;
  ref_min: number | null;
  ref_max: number | null;
  grau_ordinal: number | null; // 0 = na faixa .. 3 = fora +++
  escore_grupo: number | null; // "from ideal" (%) do grupo, quando existir
}

export interface ScanDetail {
  id: string;
  patient_id: string;
  metodo: Metodo;
  dispositivo: string | null;
  operador: string | null;
  data_sessao: string | null; // ISO
  antropometria: Record<string, unknown>;
  status_revisao: "pendente" | "confirmado";
  origem_ia: boolean;
  leituras: InstrumentReading[];
}

export interface ScanResumo {
  id: string;
  metodo: Metodo;
  dispositivo: string | null;
  data_sessao: string | null;
  status_revisao: "pendente" | "confirmado";
}

export interface EntitlementMe {
  feature: string;
  habilitado: boolean;
}

export const METODO_LABEL: Record<Metodo, string> = {
  bioressonancia_qrma: "Bioressonância (QRMA)",
  body_scan: "Body-scan",
  bioimpedancia: "Bioimpedância",
};

/** Rótulo do grau do device (0 na faixa; 1..3 fora). Não é diagnóstico. */
export function grauLabel(g: number | null): {
  label: string;
  icon: string;
  fora: boolean;
} {
  if (g === null) return { label: "sem faixa", icon: "·", fora: false };
  if (g <= 0) return { label: "na faixa", icon: "○", fora: false };
  return { label: `fora ${"+".repeat(Math.min(g, 3))}`, icon: "▲", fora: true };
}

/** Intensidade 0..1 do heatmap 1-matiz por grau (0..3). */
export function grauIntensidade(g: number | null): number {
  if (!g || g <= 0) return 0;
  return Math.min(1, g / 3);
}

/** Agrupa as leituras por sistema, preservando a ordem de aparição. */
export function agruparLeituras(
  leituras: InstrumentReading[]
): { grupo: string; itens: InstrumentReading[] }[] {
  const ordem: string[] = [];
  const mapa = new Map<string, InstrumentReading[]>();
  for (const r of leituras) {
    const g = r.grupo ?? "Sem grupo";
    if (!mapa.has(g)) {
      mapa.set(g, []);
      ordem.push(g);
    }
    mapa.get(g)!.push(r);
  }
  return ordem.map((g) => ({ grupo: g, itens: mapa.get(g)! }));
}

/** "2024-07-05T17:11" -> "05/07/2024 · 17:11" (split por string; sem Date). */
export function fmtData(iso: string | null): string {
  if (!iso) return "sem data";
  const [d, t] = iso.split("T");
  const [y, mo, dy] = d.split("-");
  if (!y || !mo || !dy) return iso;
  return `${dy}/${mo}/${y}${t ? ` · ${t.slice(0, 5)}` : ""}`;
}

/** Sessão demonstrativa (dados ilustrativos — nenhum dado real, paciente fictício). */
export const MOCK_SCAN: ScanDetail = {
  id: "demo",
  patient_id: "p-demo",
  metodo: "bioressonancia_qrma",
  dispositivo: "QRMA",
  operador: null,
  data_sessao: "2024-07-05T17:11",
  antropometria: { altura_cm: 173, peso_kg: 85 },
  status_revisao: "pendente",
  origem_ia: true,
  leituras: [
    {
      grupo: "Cardiovascular e Cerebrovascular",
      item: "Viscosidade do sangue",
      valor_num: 69.504,
      unidade: null,
      ref_min: 48.264,
      ref_max: 65.371,
      grau_ordinal: 1,
      escore_grupo: null,
    },
    {
      grupo: "Cardiovascular e Cerebrovascular",
      item: "Cristal de colesterol",
      valor_num: 60.0,
      unidade: null,
      ref_min: 56.749,
      ref_max: 67.522,
      grau_ordinal: 0,
      escore_grupo: null,
    },
    {
      grupo: "Cardiovascular e Cerebrovascular",
      item: "Elasticidade vascular",
      valor_num: 1.812,
      unidade: null,
      ref_min: 1.672,
      ref_max: 1.978,
      grau_ordinal: 0,
      escore_grupo: null,
    },
    {
      grupo: "Função do Fígado",
      item: "Metabolismo proteico",
      valor_num: 1.21,
      unidade: null,
      ref_min: 0.5,
      ref_max: 1.0,
      grau_ordinal: 1,
      escore_grupo: null,
    },
    {
      grupo: "Função do Fígado",
      item: "Capacidade de desintoxicação",
      valor_num: 0.82,
      unidade: null,
      ref_min: 0.5,
      ref_max: 1.0,
      grau_ordinal: 0,
      escore_grupo: null,
    },
    {
      grupo: "Sistema Imunológico",
      item: "Índice de imunoglobulina",
      valor_num: 3.2,
      unidade: null,
      ref_min: 1.0,
      ref_max: 4.0,
      grau_ordinal: 0,
      escore_grupo: null,
    },
    {
      grupo: "Sistema Imunológico",
      item: "Atividade do timo",
      valor_num: 5.11,
      unidade: null,
      ref_min: 2.0,
      ref_max: 4.5,
      grau_ordinal: 1,
      escore_grupo: null,
    },
  ],
};

// ─────────────────────────────── Série histórica ───────────────────────────────

export interface SeriePonto {
  data_sessao: string | null;
  metodo: Metodo;
  valor_num: number | null;
  unidade: string | null;
  ref_min: number | null;
  ref_max: number | null;
  grau_ordinal: number | null;
  escore_grupo: number | null;
  status_revisao: "pendente" | "confirmado";
}

/** Δ do último ponto vs o anterior (grandeza + direção). NÃO implica melhora/
 * piora — o sentido depende do marcador e é leitura do médico. */
export function serieDelta(
  pontos: SeriePonto[]
): { valor: number; dir: "up" | "down" | "flat" } | null {
  const vals = pontos
    .map((p) => p.valor_num)
    .filter((v): v is number => v != null);
  if (vals.length < 2) return null;
  const d = vals[vals.length - 1] - vals[vals.length - 2];
  return { valor: d, dir: d > 0 ? "up" : d < 0 ? "down" : "flat" };
}

/** Série demonstrativa de um marcador ao longo de 4 sessões (ilustrativa). */
export const MOCK_SERIE_ITEM = "Viscosidade do sangue";
export const MOCK_SERIE: SeriePonto[] = [
  { data_sessao: "2024-01-10T09:00", metodo: "bioressonancia_qrma", valor_num: 74.2, unidade: null, ref_min: 48.264, ref_max: 65.371, grau_ordinal: 1, escore_grupo: null, status_revisao: "confirmado" },
  { data_sessao: "2024-03-05T09:30", metodo: "bioressonancia_qrma", valor_num: 71.8, unidade: null, ref_min: 48.264, ref_max: 65.371, grau_ordinal: 1, escore_grupo: null, status_revisao: "confirmado" },
  { data_sessao: "2024-05-12T10:00", metodo: "bioressonancia_qrma", valor_num: 66.9, unidade: null, ref_min: 48.264, ref_max: 65.371, grau_ordinal: 1, escore_grupo: null, status_revisao: "confirmado" },
  { data_sessao: "2024-07-05T17:11", metodo: "bioressonancia_qrma", valor_num: 69.504, unidade: null, ref_min: 48.264, ref_max: 65.371, grau_ordinal: 1, escore_grupo: null, status_revisao: "pendente" },
];

/** Sessão ANTERIOR demonstrativa (para o comparador). Mesmos itens do MOCK_SCAN,
 * data mais antiga, valores diferentes — alguns melhoraram desde então. */
export const MOCK_SCAN_PREV: ScanDetail = {
  id: "demo-prev",
  patient_id: "p-demo",
  metodo: "bioressonancia_qrma",
  dispositivo: "QRMA",
  operador: null,
  data_sessao: "2024-05-12T10:00",
  antropometria: { altura_cm: 173, peso_kg: 87 },
  status_revisao: "confirmado",
  origem_ia: true,
  leituras: [
    { grupo: "Cardiovascular e Cerebrovascular", item: "Viscosidade do sangue", valor_num: 72.1, unidade: null, ref_min: 48.264, ref_max: 65.371, grau_ordinal: 1, escore_grupo: null },
    { grupo: "Cardiovascular e Cerebrovascular", item: "Cristal de colesterol", valor_num: 64.0, unidade: null, ref_min: 56.749, ref_max: 67.522, grau_ordinal: 0, escore_grupo: null },
    { grupo: "Cardiovascular e Cerebrovascular", item: "Elasticidade vascular", valor_num: 1.74, unidade: null, ref_min: 1.672, ref_max: 1.978, grau_ordinal: 0, escore_grupo: null },
    { grupo: "Função do Fígado", item: "Metabolismo proteico", valor_num: 1.35, unidade: null, ref_min: 0.5, ref_max: 1.0, grau_ordinal: 1, escore_grupo: null },
    { grupo: "Função do Fígado", item: "Capacidade de desintoxicação", valor_num: 0.71, unidade: null, ref_min: 0.5, ref_max: 1.0, grau_ordinal: 0, escore_grupo: null },
    { grupo: "Sistema Imunológico", item: "Índice de imunoglobulina", valor_num: 2.9, unidade: null, ref_min: 1.0, ref_max: 4.0, grau_ordinal: 0, escore_grupo: null },
    { grupo: "Sistema Imunológico", item: "Atividade do timo", valor_num: 5.4, unidade: null, ref_min: 2.0, ref_max: 4.5, grau_ordinal: 1, escore_grupo: null },
  ],
};
