/** Exames structured-first (Onda 6) — proveniência + roteamento de revisão. */

export type Fonte = "api" | "qr" | "template" | "manual" | "ocr";

export type ResultadoExame = {
  id: string;
  analito: string;
  valor: string | null;
  valor_num: number | null;
  unidade: string | null;
  ref_min: number | null;
  ref_max: number | null;
  flag: string | null;
  origem_ia: boolean;
  status_revisao: string;
  loinc: string | null;
  flag_funcional: string | null;
  fonte: Fonte;
  confianca: number | null;
  prioridade_revisao: "baixa" | "alta";
};

export type ExameDetalhe = {
  id: string;
  patient_id: string;
  data_coleta: string | null;
  laboratorio: string | null;
  status: string;
  fonte: Fonte;
  confianca: number | null;
  resultados: ResultadoExame[];
};

// hierarquia structured-first (melhor -> pior)
export const HIERARQUIA: Fonte[] = ["api", "qr", "template", "manual", "ocr"];

export const FONTE_LABEL: Record<Fonte, string> = {
  api: "API do laboratório",
  qr: "QR do laudo",
  template: "Template conhecido",
  manual: "Digitação manual",
  ocr: "OCR (IA)",
};

export const FONTE_BADGE: Record<Fonte, "ok" | "accent" | "warn" | "neutral"> = {
  api: "ok",
  qr: "ok",
  template: "accent",
  manual: "accent",
  ocr: "warn",
};

export function estruturada(f: Fonte): boolean {
  return f === "api" || f === "qr" || f === "template";
}

export const MOCK_EXAME: ExameDetalhe = {
  id: "mock",
  patient_id: "mock",
  data_coleta: "2026-07-18",
  laboratorio: "Laboratório Central (HL7)",
  status: "extraido",
  fonte: "api",
  confianca: 0.98,
  resultados: [
    { id: "1", analito: "Glicose", valor: "92", valor_num: 92, unidade: "mg/dL", ref_min: 70, ref_max: 99, flag: "normal", origem_ia: false, status_revisao: "pendente", loinc: "2345-7", flag_funcional: "ideal", fonte: "api", confianca: 0.99, prioridade_revisao: "baixa" },
    { id: "2", analito: "TSH", valor: "3.8", valor_num: 3.8, unidade: "uUI/mL", ref_min: 0.4, ref_max: 4.0, flag: "normal", origem_ia: false, status_revisao: "pendente", loinc: "3016-3", flag_funcional: "subotimo", fonte: "api", confianca: 0.99, prioridade_revisao: "baixa" },
    { id: "3", analito: "Vitamina D", valor: "28", valor_num: 28, unidade: "ng/mL", ref_min: 30, ref_max: 100, flag: "baixo", origem_ia: false, status_revisao: "pendente", loinc: "1989-3", flag_funcional: "fora", fonte: "template", confianca: 0.92, prioridade_revisao: "baixa" },
    { id: "4", analito: "Ferritina", valor: "45", valor_num: 45, unidade: "ng/mL", ref_min: 30, ref_max: 400, flag: "normal", origem_ia: true, status_revisao: "pendente", loinc: "2276-4", flag_funcional: "subotimo", fonte: "ocr", confianca: null, prioridade_revisao: "alta" },
  ],
};

export const MOCK_EXAMES_LISTA = [
  { id: "mock", data_coleta: "2026-07-18", laboratorio: "Laboratório Central (HL7)", status: "extraido", fonte: "api" as Fonte },
];
